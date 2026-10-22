---
name: alibaba-cloud
description: Operate Alibaba Cloud (SWAS / ECS / billing) via the `aliyun` CLI and the alibaba-cloud-ops MCP server. Use when creating/managing Alibaba Cloud servers, querying regions/plans/images, or troubleshooting billing.
---

# Alibaba Cloud operations

Operate Alibaba Cloud programmatically via the `aliyun` CLI or the
`alibaba-cloud-ops` MCP server (both use the same account credentials).

## Credentials

`~/.env.opencode` holds `ALIBABA_CLOUD_ACCESS_KEY_ID` + `ALIBABA_CLOUD_ACCESS_KEY_SECRET`.
The account is **international** (root account `5614539922438782`).

```bash
source ~/.env.opencode
export ALIBABA_CLOUD_ACCESS_KEY_ID ALIBABA_CLOUD_ACCESS_KEY_SECRET
```

## CLI — key facts (hard-won)

- `aliyun` is at `~/.local/bin/aliyun` (configured profile region `cn-hangzhou`).
- **International vs domestic**: this account is international, so use
  `--region ap-southeast-1` (or another `ap-*` region) to hit the international
  endpoint. `cn-*` regions route to the domestic site and fail auth/billing.
- **SWAS product code is `swas-open`** (not `swas`). First install its plugin:
  `aliyun plugin install --names aliyun-cli-swas-open`.
- **API names are kebab-case**: `list-instances`, `list-plans`, `list-images`,
  `create-instances`, `reset-system` (NOT camelCase).
- **SWAS region param is `--biz-region-id`** (not `--RegionId`).
- Query balance (correct international endpoint):
  `aliyun bssopenapi QueryAccountBalance --region ap-southeast-1 --endpoint business.ap-southeast-1.aliyuncs.com`
- Endpoint override omits the scheme (`--endpoint swas.ap-southeast-1.aliyuncs.com`),
  not `https://…`.

## Creating a SWAS instance

```bash
aliyun swas-open list-plans     --biz-region-id ap-southeast-1 --region ap-southeast-1
aliyun swas-open list-images    --biz-region-id ap-southeast-1 --region ap-southeast-1
aliyun swas-open create-instances \
  --biz-region-id ap-southeast-1 --region ap-southeast-1 \
  --image-id <Ubuntu-22.04-id> --plan-id swas.s.c2m4s50b1.linux --period 1 --amount 1
```

- 2C/4GB Linux plan: `swas.s.c2m4s50b1.linux` (~$10–16/mo). Ubuntu 22.04 image id
  `e9363571cf2444aba422b17470285465`.
- **Password is set AFTER creation** via `reset-system --login-credentials Password=…`
  (`create-instances` has no password param).
- **Billing gotcha**: `create-instances` only does *synchronous* payment and needs
  **cash balance** (not just a card). A `SYNC_PAYMENT_NOT_SUPPORT` error with a
  `$0.00` `AvailableAmount` means top up the balance, or create in the console.

## MCP server

`alibaba-cloud-ops` (local, `uvx alibaba-cloud-ops-mcp-server@latest`) provides
ECS/VPC/RDS/OSS/Cloud-Monitor tools + dynamic OpenAPI tools. Note: it has no
dedicated SWAS tools — use the `aliyun` CLI for SWAS.

## This repo's SWAS migration

`deploy/swas/` holds the systemd units (`wcag-score-worker.service`,
`browserless.service`) + `deploy.sh` + a README for running the assessment worker
and a co-located Browserless on one SWAS box. Worker + Browserless must be
co-located (CDP is latency-critical).
