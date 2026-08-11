# 🚀 汎用 AI API 呼び出しサンプルコード（抽象化版）

`popup.js` に以下の共通関数を定義しておけば、エンドポイントやモデル名を書き換えるだけで全ての主要AIプロバイダに対応できます。

---

## パターン 1: APIキーが必要なクラウドAI
> **【対象プラットフォーム】**
> OpenAI (ChatGPT) / OpenRouter / Groq / DeepSeek / Mistral AI / Anthropic (Claude) / Google Gemini

### 1. 共通抽象化関数 (`popup.js` 用)
```javascript
/**
 * APIキーが必要なクラウドAI呼び出し（OpenAI互換標準）
 */
async function callCloudAI({ apiKey, endpoint, model, title, text }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'Webページの要約プロです。日本語で3つの要点を箇条書きで要約してください。' },
        { role: 'user', content: `タイトル: ${title}\n\n本文:\n${text}` }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `APIエラー (Status: ${response.status})`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
```

### 2. 主要プラットフォーム設定一覧（呼び出し例）

```javascript
// --- OpenAI の場合 ---
const summary = await callCloudAI({
  apiKey: apiKey,
  endpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  title: pageData.title,
  text: pageData.content
});

// --- OpenRouter (無料モデル等) の場合 ---
const summary = await callCloudAI({
  apiKey: apiKey,
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'google/gemini-2.0-flash-exp:free', // お好みのモデルに変更可
  title: pageData.title,
  text: pageData.content
});

// --- Groq (超高速) の場合 ---
const summary = await callCloudAI({
  apiKey: apiKey,
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama-3.3-70b-versatile',
  title: pageData.title,
  text: pageData.content
});

// --- DeepSeek の場合 ---
const summary = await callCloudAI({
  apiKey: apiKey,
  endpoint: 'https://api.deepseek.com/chat/completions',
  model: 'deepseek-chat',
  title: pageData.title,
  text: pageData.content
});
```

---

## パターン 2: APIキー不要のローカルAI
> **【対象プラットフォーム】**
> Ollama / LM Studio / LocalAI / vLLM (PCローカル環境で動作するモデル)

### 1. 共通抽象化関数 (`popup.js` 用)
```javascript
/**
 * APIキー不要のローカルLLM呼び出し
 */
async function callLocalAI({ endpoint = 'http://localhost:11434/api/generate', model = 'llama3.2', title, text }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      prompt: `Webページの要約プロです。日本語で3つの要点を箇条書きで要約してください。\n\nタイトル: ${title}\n\n本文:\n${text}`,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error('ローカルLLMサーバーへの接続に失敗しました。アプリが起動しているか確認してください。');
  }

  const data = await response.json();
  return data.response.trim();
}
```

### 2. 主要プラットフォーム設定一覧（呼び出し例）

```javascript
// --- Ollama の場合 ---
const summary = await callLocalAI({
  endpoint: 'http://localhost:11434/api/generate',
  model: 'llama3.2', // インストール済みのモデル名
  title: pageData.title,
  text: pageData.content
});

// --- LM Studio (ローカルサーバーモード) の場合 ---
const summary = await callLocalAI({
  endpoint: 'http://localhost:1234/api/v0/generate',
  model: 'local-model',
  title: pageData.title,
  text: pageData.content
});
```

---

## ⚙️ `manifest.json` 設定時の注意点

`manifest.json` の `host_permissions` には、利用したいエンドポイントのドメインを追加しておきます。

```json
  "host_permissions": [
    "https://api.openai.com/*",
    "https://openrouter.ai/*",
    "https://api.groq.com/*",
    "https://api.deepseek.com/*",
    "http://localhost:11434/*",
    "http://localhost:1234/*"
  ]
```