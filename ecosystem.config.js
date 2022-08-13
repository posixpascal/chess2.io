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
      path : '/opt/chess2',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && npm run build:production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
