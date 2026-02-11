// Sauce Labs Integration Example

const { TunnelServer, getConfigLoader } = require('gtunnel');

async function main() {
  console.log('Starting GTunnel with Sauce Labs compatibility...\n');
  
  // Get configuration loader
  const configLoader = getConfigLoader();
  
  // Configure for Sauce Labs
  configLoader.setConfig({
    server: {
      host: '0.0.0.0',
      port: 8080,
      tls: {
        enabled: false, // Set to true if you have certificates
      },
    },
    auth: {
      apiKey: {
        enabled: true,
        keys: [
          {
            name: 'sauce-labs',
            key: process.env.SAUCE_ACCESS_KEY || 'your-sauce-access-key',
          },
        ],
      },
    },
    sauceLabs: {
      compatible: true,
      tunnelId: process.env.SAUCE_TUNNEL_ID || 'my-tunnel',
      username: process.env.SAUCE_USERNAME || 'your-username',
      accessKey: process.env.SAUCE_ACCESS_KEY || 'your-access-key',
    },
    monitoring: {
      metrics: {
        enabled: true,
        port: 9090,
      },
      dashboard: {
        enabled: true,
        port: 8081,
      },
      logging: {
        level: 'info',
        format: 'json',
      },
    },
  });
  
  // Validate configuration
  const validation = configLoader.validate();
  if (!validation.valid) {
    console.error('Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  const config = configLoader.getConfig();
  
  console.log('Configuration:');
  console.log(`  Tunnel ID: ${config.sauceLabs.tunnelId}`);
  console.log(`  Username: ${config.sauceLabs.username}`);
  console.log(`  Port: ${config.server.port}`);
  console.log();
  
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
  console.log('✓ GTunnel started successfully!');
  console.log(`  Server: http://${info.host}:${info.port}`);
  console.log(`  Dashboard: http://localhost:${config.monitoring.dashboard.port}`);
  console.log(`  Metrics: http://localhost:${config.monitoring.metrics.port}/metrics`);
  console.log(`  Tunnel ID: ${config.sauceLabs.tunnelId}`);
  console.log('\nConnect your Sauce Labs tests to this tunnel.');
  console.log('Press Ctrl+C to stop\n');
}

main().catch(error => {
  console.error('Failed to start GTunnel:', error);
  process.exit(1);
});
