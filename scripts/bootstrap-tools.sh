#!/usr/bin/env bash
# Bootstrap script: install additional workstation tooling not covered by setup.sh.
# Run after postCreate to add data processing, ETL, conversion tools, and CLIs.
#
# Usage: bash scripts/bootstrap-tools.sh
set -euo pipefail

echo "=== Bootstrap: Data/ETL/CLI Tools ==="

# --- apt packages ---
echo "[1/5] apt packages (pandoc, miller, jq, sqlite3)..."
sudo apt-get update -qq
sudo apt-get install -y -qq pandoc miller jq sqlite3 xmlstarlet

# --- pipx packages ---
echo "[2/5] pipx packages (csvkit)..."
pipx install csvkit || echo "csvkit already installed"

# --- pip packages (system, with --break-system-packages for Debian) ---
echo "[3/5] pip packages (duckdb, polars, datasette, pyarrow, openpyxl, xlrd, xlsxwriter, lxml, sqlalchemy, tabulate)..."
pip3 install --break-system-packages -q \
  duckdb polars datasette pyarrow \
  openpyxl xlrd xlsxwriter lxml \
  sqlalchemy tabulate

# --- npm global packages ---
echo "[4/5] npm global (csvtojson, json2csv, vercel)..."
npm install -g --silent csvtojson json2csv vercel

# --- CLI tools ---
echo "[5/5] SurrealDB CLI..."
if ! command -v surreal >/dev/null 2>&1; then
  curl -sSf https://install.surrealdb.com | sh 2>/dev/null || echo "surrealdb install failed"
  sudo ln -sf "$HOME/.surrealdb/surreal" /usr/local/bin/surreal 2>/dev/null || true
fi

echo ""
echo "=== Bootstrap complete ==="
echo "Installed: pandoc, miller (mlr), jq, csvkit, sqlite3, duckdb, polars, datasette,"
echo "           pyarrow, openpyxl, xlrd, xlsxwriter, lxml, csvtojson, json2csv,"
echo "           vercel (CLI), surreal (CLI)"
