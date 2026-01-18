# Quick Start Guide

## Get Started with OpenAPI MCP Server 🚀

The OpenAPI MCP Server dynamically exposes your API endpoints as Claude tools.

### Prerequisites

Before starting, ensure you have:
1. Your API running and accessible
2. OpenAPI spec URL (e.g., `https://localhost:7086/openapi/v1.json`)
3. Docker Desktop installed

### 1. Configure Your API

Edit the `.env` file with your API details:

```bash
# Required: URL to your OpenAPI specification
API_SPEC_URL=https://localhost:7086/openapi/v1.json

# Optional: Base URL for API calls (if different from spec)
API_BASE_URL=https://localhost:7086

# Optional: Custom server name
MCP_SERVER_NAME=openapi-mcp-server
```

### 2. Build and Start the Server

```bash
# Build the project
npm run build

# Start with Docker Compose
docker-compose up -d

# View logs to verify it started
docker-compose logs -f
```

Look for these messages in the logs:
```
Loaded API: YourApiName (v1.0.0)
Found X API operations
Registering tool: operationName (GET /path)
MCP Server listening on http://localhost:3000
```

### 3. Connect Claude Code

Add this to your Claude Code settings (`mcp_settings.json`):

```json
{
  "mcpServers": {
    "my-api": {
      "url": "http://localhost:3001/mcp",
      "transport": "http"
    }
  }
}
```

**Settings location**:
- Windows: `%APPDATA%\Claude\mcp_settings.json`
- macOS: `~/Library/Application Support/Claude/mcp_settings.json`
- Linux: `~/.config/claude/mcp_settings.json`

After adding the configuration, **restart Claude Code**.

### 4. Test the Connection

Ask Claude:
- "What tools are available from my API?"
- "Show me the server information"

Then start using your API through Claude based on the available operations.

## Quick Commands

```bash
# View logs
docker-compose logs -f

# Restart server
docker-compose restart

# Stop server
docker-compose down

# Start server
docker-compose up -d

# Rebuild and restart (after code or config changes)
npm run build && docker-compose up -d --build

# Check if server is running
curl http://localhost:3001/mcp
```

## How It Works

1. **Server fetches your OpenAPI spec** from the configured URL
2. **Each API endpoint becomes an MCP tool** named after its `operationId`
3. **Claude can call these tools** to interact with your API
4. **Responses are formatted** and returned to Claude for analysis

## Troubleshooting

### Server won't start

Check logs:
```bash
docker-compose logs -f
```

Common issues:
- `API_SPEC_URL` not set or incorrect
- API not running or not accessible
- Invalid OpenAPI specification

### No tools appearing

Verify:
1. OpenAPI spec is valid (OpenAPI 3.0+)
2. Endpoints have `operationId` fields
3. Check server logs for tool registration

### Can't connect from Claude

Ensure:
1. Server is running: `docker ps | grep openapi-mcp-server`
2. Port 3001 is accessible: `curl http://localhost:3001/mcp`
3. Claude Code config has correct URL
4. Claude Code has been restarted

## Next Steps

- Read `CLAUDE_CODE_SETUP.md` for detailed connection instructions
- Read `DOCKER_SETUP.md` for Docker configuration options
- Read `PROJECT_STRUCTURE.md` to understand the codebase
- Read `README.md` for comprehensive documentation

---

**Server Details**:
- Endpoint: http://localhost:3001/mcp
- Container: openapi-mcp-server
- Port mapping: 3001 (host) → 3000 (container)
