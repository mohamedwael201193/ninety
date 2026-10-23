# SafePlate

| | |
|---|---|
| Name | SafePlate |
| Author | Milliebanned |
| Repo | https://github.com/Milliebanned/safeplate |
| Live | https://safeplate.milliebanned.xyz/ (GitHub homepage is also https://safeplate-alpha.vercel.app/, HTTP 200) |
| Demo menu | https://safeplate.milliebanned.xyz/m/demo-bistro |
| Safety record | https://safeplate.milliebanned.xyz/verified |
| TestSprite PRs | [#1](https://github.com/Milliebanned/safeplate/pull/1) merged, [#2](https://github.com/Milliebanned/safeplate/pull/2) closed unmerged (no TestSprite run), [#3](https://github.com/Milliebanned/safeplate/pull/3) merged, [#4](https://github.com/Milliebanned/safeplate/pull/4) merged, [#5](https://github.com/Milliebanned/safeplate/pull/5) merged |
| Demo video | https://youtu.be/0CydndUXC90 |
| Review date | 2026-10-23 |
| Reviewer model | Grok 4.7 |

Stack: Next.js 16.4.2 / React 19 / TypeScript (strict) / Tailwind 4 / Drizzle / Neon Postgres / Vitest, deployed on Vercel. MIT. Created 2026-10-20, last push 2026-10-21. Five pull requests, four merged, zero GitHub Actions workflows.

## 1. What it is

SafePlate is a restaurant tool for the stale allergen sheet. An owner tags each ingredient with any of the 14 EU-style major allergens; sub-recipes and dishes inherit those tags through nested components, so a guest who scans a QR code and selects allergies sees "Safe for you" or "Contains: …" on every published dish. The demo restaurant needs no account. The safety claim is only as good as what the restaurant typed: the public menu states that allergen information is provided by the restaurant. That is a real front-of-house problem with a clear owner and a clear guest, scoped as a menu calculator rather than a medical device.

## 2. Architecture

- App router UI: home [`src/app/page.tsx`](https://github.com/Milliebanned/safeplate/blob/main/src/app/page.tsx), public menu [`src/app/m/[slug]/page.tsx`](https://github.com/Milliebanned/safeplate/blob/main/src/app/m/%5Bslug%5D/page.tsx), dashboard pages under [`src/app/dashboard/`](https://github.com/Milliebanned/safeplate/tree/main/src/app/dashboard), safety record [`src/app/verified/page.tsx`](https://github.com/Milliebanned/safeplate/blob/main/src/app/verified/page.tsx).
- Allergen engine: [`src/lib/allergens.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/allergens.ts) (14 codes, union through nested recipes, cycle detection). Sample graph: [`src/lib/sample-menu.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/sample-menu.ts) (23 ingredients, 5 sub-recipes, 9 dishes, 8 with `published: true`, 1 draft).
- Auth: bcrypt passwords, SHA-256 session ids, HTTP-only cookie in [`src/lib/auth.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/auth.ts). Signed-out `/dashboard` redirect in [`src/proxy.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/proxy.ts). Mutations call `requireOwner` and filter by `restaurantId` (example: [`ingredients/actions.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/app/dashboard/ingredients/actions.ts)).
- Data: Drizzle schema [`src/db/schema.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/db/schema.ts) on Neon (`DATABASE_URL` in [`.env.example`](https://github.com/Milliebanned/safeplate/blob/main/.env.example)). Migrations run at build via [`scripts/migrate.ts`](https://github.com/Milliebanned/safeplate/blob/main/scripts/migrate.ts). Dish photos are bytes in Postgres, served at [`src/app/api/dishes/[id]/photo/[version]/route.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/app/api/dishes/%5Bid%5D/photo/%5Bversion%5D/route.ts).
- Deploy target: Vercel project `safeplate` (team `program1462s-projects`). Custom domain above. Health: [`/api/health`](https://github.com/Milliebanned/safeplate/blob/main/src/app/api/health/route.ts).
- Spec and plan: [`docs/PRD.md`](https://github.com/Milliebanned/safeplate/blob/main/docs/PRD.md), [`docs/TEST-PLAN.md`](https://github.com/Milliebanned/safeplate/blob/main/docs/TEST-PLAN.md). No `vercel.json`.

## 3. TestSprite integration depth

**Score: 6/10.** The GitHub App really runs, the required check is publicly visible, and one product bug has a status-backed red-to-green trail. The suite itself is not in the repo, nothing runs on a schedule or in GitHub Actions, and TestSprite once posted `state: success` for a run whose own description said a test failed.

### GitHub App check (commit status `TestSprite V3`, not a Check Run)

Check Runs on `main` are empty (`total_count: 0`). The app posts a **commit status** named `TestSprite V3` (app id 2756476 on the branch object). It is attached to the PR head, not to the merge commit. Merge commits on `main` show only Vercel. Dashboard pages return HTTP 200 with title "TestSprite" and a ~37 KB shell; the pass/fail tables are not in the HTML (login wall). Counts below are the status `description` plus the `testsprite[bot]` PR comment.

| PR | Head | Status | Execution |
|---|---|---|---|
| [#1](https://github.com/Milliebanned/safeplate/pull/1) first run, [`fcf85fd`](https://github.com/Milliebanned/safeplate/commit/fcf85fdfa27a81ff587c2771a226da8828799547) | 2026-10-21 09:32Z | description **"23/24 passed · 1 failed"**, **`state: success`** | [517ddd77](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/517ddd77-d0df-4639-a6a3-068a803ab28c) |
| [#1](https://github.com/Milliebanned/safeplate/pull/1) after merging `main`, [`102dc28`](https://github.com/Milliebanned/safeplate/commit/102dc2872f5388d539740ea21be90c4072665714) | 10:23Z | **"23/24 passed · 1 blocked"**, `state: failure` | [c7e386df](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/c7e386df-f4e8-46f4-92bd-b6ab104928a0) |
| [#1](https://github.com/Milliebanned/safeplate/pull/1) merged head [`c12c9de`](https://github.com/Milliebanned/safeplate/commit/c12c9de4ea9b6c0457396f9c0ccaf8dbfe413b0b) | 10:28Z | **"All 24 tests passed"**, success. Merged 10:34Z | [c24cfb64](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/c24cfb64-e2ef-4a05-bac2-629e28fd04d6) |
| [#2](https://github.com/Milliebanned/safeplate/pull/2) head [`5b57ad6`](https://github.com/Milliebanned/safeplate/commit/5b57ad6371f9c0fd7c7d9b2cd32b2af07d446cad) | 09:58Z | Vercel only. **No TestSprite status.** Closed unmerged 10:09Z | none |
| [#3](https://github.com/Milliebanned/safeplate/pull/3) head [`a0f76df`](https://github.com/Milliebanned/safeplate/commit/a0f76df3fbcf69e4ed5a06c815bc7e927deac892) | 10:11Z | **"All 24 tests passed"**. Merged 10:19Z | [94638251](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/94638251-c016-458a-b118-90c971d3d05a) |
| [#4](https://github.com/Milliebanned/safeplate/pull/4) head [`8a98008`](https://github.com/Milliebanned/safeplate/commit/8a98008ee4f7814cc40ea3383f19edc48596bc85) | 16:06Z | **"All 39 tests passed"**. Merged 16:06:56Z (51s later). No earlier failing status on this PR | [6c6cfe67](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/6c6cfe67-1c22-4384-9a18-0252b41e58b1) |
| [#5](https://github.com/Milliebanned/safeplate/pull/5) head [`d660151`](https://github.com/Milliebanned/safeplate/commit/d660151fa9881cce8b18402f41537dac40615b48) | 16:39Z | **"All 40 tests passed"**. Merged 16:39:51Z (36s later) | [82b28eea](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/82b28eea-c6b8-4f93-b7ca-b34453eb0eac) |

Bot comments (one per tested PR, edited in place when the run finishes; only the final text remains): [#1 comment](https://github.com/Milliebanned/safeplate/pull/1#issuecomment-6313728019) "24 of 24"; [#3](https://github.com/Milliebanned/safeplate/pull/3#issuecomment-6313424500) "24 of 24"; [#4](https://github.com/Milliebanned/safeplate/pull/4#issuecomment-6320399712) "39 of 39"; [#5](https://github.com/Milliebanned/safeplate/pull/5#issuecomment-6321134540) headline and results line say **40 passed / 40 total**, while the same comment's prose says **"39 of 39 executable tests passed"**.

Status API examples: [`fcf85fd` status](https://api.github.com/repos/Milliebanned/safeplate/commits/fcf85fdfa27a81ff587c2771a226da8828799547/status), [`c12c9de` status](https://api.github.com/repos/Milliebanned/safeplate/commits/c12c9de4ea9b6c0457396f9c0ccaf8dbfe413b0b/status), [`8b65d06` merge status](https://api.github.com/repos/Milliebanned/safeplate/commits/8b65d0662430d02553afca59cd0c415e691f86ee/status) (Vercel only).

### Is TestSprite V3 required?

- Public branch object: [`GET /repos/Milliebanned/safeplate/branches/main`](https://api.github.com/repos/Milliebanned/safeplate/branches/main) returns `protected: true` and `required_status_checks.contexts: ["TestSprite V3"]` with **`enforcement_level: "everyone"`** (GitHub's value when the status check applies to administrators as well as everyone else). `checks[0].app_id` is 2756476.
- Full protection, `enforce_admins`, and `required_status_checks` sub-resources: **HTTP 403** "Resource not accessible by integration" (needs `administration=read`).
- Repository rulesets: [`GET /rulesets`](https://api.github.com/repos/Milliebanned/safeplate/rulesets) is **HTTP 200 `[]`**. No ruleset requires a pull request or blocks pushes.
- No approving reviews on any PR. Merges are by Milliebanned, each after a success status on the head. That fits a required status check. It does not prove a "require a pull request" rule.
- **Direct pushes rejected: not shown.** First-parent history of `main` is four merges ([#3](https://github.com/Milliebanned/safeplate/commit/7f64e4df569b057efc5b817cdba0893f22543e33), [#1](https://github.com/Milliebanned/safeplate/commit/1c99a6ff69b04aad6bf2ddbb5f6c1d9e8caf2fd4), [#4](https://github.com/Milliebanned/safeplate/commit/7cb198540c203d67b85fb4974bc78bd8dc32ee4d), [#5](https://github.com/Milliebanned/safeplate/commit/8b65d0662430d02553afca59cd0c415e691f86ee)). Everything before that is direct commits, including the whole product. Example the same morning as the first merge: [`b70d6ee`](https://github.com/Milliebanned/safeplate/commit/b70d6eeec3c11072cf6c8049c904777eb12f5193). Local count of non-merge first-parent commits: 79 (clone count; [commit list](https://github.com/Milliebanned/safeplate/commits/main)). No rejected-push event is public.

### CLI, MCP, plans in git, triage, schedules

- **CLI:** documented, not automated. [`docs/TEST-PLAN.md`](https://github.com/Milliebanned/safeplate/blob/main/docs/TEST-PLAN.md) says 16 tests were added with `testsprite test create --plan-from` and that saved code was rewritten with `testsprite test code put`. [`CONTRIBUTING.md`](https://github.com/Milliebanned/safeplate/blob/main/CONTRIBUTING.md) and [`AGENTS.md`](https://github.com/Milliebanned/safeplate/blob/main/AGENTS.md) tell the agent to run `testsprite test failure get <test-id>` and fix the app rather than the test. No workflow, script, or config file invokes the CLI. The jump from status text "24" to "39" to "40" is the public evidence the cloud suite grew.
- **MCP:** none. No MCP config in the repo.
- **Plans committed:** one markdown plan, [`docs/TEST-PLAN.md`](https://github.com/Milliebanned/safeplate/blob/main/docs/TEST-PLAN.md), listing 40 named cases (9 public menu + 8 accounts + 7 dashboard + 16 CLI). **Zero executable TestSprite tests, zero frontend plan files, zero `testsprite` config.** Photo upload is explicitly out of the suite (same file).
- **Triage:** bot comment on the PR, plus the author's root-cause writeup in the PR body. No issues (the only "issues" are the five PRs). No auto-fix bot. [`/verified`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/verification.ts) reads the latest status on each PR head and caches it for five minutes. It does not classify UI vs engine, and it hides earlier SHAs.
- **Schedules:** none. No nightly, no on-merge TestSprite run. `main` merge commits are not re-tested by TestSprite.
- **Credits:** no credit or quota notes in the repo.

### Red → green loops

1. **Allergen confirmation (evidenced).** [`fcf85fd`](https://api.github.com/repos/Milliebanned/safeplate/commits/fcf85fdfa27a81ff587c2771a226da8828799547/status) "23/24 passed · 1 failed" on the execution linked from [PR #3's body](https://github.com/Milliebanned/safeplate/pull/3). That status **state is success**, so branch protection would not have blocked a merge of that SHA. They did not merge it. Fix landed on [#3](https://github.com/Milliebanned/safeplate/pull/3) ([`626aae7`](https://github.com/Milliebanned/safeplate/commit/626aae7047dbe290e370f11f4d2ce3c039e2e96e) plus unit test [`701b3dd`](https://github.com/Milliebanned/safeplate/commit/701b3dd6d316882c3a7b78d876dd77c7c807058c)), status **"All 24 tests passed"** ([94638251](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/94638251-c016-458a-b118-90c971d3d05a)), merged. [#1](https://github.com/Milliebanned/safeplate/pull/1) then reran **"All 24 tests passed"** ([c24cfb64](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/c24cfb64-e2ef-4a05-bac2-629e28fd04d6)) and merged. The failed test's name ("Create ingredient with allergen tags") is in the PR body, not in the status string. The code change matches that story: [`ingredientSavedMessage`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/components.test.ts) expects `Ingredient "QA Saffron" added. Contains: Sesame.`
2. **Blocked sign-up (evidenced, extra).** After merging `main` into #1, [`102dc28`](https://api.github.com/repos/Milliebanned/safeplate/commits/102dc2872f5388d539740ea21be90c4072665714/status) is **"23/24 passed · 1 blocked"**, `state: failure` ([c7e386df](https://www.testsprite.com/dashboard-v3/o/d64958d2-07d8-5f2e-bab0-08287dabd4a7/projects/81ea21ae-7852-4909-8fee-ba8ab0289d9a/execution/c7e386df-f4e8-46f4-92bd-b6ab104928a0)). Next commit message is "note the ingredient confirmation and random test emails". Following head is 24/24. README attributes this to a frozen sign-up email. The blocked test's name is not in the status string.
3. **Off-screen confirmation (not a GitHub loop).** [#4](https://github.com/Milliebanned/safeplate/pull/4) has a single TestSprite status, already **"All 39 tests passed"**, on a head that already contains the fix [`311f96c`](https://github.com/Milliebanned/safeplate/commit/311f96c113242eeb8251d9d67366fe454bea1ef4). No failing status, no execution URL for the red run. The 1,566 px figure exists only in the PR body.
4. **Safety record.** [#5](https://github.com/Milliebanned/safeplate/pull/5) went 40/40 with no public red run.

### Vercel preview per PR

| PR | Preview host from the Vercel bot comment | TestSprite |
|---|---|---|
| #1 | `safeplate-git-docs-test-plan-program1462s-projects.vercel.app` (label length 50) | yes |
| #2 | `safeplate-git-fix-ingredient-aller-4952d4-program1462s-projects.vercel.app` (label length **63**, hash `4952d4`) | **no** |
| #3 | `safeplate-git-fix-allergen-confirm-program1462s-projects.vercel.app` (56) | yes |
| #4 | `safeplate-git-fix-visible-toasts-program1462s-projects.vercel.app` | yes |
| #5 | `safeplate-git-feat-verified-page-program1462s-projects.vercel.app` | yes |

The untruncated #2 label `safeplate-git-fix-ingredient-allergen-confirmation-program1462s-projects` is 72 characters. Branch ref `fix/ingredient-allergen-confirmation` is 36 characters (PR #3's body says 34). Author [closed #2](https://github.com/Milliebanned/safeplate/pull/2) saying the trigger could not reach the shortened preview. [`CONTRIBUTING.md`](https://github.com/Milliebanned/safeplate/blob/main/CONTRIBUTING.md) now caps branch names at 27 characters.

**Own database branch per preview: UNVERIFIED.** The repo has a single `DATABASE_URL`. No Neon branch id, no preview-branch config. That integration would live in the Neon/Vercel dashboard, which this review cannot see.

**Draft PRs: UNVERIFIED.** None of the five PRs was a draft.

## 4. Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite cloud suite | 40, "from PRD" | Latest status text **"All 40 tests passed"**. Plan lists 40 names: 24 in the first three sections, 16 under "Added through the TestSprite CLI" | [status on `d660151`](https://api.github.com/repos/Milliebanned/safeplate/commits/d660151fa9881cce8b18402f41537dac40615b48/status), [TEST-PLAN.md](https://github.com/Milliebanned/safeplate/blob/main/docs/TEST-PLAN.md), [PR #5 comment](https://github.com/Milliebanned/safeplate/pull/5#issuecomment-6321134540) | **VERIFIED** as a count on the check. Executable bodies are **not in git**, so the assertions were not read. README still says "39-test" ([README](https://github.com/Milliebanned/safeplate/blob/main/README.md)) which is stale after #5 |
| TestSprite on #4 | 39, of which 15 were new | Status **"All 39 tests passed"** after a prior **"All 24 tests passed"** (39−24=15). Plan's CLI section has 15 rows before "View the public safety record" | [8a98008 status](https://api.github.com/repos/Milliebanned/safeplate/commits/8a98008ee4f7814cc40ea3383f19edc48596bc85/status), [TEST-PLAN.md](https://github.com/Milliebanned/safeplate/blob/main/docs/TEST-PLAN.md) | Count **VERIFIED**. The red run that supposedly created those 15 tests is **UNVERIFIED** |
| Vitest unit tests | PR bodies say `npm test`: 56 passed | **56 passed / 4 files / 381 ms** (vitest 5.0.5, local, 2026-10-23). Expansion is `it.each`: allergens 25, validation 21, photo 7, components 3 | [`allergens.test.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/allergens.test.ts), [`validation.test.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/validation.test.ts), [`photo.test.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/photo.test.ts), [`components.test.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/components.test.ts) | **VERIFIED** locally. Not run in CI (zero workflows) |
| Sample-menu oracle inside those unit tests | 8 published dishes; avoiding sesame leaves 7 safe, milk leaves 5, gluten+peanuts leaves 5 | Same figures in `it.each` and on the live menu (below) | [`allergens.test.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/allergens.test.ts), live URLs in section 8 | **VERIFIED** |
| GitHub Actions / lint / typecheck CI | CONTRIBUTING says run them locally | Workflows API `total_count: 0`. [`.github`](https://github.com/Milliebanned/safeplate/tree/main/.github) contains only `pull_request_template.md` | [actions workflows](https://api.github.com/repos/Milliebanned/safeplate/actions/workflows) | No CI gate |
| Playwright / API / axe / fuzz | not claimed | none in repo | repo tree | n/a |

Local command: `npm install` then `npm test` in the clone. No database and no secrets required. `node_modules` deleted afterwards. Lint and typecheck were not run.

## 5. Claim verification

| Claim | Verdict | Why |
|---|---|---|
| Traces 14 major allergens | **VERIFIED** | [`ALLERGENS`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/allergens.ts) has 14 codes (celery through tree nuts). Live demo lists the same 14 labels: https://safeplate.milliebanned.xyz/m/demo-bistro. Mechanism is a union of owner-entered tags, including through a nested sub-recipe (Green Goddess Dressing uses Mustard Vinaigrette). It does not detect allergens in a lab |
| Nothing ships without a green TestSprite check | **FALSE** | The app reached `main` by direct pushes before any TestSprite status existed ([`b70d6ee`](https://github.com/Milliebanned/safeplate/commit/b70d6eeec3c11072cf6c8049c904777eb12f5193) and the product commits under it). Separately, the 23/24 run with 1 failed was posted as **`state: success`** ([`fcf85fd` status](https://api.github.com/repos/Milliebanned/safeplate/commits/fcf85fdfa27a81ff587c2771a226da8828799547/status)), so a green check did not mean every test passed. The four merged PR heads were updated to an "all tests passed" success before merge |
| 23 of 24 passed (saved allergen never confirmed); PR #3 fixed it 24/24; PR #1 reran 24/24 and merged | **VERIFIED** (counts and order) | Statuses in section 3 match 23/24, then #3 "All 24 tests passed", then #1 head "All 24 tests passed" and [merged](https://github.com/Milliebanned/safeplate/pull/1). The "never confirmed on screen" sentence is the [PR #3 body](https://github.com/Milliebanned/safeplate/pull/3), not a line in the status. The fix and the unit test corroborate it. Dashboard report HTML does not show the failed test name |
| Every PR, including drafts, runs against its own Vercel preview and DB branch | **Mixed** | Vercel preview comment on all five PRs: **VERIFIED**. Drafts: **UNVERIFIED** (no draft PR). Per-preview DB branch: **UNVERIFIED** (not in repo). TestSprite did **not** run on #2 |
| Branch protection requires TestSprite V3, admins included | **VERIFIED** for the status check | [`branches/main`](https://api.github.com/repos/Milliebanned/safeplate/branches/main): context `TestSprite V3`, `enforcement_level: "everyone"`. Full `enforce_admins` endpoint is 403 |
| Direct pushes rejected | **UNVERIFIED** (and false for this repo's history) | Rulesets `[]`. Full protection 403, so a "require pull request" rule is not visible. Dozens of direct commits are on `main` ([commits](https://github.com/Milliebanned/safeplate/commits/main)) |
| 40 tests from the PRD | **VERIFIED** as a suite size, origin is mixed | Status "All 40 tests passed". [TEST-PLAN](https://github.com/Milliebanned/safeplate/blob/main/docs/TEST-PLAN.md): **24** planned by TestSprite from the PRD plus a live exploration, **16** written by the author and added with the CLI. "TestSprite generated all 40 from the PRD" would be false. README's "39-test" line is stale |
| PR #4: 15 new tests caught confirmations 1,566 px off-screen; fixed 39/39 | **Split** | 39/39 and the +15 count: **VERIFIED** (section 4). The failing run and the 1,566 px measurement: **UNVERIFIED**. Only the [PR #4 body](https://github.com/Milliebanned/safeplate/pull/4) states them. The floating banner is real: [`flash.tsx`](https://github.com/Milliebanned/safeplate/blob/main/src/components/flash.tsx) |
| PR #5: 40/40 merged | **VERIFIED** | Status "All 40 tests passed" at 16:39:15Z, merged 16:39:51Z ([#5](https://github.com/Milliebanned/safeplate/pull/5)). Same bot comment also says "39 of 39 executable" in the prose |
| Preview URLs longer than 63 characters broke the PR trigger | **VERIFIED** | #2's deployed label is exactly 63 characters and contains Vercel's truncation hash; the full branch label would be 72. No TestSprite status on that head. Author closed the PR for that reason. Later branches are short and did get runs |

## 6. Code quality

The tree is small and readable. `strict: true`. Allergen math is pure and table-tested against the sample menu, including a three-level propagation case (lemon juice → vinaigrette → green goddess → salmon). Server actions that were read scope writes with `requireOwner` and `restaurantId`. Sessions store a hash, not the raw token. Passwords use bcrypt. Duplicate names are case-insensitive unique indexes. Build applies SQL migrations and skips cleanly when `DATABASE_URL` is absent.

Smells that matter for judges:

- No CI at all. The 56 unit tests, `tsc`, and eslint never run on GitHub. The only merge gate is the TestSprite commit status, and that status has already reported success for a failed suite.
- TestSprite tests are not reviewable. A later `testsprite test code put` can change what "40/40" means without a diff in this repo.
- [`/verified`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/verification.ts) shows the latest head only, so PR #1 displays "All 24 tests passed" and the 23/24 failure and the blocked run disappear. The page copy says a failing check blocks the change.
- README still says the suite is 39 tests.
- Unknown-menu responses are HTTP 404 and the body says "Menu not found", but the document title stays the homepage title (`MenuNotFound` sets no `metadata`).
- Photos live in Postgres. Fine for a demo, painful as a menu grows.
- Signup is open, with no email verification and a 30-day session. Expected for a hackathon, not a production kitchen system.
- No rate limiting visible on auth actions.

## 7. Live-site behavior

Checked 2026-10-23 with curl. No accounts created, no forms submitted. Authenticated dashboard CRUD was not exercised.

| URL | Result |
|---|---|
| https://safeplate.milliebanned.xyz/ | 200 in ~1.1s. Title "SafePlate \| Allergen-safe menus for restaurants". `cache-control: private, no-cache`. `server: Vercel`, `x-powered-by: Next.js`, HSTS |
| https://safeplate.milliebanned.xyz/m/demo-bistro | 200 in ~0.9s. Title "Demo Bistro menu \| SafePlate". Eight dishes (Garden Salad, Hummus & Pita, Garlic Shrimp, Grilled Salmon, Peanut Noodles, Roasted Potatoes, Chocolate Brownie, Fresh Lemonade). Draft Celery Soup is absent. All 14 allergen checkboxes. Disclaimer is present |
| https://safeplate.milliebanned.xyz/m/demo-bistro?avoid=sesame | 200. SSR text: **"7 of 8 dishes are free from your selected allergens."** Matches the unit test |
| https://safeplate.milliebanned.xyz/m/demo-bistro?avoid=milk&hide=1 | 200. **"5 of 8 dishes are free…"**. Garlic Shrimp, Grilled Salmon, and Chocolate Brownie are omitted. Five dishes remain. Matches the unit test |
| https://safeplate.milliebanned.xyz/m/empty-kitchen | 200. "Empty Kitchen" and "This restaurant hasn't published any dishes yet." |
| https://safeplate.milliebanned.xyz/m/not-a-real-menu-xyz | **404**. Body "Menu not found" |
| https://safeplate.milliebanned.xyz/does-not-exist | **404**. "Page not found" |
| https://safeplate.milliebanned.xyz/verified | 200. Latest release "All 40 tests passed" for PR #5. Rows: #5 40 passed, #4 39 passed, #3 24 passed, **#2 "Not tested"**, #1 24 passed. Links to the four execution URLs above |
| https://safeplate.milliebanned.xyz/login and /signup | 200. Titles "Log in" and "Create your account" |
| https://safeplate.milliebanned.xyz/dashboard | **307** to `/login?next=%2Fdashboard` |
| https://safeplate.milliebanned.xyz/api/health | 200 `{"status":"ok","database":"ok"}` (~0.9s) |
| https://safeplate.milliebanned.xyz/api/health/ | 308 to `/api/health` |
| https://safeplate-alpha.vercel.app/ | 200 |

What works without an account: marketing page, demo menu, allergen filter kept in the query string, hide-unsafe filter, empty restaurant, unknown-menu 404, health, login wall. What this review did not click through: sign-up, ingredient edit, sub-recipe cycles, dish photos, QR code, sample-menu load.

## 8. Demo

The video exists and is public to oEmbed: title **"safeplate demo"**, author Milliebanned, https://youtu.be/0CydndUXC90 (oEmbed and noembed, 2026-10-23). **Length UNVERIFIED.** The watch page returned a YouTube consent shell with no `lengthSeconds`, and oEmbed has no duration. **What it shows is UNVERIFIED** because the video was not played. The no-account demo menu above is the stronger public demo.

## 9. Weaknesses / risks for judges

- The required check can be green while a test failed. That is the worst fact in the TestSprite story, and it is on the public status API.
- Judges cannot read the 40 tests. A green tick is a cloud-side artifact.
- PR #4's "TestSprite caught a 1,566 px bug" has no red check. The pixel number should not be scored as observed.
- PR #2 is on the safety record as "Not tested", which contradicts "every PR is tested" and the hero sentence on `/verified`.
- Most of the product never went through TestSprite. Protection, if it now blocks direct pushes, was not on for the commits that built the app, and direct-push rejection is still not visible in the API.
- No Actions, no MCP, no schedule, no re-test of `main` after merge, no mutation testing, no photo e2e.
- The 40/40 bot comment disagrees with itself (39 vs 40). README still says 39.
- Allergen output is owner-declared. A guest can still be hurt by a wrong tag. The disclaimer says so; some of the marketing ("a mistake can never hide an allergen") is stronger than the system.
- Dashboard TestSprite reports are not anonymously readable, so the failure bundles are not independently inspectable.

## 10. Where it beats Ninety

Ninety is https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app): Schengen 90/180 calculator, Entry/Exit reconciliation, Article 52 letter, tests committed in git, CLI workflow, but branch protection unverifiable and PR #63 merged while TestSprite V3 was red. No demo video.

1. **The required TestSprite check is publicly readable and set to `everyone`.** Evidence: [`branches/main`](https://api.github.com/repos/Milliebanned/safeplate/branches/main) requires context `TestSprite V3` with `enforcement_level: "everyone"`. The four merges happened only after an "all tests passed" status on the head. Ninety's protection API is 403 and a red TestSprite V3 PR was merged. To match, Ninety needs a required `TestSprite V3` check whose enforcement level is visible and which actually stops a red merge, including for admins.
2. **A public safety record that is the product, not a README badge.** https://safeplate.milliebanned.xyz/verified renders each PR's `TestSprite V3` status from the GitHub API ([`verification.ts`](https://github.com/Milliebanned/safeplate/blob/main/src/lib/verification.ts)), and that page is itself the 40th test in [TEST-PLAN.md](https://github.com/Milliebanned/safeplate/blob/main/docs/TEST-PLAN.md). Ninety would need a guest-visible page bound to the same check the merge gate uses. SafePlate's page still hides earlier red SHAs, so matching it means showing the latest status and the failed runs.
3. **A real guest demo with no account, plus a public video.** https://safeplate.milliebanned.xyz/m/demo-bistro?avoid=sesame returns the same "7 of 8" figure as the unit test. Video: https://youtu.be/0CydndUXC90. Ninety has no demo video. Ninety's calculator is also usable without an account, so the gap is the video and the in-product proof page, not "has a live URL".
4. **They hit a TestSprite trigger bug and left the evidence.** PR #2's preview host was truncated at 63 characters and never received a TestSprite status ([#2](https://github.com/Milliebanned/safeplate/pull/2)); branch names are now capped in [CONTRIBUTING.md](https://github.com/Milliebanned/safeplate/blob/main/CONTRIBUTING.md). They also recorded a blocked run when saved test data was not unique ([`102dc28` status](https://api.github.com/repos/Milliebanned/safeplate/commits/102dc2872f5388d539740ea21be90c4072665714/status)) and describe rewriting shallow tests with `testsprite test code put`. Ninety's `testsprite-smoke.yml` is broken (multiple test ids, no `--local`) and disabled. To match, Ninety needs a working trigger path and a written red-to-green for a TestSprite tooling failure, not only for product bugs.

Ninety is ahead on committed plans (43 frontend, 28 API), a CLI gate workflow, unit-test volume in CI, fuzz, Schemathesis, axe, and an HTTP plus stdio MCP for the product. SafePlate has none of those. The false-success status means SafePlate's "required check" is not yet a reliable gate.

## 11. Estimated judging scores

| Criterion | Score | Note |
|---|---|---|
| Problem value | 8 | Concrete kitchen/guest problem, working public menu, honest disclaimer. Self-reported tags and no kitchen integration keep it under 9 |
| TestSprite depth | 6 | Real App status, required check at `everyone`, one evidenced product red-to-green, CLI used to grow the suite. No tests in git, no Actions, no MCP, no schedule, and a success state on a failed run |
| Verifiability | 7 | Statuses, live SSR counts, and a local 56/56 rerun line up. Dashboard bodies, the 1,566 px bug, DB branches, and direct-push blocking do not |
| Polish | 8 | Strict TypeScript, tenant filters, 404s, health, auth redirect, designed menu. No CI, stale "39 tests" README |
| Demo | 6 | Public video titled "safeplate demo"; length and contents not verified. The no-signup menu is the demo that was actually exercised |
| **Overall** | **7** | A real TestSprite merge loop on a polished allergen menu. The gate is weaker than the README, and the tests are not auditable |

## 12. Technique Ninety lacks

- Required `TestSprite V3` commit status with `enforcement_level: "everyone"`, visible on the public branch resource.
- End-user page that displays those statuses (`/verified`).
- Short branch names so the Vercel preview label stays within 63 characters and the TestSprite PR trigger can resolve it.
- Post-run rewrite of cloud tests via `testsprite test code put` / `testsprite test create --plan-from` (documented; the tests themselves are still not in git).
