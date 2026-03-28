# GitHub PAT Update — Add `issues:write` Scope

## Why this is needed

The current fine-grained PAT (`github_pat_11BB5DEXY08H...`) has `contents:write` permission but does not have `issues:write`. This prevents CI/CD automation from closing GitHub issues programmatically after a deployment.

## Why it cannot be done via the API

GitHub's REST API does not provide an endpoint to modify the permissions of an existing fine-grained PAT. The token must be regenerated or a new token created with the correct permissions through the GitHub web UI.

## Steps to create a new PAT with `issues:write`

1. Sign in to GitHub as **BigLittleBusiness**.
2. Navigate to **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
3. Click **Generate new token**.
4. Set the following fields:

   | Field | Value |
   |---|---|
   | Token name | `GetItDone CI/CD` (or any descriptive name) |
   | Expiration | 90 days (or your preferred rotation interval) |
   | Resource owner | `BigLittleBusiness` |
   | Repository access | Only select repositories → `GetItDone` |

5. Under **Repository permissions**, grant:

   | Permission | Access level |
   |---|---|
   | Contents | Read and write |
   | Issues | Read and write |
   | Metadata | Read-only (required, auto-selected) |

6. Click **Generate token** and copy the new token value immediately — it is shown only once.

## Where to update the token

Update the token in two places:

1. **Manus project secrets** — In the Manus Management UI under Settings → Secrets, update or add a secret named `GITHUB_PAT` with the new token value.
2. **Manus agent memory** — Provide the new token value to the Manus agent so it can be saved as the project-specific PAT for future tasks.

## Verify the new token

After updating, verify `issues:write` works:

```bash
curl -s -X PATCH \
  -H "Authorization: token <NEW_TOKEN>" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/BigLittleBusiness/GetItDone/issues/1" \
  -d '{"state":"open"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('state:', d.get('state'), 'msg:', d.get('message',''))"
```

Expected output: `state: open msg: `

## CI/CD usage pattern

Once the new token is in place, the following pattern can be used in any automation script to close an issue after a successful deployment:

```bash
# Close an issue and leave a comment referencing the commit
REPO="BigLittleBusiness/GetItDone"
ISSUE=6
SHA=$(git rev-parse HEAD)

# Post a resolution comment
curl -sf -X POST \
  -H "Authorization: token $GITHUB_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues/$ISSUE/comments" \
  -d "{\"body\":\"Resolved in commit $SHA.\"}"

# Close the issue
curl -sf -X PATCH \
  -H "Authorization: token $GITHUB_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues/$ISSUE" \
  -d '{"state":"closed"}'
```
