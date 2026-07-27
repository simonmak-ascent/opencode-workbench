# Figma Integration

> Phase: #2 | Created: 2026-07-27

## Architecture

```
Figma Design File
  │
  ├─ Variables (colors, spacing, radii, typography)
  │    │
  │    ▼
  │  Figma Variables API / Plugin export
  │    │
  │    ▼
  │  tokens/source/primitives.json
  │  tokens/source/semantic.json
  │    │
  │    ▼
  │  Style Dictionary (build script)
  │    │
  │    ▼
  │  src/styles/generated/tokens.css
  │    │
  │    ▼
  │  tailwind.config.ts (references CSS vars)
  │    │
  │    ▼
  │  React components + Storybook
  │
  └─ Components (design specs)
       │
       ▼
     Figma MCP (design token queries)
       │
       ▼
     DesignAgent (generates Tailwind + JSX)
```

## Token Pipeline

### Step 1: Export from Figma
Use Figma Variables API or approved plugin to export W3C DTCG-compliant JSON:
```bash
# Via Figma Variables REST API (requires FIGMA_ACCESS_TOKEN)
curl -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/variables/local"
```

### Step 2: Store as Source of Truth
```
tokens/
├── source/
│   ├── primitives.json     # color, spacing, radius primitives
│   └── semantic.json       # semantic token mappings
└── generated/
    └── tokens.css           # Style Dictionary output (committed)
```

### Step 3: Transform with Style Dictionary
```js
// style-dictionary.config.js
module.exports = {
  source: ["tokens/source/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/styles/generated/",
      files: [{
        destination: "tokens.css",
        format: "css/variables"
      }]
    }
  }
};
```

### Step 4: Wire to Tailwind
```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-surface-brand)',
        'text-primary': 'var(--color-text-primary)',
      },
      borderRadius: {
        md: 'var(--radius-md)',
      },
    },
  },
};
```

## CI Validation

```yaml
figma-tokens:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm run tokens:build    # Run Style Dictionary
    - run: |
        if ! git diff --exit-code src/styles/generated/; then
          echo "Generated tokens differ from committed. Run 'npm run tokens:build' locally."
          exit 1
        fi
    - run: npm run storybook:build
    - run: npm run test:visual     # Visual regression in light/dark/high-contrast
```

## Figma MCP Usage

```bash
# Start the Figma MCP HTTP server
bash scripts/services/figma-mcp.sh start
```

The DesignAgent uses Figma MCP to:
1. Query design tokens from Figma files
2. Get component specs and variants
3. Extract spacing, color, and typography values
4. Generate corresponding Tailwind classes and JSX

## Component Design Sync

```
Figma component → Figma MCP query → DesignAgent
  → extracts: tokens, layout, spacing, typography
  → generates: Tailwind JSX + Storybook story
  → validates: visual regression against Figma screenshot
```

## Figma MCP Server

- **Type**: Local (npm global)
- **Package**: `figma-developer-mcp`
- **Transport**: HTTP on `localhost:3333`
- **Auth**: `FIGMA_ACCESS_TOKEN` env var
- **Start**: `bash scripts/services/figma-mcp.sh start`
