const twitterCheck = require('./twitterCheck');
const tweetShot = require('tweet-shot');
const ts = require('./tweetShot');

const saveTweetImage = async tweet => {
  // const shot = await tweetShot(url, { dest: '/chirp'});
  //console.log('SHOT', shot);

  const res = await ts(tweet, { testURL: 'thinggy' });
  console.log(res);
  // await screenshotTweet(
  //   url,
  //   // `${id}.jpg`
  // ).then(() => {
  //   console.log("Success");
  // }).catch(error => {
  //   console.error("Error");
  // });

  // console.log('uh?');
}

var client = require('coffea')({
  host: process.env.CHIRPIRC_HOST,
  port: process.env.CHIRPIRC_HOST_PORT, // default value: 6667
  ssl: false, // set to true if you want to use ssl
  ssl_allow_invalid: false, // set to true if the server has a custom ssl certificate
  prefix: '!', // used to parse commands and emit on('command') events, default: !
  channels: [process.env.CHIRPIRC_CHANNEL.split(',')], // autojoin channels, default: []
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
  const t = twitterCheck(event.message).then(async obj => {
    if(obj){
      console.log('OBJEEECT', obj);
      await saveTweetImage(obj)
      event.reply(obj.msg)
    }
  });
});
