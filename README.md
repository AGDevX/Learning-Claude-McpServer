# OpenAPI MCP Server

A Model Context Protocol (MCP) server that dynamically exposes API endpoints from any OpenAPI specification as tools for Claude. This allows Claude to interact with your .NET Core API (or any OpenAPI-compliant API) by automatically generating tool definitions from your swagger/OpenAPI spec.

## Features

- **Dynamic Tool Generation**: Automatically creates MCP tools from OpenAPI specifications
- **Full OpenAPI Support**: Works with OpenAPI 3.0 and 3.1 specifications
- **Parameter Mapping**: Converts OpenAPI parameters (path, query, header, body) to MCP tool inputs
- **Type Safety**: Uses Zod schemas for runtime validation based on OpenAPI types
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Environment Configuration**: Flexible configuration via environment variables
- **Error Handling**: Comprehensive error handling and logging

## Quick Start

### 1. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your API details:

```env
# Required: URL to your OpenAPI spec
API_SPEC_URL=http://localhost:5000/swagger/v1/swagger.json

# Optional: Base URL for API calls (if different from spec)
API_BASE_URL=http://localhost:5000

# Optional: Custom server name
MCP_SERVER_NAME=my-api-mcp-server
```

### 2. Build and Run with Docker

```bash
# Build the project
npm run build

# Start the MCP server
docker-compose up -d

# View logs
docker-compose logs -f
```

The server will be available at `http://localhost:3001/mcp`

### 3. Connect to Claude Code

Add to your Claude Code settings (`mcp_settings.json`):

```json
{
  "mcpServers": {
    "my-api": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

**Settings location**:
- Windows: `%APPDATA%\Claude\mcp_settings.json`
- macOS: `~/Library/Application Support/Claude/mcp_settings.json`
- Linux: `~/.config/claude/mcp_settings.json`

Restart Claude Code to connect.

## How It Works

1. **Startup**: The MCP server fetches your OpenAPI specification from the configured URL
2. **Tool Generation**: Each API endpoint becomes an MCP tool with:
   - Tool name derived from the operationId (or auto-generated)
   - Description from the operation summary
   - Input schema converted from OpenAPI parameters and request body
3. **Execution**: When Claude calls a tool, the server:
   - Validates the input parameters
   - Constructs and executes the HTTP request to your API
   - Returns the response to Claude

## Configuration

All configuration is done via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_SPEC_URL` | Yes | - | URL to OpenAPI specification (e.g., `/swagger/v1/swagger.json`) |
| `API_BASE_URL` | No | From spec | Base URL for API calls (overrides spec servers) |
| `MCP_SERVER_NAME` | No | `openapi-mcp-server` | Name of the MCP server |
| `PORT` | No | `3000` | Port for the MCP server |
| `API_TIMEOUT` | No | `30000` | API request timeout in milliseconds |
| `SPEC_REFRESH_INTERVAL` | No | `0` | How often to refresh spec (0 = never) |

## Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Set environment variables
export API_SPEC_URL=http://localhost:5000/swagger/v1/swagger.json

# Run the server
npm start

# Or run in development mode with auto-reload
npm run dev
```

### Project Structure

```
.
├── src/
│   ├── config.ts                  # Configuration and environment variables
│   ├── index.ts                   # Entry point
│   ├── server/
│   │   ├── mcpServer.ts          # MCP server setup and tool registration
│   │   └── httpTransport.ts      # HTTP transport and session management
│   └── services/
│       ├── openApiService.ts     # OpenAPI spec fetching and API calls
│       └── toolGenerator.ts      # Dynamic tool generation from OpenAPI
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # Docker image definition
└── .env.example                  # Environment variable template
```

## Using with Your .NET Core API

1. **Ensure your API exposes an OpenAPI spec**:
   - Most .NET Core APIs with Swashbuckle have this at `/swagger/v1/swagger.json`
   - Or at `/swagger/v1/swagger.yaml`

2. **Set the API_SPEC_URL**:
   ```bash
   API_SPEC_URL=http://your-api:5000/swagger/v1/swagger.json
   ```

3. **If your API requires authentication**:
   - Currently, the server doesn't support authentication
   - This can be extended by modifying `src/services/openApiService.ts`
   - Add headers in the `apiClient` configuration

4. **Docker networking**:
   - If your .NET API is also in Docker, use Docker network names
   - Example: `API_SPEC_URL=http://my-dotnet-api:80/swagger/v1/swagger.json`

## Example Usage with Claude

Once connected, Claude can interact with your API:

```
User: "What endpoints are available in my API?"
Claude: *Calls the server info resource to list all tools*

User: "Get all users"
Claude: *Calls the get_users tool (if it exists in your API)*

User: "Create a new user with name 'John Doe' and email 'john@example.com'"
Claude: *Calls the create_user tool with appropriate parameters*
```

Claude will automatically:
- Understand which tools to use based on descriptions
- Provide required parameters
- Handle responses and errors
- Format results for you

## Troubleshooting

### Server won't start

**Error**: "Cannot start MCP server without valid OpenAPI specification"

**Solutions**:
- Verify `API_SPEC_URL` is set and accessible
- Check that your API is running
- Test the URL: `curl http://your-api/swagger/v1/swagger.json`

### Claude can't connect

**Solutions**:
1. Verify the MCP server is running: `docker ps`
2. Check logs: `docker-compose logs -f`
3. Test the endpoint: `curl http://localhost:3001/mcp`
4. Verify Claude Code configuration has the correct URL

### Tools not working

**Check**:
1. Server logs for errors: `docker-compose logs -f`
2. API accessibility from within Docker
3. OpenAPI spec validity

### Port conflicts

Change the port in `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Use 8080 instead of 3001
```

Then update Claude Code config to use the new port.

## Advanced Configuration

### Custom Docker Network

To connect with other Docker services:

```yaml
services:
  openapi-mcp-server:
    networks:
      - my-network

networks:
  my-network:
    external: true
```

### Environment-Specific Configuration

Create multiple env files:
- `.env.development`
- `.env.production`

Load with: `docker-compose --env-file .env.production up`

## Contributing

Contributions are welcome! Areas for improvement:
- Authentication support (API keys, OAuth, JWT)
- Response caching
- Rate limiting
- OpenAPI schema validation improvements
- Support for webhooks and callbacks

## License

MIT

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs: `docker-compose logs -f`
3. Open an issue with:
   - Your OpenAPI spec structure (sanitized)
   - Error messages from logs
   - Configuration (without sensitive data)
