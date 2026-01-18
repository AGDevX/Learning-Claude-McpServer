#!/usr/bin/env node

//-- Allow self-signed certificates (for development/testing)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { createMcpHttpApp } from './server/http-transport.js';
import { SERVER_CONFIG, ENVIRONMENT_CONFIG } from './config.js';

async function main() {
	console.log('Starting OpenAPI MCP Server...');
	console.log(`Server name: ${SERVER_CONFIG.name}`);

	//-- Validate configuration
	if (ENVIRONMENT_CONFIG.environments.length === 0) {
		console.error('ERROR: No API environments configured');
		console.error('');
		console.error('Please configure at least one environment:');
		console.error('');
		console.error('Example - Single environment:');
		console.error('  ENVIRONMENTS=prod');
		console.error('  API_SPEC_URL_PROD=https://api.example.com/openapi/v1.json');
		console.error('');
		console.error('Example - Multiple environments:');
		console.error('  ENVIRONMENTS=dev,qa,prod');
		console.error('  DEFAULT_ENVIRONMENT=dev');
		console.error('  API_SPEC_URL_DEV=https://dev-api.example.com/openapi/v1.json');
		console.error('  API_SPEC_URL_QA=https://qa-api.example.com/openapi/v1.json');
		console.error('  API_SPEC_URL_PROD=https://api.example.com/openapi/v1.json');
		process.exit(1);
	}

	//-- Log environment configuration
	console.log(`Configured environments: ${ENVIRONMENT_CONFIG.environments.join(', ')}`);
	console.log(`Default environment: ${ENVIRONMENT_CONFIG.defaultEnvironment}`);
	for (const env of ENVIRONMENT_CONFIG.environments) {
		const config = ENVIRONMENT_CONFIG.configs[env];
		console.log(`  ${env}: ${config.specUrl}`);
	}

	const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : SERVER_CONFIG.defaultPort;
	const app = createMcpHttpApp();

	//-- Start the server
	app.listen(PORT, () => {
		console.log(`OpenAPI MCP Server listening on http://localhost:${PORT}`);
		console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
	});
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
