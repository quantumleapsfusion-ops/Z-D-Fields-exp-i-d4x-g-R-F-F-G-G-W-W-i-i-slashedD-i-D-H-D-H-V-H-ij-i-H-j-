# Security

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private
[Report a vulnerability](../../security/advisories/new) form, or e-mail
chiefexec@earth1.co. You will get a reply within three working days.

## Secrets

Never commit keys, tokens, passwords or connection strings. They belong in Vercel or
Cloudflare environment variables, GitHub Actions secrets, or a local `.env.local`
(ignored by git). Every push and pull request is scanned with gitleaks; if a secret is
ever committed, rotate it first, then remove it from history.
