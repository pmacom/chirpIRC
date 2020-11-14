var Twitter = require('twitter');

var tclient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
});

const checkMessage = message => {
  const re = /http(?:s)?:\/\/(?:www)?twitter\.com\/([a-zA-Z0-9_]+)\/status\/([a-zA-Z0-9_]+)/
  const data = message.match(re);
  if(!data || !data[0] || !data[1] || !data[2]){ return null; }
  const [url, author, id] = data;
  return ({ url, author, id });
}

const getTweet = async id => {
  const res = await tclient.get('statuses/show', {id, tweet_mode: 'extended'});
  const { full_text, created_at, entities, user } = res;
  const { name, screen_name } = user;
  const formattedText = full_text.replace(/\n/g, "::");
  return `{TWEET} -- ${name} (@${screen_name}) :: ${formattedText} :: ${created_at}`;
}

const twitterCheck = async message => {
  const validMessage = checkMessage(message);
  if(validMessage){
    const tweet = await getTweet(validMessage.id);
    return tweet;
  }
}

module.exports = twitterCheck;