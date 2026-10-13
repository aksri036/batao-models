# @batao/models

Shared data models for the batao frontend (`batao`), Cloud Functions backend (`batao-backend`) and admin (`batao-admin`).

## Rules

- Models only: interfaces, types, enums, constants, default factories (e.g. `createEmptyAutoMsgConfig`) and small pure helpers.
- No Firebase SDK imports. Use `Timestamp` from `./timestamp`, a structural type that both `firebase/firestore` and `firebase-admin/firestore` Timestamps satisfy.
- No Firestore access / repo code. That stays in each app (client SDK vs admin SDK).
- When a field is added in any app, add it here so all apps see the same shape.

## Usage

Import by subpath:

```ts
import { WASettings, createEmptyAutoMsgConfig } from "@batao/models/wa-settings";
import { Offer } from "@batao/models/offers/offers";
```

Works with Next.js (`moduleResolution: bundler`) and the Functions build (`module: commonjs`).

## Develop

```sh
npm install
npm run typecheck
npm run build
```
