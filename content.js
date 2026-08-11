chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const title = document.title || '無題のページ';
    const url = window.location.href;

    // DOMのクローンを作成して不要な要素を除去
    const clone = document.body.cloneNode(true);
    const selectorsToIgnore = ['script', 'style', 'nav', 'header', 'footer', 'iframe', 'noscript', 'aside', 'form'];
    selectorsToIgnore.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // テキストを整理して抽出
    let text = clone.innerText || clone.textContent || '';
    text = text.replace(/\n\s*\n/g, '\n\n').trim();

    // APIのトークン制限・コスト抑制のため上限（先頭約5000文字）にカット
    const maxChars = 5000;
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '\n...(以下省略)' : text;

    sendResponse({
      title,
      url,
      content: truncatedText
    });
  }
  return true;
});chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const title = document.title || '無題のページ';
    const url = window.location.href;

    // DOMのクローンを作成して不要な要素を除去
    const clone = document.body.cloneNode(true);
    const selectorsToIgnore = ['script', 'style', 'nav', 'header', 'footer', 'iframe', 'noscript', 'aside', 'form'];
    selectorsToIgnore.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // テキストを整理して抽出
    let text = clone.innerText || clone.textContent || '';
    text = text.replace(/\n\s*\n/g, '\n\n').trim();

    // APIのトークン制限・コスト抑制のため上限（先頭約5000文字）にカット
    const maxChars = 5000;
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '\n...(以下省略)' : text;

    sendResponse({
      title,
      url,
      content: truncatedText
    });
  }
  return true;
});