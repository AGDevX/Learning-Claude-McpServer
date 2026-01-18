# Project Structure

The codebase is organized into a modular structure for dynamic OpenAPI-to-MCP tool generation.

## Directory Structure

```
src/
├── services/
│   ├── openApiService.ts     # OpenAPI spec fetching and API execution
│   └── toolGenerator.ts      # Dynamic tool schema generation
├── server/
│   ├── mcpServer.ts          # MCP server factory and tool registration
│   └── httpTransport.ts      # HTTP transport and Express app setup
├── config.ts                 # Server configuration constants
└── index.ts                  # Main entry point
```

## Module Descriptions

### `src/index.ts`
**Main Entry Point**
- Bootstraps the application
- Validates configuration (ensures API_SPEC_URL is set)
- Starts the HTTP server
- Minimal code - just initialization

### `src/config.ts`
**Configuration**
- Server metadata (name, version, default port)
- Resource definitions
- Environment variable mappings
- OpenAPI configuration (spec URL, base URL, timeouts)

### `src/services/openApiService.ts`
**OpenAPI Service**
- Fetches and parses OpenAPI specifications
- Extracts API information (title, version, description)
- Parses operations from OpenAPI paths
- Executes HTTP requests to the actual API
- Handles path parameters, query params, headers, and request bodies
- Returns `OpenApiOperation` objects with method, path, parameters, etc.

Key methods:
- `fetchSpec()` - Fetches OpenAPI spec from configured URL
- `getApiInfo()` - Extracts API metadata
- `getOperations()` - Parses all operations from the spec
- `executeOperation(operation, params)` - Executes API call

### `src/services/toolGenerator.ts`
**Tool Schema Generator**
- Converts OpenAPI operations to MCP tool schemas
- Generates Zod validation schemas from OpenAPI parameters
- Creates tool names from operationIds
- Formats descriptions and parameter documentation
- Handles different parameter types (path, query, header, body)

Key functions:
- `generateToolInputSchema(operation)` - Creates Zod schema for tool inputs
- `generateToolDescription(operation)` - Creates tool description text
- `sanitizeToolName(operationId)` - Converts operationId to valid tool name
- `getFullDescription(operation)` - Combines summary and description

### `src/server/mcpServer.ts`
**MCP Server Factory**
- `createApiServer()` factory function
- Fetches OpenAPI spec at startup
- Dynamically registers tools for each API operation
- Registers server information resource
- Handles tool execution by calling OpenApiService
- Formats responses as MCP tool results

Flow:
1. Fetch OpenAPI spec
2. Extract all operations
3. For each operation, register an MCP tool
4. Handle tool calls by executing the corresponding API request

### `src/server/httpTransport.ts`
**HTTP Transport Layer**
- `SessionManager` class for managing client sessions
- `createMcpHttpApp()` creates configured Express app
- Handles HTTP endpoints:
  - `POST /mcp` - Initialization and requests
  - `GET /mcp` - SSE streams
  - `DELETE /mcp` - Session termination
- Manages transport lifecycle and cleanup
- Graceful shutdown handling

## Benefits of This Structure

### 1. **Separation of Concerns**
- OpenAPI spec handling separate from tool generation
- Tool generation separate from MCP server logic
- Transport layer separate from business logic

### 2. **Maintainability**
- Each file has a single, clear responsibility
- Easy to locate and update specific functionality
- Small, focused modules

### 3. **Extensibility**
- Easy to add support for other OpenAPI features
- Can swap OpenAPI service for GraphQL or other API specs
- Tool generation logic is isolated and reusable

### 4. **Dynamic Tool Generation**
- No hardcoded tools - everything is generated from the spec
- Automatically adapts to API changes
- Supports any OpenAPI-compliant API

## Adding New Features

### Supporting Authentication

Add authentication headers in `src/services/openApiService.ts`:

```typescript
private apiClient = axios.create({
  timeout: OPENAPI_CONFIG.timeout,
  headers: {
    'Authorization': `Bearer ${process.env.API_TOKEN}`
  }
});
```

### Adding Request/Response Transformations

Modify `executeOperation()` in `openApiService.ts` to transform data before/after API calls.

### Supporting Additional Parameter Types

Update `generateToolInputSchema()` in `toolGenerator.ts` to handle new OpenAPI parameter types.

### Adding Caching

Implement caching in `openApiService.ts` to avoid refetching the spec on every startup.

### Supporting Webhooks

Add webhook handling in `mcpServer.ts` to register webhook-based tools from OpenAPI spec.

## Code Flow

```
index.ts
  └─> config.ts (loads configuration)
  └─> httpTransport.ts (creates Express app)
      └─> mcpServer.ts (creates MCP server instance)
          └─> openApiService.ts (fetches spec, executes operations)
              └─> toolGenerator.ts (generates schemas)
```

## Tool Registration Flow

```
1. OpenApiService fetches spec from API_SPEC_URL
2. OpenApiService parses operations from spec
3. For each operation:
   a. ToolGenerator creates tool name from operationId
   b. ToolGenerator creates input schema from parameters
   c. ToolGenerator creates description from summary
   d. McpServer registers the tool
4. When tool is called:
   a. MCP validates input against schema
   b. McpServer calls OpenApiService.executeOperation()
   c. OpenApiService constructs and executes HTTP request
   d. Response is formatted and returned to Claude
```

## Best Practices

1. **Keep configuration in config.ts** - Don't hardcode values
2. **Use environment variables** - All API-specific config should be env vars
3. **Validate OpenAPI specs** - Ensure operationIds exist for all endpoints
4. **Handle errors gracefully** - Both spec fetching and API execution can fail
5. **Log important events** - Tool registration, API calls, errors

## Environment Variables

All configured in `.env`:
- `API_SPEC_URL` - Required: URL to OpenAPI spec
- `API_BASE_URL` - Optional: Override base URL from spec
- `MCP_SERVER_NAME` - Optional: Custom server name
- `PORT` - Optional: Server port (default 3000)
- `API_TIMEOUT` - Optional: API request timeout
- `SPEC_REFRESH_INTERVAL` - Optional: How often to refresh spec
