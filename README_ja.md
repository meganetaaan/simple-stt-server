# 簡易 VOSK WebSocket サーバー

日本語 | [English](./README.md)

このプロジェクトは、VOSKを使用して音声を認識し、WebSocketに送信するNode.js製サーバーです。

## インストール方法

1. このリポジトリをクローンします。
2. プロジェクトのルートディレクトリに移動します。
3. `npm install` コマンドを実行して、依存関係をインストールします。
4. [VOSKのモデルファイル](https://alphacephei.com/vosk/models)をダウンロードして解凍し、`model` ディレクトリに配置します。次のような構造になっていればOKです。

```
[sskw]$ ls -l model
合計 24
-rw-r--r-- 1 sskw sskw  898  7月  9  2022 README
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 am
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 conf
drwxr-xr-x 3 sskw sskw 4096  7月  9  2022 graph
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 ivector
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 rescore
```

## 起動方法

1. プロジェクトのルートディレクトリに移動します。
2. `npm start` コマンドを実行します。

## 使い方

起動すると、WebSocketサーバーがポート8080で実行されます。クライアントがWebSocketに接続すると、認識されたテキストをクライアントに送信します。

認識結果の送信を一時停止するには、スペースキーを押します。再開するには、もう一度スペースキーを押します。

## ライセンス

MIT License
