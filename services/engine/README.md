# E1-4 Engine

Earth 1 Coalescent's backend service: a small FastAPI app. Today it answers `/` and
`/health`; endpoints grow here as earth1.co and e1-4.com need them. It is separate from
`apps/davinci` (the self-hosted AI gateway).

## Run

```bash
cd services/engine
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn main:app --reload        # http://127.0.0.1:8000
```

| Route     | Returns                                              |
| --------- | ---------------------------------------------------- |
| `/`       | `{"system": "E1-4 Engine", "status": "Operational"}` |
| `/health` | `{"ok": true}`                                       |

## Check

```bash
ruff check . && ruff format --check . && mypy . && pytest -q
```

## CORS

Allowed origins are `https://earth1.co`, `https://e1-4.com` and any `localhost` /
`127.0.0.1` port. Add preview or staging origins with a comma-separated
`ENGINE_EXTRA_ORIGINS` environment variable; never widen the list in code.

## Docker

```bash
docker build -t e14-engine services/engine
docker run --rm -p 8000:8000 e14-engine
```

Hosting is not decided (see `QUESTIONS.md`); nothing here deploys anything.
