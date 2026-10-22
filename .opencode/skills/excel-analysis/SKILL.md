---
name: excel-analysis
description: Create professional Excel workbooks with native editable charts, KPI dashboards, conditional formatting, and pandas-powered statistical analysis
---

## When to Use
- Data analysis tasks requiring Excel output
- Financial models with editable native charts
- Reports where users need to edit data in Excel
- Statistical summaries, descriptive analytics

## Library Location
`~/.local/bin/docgen/`

## Core Tools
Use the `create_excel` tool from the `doc-tools` plugin.

Or call Python directly:
```python
import sys
sys.path.insert(0, '/home/simonmak/.local/bin/docgen')
import pandas as pd
from excel_analyzer import ExcelAnalyzer
```

## Sheet Types
| Method | Purpose |
|--------|---------|
| `add_data_sheet` | Formatted table with headers and striped rows |
| `add_dataframe_sheet` | Pandas DataFrame → formatted sheet |
| `add_kpi_sheet` | Dashboard with big KPI numbers |
| `add_analysis_sheet` | Descriptive statistics (describe()) |
| `add_image_chart` | Embed matplotlib PNG chart |

## Native Excel Charts (Editable in Excel)
| Method | Chart Type |
|--------|-----------|
| `add_native_bar_chart` | Column chart |
| `add_native_line_chart` | Line chart |
| `add_native_pie_chart` | Pie chart |

## Conditional Formatting
```python
ea.add_conditional_formatting("Sheet", "B", 2, 10)
# Applies green-yellow-red 3-color scale
```

## Full Example
```python
import pandas as pd
from excel_analyzer import ExcelAnalyzer

df = pd.DataFrame({"Quarter":["Q1","Q2","Q3","Q4"],
                   "Revenue":[1200000,1450000,1380000,1720000]})

ea = ExcelAnalyzer("Financial Analysis")
ea.add_dataframe_sheet("Data", df)
ea.add_native_bar_chart("Revenue Chart", "Data", "A", ["B"], 2, 5, "Data", "A8")
ea.add_kpi_sheet({"Revenue": {"value":"5.75M","unit":"$","change":"+14%"}})
ea.add_conditional_formatting("Data", "B", 2, 5)
ea.save("/home/simonmak/docgen_output/analysis.xlsx")
```
