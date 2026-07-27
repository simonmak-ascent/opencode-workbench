# Python Data Tools (pip)

> Phase: #3 | Created: 2026-07-27
> Documenting already-installed Python data tooling.

## duckdb
- **Purpose**: In-process OLAP SQL engine for analytical queries
- **Install**: `pip3 install --break-system-packages duckdb`
- **Runtime impact**: Zero — embedded, no server process
- **Why chosen**: Fastest analytical SQL engine, zero-config, works directly on CSV/Parquet/JSON
- **Alternatives considered**: SQLite (OLTP-oriented), pandas (heavier, Python-only API)
- **Limitations**: Single-node, not for high-concurrency OLTP

## polars
- **Purpose**: Fast DataFrame library in Rust with Python bindings
- **Install**: `pip3 install --break-system-packages polars`
- **Runtime impact**: Zero — library only
- **Why chosen**: Faster than pandas, lazy evaluation, expression-based API
- **Alternatives considered**: pandas (more ecosystem, slower)
- **Limitations**: Smaller ecosystem than pandas

## datasette
- **Purpose**: SQLite exploration UI
- **Install**: `pip3 install --break-system-packages datasette`
- **Runtime impact**: Starts HTTP server on demand
- **Why chosen**: Best SQLite exploration and publishing tool
- **Security**: Bind to localhost only; don't expose without auth
- **Rollback**: `pip3 uninstall datasette`

## pyarrow
- **Purpose**: Apache Arrow columnar format
- **Install**: `pip3 install --break-system-packages pyarrow`
- **Runtime impact**: Zero — library only
- **Why chosen**: Interchange format between DuckDB, Polars, and other analytics tools
- **Limitations**: Low-level API; use via DuckDB/Polars

## openpyxl, xlrd, xlsxwriter, lxml
- **Purpose**: Excel read/write (openpyxl, xlrd, xlsxwriter) and XML/HTML parsing (lxml)
- **Rollback**: `pip3 uninstall openpyxl xlrd xlsxwriter lxml`

## sqlalchemy, tabulate
- **Purpose**: ORM (sqlalchemy) and table formatting (tabulate)
- **Rollback**: `pip3 uninstall sqlalchemy tabulate`
