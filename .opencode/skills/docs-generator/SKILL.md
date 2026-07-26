---
name: docs-generator
description: Generate comprehensive API and project documentation from code and specs
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: developers-maintainers
---

## What I do

- Generate API documentation, README files, architecture docs, and contributor guides
- Extract from JSDoc/TSDoc comments, OpenAPI specs, and code structure
- Produce clean, well-organized markdown docs suitable for GitHub, GitBook, or Docusaurus

## When to use me

Use when: writing README for a new project, documenting an API, generating TypeDoc/JSDoc, or creating contributor guides. Trigger phrases: "document this API...", "write a README for...", "generate docs for...", "create API documentation...", "write a contributor guide...".

## Workflow

1. Determine what documentation is needed and for which audience:
   - **README**: project overview, quick start, features, links to full docs
   - **API docs**: endpoint reference with request/response examples
   - **Architecture docs**: system design, data flow, module map
   - **Contributor guide**: setup, conventions, PR process
   - **User guide**: installation, configuration, usage examples
2. Gather sources:
   - Code comments (JSDoc, TSDoc, docstrings)
   - OpenAPI/Swagger specs
   - Existing markdown files
   - Package manifests and config files
3. Generate documentation that is:
   - **Scannable**: clear headings, tables, code blocks
   - **Complete**: covers all public APIs, configuration options, and error scenarios
   - **Example-driven**: every concept has a working code example
   - **Versioned**: note which version features were added/changed
4. For API documentation, include for each endpoint:
   - HTTP method and path
   - Authentication required
   - Request parameters (path, query, body) with types
   - Response shape with types
   - Error codes and meanings
   - Curl or SDK example
5. Output as well-structured markdown files in the project's docs directory

## README template

```markdown
# Project Name
Brief description (one sentence)

## Features
## Quick Start
## Documentation
## API Reference
## Configuration
## Contributing
## License
```
