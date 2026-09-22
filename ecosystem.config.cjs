module.exports = {
  apps: [
    {
      name: 'agrirenta-server',
      script: 'src/server.js',
      cwd: './server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MONGO_URI: 'mongodb://127.0.0.1:27017/agrirenta',
        JWT_SECRET: 'agrirenta_super_secret_jwt_key_2026'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
