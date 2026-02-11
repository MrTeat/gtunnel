# Sauce Connect Compatible Commands

GTunnel supports Sauce Connect compatible command-line options for easy migration.

## Command Format Comparison

### Sauce Connect Command
```bash
sc run -u <username> -k <access-key> --region <region> --tunnel-name <tunnel-name>
```

### GTunnel Equivalent Command
```bash
gtunnel start -u <username> -k <access-key> --region <region> --tunnel-name <tunnel-name>
```

## Example: Using Sauce Labs Credentials

### Sauce Connect
```bash
sc run -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name oauth-wfuller894-22ca3_tunnel_name
```

### GTunnel (Sauce Connect Compatible)
```bash
gtunnel start -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name oauth-wfuller894-22ca3_tunnel_name
```

## Command Options Reference

### Sauce Connect Compatible Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `-u, --user` | - | Sauce Labs username | `-u oauth-wfuller894-22ca3` |
| `-k` | `--api-key` | Sauce Labs access key | `-k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db` |
| `--tunnel-name` | `--tunnel-id` | Tunnel identifier | `--tunnel-name my_tunnel` |
| `--region` | - | Data center region | `--region us-west` |

### Available Regions

- `us-west` - US West (default)
- `us-east` - US East
- `eu-central` - EU Central
- `apac` - Asia Pacific

### GTunnel-Specific Options

These options are available in addition to Sauce Connect compatibility:

| Option | Description | Example |
|--------|-------------|---------|
| `-h, --host` | Server host | `--host 0.0.0.0` |
| `-p, --port` | Server port | `--port 8080` |
| `--tls` | Enable TLS | `--tls` |
| `--cert` | TLS certificate | `--cert /path/to/cert.pem` |
| `--key` | TLS key | `--key /path/to/key.pem` |
| `-c, --config` | Config file | `--config gtunnel.yml` |

## Usage Examples

### 1. Basic Sauce Labs Setup
```bash
gtunnel start -u myusername -k myaccesskey --tunnel-name my-tunnel
```

### 2. With Specific Region
```bash
gtunnel start -u myusername -k myaccesskey --region eu-central --tunnel-name eu-tunnel
```

### 3. Using Environment Variables
```bash
export SAUCE_USERNAME=myusername
export SAUCE_ACCESS_KEY=myaccesskey
export SAUCE_TUNNEL_ID=my-tunnel

gtunnel start
```

### 4. Mixing Sauce Connect and GTunnel Options
```bash
gtunnel start -u myusername -k myaccesskey --tunnel-name my-tunnel --port 9000
```

### 5. Using Config File with CLI Override
```bash
gtunnel start --config gtunnel.yml -u override-user --region us-east
```

## Automatic Sauce Labs Mode

When you use any of these options, Sauce Labs compatibility mode is automatically enabled:
- `-u, --user` (username)
- `-k` (access key)
- `--region` (region)
- `--tunnel-name` (tunnel name)

You don't need to explicitly add `--sauce-labs` flag.

## Output Example

When you start gtunnel with Sauce Connect compatible options, you'll see:

```
✓ GTunnel started successfully!

  Server:    http://0.0.0.0:8080
  Dashboard: http://localhost:8081
  Metrics:   http://localhost:9090/metrics

  Sauce Labs Mode: Enabled
  Username:  oauth-wfuller894-22ca3
  Tunnel:    oauth-wfuller894-22ca3_tunnel_name
  Region:    us-west

Press Ctrl+C to stop
```

## Migration from Sauce Connect

If you're currently using Sauce Connect, you can simply replace `sc run` with `gtunnel start`:

**Before (Sauce Connect):**
```bash
sc run -u myuser -k mykey --tunnel-name my-tunnel --region us-west
```

**After (GTunnel):**
```bash
gtunnel start -u myuser -k mykey --tunnel-name my-tunnel --region us-west
```

All your existing Sauce Connect command-line arguments will work with gtunnel!

## Additional Features

### Monitoring Dashboard
Access real-time metrics at `http://localhost:8081`

### Prometheus Metrics
Export metrics at `http://localhost:9090/metrics`

### Health Checks
- Health: `http://localhost:8080/health`
- Ready: `http://localhost:8080/ready`

## Troubleshooting

### Windows: "The system cannot find the file -u"

If you encounter this error on Windows:
```
The system cannot find the file -u.
```

This occurs when using the Windows built-in `start` command instead of the `gtunnel start` command.

**Problem:** Windows has a built-in `start` command that opens programs/files. When you type `start -u ...`, Windows tries to open a file called "-u".

**Solution:** Always prefix the command with `gtunnel`:

❌ **INCORRECT (missing `gtunnel`):**
```bash
start -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name my-tunnel
```

✅ **CORRECT:**
```bash
gtunnel start -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name my-tunnel
```

### Windows Command Prompt vs PowerShell

**Command Prompt (cmd.exe):**
```cmd
gtunnel start -u myuser -k mykey --tunnel-name my-tunnel
```

**PowerShell:**
```powershell
gtunnel start -u myuser -k mykey --tunnel-name my-tunnel
```

If `gtunnel` is not recognized, ensure npm global binaries are in your PATH or use `npx`:
```powershell
npx gtunnel start -u myuser -k mykey --tunnel-name my-tunnel
```

### Check Tunnel Status
```bash
gtunnel status
```

### Stop Tunnel
```bash
gtunnel stop
```

### View Configuration
```bash
gtunnel config --show
```

### Validate Configuration
```bash
gtunnel config --validate
```

## Notes

- GTunnel automatically enables Sauce Labs compatibility when you use `-u`, `-k`, `--region`, or `--tunnel-name` options
- The `-k` option is a Sauce Connect compatible alias for `--api-key`
- The `--tunnel-name` option is a Sauce Connect compatible alias for `--tunnel-id`
- You can mix and match Sauce Connect options with GTunnel-specific options for maximum flexibility
