module.exports = {
  apps: [{
    name: 'LogCell',
    cwd: '/home/matheus/apps/LogCell',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      // NÃO incluir NODE_TLS_REJECT_UNAUTHORIZED
    },
    error_file: '~/.pm2/logs/LogCell-error.log',
    out_file: '~/.pm2/logs/LogCell-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
