# Connecting Claude Code to Your OpenAPI MCP Server

## Server is Running!

Your OpenAPI MCP Server is now running in Docker at:

- **Host URL**: http://localhost:3001/mcp
- **Container Internal**: http://localhost:3000/mcp

This server dynamically exposes your API endpoints as MCP tools based on your OpenAPI specification.

## Connecting Claude Code

Claude Code supports HTTP MCP servers. Here's how to connect:

### Method 1: Using Claude Code Settings File

1. **Claude Code typically discovers HTTP MCP servers automatically** if they follow the standard. However, if you need to manually configure:

2. **Check your Claude Code settings location** by running:

   ```bash
   claude config show
   ```

   This will show you where your configuration files are stored.

3. **If manual configuration is needed**, create or edit the MCP settings file in your Claude Code configuration directory with:

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

   claude mcp add --transport http my-api --scope user http://localhost:3001/mcp⁠

4. **Restart Claude Code** to pick up the new configuration.

> **Note**: The exact configuration method may vary depending on your Claude Code version. Check the official Claude Code documentation for the most up-to-date instructions.

### Method 2: Using Claude Desktop

If using Claude Desktop instead of Claude Code CLI:

1. **Locate your configuration file**:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Add the HTTP MCP server**:

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

3. **Restart Claude Desktop**.

## Testing the Connection

Once connected, Claude will have access to tools generated from your OpenAPI specification.

### Viewing Available Tools

Ask Claude:

- "What tools are available from my API?"
- "Show me the server information resource"

### Using the Tools

The available tools depend on your OpenAPI specification. Each API endpoint becomes a tool named after its `operationId`.

For example, if your API has these endpoints:

- `GET /api/users` (operationId: `getUsers`)
- `POST /api/users` (operationId: `createUser`)
- `GET /api/users/{id}` (operationId: `getUserById`)

Then you can ask Claude:

- "Get all users from my API"
- "Create a new user with name 'John Doe'"
- "Get user with ID 123"

## Troubleshooting

### Claude Code can't connect to the server

1. **Check if Docker container is running**:

   ```bash
   docker ps | grep openapi-mcp-server
   ```

2. **Check container logs**:

   ```bash
   docker-compose logs -f openapi-mcp-server
   ```

3. **Verify the endpoint is accessible**:

   ```bash
   curl http://localhost:3001/mcp
   ```

   You should get a JSON-RPC response (even if it's an error, it means the server is responding).

4. **Check firewall settings**: Ensure localhost connections on port 3001 are allowed.

### Server won't start - "Cannot start MCP server without valid OpenAPI specification"

This means the server cannot fetch your OpenAPI spec. Check:

1. **Is your API running?** The OpenAPI spec URL must be accessible
2. **Is the URL correct?** Check `API_SPEC_URL` in your `.env` file
3. **Test the URL manually**:

   ```bash
   curl https://localhost:7086/openapi/v1.json
   ```

4. **SSL/TLS issues?** If using `https://localhost`, you may need to configure SSL certificate trust

### No tools are showing up

1. **Check the OpenAPI spec is valid**: Ensure your API is exposing a valid OpenAPI 3.0+ specification
2. **Check server logs** for tool registration messages:
   ```bash
   docker-compose logs -f | grep "Registering tool"
   ```
3. **Verify operationIds exist**: Each endpoint should have an `operationId` in the spec

### Server stopped unexpectedly

Restart the container:

```bash
docker-compose restart
```

Or stop and start fresh:

```bash
docker-compose down
docker-compose up -d
```

### Want to use a different port?

Edit `docker-compose.yml` and change the port mapping:

```yaml
ports:
  - 'YOUR_PORT:3000' # Change YOUR_PORT to desired port
```

Then update your Claude Code configuration to use the new port.

## Stopping the Server

When you're done:

```bash
docker-compose down
```

This stops and removes the container. Your Docker image will remain, so you can quickly start it again with `docker-compose up -d`.

## Additional Information

- **Server logs**: `docker-compose logs -f openapi-mcp-server`
- **Server status**: `docker-compose ps`
- **Rebuild after code changes**: `npm run build && docker-compose up -d --build`
- **Change API spec**: Update `API_SPEC_URL` in `.env` and restart the container
