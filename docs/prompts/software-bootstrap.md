# Software Bootstrap

**Purpose:** Install file format conversion, ETL, and data management tools.

**When To Use:** When setting up a fresh build box or adding data processing capabilities.

**Author:** DevOps  
**Date Modified:** 2026-07-25

---

Install files format conversion, ETL, data management tools:

**Format Conversion:**
- pandoc — universal document converter
- jq — JSON processor
- csvtojson, json2csv — Node.js converters

**ETL & Data Wrangling:**
- csvkit — CSV toolkit (csvcut, csvgrep, csvjoin, csvsql, csvjson, in2csv, sql2csv)
- miller (mlr) — structured data processing like awk/sed for CSV, JSON, TSV

**Data Management & Analysis:**
- SQLite — embedded relational database
- duckdb — in-process OLAP analytical database
- polars — high-performance DataFrame library
- datasette — instant SQLite-backed data browser
- pyarrow, openpyxl, xlrd, xlsxwriter, lxml — Excel/XML/Parquet support
- sqlalchemy, tabulate — SQL toolkit & table formatting

Installation methods:
- System packages via apt: pandoc, miller, jq, sqlite3
- Python packages via pipx: csvkit
- Python packages via pip (system): duckdb, polars, pyarrow, openpyxl, xlrd, xlsxwriter, lxml, sqlalchemy, tabulate, datasette
- npm global: csvtojson, json2csv
