module.exports = {
  apps: [{
    name: 'LogCell',
    cwd: '/home/matheus/apps/LogCell',
    script: 'npm',
    args: 'start -- --hostname 127.0.0.1',
    instances: 1,
    autorestart: true,
    watch: false,
    restart_delay: 5000,
    max_restarts: 3,
    min_uptime: 15000,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
    },
    error_file: '~/.pm2/logs/LogCell-error.log',
    out_file: '~/.pm2/logs/LogCell-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
