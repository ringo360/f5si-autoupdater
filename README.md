# これは何？

[DDNS Now](https://f5.si/)向けに作成された、DDNS の自動更新システムです。

# 導入

1. このコードを clone する
2. `config.json`を作成する
3. `config.json`をこのようにする(例: `domainname.f5.si`の場合):

```json
{
	"domain": "domainname",
	"token": "password-or-api-token"
}
```

> domain、token は各自自分のものに置き換えてください。

4. `yarn install`で依存関係をインストールする(もしくは`npm i`)
5. `node main`で実行！

# TODO

認知されているバグ、追加予定の機能等は[Issue](https://github.com/ringo360/f5si-autoupdater/issues)にあります。ご覧ください。
