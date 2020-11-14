var twitterCheck = require('./twitterCheck');

var client = require('coffea')({
  host: process.env.CHIRPIRC_HOST,
  port: process.env.CHIRPIRC_HOST_PORT, // default value: 6667
  ssl: false, // set to true if you want to use ssl
  ssl_allow_invalid: false, // set to true if the server has a custom ssl certificate
  prefix: '!', // used to parse commands and emit on('command') events, default: !
  channels: [process.env.CHIRPIRC_CHANNEL], // autojoin channels, default: []
  nick: process.env.CHIRPIRC_NICK, // default value: 'coffea' with random number
  username: process.env.CHIRPIRC_USERNAME, // default value: username = nick
  realname: process.env.CHIRPIRC_REALNAME, // default value: realname = nick
  pass: process.env.CHIRPIRC_PASS, // by default no password will be sent
  nickserv: {
      username: process.env.CHIRPIRC_NICKSERV_USERNAME,
      password: process.env.CHIRPIRC_NICKSERV_PASS,
  },
  throttling: 250 // default value: 250ms, 1 message every 250ms, disable by setting to false
});

client.on('message', function (event) {
  const t = twitterCheck(event.message).then(msg => {
    if(msg){
      event.reply(msg)
    }
  });
});
