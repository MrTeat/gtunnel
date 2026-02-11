// Basic GTunnel Usage Example

const { TunnelServer, getConfigLoader } = require('gtunnel');

async function main() {
  // Get configuration loader
  const configLoader = getConfigLoader();
  
  // Load from environment variables
  configLoader.loadFromEnv();
  
  // Get the configuration
  const config = configLoader.getConfig();
  
  console.log('Starting GTunnel with configuration:', {
    host: config.server.host,
    port: config.server.port,
    tls: config.server.tls.enabled,
  });
  
  // Create tunnel server
  const server = new TunnelServer(config);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await server.stop();
    process.exit(0);
  });
  
  // Start the server
  await server.start();
  
  const info = server.getInfo();
  console.log('\n✓ GTunnel started successfully!');
  console.log(`  Server: ${info.tls ? 'https' : 'http'}://${info.host}:${info.port}`);
  console.log(`  Dashboard: http://localhost:${config.monitoring.dashboard.port}`);
  console.log(`  Metrics: http://localhost:${config.monitoring.metrics.port}/metrics`);
  console.log('\nPress Ctrl+C to stop\n');
}

main().catch(error => {
  console.error('Failed to start GTunnel:', error);
  process.exit(1);
});
