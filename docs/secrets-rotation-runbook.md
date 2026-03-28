# Secrets Rotation Runbook — Issue #7

**Project:** Taskbloom / GetItDone  
**Scope:** `JWT_SECRET` and `ADMIN_PASSWORD`  
**Goal:** Rotate either secret in production without service interruption or user session loss.

---

## Overview

Two secrets require periodic rotation:

| Secret | Purpose | Rotation trigger |
|---|---|---|
| `JWT_SECRET` | Signs and verifies the httpOnly session cookie issued at OAuth login | Suspected compromise, quarterly schedule, or staff offboarding |
| `ADMIN_PASSWORD` | Authenticates the `/admin` dashboard via `timingSafeEqual` comparison | Suspected compromise, staff offboarding, or quarterly schedule |

Both secrets are injected as environment variables by the Manus platform and are never stored in source code or the database. Rotation therefore requires updating the secret value in the platform's Secrets panel and triggering a deployment.

---

## 1. Rotating `JWT_SECRET`

### Risk profile

Changing `JWT_SECRET` immediately invalidates **all existing user sessions**. Every logged-in user will be silently signed out on their next request and redirected to the OAuth login page. For a productivity app used during working hours this is disruptive; the dual-validation window below eliminates that disruption.

### Recommended approach — dual-validation window

The strategy is to accept tokens signed with either the old or the new secret for a short overlap period (typically 15–30 minutes), then remove the old secret.

#### Step 1 — Prepare the new secret

Generate a cryptographically strong random value. A 256-bit (32-byte) hex string is appropriate:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Record the new value securely (e.g., in your password manager). Do **not** commit it to source control.

#### Step 2 — Add dual-validation support in code

Before deploying the new secret, update `server/_core/cookies.ts` (or wherever JWT verification occurs) to accept an array of secrets and try each in order:

```ts
// server/_core/cookies.ts (dual-validation window)
const secrets = [
  process.env.JWT_SECRET_NEW,   // new secret — tried first
  process.env.JWT_SECRET,       // old secret — fallback during overlap
].filter(Boolean) as string[];

export async function verifySessionToken(token: string): Promise<Payload | null> {
  for (const secret of secrets) {
    try {
      const payload = await jwtVerify(token, new TextEncoder().encode(secret));
      return payload.payload as Payload;
    } catch {
      // try next secret
    }
  }
  return null;
}
```

Deploy this code change **before** changing any secret values.

#### Step 3 — Add the new secret to the platform

In the Manus Secrets panel (Settings → Secrets), add a new secret `JWT_SECRET_NEW` with the value generated in Step 1. Trigger a deployment. The server now accepts tokens signed with either secret.

#### Step 4 — Promote the new secret

After the overlap period (15–30 minutes is sufficient; all active sessions will have refreshed), update the Manus Secrets panel:

1. Set `JWT_SECRET` to the new value (the value currently in `JWT_SECRET_NEW`).
2. Delete `JWT_SECRET_NEW`.
3. Trigger a deployment.

The server now only accepts tokens signed with the new secret. Any sessions signed with the old secret are invalidated — but because the overlap window has passed, all active users already hold a new-secret token.

#### Step 5 — Revert the dual-validation code

Remove the `JWT_SECRET_NEW` branch from `verifySessionToken` and redeploy. The codebase is clean again.

#### Step 6 — Verify

Confirm in the application logs that no `jwt signature verification failed` errors appear after the final deployment.

---

## 2. Rotating `ADMIN_PASSWORD`

### Risk profile

`ADMIN_PASSWORD` is compared server-side using `crypto.timingSafeEqual` and is never stored in the database or returned to the client. Changing it takes effect immediately on the next request — there is no session to invalidate because admin authentication uses a separate short-lived httpOnly cookie (`admin_session`). The rotation is therefore zero-downtime by design.

### Steps

#### Step 1 — Generate a new password

Use a password manager to generate a random password of at least 20 characters containing uppercase, lowercase, digits, and symbols. Record it securely.

#### Step 2 — Update the secret in the platform

In the Manus Secrets panel, update `ADMIN_PASSWORD` to the new value and trigger a deployment.

#### Step 3 — Verify

Attempt to log in to the admin dashboard with the new password. Confirm the old password is rejected.

#### Step 4 — Distribute

Share the new password with all authorised administrators via a secure channel (e.g., a shared password manager vault entry). Revoke access for any departing staff by repeating this rotation.

---

## 3. Emergency rotation (suspected compromise)

If either secret is suspected to have been exposed:

1. **Rotate immediately** — do not wait for a maintenance window. Follow the steps above, skipping the dual-validation overlap for `JWT_SECRET` if the risk of active session hijacking outweighs the disruption of signing everyone out.
2. **Audit access logs** — review server logs for unusual admin login attempts or anomalous API calls in the period before the suspected compromise.
3. **Rotate related secrets** — if `JWT_SECRET` was compromised, also rotate `ADMIN_PASSWORD` and vice versa, as the attacker may have had broader access.
4. **Notify affected users** if there is evidence that user session tokens were used maliciously.

---

## 4. Rotation schedule

| Secret | Recommended rotation interval |
|---|---|
| `JWT_SECRET` | Every 90 days, or immediately on suspected compromise or staff offboarding |
| `ADMIN_PASSWORD` | Every 90 days, or immediately on suspected compromise or staff offboarding |

---

## 5. Checklist

Use this checklist for each rotation event:

- [ ] New secret value generated using a cryptographically secure method
- [ ] New value recorded in the team password manager before deployment
- [ ] For `JWT_SECRET`: dual-validation code deployed before secret value changed
- [ ] New secret value set in Manus Secrets panel
- [ ] Deployment triggered and health check passed
- [ ] For `JWT_SECRET`: overlap period observed, then old secret removed and final deployment triggered
- [ ] Login verified with new credentials
- [ ] Old secret value purged from all records
- [ ] Rotation event logged in the team's security log (date, rotated by, reason)
