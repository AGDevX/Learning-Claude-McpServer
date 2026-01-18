# Docker Setup Guide

## Prerequisites
- Docker Desktop installed and running
- Project built (`npm run build` already executed)
- `.env` file configured with your OpenAPI specification URL

## Configuration Before Running

**IMPORTANT**: You must set your OpenAPI specification URL before starting the server.

Edit `.env` file:
```env
# Required: URL to your OpenAPI spec
API_SPEC_URL=https://localhost:7086/openapi/v1.json

# Optional: Base URL for API calls
API_BASE_URL=https://localhost:7086

# Optional: Custom server name
MCP_SERVER_NAME=openapi-mcp-server
```

## Building and Running with Docker

### Option 1: Using Docker Compose (Recommended)

1. Build and start the container:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop the container:
```bash
docker-compose down
```

### Option 2: Using Docker CLI

1. Build the Docker image:
```bash
docker build -t openapi-mcp-server .
```

2. Run the container with environment variables:
```bash
docker run -d \
  -p 3001:3000 \
  -e API_SPEC_URL=https://localhost:7086/openapi/v1.json \
  -e API_BASE_URL=https://localhost:7086 \
  --name openapi-mcp-server \
  openapi-mcp-server
```

3. View logs:
```bash
docker logs -f openapi-mcp-server
```

4. Stop the container:
```bash
docker stop openapi-mcp-server
docker rm openapi-mcp-server
```

## Verifying the Server

The MCP server should be accessible at:
- **Endpoint**: http://localhost:3001/mcp (Docker Compose default)
- **Internal**: http://localhost:3000/mcp (container port)

Test if it's running:
```bash
curl http://localhost:3001/mcp
```

You should see output indicating the server is running. Check logs to verify your API spec was loaded:
```bash
docker-compose logs -f | grep "Loaded API"
docker-compose logs -f | grep "Registering tool"
```

## Connecting Claude Code

Claude Code needs to be configured to connect to the HTTP MCP server. Add the following to your Claude Code settings:

### For Claude Desktop (claude_desktop_config.json):

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

### For Claude Code CLI:

Add to your MCP settings file (`~/.config/claude/mcp_settings.json` or similar):

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

## Troubleshooting

1. **Server won't start - "Cannot start MCP server without valid OpenAPI specification"**:
   - Ensure `API_SPEC_URL` is set in `.env` file
   - Verify your API is running and accessible
   - Test the URL: `curl https://localhost:7086/openapi/v1.json`

2. **Port already in use**: Change the port mapping in docker-compose.yml:
   ```yaml
   ports:
     - "8080:3000"  # Use port 8080 on host instead
   ```

3. **Container won't start**: Check logs with `docker-compose logs` or `docker logs openapi-mcp-server`

4. **Can't connect from Claude Code**: Ensure:
   - Docker container is running (`docker ps`)
   - Port 3001 is exposed and accessible
   - No firewall blocking the connection
   - Using `http://localhost:3001/mcp` as the endpoint

5. **No tools appearing**:
   - Verify OpenAPI spec is valid (OpenAPI 3.0+)
   - Check that endpoints have `operationId` fields
   - Review server logs for tool registration messages
