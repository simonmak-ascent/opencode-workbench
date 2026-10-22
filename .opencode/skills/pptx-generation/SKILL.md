---
name: pptx-generation
description: Create professional PowerPoint presentations with branded charts, KPI cards, tables, and multi-slide layouts using the docgen library
---

## When to Use
- Creating financial reports, quarterly/annual reviews
- Business presentations with data visualization
- Slide decks from research findings
- Any task asking for a .pptx, PowerPoint, or presentation file

## Library Location
`~/.local/bin/docgen/`

## Core Tools
Use the `create_pptx` tool from the `doc-tools` plugin.

Alternatively call Python directly:
```python
import sys
sys.path.insert(0, '/home/simonmak/.local/bin/docgen')
import chart_builder as cb
from pptx_generator import PptxGenerator
```

## Slide Types
| Type | When to Use |
|------|-------------|
| `title` | First slide — title + subtitle + date |
| `section` | Section dividers between content groups |
| `kpi` | KPI card row with metrics, values, changes |
| `chart` | Single full-width chart |
| `two_charts` | Side-by-side two charts |
| `chart_and_table` | Left chart + right data table |
| `table` | Standalone styled data table |
| `text` | Text/bullet content slide |

## Chart Types
| Type | Best For |
|------|----------|
| `bar` | Comparisons, rankings, categories |
| `line` | Trends over time, multi-series |
| `pie` | Part-to-whole distribution |
| `area` | Volume trends, stacked contributions |
| `scatter` | Correlations with trend line |
| `combo` | Bar + line dual-axis (e.g. revenue + margin) |
| `kpi_card` | Dashboard row of metric cards |

## Financial Report Pattern
```python
gen = PptxGenerator("Q4 2025 Report", author="OpenCode")
gen.add_title_slide("Q4 2025 Financial Report", "FY Performance", "Feb 2026")
gen.add_kpi_slide({"Revenue": {"value":"5.75M","unit":"$","change":"+14%"}})
gen.add_chart_slide("Revenue by Quarter", cb.bar_chart(quarters, values, "Revenue"))
gen.add_chart_slide("Profit Trend", cb.line_chart(quarters, series, "Profit"))
gen.add_two_chart_slide("Breakdown", pie_png, combo_png)
gen.add_table_slide("Summary", headers, rows)
gen.save("/home/simonmak/docgen_output/report.pptx")
```

## Output Location
Default: `~/docgen_output/`
All documents go to Windows accessible path via: `/mnt/c/Users/<user>/Documents/`
