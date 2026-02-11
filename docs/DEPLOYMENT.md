# GTunnel Deployment Guide

## Table of Contents
- [Local Deployment](#local-deployment)
- [Docker Deployment](#docker-deployment)
- [Docker Compose](#docker-compose)
- [Systemd Service](#systemd-service)
- [PM2 Process Manager](#pm2-process-manager)
- [Cloud Deployment](#cloud-deployment)

## Local Deployment

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install -g gtunnel
```

### Running

```bash
# Start with default settings
gtunnel start

# Start with configuration file
gtunnel start --config ./gtunnel.config.yml

# Start with CLI options
gtunnel start --host 0.0.0.0 --port 8080 --api-key your-secret-key
```

## Docker Deployment

### Build Docker Image

```bash
cd /path/to/gtunnel
docker build -f docker/Dockerfile -t gtunnel:latest .
```

### Run Docker Container

```bash
docker run -d \
  --name gtunnel \
  -p 8080:8080 \
  -p 8081:8081 \
  -p 9090:9090 \
  -e GTUNNEL_API_KEY=your-api-key \
  gtunnel:latest
```

### With Environment File

Create `.env` file:
```
GTUNNEL_HOST=0.0.0.0
GTUNNEL_PORT=8080
GTUNNEL_API_KEY=your-secret-api-key
SAUCE_USERNAME=your-username
SAUCE_ACCESS_KEY=your-access-key
SAUCE_TUNNEL_ID=my-tunnel
```

Run with environment file:
```bash
docker run -d \
  --name gtunnel \
  --env-file .env \
  -p 8080:8080 \
  -p 8081:8081 \
  -p 9090:9090 \
  gtunnel:latest
```

### With Configuration File

```bash
docker run -d \
  --name gtunnel \
  -p 8080:8080 \
  -p 8081:8081 \
  -p 9090:9090 \
  -v $(pwd)/gtunnel.config.yml:/app/config/gtunnel.config.yml:ro \
  gtunnel:latest \
  start --config /app/config/gtunnel.config.yml
```

## Docker Compose

### Basic Setup

```bash
cd /path/to/gtunnel
cp .env.example .env  # Edit with your settings
docker-compose -f docker/docker-compose.yml up -d
```

### Check Status

```bash
docker-compose -f docker/docker-compose.yml ps
docker-compose -f docker/docker-compose.yml logs -f gtunnel
```

### Stop Services

```bash
docker-compose -f docker/docker-compose.yml down
```

### With Monitoring Stack

The docker-compose includes optional Prometheus and Grafana services:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

Access services:
- GTunnel: http://localhost:8080
- Dashboard: http://localhost:8081
- Prometheus: http://localhost:9091
- Grafana: http://localhost:3000 (admin/admin)

## Systemd Service

### Create Service File

Create `/etc/systemd/system/gtunnel.service`:

```ini
[Unit]
Description=GTunnel - High-Performance Tunnel
After=network.target

[Service]
Type=simple
User=gtunnel
WorkingDirectory=/opt/gtunnel
Environment="NODE_ENV=production"
Environment="GTUNNEL_API_KEY=your-api-key"
ExecStart=/usr/bin/gtunnel start --config /etc/gtunnel/gtunnel.config.yml
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=gtunnel

[Install]
WantedBy=multi-user.target
```

### Setup User and Directories

```bash
# Create user
sudo useradd -r -s /bin/false gtunnel

# Create directories
sudo mkdir -p /opt/gtunnel /etc/gtunnel /var/log/gtunnel
sudo chown gtunnel:gtunnel /opt/gtunnel /var/log/gtunnel

# Copy configuration
sudo cp gtunnel.config.yml /etc/gtunnel/
sudo chown root:gtunnel /etc/gtunnel/gtunnel.config.yml
sudo chmod 640 /etc/gtunnel/gtunnel.config.yml
```

### Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable gtunnel

# Start service
sudo systemctl start gtunnel

# Check status
sudo systemctl status gtunnel

# View logs
sudo journalctl -u gtunnel -f
```

### Service Commands

```bash
# Start
sudo systemctl start gtunnel

# Stop
sudo systemctl stop gtunnel

# Restart
sudo systemctl restart gtunnel

# Status
sudo systemctl status gtunnel

# Enable on boot
sudo systemctl enable gtunnel

# Disable on boot
sudo systemctl disable gtunnel
```

## PM2 Process Manager

### Install PM2

```bash
npm install -g pm2
```

### Create Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'gtunnel',
    script: 'gtunnel',
    args: 'start --config ./gtunnel.config.yml',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      GTUNNEL_API_KEY: 'your-api-key'
    }
  }]
};
```

### Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save process list
pm2 save

# Generate startup script
pm2 startup
```

### PM2 Commands

```bash
# List processes
pm2 list

# View logs
pm2 logs gtunnel

# Monitor
pm2 monit

# Restart
pm2 restart gtunnel

# Stop
pm2 stop gtunnel

# Delete
pm2 delete gtunnel
```

## Cloud Deployment

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Install GTunnel:
```bash
sudo npm install -g gtunnel
```

4. Configure and start:
```bash
sudo gtunnel config --init
sudo gtunnel start --config /etc/gtunnel/gtunnel.config.yml
```

5. Setup systemd service (see above)

### AWS ECS (Docker)

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Create ECS service
4. Configure load balancer
5. Set environment variables

### Google Cloud Platform

1. Create Compute Engine instance
2. Install Node.js and GTunnel
3. Configure firewall rules:
```bash
gcloud compute firewall-rules create gtunnel-allow \
  --allow tcp:8080,tcp:8081,tcp:9090 \
  --source-ranges 0.0.0.0/0 \
  --target-tags gtunnel
```

### Azure

1. Create Virtual Machine
2. Install Node.js and GTunnel
3. Configure Network Security Group
4. Setup managed service identity

### Kubernetes

Create deployment manifest `gtunnel-deployment.yml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gtunnel-config
data:
  gtunnel.config.yml: |
    server:
      host: 0.0.0.0
      port: 8080
    # ... rest of config
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gtunnel
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gtunnel
  template:
    metadata:
      labels:
        app: gtunnel
    spec:
      containers:
      - name: gtunnel
        image: gtunnel:latest
        ports:
        - containerPort: 8080
        - containerPort: 8081
        - containerPort: 9090
        env:
        - name: GTUNNEL_API_KEY
          valueFrom:
            secretKeyRef:
              name: gtunnel-secret
              key: api-key
        volumeMounts:
        - name: config
          mountPath: /app/config
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: config
        configMap:
          name: gtunnel-config
---
apiVersion: v1
kind: Service
metadata:
  name: gtunnel
spec:
  selector:
    app: gtunnel
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: dashboard
    port: 8081
    targetPort: 8081
  - name: metrics
    port: 9090
    targetPort: 9090
  type: LoadBalancer
```

Deploy to Kubernetes:
```bash
kubectl apply -f gtunnel-deployment.yml
```

## Security Considerations

1. **Always use TLS in production**
2. **Secure API keys** using secrets management
3. **Enable IP whitelisting** when possible
4. **Regular updates** - Keep GTunnel and dependencies updated
5. **Monitor logs** for security events
6. **Use firewalls** to restrict access
7. **Rotate API keys** regularly
8. **Backup configuration** files

## Performance Tuning

### Operating System

```bash
# Increase file descriptor limits
ulimit -n 65536

# TCP tuning
sysctl -w net.core.somaxconn=1024
sysctl -w net.ipv4.tcp_max_syn_backlog=2048
```

### Node.js

```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### GTunnel Configuration

Adjust connection pool and limits based on load:

```yaml
performance:
  connectionPool:
    maxSize: 500
    minSize: 50
  maxConnections: 5000
```

## Troubleshooting

### Check if service is running
```bash
curl http://localhost:8080/health
```

### View logs
```bash
# Systemd
journalctl -u gtunnel -f

# PM2
pm2 logs gtunnel

# Docker
docker logs -f gtunnel
```

### Port conflicts
```bash
# Check what's using a port
lsof -i :8080
netstat -tulpn | grep 8080
```

### Connection issues
- Check firewall rules
- Verify network connectivity
- Check DNS resolution
- Review logs for errors
