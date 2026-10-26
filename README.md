# @batao/models

The single source of truth for batao's data models: the shapes of Firestore documents, enums, constants, default values (e.g. `createEmptyAutoMsgConfig`) and small pure helpers (e.g. `getDiscountString`).

Every batao app imports its models from this package instead of keeping its own copy. Before this package existed, each repo had its own `models/` folder, and the copies drifted apart. A default value set in one repo but not another caused a real production bug.

## Contents

1. [Rules for what goes in here](#rules-for-what-goes-in-here)
2. [Using the models in an app](#using-the-models-in-an-app)
3. [Which repos use it, and how](#which-repos-use-it-and-how)
4. [Branches and versions](#branches-and-versions)
5. [Changing a model: step by step](#changing-a-model-step-by-step)
6. [Updating an app to a new version](#updating-an-app-to-a-new-version)
7. [Checking which version each app uses](#checking-which-version-each-app-uses)
8. [Gotchas](#gotchas)
9. [Troubleshooting](#troubleshooting)

---

## Rules for what goes in here

- **Models only.** Interfaces, types, enums, constants, default factories and small pure helper functions.
- **No Firebase SDK imports.** The browser apps use `firebase/firestore`; the backend uses `firebase-admin/firestore`. For Firestore timestamps, use `Timestamp` from `src/timestamp.ts`. It is a minimal shape that both SDKs' `Timestamp` classes fit.
- **No Firestore reads or writes.** Database code stays in each app (`StoreOperations`, `db-utils`, `db_operations`…), because each app uses a different SDK.
- **Prefer additive changes.** Adding an optional field never breaks anyone. Renaming, removing or making a field required can break apps that haven't been updated yet. See [versioning](#4-bump-the-version-and-tag).
- **If an app needs a new field, add it here**, never in the app. There is no local `models/` folder in any app any more.

## Using the models in an app

Import by **subpath**: the file's path under `src/`, without `.ts`:

```ts
import { WASettings, createEmptyAutoMsgConfig } from "@batao/models/wa-settings";
import { Offer } from "@batao/models/offers/offers";
import { Timestamp } from "@batao/models/timestamp";
```

There is no `index.ts` that re-exports everything. Several files export the same name, so a single entry point would clash.

"Go to Definition" in VS Code opens the real `.ts` source under `node_modules/@batao/models/src/` (from v0.1.2 on), so you can read model code from any app.

### Discount and benefit wording: UI vs messages

There are two sets of wording functions. Pick by where the text appears:

| Where the text appears | Use | Example output |
|---|---|---|
| Web UI (frontend, admin, storefront) | `getDiscountString`, `getBenefitString` | `🎁 2 Cookies`, `💎 50 pts` |
| WhatsApp messages, link previews, Google posts (backend) | `getDiscountMessageString`, `getBenefitMessageString` | `2 Cookies free`, `50 points` |

`getMembershipDiscountString(mp, format)` and `getReferralDiscountString(rp, format)` default to the UI wording. The backend passes `getDiscountMessageString` as the second argument.

**WhatsApp template text must not change silently.** Approved templates were written around the plain wording. In backend message code, always use the `...MessageString` versions.

## Which repos use it, and how

| App | GitHub repo | Built where | How it gets the package |
|---|---|---|---|
| Frontend (seller/buyer web app) | `aksri036/batao` | Firebase **App Hosting** (Google's servers) | Vendored tarball: `vendor/batao-models-X.Y.Z.tgz` |
| Backend (Cloud Functions) | `aksri036/batao-backend` | `firebase deploy` → Cloud Build (Google's servers) | Vendored tarball: `functions/vendor/batao-models-X.Y.Z.tgz` |
| Storefront | `aksri036/batao-storefront` | Firebase **App Hosting** (Google's servers) | Vendored tarball: `vendor/batao-models-X.Y.Z.tgz` |
| Admin | `aksri036/batao-admin` | `firebase deploy` builds **on your machine** | GitHub dependency: `github:aksri036/batao-models#vX.Y.Z` (devDependency) |

### Why two different methods?

This repo is **private**.

- **Admin** is built on the developer's machine. `npm install` uses your own GitHub login to fetch the package, and Next.js copies the model code into the build output. The deployed app never downloads the package, so a GitHub dependency works.
- **Frontend, backend and storefront** are installed and built on Google's servers. Those servers have **no access to a private GitHub repo**, so a GitHub dependency would fail mid-deploy. Instead, each repo commits a packed copy of the package (a `.tgz` file) under `vendor/`, and `package.json` points at it with `file:`. The install then needs nothing outside the repo.

The tarball must be **committed** in each of those repos. In the backend, the root `.gitignore` ignores `*.tgz`, so `functions/.gitignore` has an exception: `!vendor/*.tgz`. Don't remove it.

---

## Branches and versions

`main` is the release branch: urgent releases go out from it. Bigger features are built on their own long-running branch (e.g. `autocampaigns`) and released to apps on their feature branches while still in progress. Both kinds of release need version numbers, so they follow different rules that keep them from colliding:

| Branch | Versions | First release on the branch | Each later release |
|---|---|---|---|
| `main` | Plain only: `0.2.1`, `0.3.0` | n/a | `npm version patch` (or `minor`) |
| Feature branch, e.g. `autocampaigns` | Prereleases named after the branch: `0.3.0-autocampaigns.4` | `npm version preminor --preid=autocampaigns` | `npm version prerelease --preid=autocampaigns` |

`npm version` enforces this. Its `preversion` script (`scripts/check-version.js`) refuses, without changing anything:

- a version whose tag already exists, locally or on GitHub;
- a prerelease on `main`, or a plain version on any other branch;
- a feature prerelease based on a version that's already released (e.g. `0.3.0-autocampaigns.2` once `0.3.0` is out). The error message gives the version to move to.

`ALLOW_ANY_VERSION=1 npm version …` skips the checks. Use it only if you're sure.

**The feature branch's life cycle:**

1. **Start:** `npm version preminor --preid=<branch>` on the branch gives `<next minor>-<branch>.0`.
2. **While it's in progress:** after every `main` release, merge `main` into the branch, so the branch's apps keep getting urgent fixes. If `package.json` conflicts on `version`, keep the branch's prerelease version.
3. **Done:** merge `main` into the branch one last time, then merge the branch into `main`, and on `main` run `npm version minor`. That is the first plain version containing the feature.

**Apps:** an app's production branch may only use plain versions. Prerelease versions are for that app's matching feature branch.

**Earlier releases.** v0.1.4 to v0.2.0 were released as plain versions from `autocampaigns` before these rules existed. Those tags stay as they are, since apps may use them. `main` carries on after the highest number (v0.2.1), and `autocampaigns` switches to `0.3.0-autocampaigns.N`.

---

## Changing a model: step by step

Example: adding an optional `keywords?: string[]` field to `MediaBankItem` in `src/gmb/types.ts`.

### 1. Get the models repo up to date

```sh
cd /path/to/batao-models
git pull
npm install          # first time only
```

### 2. Make the change

Edit the file under `src/`. Keep the rules above in mind: no Firebase imports, and prefer optional fields.

### 3. Check it compiles

```sh
npm run typecheck
```

### 4. Bump the version and tag

Commit your change first, then let npm bump the version, commit it and create the git tag in one step. On `main`:

```sh
git add src/
git commit -m "gmb types: MediaBankItem.keywords"
npm version patch        # 0.2.1 -> 0.2.2, commits and tags v0.2.2
git push && git push origin v0.2.2
```

On a feature branch, use `npm version prerelease --preid=<branch>` instead ([Branches and versions](#branches-and-versions)).

Push only the tag you just created, not `git push --tags`, so stray local tags never reach GitHub.

Which bump to use on `main`:

| Change | Command | Example |
|---|---|---|
| New optional field, new type, new helper, bug fix | `npm version patch` | 0.2.1 → 0.2.2 |
| Rename/remove a field, make a field required, change a helper's output, or a feature branch merged in | `npm version minor` | 0.2.1 → 0.3.0 |

A **minor** bump signals that the change can break apps. Before releasing one, search all four repos for uses of what you changed.

Confirm the tag reached GitHub:

```sh
git ls-remote --tags origin      # should list refs/tags/v0.2.2
```

### 5. Build the tarball (for frontend, backend and storefront)

Always pack from a **clean export of the tag**, never from your working folder. `npm pack` builds from whatever files are on disk, so uncommitted edits would end up inside the tarball.

```sh
V=0.1.4                                   # the version you just tagged
rm -rf /tmp/models-$V && mkdir -p /tmp/models-$V
git archive v$V | tar -x -C /tmp/models-$V
cd /tmp/models-$V
npm ci --ignore-scripts                   # installs TypeScript for the build
npm pack                                  # builds dist/ and writes batao-models-$V.tgz
ls -l batao-models-$V.tgz
```

Keep `/tmp/models-$V/batao-models-$V.tgz`; the next section copies it into each app.

### 6. Update the apps that need the change

See the next section. You don't have to update every app: only the ones that use the new or changed model. Additive changes are safe to roll out one app at a time.

---

## Updating an app to a new version

In all cases, finish with the app's own checks (type-check, lint, build) and commit **both** `package.json` and `package-lock.json`, plus the tarball where there is one.

### Frontend (`batao`) and storefront (`batao-storefront`)

```sh
cd /path/to/batao                        # or batao-storefront
rm vendor/batao-models-*.tgz             # remove the old version
cp /tmp/models-0.1.4/batao-models-0.1.4.tgz vendor/
npm install "file:vendor/batao-models-0.1.4.tgz"

npx tsc --noEmit -p .
npm run lint
npm run build                            # optional locally; App Hosting builds on deploy

git add vendor package.json package-lock.json
git commit -m "models v0.1.4"
```

Deploys through App Hosting as usual. Nothing else to configure.

### Backend (`batao-backend`)

Same as above, but inside `functions/`:

```sh
cd /path/to/batao-backend/functions
rm vendor/batao-models-*.tgz
cp /tmp/models-0.1.4/batao-models-0.1.4.tgz vendor/
npm install "file:vendor/batao-models-0.1.4.tgz"

npx tsc --noEmit -p .
npm run lint

git add vendor package.json package-lock.json
git commit -m "models v0.1.4"
```

Then deploy only the functions that use the changed model, e.g. `firebase deploy --only functions:gmbOps`. Use `deploy-all.sh` in the repo root only when every function needs redeploying (it deploys in batches to avoid timeouts).

`git status` should show `functions/vendor/batao-models-0.1.4.tgz` as a new file. If it doesn't, check that `functions/.gitignore` still contains `!vendor/*.tgz`.

### Admin (`batao-admin`)

No tarball. Point the dependency at the new tag:

```sh
cd /path/to/batao-admin
npm install -D "github:aksri036/batao-models#v0.1.4"

npx tsc --noEmit -p .
npm run build

git add package.json package-lock.json
git commit -m "models v0.1.4"
```

This needs your GitHub login on the machine (it's a private repo), the same login you use for `git push`.

### Other checkouts of the same repo

Some repos have more than one local checkout (e.g. a dev and a prod folder of `batao-backend`, or two folders of `batao-admin`). After pulling the commit that updates the models, run `npm install` in that checkout too. Otherwise it fails with `Cannot find module '@batao/models/...'`.

---

## Checking which version each app uses

From each app's folder:

```sh
grep '"@batao/models"' package.json             # frontend, admin, storefront
grep '"@batao/models"' functions/package.json   # backend
```

Example output: `"@batao/models": "file:vendor/batao-models-0.1.2.tgz"` or `"@batao/models": "github:aksri036/batao-models#v0.1.3"`.

Apps don't all have to be on the same version. Each should be on a version that has every model it uses.

---

## Gotchas

- **Never edit model files inside an app.** They live under `node_modules/@batao/models/`, and the next `npm install` overwrites them. Change this repo and release instead.
- **Never pack from your working folder.** Always use `git archive vX.Y.Z` as in step 5, so the tarball matches the tag exactly.
- **Don't reuse a version number.** If a release is wrong, fix it and release the next patch. Never move or delete a pushed tag.
- **Merging branches in an app:** if Git reports a conflict like `functions/src/models/xyz.ts deleted in main and modified in HEAD`, a branch still had the old local model files. Move any real change from that file into this repo, release, update the app, then resolve with `git rm` on the old file.
- **Timestamps:** model fields typed `Timestamp` use the shared shape from `src/timestamp.ts`. If app code needs a specific SDK type (e.g. passing it to an admin-SDK API), cast it at that spot in the app, not here.
- **`id` fields:** many Firestore documents don't store their own `id`. The app adds it after reading. Model that in the app as `Model & { id: string }` rather than adding `id` to the shared model.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module '@batao/models/...'` (local run, build or deploy) | Package not installed in this checkout | `npm install` (in `functions/` for the backend) |
| App Hosting / Cloud Functions deploy fails fetching `github:aksri036/batao-models` | An App Hosting or backend app was given a GitHub dependency | Switch it to the vendored tarball ([above](#frontend-batao-and-storefront-batao-storefront)) |
| Tarball missing on GitHub / deploy can't find `vendor/...tgz` | Tarball not committed, often because of a `*.tgz` ignore rule | `git check-ignore -v vendor/*.tgz`, add an exception like `!vendor/*.tgz`, commit it |
| `npm ci` integrity error after replacing the tarball | Lockfile still points at the old file | Re-run `npm install "file:vendor/batao-models-X.Y.Z.tgz"` and commit the lockfile |
| A new field isn't visible in an app | App is on an older version | Check the version ([above](#checking-which-version-each-app-uses)) and update |
| `npm install -D github:...` asks for credentials or fails (admin) | No GitHub access on this machine | Log in to GitHub (`gh auth login`, or set up an SSH key) |

## Developing this package

```sh
npm install
npm run typecheck     # type-check only
npm run build         # compile to dist/ (also runs automatically on install and npm pack)
```

`dist/` is git-ignored and built on install. The published package contains `dist/` (compiled JS + type declarations) and `src/` (for Go to Definition).
