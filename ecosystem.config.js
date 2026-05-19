module.exports = {
  apps: [
    {
      name: 'samplesite',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      instances: 2, // Dual cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
