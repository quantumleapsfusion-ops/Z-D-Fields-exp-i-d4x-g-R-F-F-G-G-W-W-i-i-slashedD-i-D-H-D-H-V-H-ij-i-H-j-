# Da Vinci

Earth 1 Coalescent's own AI. A small FastAPI gateway that fronts self-hosted, open-weight
models on GPU hardware we control. e1-4.com talks to **one** endpoint with a shared secret;
no audio, transcript or prompt leaves our infrastructure.

Not deployed to Vercel. Runs on a Hetzner GEX130 (1× L40S 48 GB) via Docker Compose.

## Endpoints

All `/v1/*` routes require `Authorization: Bearer $DAVINCI_SECRET`.

| Route                 | Purpose                                                                                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /healthz`        | Liveness (public).                                                                                                                                                                                                                |
| `GET /readyz`         | Which backends (`llm`, `stt`, `embed`) currently answer.                                                                                                                                                                          |
| `POST /v1/complete`   | `{system, prompt, tier, temperature, max_tokens, seed?, json_schema?}` → `{text, json, model, usage}`. With `json_schema`, decoding is grammar-constrained (vLLM `response_format: json_schema`) and `json` is the parsed object. |
| `POST /v1/transcribe` | multipart `file` (+ optional `language`) → `{text, language, duration_s, segments[], model}`.                                                                                                                                     |
| `POST /v1/embed`      | `{texts[]}` → `{vectors[][], model, dimensions, usage}` (1024-d, for pgvector).                                                                                                                                                   |

Upstream model-server failures surface as `502` with a `llm:`/`stt:`/`embed:` prefix, so the
app can tell "Da Vinci is down" (503 in the app) from "the model misbehaved".

## Models (all Apache-2.0 / MIT)

| Role          | Default                                 | Served by                                              |
| ------------- | --------------------------------------- | ------------------------------------------------------ |
| LLM           | `Qwen/Qwen3.8-27B` (FP8 at load)        | vLLM, xgrammar structured outputs                      |
| Embeddings    | `Qwen/Qwen3-Embedding-0.6B` (1024-d)    | vLLM `--task embed`                                    |
| STT (Phase 1) | `Systran/faster-whisper-large-v3-turbo` | speaches (faster-whisper, CTranslate2)                 |
| STT (target)  | `Qwen/Qwen3-ASR-1.7B`                   | swap `STT_IMAGE`/`STT_MODEL` once validated on the box |

Every backend is OpenAI-compatible, so swapping a model is an `.env` change.

## Local development

```bash
cd apps/davinci
python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
.venv/bin/pytest            # gateway tests (backends are mocked; no GPU needed)
.venv/bin/ruff check . && .venv/bin/ruff format --check . && .venv/bin/mypy davinci tests

DAVINCI_SECRET=$(openssl rand -hex 32) .venv/bin/uvicorn davinci.main:app --factory --reload
```

Point `DAVINCI_LLM_URL` etc. at any OpenAI-compatible server (Ollama, LM Studio, a remote vLLM)
to run the real thing without a local GPU.

## Deploy (Hetzner L40S)

```bash
# on the box, once
apt-get install -y docker.io docker-compose-v2 nvidia-container-toolkit
git clone <repo> /opt/davinci && cd /opt/davinci/apps/davinci/deploy
cp .env.example .env            # set DAVINCI_HOST + DAVINCI_SECRET
docker compose up -d            # first start downloads ~30 GB of weights
cp davinci.service /etc/systemd/system/ && systemctl enable --now davinci

# verify
curl -fsS https://$DAVINCI_HOST/healthz
curl -fsS -H "Authorization: Bearer $DAVINCI_SECRET" https://$DAVINCI_HOST/readyz
```

Then in Vercel (e1-4-com project): `DAVINCI_URL=https://<host>` and `DAVINCI_SECRET=<same>`.
The app prefers Da Vinci over any third-party key when both are configured.

Firewall: allow 22 (from your IPs) and 80/443 only. The model servers are never published.

## Environment (`DAVINCI_*`)

| Variable                     | Default                      |
| ---------------------------- | ---------------------------- |
| `DAVINCI_SECRET`             | required, ≥16 chars          |
| `DAVINCI_LLM_URL`            | `http://127.0.0.1:8001/v1`   |
| `DAVINCI_LLM_MODEL_EVERYDAY` | `Qwen/Qwen3.8-27B`           |
| `DAVINCI_LLM_MODEL_HEAVY`    | `Qwen/Qwen3.8-27B`           |
| `DAVINCI_STT_URL`            | `http://127.0.0.1:8002/v1`   |
| `DAVINCI_STT_MODEL`          | `Qwen/Qwen3-ASR-1.7B`        |
| `DAVINCI_EMBED_URL`          | `http://127.0.0.1:8003/v1`   |
| `DAVINCI_EMBED_MODEL`        | `Qwen/Qwen3-Embedding-0.6B`  |
| `DAVINCI_EMBED_DIMENSIONS`   | `1024`                       |
| `DAVINCI_MAX_AUDIO_BYTES`    | `52428800`                   |
| `DAVINCI_*_TIMEOUT_S`        | llm 120 · stt 120 · embed 30 |

## Roadmap

- M1 (this): gateway, batch STT, constrained-JSON completions, embeddings, app client.
- M2: streaming STT over WebSocket for live transcription; browser WebGPU Whisper experiment.
- M3: pgvector memory (segment embeddings, diary search, hard-delete purge).
- M4: Chalkboard scene JSON + edit ops; Gravity Board superposition sampling/scoring/collapse.
- M5: retire `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `DEEPGRAM_API_KEY`.
