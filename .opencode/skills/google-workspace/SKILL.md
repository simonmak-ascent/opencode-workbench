---
name: google-workspace
description: Interact with Gmail, Google Docs, Sheets, Slides, Calendar, Drive, and Contacts via the Google Workspace MCP server
---

## When to Use
- Reading/sending emails via Gmail
- Creating or editing Google Docs
- Reading/writing Google Sheets data
- Managing Google Calendar events
- Uploading/downloading Google Drive files
- Any task involving Google Workspace apps

## Setup Required (One-time)
Before first use, run OAuth setup:
```bash
mkdir -p ~/.mcp/google-workspace-mcp
docker run -it --rm \
  -v ~/.mcp/google-workspace-mcp:/app/config \
  -e GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
  -e GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
  ghcr.io/aaronsb/google-workspace-mcp:latest
```
Then set `"enabled": true` in opencode.json for google-workspace.

## Available Operations by Service

### Gmail
- List, read, search emails
- Send emails (plain text or HTML)
- Reply to threads
- Label management
- Draft creation

### Google Sheets
- Read cell ranges
- Write data to ranges
- Create new spreadsheets
- Append rows
- Format cells

### Google Docs
- Create new documents
- Read document content
- Append content
- Search within docs

### Google Drive
- List files and folders
- Upload files
- Download files
- Create folders
- Share files

### Google Calendar
- List events
- Create events
- Update/delete events
- Check availability

## Usage Pattern
```
# Specify the service in your prompt:
"Use google-workspace to send an email to..."
"Use google-workspace to read from Google Sheet..."
"Use google-workspace to create a calendar event..."
```

## Notes
- Enabled only after Google OAuth credentials are configured
- Set `"enabled": true` in opencode.json after OAuth setup
- Credentials stored in `~/.mcp/google-workspace-mcp/`
