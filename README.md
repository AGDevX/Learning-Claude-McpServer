# OpenAPI MCP Server

A Model Context Protocol (MCP) server that dynamically exposes API endpoints from any OpenAPI specification as tools for MCP clients. This allows MCP clients to interact with your .NET Core API (or any OpenAPI-compliant API) by automatically generating tool definitions from your swagger/OpenAPI spec.

MCP clients will automatically:

- Understand which tools to use based on descriptions
- Provide required parameters
- Handle responses and errors
- Format results for you

## Features

- **Dynamic Tool Generation**: Automatically creates MCP tools from OpenAPI specifications
- **Full OpenAPI Support**: Works with OpenAPI 3.0 and 3.1 specifications
- **Parameter Mapping**: Converts OpenAPI parameters (path, query, header, body) to MCP tool inputs
- **Type Safety**: Uses Zod schemas for runtime validation based on OpenAPI types
- **Multi-Environment Support**: Configure multiple API environments (dev, qa, prod) and switch between them per-request
- **Live Spec Refresh**: Update tools without restarting - existing tools automatically use the latest spec, new operations are registered on-the-fly
- **Rate Limiting**: Built-in protection for production APIs with configurable request limits
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Flexible Configuration**: Environment variables for all settings
- **Error Handling**: Comprehensive error handling and logging

## How It Works

1. **Startup**: The MCP server fetches your OpenAPI specification from the configured URL
2. **Tool Generation**: Each API endpoint becomes an MCP tool with:
   - Tool name derived from the operationId (or auto-generated)
   - Description from the operation summary
   - Input schema converted from OpenAPI parameters and request body
3. **MCP clients can call these tools**: When a tool is called, the server:
   - Validates the input parameters
   - Constructs and executes the HTTP request to your API
   - Returns the response
4. **Responses are formatted** and returned for analysis

## Prerequisites

- Docker Desktop installed and running
- Your MCP Client of choice installed

## Configuration Before Running

All configuration is done via environment variables:

### General Configuration

| Variable                | Required | Default              | Description                                                  |
| ----------------------- | -------- | -------------------- | ------------------------------------------------------------ |
| `MCP_SERVER_NAME`       | No       | `openapi-mcp-server` | Name of the MCP server                                       |
| `PORT`                  | No       | `3000`               | Port for the MCP server                                      |
| `API_TIMEOUT`           | No       | `30000`              | API request timeout in milliseconds                          |
| `SPEC_REFRESH_INTERVAL` | No       | `0`                  | How often to refresh spec (0 = never)                        |
| `RATE_LIMIT_ENABLED`    | No       | `true`               | Enable/disable rate limiting (`true` or `false`)             |
| `RATE_LIMIT_REQUESTS`   | No       | `10`                 | Maximum number of requests allowed in time window            |
| `RATE_LIMIT_WINDOW_MS`  | No       | `60000`              | Rate limit time window in milliseconds (default: 60 seconds) |

### Environment Configuration

| Variable              | Required | Default   | Description                                                                    |
| --------------------- | -------- | --------- | ------------------------------------------------------------------------------ |
| `ENVIRONMENTS`        | Yes      | -         | Comma-separated list of environment names (e.g., `dev,qa,prod` or just `prod`) |
| `DEFAULT_ENVIRONMENT` | No       | First     | Default environment to use when not specified                                  |
| `API_SPEC_URL_{ENV}`  | Yes\*    | -         | OpenAPI spec URL for each environment (e.g., `API_SPEC_URL_DEV`)               |
| `API_BASE_URL_{ENV}`  | No       | From spec | Base URL for each environment (e.g., `API_BASE_URL_DEV`)                       |

\*Required for each environment listed in `ENVIRONMENTS`

### Configuration Examples

**Single Environment:**

```bash
ENVIRONMENTS=prod
API_SPEC_URL_PROD=https://api.example.com/openapi/v1.json
API_BASE_URL_PROD=https://api.example.com
```

**Multiple Environments:**

```bash
ENVIRONMENTS=dev,qa,prod
DEFAULT_ENVIRONMENT=dev

API_SPEC_URL_DEV=https://dev-api.example.com/openapi/v1.json
API_BASE_URL_DEV=https://dev-api.example.com

API_SPEC_URL_QA=https://qa-api.example.com/openapi/v1.json
API_BASE_URL_QA=https://qa-api.example.com

API_SPEC_URL_PROD=https://api.example.com/openapi/v1.json
API_BASE_URL_PROD=https://api.example.com
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

4. Restart the container:

```bash
docker-compose restart
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

Run the view logs command and look for these messages in the logs:

```
Loaded API: YourApiName (v1.0.0)
Found X API operations
Registering tool: operationName (GET /path)
MCP Server listening on http://localhost:3000
```

## Stopping the Server

When you're done:

```bash
docker-compose down
```

This stops and removes the container. Your Docker image will remain, so you can quickly start it again with `docker-compose up -d`.

## Connecting Claude Code

Claude Code supports HTTP MCP servers. Here's how to connect:

#### Method 1: Using Claude Code Settings File

1. **Claude Code typically discovers HTTP MCP servers automatically** if they follow the standard. However, if you need to manually configure:

2. **Check your Claude Code settings location** by running:

   ```bash
   claude config show
   ```

   This will show you where your configuration files are stored.

3. **To configure by command line**, run `claude mcp add --transport http my-api --scope user http://localhost:3001/mcp⁠`

4. **If manual configuration is needed**, create or edit the MCP settings file in your Claude Code configuration directory with:

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

5. **Restart Claude Code** to pick up the new configuration.

> **Note**: The exact configuration method may vary depending on your Claude Code version. Check the official Claude Code documentation for the most up-to-date instructions.

#### Method 2: Using Claude Desktop

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

### Testing the Connection

Once connected, Claude will have access to tools generated from your OpenAPI specification.

Ask Claude:

- "What tools are available from my API?"
- "Show me the server information resource"

### Using the Tools

The available tools depend on your OpenAPI specification. Each API endpoint becomes a tool named after its `operationId`. Additionally, a special `refresh_openapi_spec` tool is always available to update the spec.

For example, if your API has these endpoints:

- `GET /api/users` (operationId: `getUsers`)
- `POST /api/users` (operationId: `createUser`)
- `GET /api/users/{id}` (operationId: `getUserById`)

Then you can ask Claude:

- "Get all users from my API"
- "Create a new user with name 'John Doe'"
- "Get user with ID 123"

## Working with Multiple Environments

If you have multiple environments configured (dev, qa, prod), you can switch between them on a per-request basis.

### How It Works

Every API tool includes an optional `environment` parameter. When not specified, the default environment is used. You can:

- Execute the same request in different environments
- Compare responses across environments
- Test in dev, verify in qa, deploy to prod - all without restarting

### Managing Environments

The server provides three tools for environment management:

- **`list_environments`** - View all configured environments and their details
- **`get_current_environment`** - Check which environment is currently default
- **`set_default_environment`** - Change the default environment

### Usage Examples

**List all environments:**

```
You: "List all available environments"

Claude: [Calls list_environments tool]

Configured Environments:

- dev (default): My API v1.0.0 - https://dev-api.example.com (25 operations)
- qa: My API v1.0.0 - https://qa-api.example.com (25 operations)
- prod: My API v1.0.0 - https://api.example.com (25 operations)

Use the "environment" parameter in any tool to specify which environment to use.
```

**Execute a request in a specific environment:**

```
You: "Get all users from the dev environment"

Claude: [Calls getUsers tool with environment: "dev"]
```

**Compare across environments:**

```
You: "Get user with ID 123 from dev, then get the same user from prod"

Claude: [Calls getUserById with environment: "dev", then with environment: "prod"]
```

**Change the default environment:**

```
You: "Set the default environment to prod"

Claude: [Calls set_default_environment with environment: "prod"]

Default environment changed to: prod

API: My API v1.0.0
Base URL: https://api.example.com
Operations: 25
```

### Best Practices

- **Development**: Use dev environment by default for testing
- **Verification**: Switch to qa for verification before production
- **Production**: Explicitly specify `environment: "prod"` for production operations
- **Safety**: Keep prod as a non-default environment to avoid accidental changes

## Refreshing the OpenAPI Spec

The server includes a special `refresh_openapi_spec` tool that allows you to update the OpenAPI specification without restarting the MCP server or your Claude client connection.

### When to Use

Refresh the spec when:

- Your API has been updated with new endpoints
- Existing endpoints have changed (parameters, paths, etc.)
- You want to ensure you're working with the latest API definition

### How to Use

Simply ask Claude:

- "Refresh the OpenAPI spec"
- "Get the latest API specification"
- "Update the API spec"

### What Happens

When you refresh the spec:

1. **Fetches the latest** OpenAPI specification from the configured URL
2. **Updates existing tools** - All existing tools immediately start using the updated operation definitions (paths, parameters, request bodies, etc.)
3. **Registers new operations** - Any new endpoints are automatically registered as new tools
4. **Reports changes** - Returns a summary showing:
   - API title and version
   - Total number of operations
   - How many new operations were added

### Important Notes

- **No restart required** - All changes take effect immediately
- **Existing tools work instantly** - Updated paths and parameters are used on the next tool call
- **New tools are available immediately** - You can start using newly discovered operations right away
- **Tool metadata limitation** - For existing tools, the description and input schema shown to Claude won't update until you restart the connection (but the actual execution uses the latest spec)

### Example

```
You: "Refresh the OpenAPI spec"

Claude: [Calls refresh_openapi_spec tool]

Result: "OpenAPI spec refreshed successfully!

API: My API (v2.0.0)
Total Operations: 25
New Operations Registered: 3

All existing tools have been updated to use the latest spec. New operations are now available."
```

## Rate Limiting

The server includes built-in rate limiting to protect production APIs from being overwhelmed by too many requests.

### How It Works

Rate limiting uses a **sliding window algorithm** that:

1. Tracks all requests within a configurable time window
2. Blocks requests that exceed the maximum allowed
3. Provides clear error messages with retry information
4. Applies globally to all tools (including `refresh_openapi_spec`)

### Configuration

Rate limiting is **enabled by default** with these settings:

- **Max Requests**: 10 requests
- **Time Window**: 60 seconds (1 minute)

You can customize these settings via environment variables:

```bash
RATE_LIMIT_ENABLED=true          # Enable/disable rate limiting
RATE_LIMIT_REQUESTS=10           # Maximum requests per window
RATE_LIMIT_WINDOW_MS=60000       # Time window in milliseconds
```

### Examples

**Allow 200 requests per minute:**

```bash
RATE_LIMIT_REQUESTS=200
RATE_LIMIT_WINDOW_MS=60000
```

**Allow 50 requests per 30 seconds:**

```bash
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_WINDOW_MS=30000
```

**Disable rate limiting (not recommended for production):**

```bash
RATE_LIMIT_ENABLED=false
```

### When Rate Limit is Exceeded

If you exceed the rate limit, the tool will return an error message:

```
Rate limit exceeded. Maximum 10 requests per 60 seconds. Please retry after 15 seconds.
```

The error includes:

- Current rate limit settings
- How long to wait before retrying

### Best Practices

- **Production APIs**: Keep rate limiting enabled
- **Development/Testing**: You can disable it or increase limits
- **Adjust based on API capacity**: Set limits appropriate for your API's capabilities
- **Monitor usage**: Check logs to see if rate limits are being hit frequently

## Troubleshooting

1. **Server won't start - "Cannot start MCP server without valid OpenAPI specification"**:
   This means the server cannot fetch your OpenAPI spec.
   - **Is the URL correct?** Check `API_SPEC_URL` in your `.env` file
   - **Is your API running?** The OpenAPI spec URL must be accessible
   - **Test the URL manually**: `curl https://localhost:7086/openapi/v1.json`
   - **SSL/TLS issues?** If using `https://localhost`, you may need to configure SSL certificate trust

2. **Port already in use**: Change the port mapping in docker-compose.yml:

   ```yaml
   ports:
     - '3002:3000' # Use port 3002 on host instead
   ```

   Then update your MCP client configuration to use the new port and restart the container.

3. **Container won't start**: Check logs with `docker-compose logs -f openapi-mcp-server` or `docker logs openapi-mcp-server`

4. **Can't connect from Claude Code**: Ensure:
   - Docker container is running (`docker ps | grep openapi-mcp-server`)
   - Port 3001 is exposed and accessible (`curl http://localhost:3001/mcp`)
   - You should get a JSON-RPC response (even if it's an error, it means the server is responding).
   - No firewall blocking the connection
   - Using `http://localhost:3001/mcp` as the endpoint
   - Claude Code config has correct URL
   - Claude Code has been restarted

5. **No tools appearing**:
   - **Check the OpenAPI spec is valid**: Ensure your API is exposing a valid OpenAPI 3.0+ specification
   - **Verify operationIds exist**: Each endpoint should have an `operationId` in the spec
   - **Check server logs** for tool registration messages: `docker-compose logs -f | grep "Registering tool"`

6. **Server stopped unexpectedly**

   Restart the container:

   ```bash
   docker-compose restart
   ```

   Or stop and start fresh:

   ```bash
   docker-compose down
   docker-compose up -d
   ```
