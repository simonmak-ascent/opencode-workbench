---
name: pdf-reporting
description: Generate professional multi-page PDF reports with branded cover, sections, embedded charts, styled tables, KPI rows, and automatic page headers/footers
---

## When to Use
- Formal reports for distribution (financial, research, analysis)
- Documents requiring professional layout with headers and footers
- Any task asking for a .pdf report

## Library Location
`~/.local/bin/docgen/`

## Core Tools
Use the `create_pdf` tool from the `doc-tools` plugin.

Or call Python directly:
```python
import sys
sys.path.insert(0, '/home/simonmak/.local/bin/docgen')
import chart_builder as cb
from pdf_reporter import PdfReporter
```

## Section Types
| Method | Purpose |
|--------|---------|
| `add_cover` | Branded cover page (title, subtitle, date) |
| `add_section` | Heading + body text (supports `\n\n` paragraphs, `- ` bullets) |
| `add_chart` | Embed matplotlib PNG with caption |
| `add_table` | Styled data table with caption |
| `add_kpi_row` | Horizontal row of KPI metric cards |
| `add_page_break` | Force a new page |

## Full Pattern
```python
r = PdfReporter("Q4 2025 Financial Report", author="OpenCode")
r.add_cover(subtitle="FY2025 Performance Summary")
r.add_section("Executive Summary", "Revenue grew 14% YoY...\n\n- Key point 1\n- Key point 2")
r.add_kpi_row({"Revenue": {"value":"5.75M","unit":"$","change":"+14%"}})
r.add_chart("Figure 1: Revenue by Quarter", cb.bar_chart(q, v, "Revenue"))
r.add_table("Table 1: Summary", headers, rows)
r.add_page_break()
r.add_section("Outlook", "Strategic priorities...")
r.save("/home/simonmak/docgen_output/report.pdf")
```

## Auto Features
- Page 1 (cover): no header/footer
- All other pages: branded header bar (title + author) + footer (date + page X of Y)
- Tables automatically repeat headers on new pages
