---
name: cloudflare
description: Operate Cloudflare (Workers, Pages, KV, R2, D1, DNS, Zones) via the Cloudflare MCP server and R2 S3-compatible endpoint. Use when deploying Workers/Pages, managing KV/R2/D1 storage, editing DNS records, purging cache, or troubleshooting Cloudflare resources.
---

# Cloudflare operations

Operate Cloudflare programmatically via the `cloudflare` MCP server (remote, at
`https://mcp.cloudflare.com/mcp`) which exposes the full Cloudflare API — 2,500+
endpoints covering Workers, Pages, KV, R2, D1, DNS/Zones, Stream, Images, and more.

## Credentials

`~/.env.opencode` already exports everything needed (added 2026-09-13):

```bash
source ~/.env.opencode
```

| Var | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token used by the `cloudflare` MCP server (`Authorization: Bearer`) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID (`1c30748e...`) |
| `CLOUDFLARE_ZONE_ID` | DNS Zone ID (`082a307c...`) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` / `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 S3-compatible credentials |
| `CLOUDFLARE_R2_ENDPOINT` | `https://<account_id>.r2.cloudflarestorage.com` |

## MCP server (primary interface)

- Server name in opencode: `cloudflare` (remote MCP, auth via Bearer API token).
- Because it's API-token based, always double-check that the token has the
  scopes for the operation you're doing before assuming a 403 is a config bug.
- Account tokens should include `Account Resources : Read` so the server can
  auto-detect the account; user tokens work too.
- If a call needs the account/zone ID and the tool doesn't auto-detect, use the
  values from `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_ZONE_ID`.

## R2 (object storage) — direct S3-compatible access

For direct object upload/download (bypassing the MCP layer), use any S3 client
against the R2 endpoint. `aws` CLI is the common choice:

```bash
source ~/.env.opencode
export AWS_ACCESS_KEY_ID="$CLOUDFLARE_R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$CLOUDFLARE_R2_SECRET_ACCESS_KEY"
aws --endpoint-url "$CLOUDFLARE_R2_ENDPOINT" s3 ls s3://<bucket>/
```

## CLI

No `wrangler` / `cloudflare` CLI is installed globally yet. For deploy/`wrangler`
workflows, prefer the MCP server, or install the CLI on demand:
`pnpm add -g wrangler` (then `wrangler login` uses the token from `~/.env.opencode`).

## Notes

- DNS record edits go through the zone in `CLOUDFLARE_ZONE_ID`.
- Cache purging and Workers deploys go through the account in `CLOUDFLARE_ACCOUNT_ID`.
- API tokens with Client IP Address Filtering are not supported by the MCP server.
