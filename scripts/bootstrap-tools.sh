#!/usr/bin/env bash
# Bootstrap script: install additional workstation tooling not covered by setup.sh.
# Run after postCreate to add data processing, ETL, and conversion tools.
#
# Usage: bash scripts/bootstrap-tools.sh
set -euo pipefail

echo "=== Bootstrap: Data/ETL/Conversion Tools ==="

# --- apt packages ---
echo "[1/4] apt packages (pandoc, miller, jq, sqlite3)..."
sudo apt-get update -qq
sudo apt-get install -y -qq pandoc miller jq sqlite3 xmlstarlet

# --- pipx packages ---
echo "[2/4] pipx packages (csvkit)..."
pipx install csvkit || echo "csvkit already installed"

# --- pip packages (system, with --break-system-packages for Debian) ---
echo "[3/4] pip packages (duckdb, polars, datasette, pyarrow, openpyxl, xlrd, xlsxwriter, lxml, sqlalchemy, tabulate)..."
pip3 install --break-system-packages -q \
  duckdb polars datasette pyarrow \
  openpyxl xlrd xlsxwriter lxml \
  sqlalchemy tabulate

# --- npm global packages ---
echo "[4/4] npm global (csvtojson, json2csv)..."
npm install -g --silent csvtojson json2csv

echo ""
echo "=== Bootstrap complete ==="
echo "Installed: pandoc, miller (mlr), jq, csvkit, sqlite3, duckdb, polars, datasette,"
echo "           pyarrow, openpyxl, xlrd, xlsxwriter, lxml, csvtojson, json2csv"
