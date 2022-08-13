module.exports = {
  apps : [{
    script: 'build/main.js',
    watch: '.'
  }],

  deploy : {
    production : {
      user : 'root',
      host : '46.101.109.84',
      ref  : 'origin/trunk',
      repo : 'git@github.com:posixpascal/better-chess.git',
      path : '~/app',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm run build:production'
    }
  }
};
