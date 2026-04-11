# Launch Checklist (v1)

Use this checklist before first public launch.

## 1) Environment & Secrets
- [ ] Backend uses production `NODE_ENV=production`
- [ ] `MONGO_URI` points to production database
- [ ] `JWT_SECRET` is long/random and not reused
- [ ] `CLIENT_URL` exactly matches frontend production domain
- [ ] Cookie security verified in production (`secure`, `httpOnly`)
- [ ] Frontend `VITE_API_BASE_URL` points to backend production URL

## 2) Backend Readiness
- [ ] `/api/health` returns `200` on deployed backend
- [ ] Rate limits active and tuned:
  - [ ] `RATE_LIMIT_MAX`
  - [ ] `AUTH_RATE_LIMIT_MAX`
  - [ ] `ATTEMPT_SUBMIT_RATE_LIMIT_MAX`
- [ ] Request logs visible in hosting logs
- [ ] Mongo indexes synced (first boot after deploy completes cleanly)

## 3) Student Critical Flows
- [ ] Signup works and creates pending account
- [ ] Admin approves student account
- [ ] Login works for approved student only
- [ ] Student sees dashboard + tests
- [ ] Student attempts and submits test successfully
- [ ] Result remains locked before `endTime`
- [ ] Result unlocks after `endTime`
- [ ] Leaderboard page opens after test end
- [ ] Leaderboard shows podium + your row highlighted

## 4) Admin Critical Flows
- [ ] View pending students / approve / reject
- [ ] Create question manually
- [ ] Bulk upload questions (CSV/XLSX)
- [ ] Column mapping + revalidation works
- [ ] Invalid rows export works
- [ ] Create test with selected questions
- [ ] Draft/publish toggle works
- [ ] Edit and delete test works

## 5) Browser & Mobile QA
- [ ] Chrome desktop
- [ ] Android Chrome
- [ ] iPhone Safari
- [ ] Navbar + menus on mobile do not shift page
- [ ] Attempt timer stable and no auto-submit on refresh

## 6) Security & Data
- [ ] No secrets committed to git (`.env`, credentials)
- [ ] CORS only allows trusted frontend domains
- [ ] Validation errors are user-friendly (no stack traces in prod responses)

## 7) Go / No-Go
- [ ] 0 blockers in critical flows
- [ ] No repeated 5xx spikes in logs during test run
- [ ] Team agrees launch decision

---

## Quick Smoke Commands (manual)

Backend health:

`GET /api/health`

Student result lock checks:

1. Submit before end time -> response should confirm submit, but no score reveal.
2. Open `/attempts/:id` before end time -> locked message.
3. After end time -> full result + leaderboard available.
