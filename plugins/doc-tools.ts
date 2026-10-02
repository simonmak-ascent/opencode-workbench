/**
 * doc-tools.ts — Document generation custom tools for OpenCode.
 *
 * Exposes create_pptx, create_excel, create_pdf, create_chart as AI tools.
 * Each tool calls the corresponding Python script in ~/.local/bin/docgen/.
 *
 * SCHEMA NOTE: Only string/number/boolean args are used to avoid Zod v4
 * compatibility issues with record(), any(), and nested object schemas.
 * Complex structured data (slides, sections, kpis) is passed as JSON strings
 * and parsed inside execute().
 */

import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

const DOCGEN = process.env.DOCGEN_DIR ?? `${process.env.HOME ?? "/root"}/.local/bin/docgen`

export const DocToolsPlugin: Plugin = async ({ $ }) => {
  return {
    tool: {

      create_pptx: tool({
        description:
          "Create a PowerPoint presentation (.pptx) with charts, KPI cards, tables, and graphics. " +
          "Pass slides as a JSON string. Each slide has a 'type' field: " +
          "'title' (title+subtitle+date), 'section' (divider), 'kpi' (metrics dict), " +
          "'chart' (chart_type + labels + values + series), 'two_charts', 'table' (headers + rows), 'text' (body). " +
          "Chart types: bar, line, pie, area, scatter, combo. " +
          "Output saved to ~/docgen_output/ by default. " +
          "Example slides_json: '[{\"type\":\"title\",\"title\":\"Q4 Report\",\"subtitle\":\"2025\"},{\"type\":\"chart\",\"title\":\"Revenue\",\"chart_type\":\"bar\",\"labels\":[\"Q1\",\"Q2\"],\"values\":[100,200]}]'",
        args: {
          title:       tool.schema.string().describe("Presentation title"),
          slides_json: tool.schema.string().describe("JSON array of slide definitions"),
          author:      tool.schema.string().optional().describe("Author name (default: OpenCode)"),
          output_path: tool.schema.string().optional().describe("Full output path (default: ~/docgen_output/<title>.pptx)"),
        },

        async execute(args) {
          const home   = process.env.HOME ?? "/root"
          const output = args.output_path
            ?? `${home}/docgen_output/${args.title.replace(/\s+/g, "_")}.pptx`

          const script = `
import sys, json
sys.path.insert(0, '${DOCGEN}')
import chart_builder as cb
from pptx_generator import PptxGenerator

slides = json.loads(sys.argv[1])
title  = sys.argv[2]
author = sys.argv[3]
output = sys.argv[4]

gen = PptxGenerator(title, author)

for slide in slides:
    t = slide.get('type', '')
    sl_title = slide.get('title', '')

    if t == 'title':
        gen.add_title_slide(sl_title, slide.get('subtitle',''), slide.get('date',''))
    elif t == 'section':
        gen.add_section_divider(sl_title, slide.get('subtitle',''))
    elif t == 'kpi':
        gen.add_kpi_slide(slide.get('metrics', {}), sl_title)
    elif t == 'text':
        gen.add_text_slide(sl_title, slide.get('body', ''))
    elif t == 'table':
        gen.add_table_slide(sl_title, slide.get('headers', []), slide.get('rows', []))
    elif t == 'chart':
        ct     = slide.get('chart_type', 'bar')
        labels = slide.get('labels', [])
        values = slide.get('values', [])
        series = slide.get('series', {})
        if ct == 'bar':
            png = cb.bar_chart(labels, values, sl_title)
        elif ct == 'line':
            png = cb.line_chart(labels, series or {'Values': values}, sl_title)
        elif ct == 'pie':
            png = cb.pie_chart(labels, values, sl_title)
        elif ct == 'area':
            png = cb.area_chart(labels, series or {'Values': values}, sl_title)
        elif ct == 'scatter':
            png = cb.scatter_chart(slide.get('x', values), slide.get('y', values), sl_title)
        elif ct == 'combo':
            png = cb.combo_chart(labels, series.get('bar',{}), series.get('line',{}), sl_title)
        else:
            png = cb.bar_chart(labels, values, sl_title)
        gen.add_chart_slide(sl_title, png, slide.get('notes',''))
    elif t == 'two_charts':
        left  = slide.get('left',  {})
        right = slide.get('right', {})
        def _make_chart(cfg):
            ct2 = cfg.get('chart_type', 'bar')
            lbl = cfg.get('labels', []); val = cfg.get('values', []); ser = cfg.get('series', {})
            if ct2 == 'bar':   return cb.bar_chart(lbl, val, cfg.get('title',''))
            if ct2 == 'line':  return cb.line_chart(lbl, ser or {'Values': val}, cfg.get('title',''))
            if ct2 == 'pie':   return cb.pie_chart(lbl, val, cfg.get('title',''))
            if ct2 == 'area':  return cb.area_chart(lbl, ser or {'Values': val}, cfg.get('title',''))
            return cb.bar_chart(lbl, val, cfg.get('title',''))
        gen.add_two_chart_slide(sl_title, _make_chart(left), _make_chart(right),
                                left.get('title',''), right.get('title',''))

path = gen.save(output)
print(path)
`
          const result = await $`python3 -c ${script} ${args.slides_json} ${args.title} ${args.author ?? "OpenCode"} ${output}`.text()
          return `PPTX created: ${result.trim()}`
        },
      }),

      create_excel: tool({
        description:
          "Create an Excel workbook (.xlsx) with formatted data sheets, native charts, and a KPI dashboard. " +
          "Pass sheets as a JSON string array. Each sheet: {name, headers[], rows[][], chart_type?, chart_title?}. " +
          "Pass kpis as a JSON string: {\"Revenue\":{\"value\":\"5M\",\"unit\":\"$\",\"change\":\"+12%\"}}. " +
          "Chart types: bar, line, pie. Output saved to ~/docgen_output/ by default.",
        args: {
          title:       tool.schema.string().describe("Workbook title"),
          sheets_json: tool.schema.string().describe("JSON array of sheet definitions"),
          kpis_json:   tool.schema.string().optional().describe("JSON object of KPI metrics"),
          output_path: tool.schema.string().optional().describe("Full output path (default: ~/docgen_output/<title>.xlsx)"),
        },

        async execute(args) {
          const home   = process.env.HOME ?? "/root"
          const output = args.output_path
            ?? `${home}/docgen_output/${args.title.replace(/\s+/g, "_")}.xlsx`

          const script = `
import sys, json
sys.path.insert(0, '${DOCGEN}')
from excel_analyzer import ExcelAnalyzer

sheets = json.loads(sys.argv[1])
title  = sys.argv[2]
kpis   = json.loads(sys.argv[3]) if sys.argv[3] != 'null' else None
output = sys.argv[4]

ea = ExcelAnalyzer(title)

for sheet in sheets:
    name    = sheet.get('name', 'Sheet')
    headers = sheet.get('headers', [])
    rows    = sheet.get('rows', [])
    ea.add_data_sheet(name, headers, rows)

    ct = sheet.get('chart_type')
    if ct and headers and rows:
        n_rows = len(rows)
        if ct == 'bar':
            ea.add_native_bar_chart(sheet.get('chart_title', name), name,
                'A', ['B'], 2, n_rows+1, name, 'A' + str(n_rows+5))
        elif ct == 'line':
            ea.add_native_line_chart(sheet.get('chart_title', name), name,
                'A', ['B'], 2, n_rows+1, name, 'A' + str(n_rows+5))
        elif ct == 'pie':
            ea.add_native_pie_chart(sheet.get('chart_title', name), name,
                'A', 'B', 2, n_rows+1, name, 'A' + str(n_rows+5))

if kpis:
    ea.add_kpi_sheet(kpis)

path = ea.save(output)
print(path)
`
          const kpisArg = args.kpis_json ?? "null"
          const result  = await $`python3 -c ${script} ${args.sheets_json} ${args.title} ${kpisArg} ${output}`.text()
          return `Excel created: ${result.trim()}`
        },
      }),

      create_pdf: tool({
        description:
          "Create a professional PDF report (.pdf) with cover page, sections, embedded charts, and tables. " +
          "Pass sections as a JSON string array. Each section has a 'type' field: " +
          "'cover' (subtitle), 'section' (heading+body), 'chart' (chart_type+labels+values+series+caption), " +
          "'table' (caption+headers+rows), 'kpi_row' (metrics dict), 'page_break'. " +
          "Chart types: bar, line, pie, area, scatter, combo. " +
          "Output saved to ~/docgen_output/ by default.",
        args: {
          title:         tool.schema.string().describe("Report title"),
          sections_json: tool.schema.string().describe("JSON array of section definitions"),
          author:        tool.schema.string().optional().describe("Author name (default: OpenCode)"),
          output_path:   tool.schema.string().optional().describe("Full output path (default: ~/docgen_output/<title>.pdf)"),
        },

        async execute(args) {
          const home   = process.env.HOME ?? "/root"
          const output = args.output_path
            ?? `${home}/docgen_output/${args.title.replace(/\s+/g, "_")}.pdf`

          const script = `
import sys, json
sys.path.insert(0, '${DOCGEN}')
import chart_builder as cb
from pdf_reporter import PdfReporter

sections = json.loads(sys.argv[1])
title    = sys.argv[2]
author   = sys.argv[3]
output   = sys.argv[4]

r = PdfReporter(title, author)

for sec in sections:
    t = sec.get('type', '')
    if t == 'cover':
        r.add_cover(sec.get('subtitle', ''))
    elif t == 'section':
        r.add_section(sec.get('heading', ''), sec.get('body', ''),
                      level=sec.get('level', 2))
    elif t == 'page_break':
        r.add_page_break()
    elif t == 'kpi_row':
        r.add_kpi_row(sec.get('metrics', {}))
    elif t == 'table':
        r.add_table(sec.get('caption', ''), sec.get('headers', []), sec.get('rows', []))
    elif t == 'chart':
        ct     = sec.get('chart_type', 'bar')
        labels = sec.get('labels', [])
        values = sec.get('values', [])
        series = sec.get('series', {})
        heading = sec.get('heading', 'Chart')
        if ct == 'bar':    png = cb.bar_chart(labels, values, heading)
        elif ct == 'line': png = cb.line_chart(labels, series or {'Values': values}, heading)
        elif ct == 'pie':  png = cb.pie_chart(labels, values, heading)
        elif ct == 'area': png = cb.area_chart(labels, series or {'Values': values}, heading)
        elif ct == 'scatter': png = cb.scatter_chart(sec.get('x', values), sec.get('y', values), heading)
        elif ct == 'combo':   png = cb.combo_chart(labels, series.get('bar',{}), series.get('line',{}), heading)
        else: png = cb.bar_chart(labels, values, heading)
        r.add_chart(sec.get('caption', heading), png)

path = r.save(output)
print(path)
`
          const result = await $`python3 -c ${script} ${args.sections_json} ${args.title} ${args.author ?? "OpenCode"} ${output}`.text()
          return `PDF created: ${result.trim()}`
        },
      }),

      create_chart: tool({
        description:
          "Generate a standalone chart image (PNG) and save it to disk. " +
          "Supports: bar, line, pie, area, scatter, combo, kpi_card. " +
          "For line/area/combo, pass series_json: '{\"Series A\":[1,2,3]}'. " +
          "For kpi_card, pass metrics_json: '{\"Revenue\":{\"value\":\"5M\",\"unit\":\"$\",\"change\":\"+12%\"}}'. " +
          "For scatter, pass x_json and y_json as JSON arrays.",
        args: {
          chart_type:   tool.schema.string().describe("Chart type: bar, line, pie, area, scatter, combo, kpi_card"),
          title:        tool.schema.string().describe("Chart title"),
          labels_json:  tool.schema.string().optional().describe("JSON array of category labels e.g. '[\"Q1\",\"Q2\"]'"),
          values_json:  tool.schema.string().optional().describe("JSON array of numeric values e.g. '[100,200]'"),
          series_json:  tool.schema.string().optional().describe("JSON object of named series e.g. '{\"Revenue\":[100,200]}'"),
          metrics_json: tool.schema.string().optional().describe("JSON object for kpi_card type"),
          x_json:       tool.schema.string().optional().describe("JSON array of X values for scatter"),
          y_json:       tool.schema.string().optional().describe("JSON array of Y values for scatter"),
          horizontal:   tool.schema.boolean().optional().describe("Horizontal bars (bar type only)"),
          output_path:  tool.schema.string().optional().describe("Where to save the PNG"),
        },

        async execute(args) {
          const home   = process.env.HOME ?? "/root"
          const output = args.output_path
            ?? `${home}/docgen_output/${args.title.replace(/\s+/g, "_")}.png`

          const script = `
import sys, json
sys.path.insert(0, '${DOCGEN}')
import chart_builder as cb
from pathlib import Path

ct      = sys.argv[1]
title   = sys.argv[2]
labels  = json.loads(sys.argv[3]) if sys.argv[3] != 'null' else []
values  = json.loads(sys.argv[4]) if sys.argv[4] != 'null' else []
series  = json.loads(sys.argv[5]) if sys.argv[5] != 'null' else {}
metrics = json.loads(sys.argv[6]) if sys.argv[6] != 'null' else {}
x_vals  = json.loads(sys.argv[7]) if sys.argv[7] != 'null' else values
y_vals  = json.loads(sys.argv[8]) if sys.argv[8] != 'null' else values
horiz   = sys.argv[9] == 'true'
output  = sys.argv[10]

if ct == 'bar':      png = cb.bar_chart(labels, values, title, horizontal=horiz)
elif ct == 'line':   png = cb.line_chart(labels, series or {'Values': values}, title)
elif ct == 'pie':    png = cb.pie_chart(labels, values, title)
elif ct == 'area':   png = cb.area_chart(labels, series or {'Values': values}, title)
elif ct == 'scatter':png = cb.scatter_chart(x_vals, y_vals, title)
elif ct == 'combo':  png = cb.combo_chart(labels, series.get('bar',{}), series.get('line',{}), title)
elif ct == 'kpi_card': png = cb.kpi_card(metrics, title)
else:                png = cb.bar_chart(labels, values, title)

Path(output).parent.mkdir(parents=True, exist_ok=True)
Path(output).write_bytes(png)
print(output)
`
          const result = await $`python3 -c ${script} ${args.chart_type} ${args.title} ${args.labels_json ?? "null"} ${args.values_json ?? "null"} ${args.series_json ?? "null"} ${args.metrics_json ?? "null"} ${args.x_json ?? "null"} ${args.y_json ?? "null"} ${args.horizontal ? "true" : "false"} ${output}`.text()
          return `Chart saved: ${result.trim()}`
        },
      }),

    },
  }
}
