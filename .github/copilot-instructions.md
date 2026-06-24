# Git Commit Messages

Use Conventional Commits format:

```
<type>(<scope>): <short summary>
```

**Types:** `feat` `fix` `refactor` `chore`

**Scopes:** `api` `web` `schema` `db` `ai` `auth` `ui` `infra` `ci`

**Rules:**
- Summary: lowercase, imperative mood, no period, max 72 chars
- One logical change per commit
- Breaking change: add `!` after scope and a `BREAKING CHANGE:` footer

**Examples:**
```
feat(api): add enrollment module
fix(web): resolve hydration mismatch on student list
chore(infra): add redis to docker-compose
feat(schema)!: rename payment status enum

BREAKING CHANGE: update all references from `status` to `paymentStatus`
```