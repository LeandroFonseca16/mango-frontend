# Phase 2 – Local Execution Readiness Guide

This document captures the hardware requirements, software dependencies, and environment variables needed to run the Phase 2 pipeline (feature extraction → AI generation → publishing) locally once GPU and API credentials are available.

## 1. Hardware & OS Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| GPU | NVIDIA RTX 3060 (12 GB VRAM) | NVIDIA RTX 4090 / A6000 / A100 (24 GB+ VRAM) | CUDA compute capability ≥ 7.0. Multi-GPU speeds up batching. |
| GPU Drivers | NVIDIA 535.xx+ | Latest Studio driver | Must match CUDA 12.4 toolkits used by PyTorch wheels below. |
| CPU | 8 cores | 16+ cores | CPU still handles audio feature jobs, data ingestion, encoders. |
| RAM | 32 GB | 64 GB | Feast caching, model weights, and audio buffers. |
| Storage | 200 GB SSD | 500 GB NVMe | WAV stems + generated outputs grow quickly. |
| OS | Ubuntu 22.04 LTS / Windows 11 Pro | Ubuntu 22.04 LTS | Windows requires WSL2 for CUDA workloads. |

> **Driver & CUDA alignment**: ensure `nvidia-smi` reports the same major CUDA version as the PyTorch wheel you install (instructions below use CUDA 12.4 builds).

## 2. Python Environment

1. Install Python 3.11 (recommended). Use `pyenv` or Conda for isolation.
2. Create a virtual environment dedicated to Phase 2:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .\.venv\Scripts\Activate.ps1
```

3. Install base dependencies (works on CPU-only machines):

```bash
pip install --upgrade pip wheel
pip install -r requirements/base.txt
```

4. When a CUDA-capable GPU is available, install the accelerated extras (PyTorch, PANNs, diffusion stacks):

```bash
pip install -r requirements/gpu.txt
```

If you target a different CUDA toolkit, replace the `--extra-index-url` line in `requirements/gpu.txt` with the correct PyTorch wheel index (e.g. `cu118` or `cu121`).

5. Optional dev tooling:

```bash
pip install ipykernel notebook black isort pre-commit
```

## 3. System Packages (Ubuntu)

```bash
sudo apt update
sudo apt install build-essential ffmpeg libsndfile1-dev libpq-dev
```

On Windows, install [FFmpeg](https://ffmpeg.org/download.html) and ensure `ffmpeg.exe` is on `PATH` (for waveform generation).

## 4. Environment Variables (Phase 2)

Add the following keys to your `.env` (or use a dedicated `.env.phase2`) before running the pipeline. Values can be dummy while stubs are active.

| Variable | Description | Source |
|----------|-------------|--------|
| `OPENAI_API_KEY` | GPT-4.1 / Music or Content generation | OpenAI dashboard |
| `ANTHROPIC_API_KEY` | Optional – fallback prompt provider | Anthropic console |
| `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_KEY` | Optional – Azure-hosted GPT-4.1 | Azure portal |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` | TikTok Marketing API for uploads/analytics | TikTok Developers |
| `TIKTOK_ACCESS_TOKEN` | OAuth access token (refreshable) | TikTok Marketing API |
| `YOUTUBE_API_KEY` | Data API read access | Google Cloud console |
| `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` | OAuth upload scope | Google Cloud console |
| `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` | Graph API for Reels publishing | Meta for Developers |
| `INSTAGRAM_PAGE_ID` | Target business page | Meta Business Manager |
| `RESEND_API_KEY` | Transactional emails (optional) | Resend |
| `S3_ENDPOINT` | MinIO or AWS S3 endpoint for asset storage | Local MinIO / AWS |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Storage credentials | MinIO / AWS |
| `S3_BUCKET_GENERATED_AUDIO` | Bucket to upload rendered loops | Storage |
| `KAFKA_BROKER_URL` | Kafka bootstrap servers (phase 2) | Docker compose / cloud |
| `REDIS_URL` | Redis cache endpoint | Docker compose / cloud |
| `FEAST_PROJECT` | Feast project name (e.g. `mangobeat_phase2`) | Feast config |
| `PGVECTOR_URL` | Connection string to Postgres with pgvector | Database |
| `ORIGINALITY_THRESHOLD` | Guardrail cosine distance threshold (default `0.85`) | App config |

> Store secrets in a vault (AWS Secrets Manager, GCP Secret Manager, Hashicorp Vault). Avoid committing cleartext credentials.

## 5. GPU Provisioning Cheat Sheet

| Cloud | Instance | VRAM | Hourly Spot (USD) | Notes |
|-------|----------|------|-------------------|-------|
| AWS | g5.2xlarge (A10G) | 24 GB | $0.32–0.45 | Balanced cost vs. capability |
| AWS | p4d.24xlarge (A100) | 8×40 GB | $8.00–10.50 | High throughput diffusion |
| GCP | a2-highgpu-1g (A100) | 40 GB | $2.50–3.50 | Requires GPU quota request |
| GCP | a2-ultragpu-1g (H100) | 80 GB | $4.80–6.20 | For future-proofing |
| Azure | Standard_NC12ads_A100_v4 | 40 GB | $3.00–4.00 | NVLink; good for Torch |

Provision with Ubuntu 22.04 image + CUDA toolkit 12.4. Attach 250 GB NVMe scratch disk for audio artifacts. Add outbound internet for API calls.

## 6. Next Steps Checklist

1. **Install drivers + CUDA toolkit** matching GPU.
2. **Create virtual environment** and install requirements (`base` → optional `gpu`).
3. **Populate `.env`** with Phase 2 keys and storage endpoints.
4. **Run Docker compose** (`docker compose up -d --build`) to bring up Postgres, Kafka, Redis, MinIO, Next.js stub.
5. **Seed synthetic data** (until live crawlers run) via `python scripts/synthetic/synthetic_data_generator.py --count 100`.
6. **Verify stubs** using provided curl scripts (`/api/crawl/start`, `/api/features/extract`, `/api/generate`, `/api/publish`).
7. **Install Feast + pgvector** migrations (see `prisma/migrations` or SQL scripts).
8. **Swap stubs for real services** when credentials + GPU are ready (update environment to point to actual microservices).

## 7. References

- [PyTorch CUDA compatibility](https://pytorch.org/get-started/locally/)
- [NVIDIA CUDA toolkit downloads](https://developer.nvidia.com/cuda-downloads)
- [TikTok Marketing API docs](https://ads.tiktok.com/marketing_api/docs?id=1739584793491457)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Meta Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Feast feature store Quickstart](https://docs.feast.dev/user-guide/quickstart)

Keep this guide updated as integration steps evolve.
