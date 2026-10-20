# PR #41 landing: band follows scenario, illustrations labelled, not-covered notice
- First run 14/15 (TC011 reload red): https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/d3b95b00-ab77-4d40-9a71-cf53c211b0be
  - Cause: the test agent re-opened /?today=2026-10-19&fresh=1 (step 7) before the reload step, and fresh=1 clears saved trips by design. Not an app defect.
- One-off CLI re-run of TC011 on the same preview: PASSED, run c839b4a5-0691-4418-952e-f9f038c58e80 (20 Oct 08:56 Cairo, 0.5 credit).
- Preview: https://ninety-git-b-landing-mohamedwael201193s-projects.vercel.app
- Status: waiting for momo's browser QA; one re-push after b-letter-check merges (the suite gains TS17/TS18).
