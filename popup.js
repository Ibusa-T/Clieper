document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const vaultInput = document.getElementById('vault');
  const folderInput = document.getElementById('folder');
  const saveConfigBtn = document.getElementById('saveConfig');
  const clipBtn = document.getElementById('clipBtn');
  const statusDiv = document.getElementById('status');
  const configDetails = document.getElementById('configDetails');

  // 設定のロード
  chrome.storage.sync.get(['apiKey', 'vault', 'folder'], (items) => {
    if (items.apiKey) apiKeyInput.value = items.apiKey;
    if (items.vault) vaultInput.value = items.vault;
    if (items.folder) folderInput.value = items.folder;

    // 未設定の場合は自動的に設定画面を展開
    if (!items.apiKey || !items.vault) {
      configDetails.open = true;
    }
  });

  // 設定の保存
  saveConfigBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const vault = vaultInput.value.trim();
    const folder = folderInput.value.trim();

    chrome.storage.sync.set({ apiKey, vault, folder }, () => {
      showStatus('設定を保存しました！', false);
    });
  });

  // クリップ実行
  clipBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const vault = vaultInput.value.trim();
    const folder = folderInput.value.trim();

    if (!apiKey || !vault) {
      showStatus('API Key と Vault 名を入力してください。', true);
      configDetails.open = true;
      return;
    }

    setLoading(true);
    showStatus('ページ情報を抽出中...');

    try {
      // 1. アクティブタブの取得
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error('アクティブなタブが見つかりません。');

      // 2. content.js を動的注入して実行
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // 3. ページ内容の取得
      const pageData = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractContent' }, (response) => {
          if (chrome.runtime.lastError) {
            return reject(new Error('ページの抽出に失敗しました。ページを再読み込みしてお試しください。'));
          }
          resolve(response);
        });
      });

      showStatus('AI要約を生成中...');

      // 4. OpenAI API の呼び出し
      const summaryResult = await callOpenAI(apiKey, pageData.title, pageData.content);

      showStatus('Obsidianへ送信中...');

      // 5. Markdownの整形
      const today = new Date().toISOString().split('T')[0];
      const markdownContent = `---
title: "${pageData.title.replace(/"/g, '\\"')}"
url: "${pageData.url}"
clipped: ${today}
tags:
  - clipping
---

# ${pageData.title}

## 💡 AI Summary
${summaryResult}

---
- **Source**: [${pageData.url}](${pageData.url})
- **Clipped Date**: ${today}
`;

      // 6. ファイル名とパスの生成
      const safeTitle = pageData.title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
      const fileName = `${today}_${safeTitle}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // 7. Obsidian URL スキーマの構築と実行
      const obsidianUri = `obsidian://new?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(filePath)}&content=${encodeURIComponent(markdownContent)}`;
      
      // Obsidianを起動
      chrome.tabs.update({ url: obsidianUri });

      showStatus('✅ Obsidianへ保存しました！');

    } catch (err) {
      showStatus(`エラー: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  });

  //  API 通信ロジック
  async function callOpenAI(apiKey, title, text) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'あなたはWeb記事の要約のプロです。提示されたテキストの重要ポイントを日本語で箇条書き（3ポイント程度）でわかりやすく要約してください。'
          },
          {
            role: 'user',
            content: `タイトル: ${title}\n\n本文:\n${text}`
          }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI APIリクエストに失敗しました。');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  function showStatus(msg, isError = false) {
    statusDiv.textContent = msg;
    if (isError) {
      statusDiv.classList.add('error');
    } else {
      statusDiv.classList.remove('error');
    }
  }

  function setLoading(isLoading) {
    clipBtn.disabled = isLoading;
    if (isLoading) {
      clipBtn.textContent = '処理中...';
    } else {
      clipBtn.textContent = 'AI要約してObsidianへ保存';
    }
  }
});