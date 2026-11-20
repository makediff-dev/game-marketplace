module.exports = {
  apps: [
    {
      name: 'gaming-marketplace-front',
      cwd: '/var/www/gaming-marketplace-front',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
