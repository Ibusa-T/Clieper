# Clieper
# 🚀 Obsidian Clipper - アプリケーション仕様（MVP版）

## 1. 概要 (Overview)
* **アプリ名**: Obsidian AI Web Clipper
* **概要**: Webページの内容をワンクリックでAI（LLM）が要約し、ObsidianのURLスキーマ（`obsidian://`）を経由して、iCloud等のObsidian保管庫へMarkdown形式で一発保存するChrome拡張機能。
* **技術スタック**: Pure JavaScript (バニラJS) / HTML / CSS / Manifest V3
* **ターゲット**: Obsidianユーザー、情報収集の効率化を図りたいインディハッカー・エンジニア

---


## 2. システム構成・ディレクトリ構造 (Architecture)

*ビルドツール（Webpack/Vite）や外部フレームワーク（React等）を使わない、最小・爆速の純粋なバニラJS構成。*

```text
obsidian-clipper/
├── manifest.json       # Manifest V3 設定ファイル
├── popup.html          # 拡張機能のポップアップUI画面
├── popup.js            # UI操作・AI要約実行・Obsidian連携ロジック (バニラJS)
├── content.js          # Webページの本文・タイトル・URL抽出スクリプト (バニラJS)
├── background.js       # バックグラウンド処理・Service Worker (バニラJS)
└── icons/              # アプリ用アイコン画像 (16, 48, 128)



## 🧩 STEP 2: Chromeへの読み込み（デベロッパーモード）

自分で作った拡張機能をChromeに追加します

1. **Chromeを起動**し、アドレスバー（URL入力欄）に以下を入力して Enter を押します。
    
    code Text
    
    ```
    chrome://extensions/
    ```
    
2. 画面右上にある **「デベロッパー モード」のトグルスイッチを ON（青色）** にします。
    
3. 画面左上に出現する **「パッケージ化されていない拡張機能を読み込む」** ボタンをクリックします。
    
4. ファイル選択画面が開くので、先ほど作成した obsidian-clipper **フォルダ自体を選択**して「選択」または「開く」を押します。
    
5. 拡張機能一覧に **「Obsidian AI Web Clipper」** が追加されればインストール完了です！
    

> 💡 **使いやすくするために**: Chromeの右上にあるジグソーパズルマーク（拡張機能アイコン）をクリックし、Obsidian Clipperの横にある**画びょうマーク（ピン留め）**を押しておくと、いつでもワンクリックで呼び出せるようになります。

---

## ⚙️ STEP 3: 初期設定（API Key と Vault 名）

拡張機能を使う前に、一度だけ設定を行います。

1. ピン留めした **Obsidian Clipper のアイコン** をクリックします。
    
2. ポップアップ画面が開くので、**「⚙️ 設定」** をクリックして展開します。
    
3. 以下の3項目を入力します。
    
    |   |   |   |
    |---|---|---|
    |項目|説明|入力例|
    |**OpenAI API Key**|[OpenAI Platform](https://www.google.com/url?sa=E&q=https%3A%2F%2Fplatform.openai.com%2Fapi-keys) で取得した sk- から始まるAPIキー|sk-proj-...|
    |**Vault Name**|保存したい **Obsidianの保管庫（Vault）の名前** ※正確に入力|MyVault|
    |**Folder Path**|保管庫内の保存先フォルダ（空欄でも可）|Clippings|
    
4. **「設定を保存」** ボタンをクリックします。
    

> ⚠️ **ObsidianのVault名の確認方法**  
> Obsidianアプリを開き、左下の「保管庫を開く（フォルダアイコン）」をクリックすると、現在開いている保管庫の正確な名前が確認できます。大文字・小文字も正確に合わせてください。

---

## 🚀 STEP 4: 実際の使い方（動作手順）

1. **Obsidianアプリを起動**しておきます（事前にバックグラウンドで開いておくとスムーズです）。
    
2. Chromeで **要約・保存したいWebページ**（例：技術記事やニュースサイト）を開きます。
    
3. Chrome右上の **Obsidian Clipper アイコン** をクリックします。
    
4. **「AI要約してObsidianへ保存」** ボタンをクリックします。
    
5. ポップアップ内のステータスが以下のように遷移します。
    
    - ページ情報を抽出中...
        
    - AI要約を生成中...
        
    - Obsidianへ送信中...
        
    - ✅ Obsidianへ保存しました！
        
6. 自動的にObsidianアプリに画面が切り替わり、Clippings/YYYY-MM-DD_タイトル.md というノートが新規作成されます！
    

---

## ❓ よくあるトラブルと解決策 (Troubleshooting)

### Q1. 「chrome:// のページでは実行できません」という旨のエラーが出る

- **原因**: Chromeの「設定画面」や「新しいタブ（Blankページ）」では拡張機能（content.js）が動作しない仕組みになっています。
    
- **対処法**: 通常のWebページ（https://... で始まるページ）を開いた状態で実行してください。
    

### Q2. 「OpenAI APIリクエストに失敗しました」というエラーが出る

- **原因1**: API Keyが間違っている。
    
- **原因2**: OpenAIのアカウントにクレジット（残高）がチャージされていない。
    
- **対処法**: [OpenAI Billing](https://www.google.com/url?sa=E&q=https%3A%2F%2Fplatform.openai.com%2Fsettings%2Forganization%2Fbilling) ページでクレジットカードの登録および残高（$5程度〜）があるか確認してください。
    

### Q3. 「Obsidianを開きますか？」というポップアップが出る

- **原因**: ブラウザが外部アプリ（obsidian:// スキーマ）を起動する際の安全確認です。
    
- **対処法**: **「常に許可する」** チェックボックスをオンにして「Open Obsidian」をクリックしてください。次回以降は出なくなります。
    

### Q4. Obsidianに保存されない・アプリが反応しない

- **原因**: 設定した Vault Name が実際の保管庫名と一致していません。
    
- **対処法**: 拡張機能の設定画面を開き、Vault名に余計なスペースが入っていないか、大文字小文字が合っているか再確認してください。
    

---

コードの修正やカスタマイズを行いたい場合は、ファイルを上書き保存した後に chrome://extensions/ 画面で拡張機能の **「更新（くるっと回る矢印アイコン）」** を押すだけで、すぐに最新コードが反映されます！

