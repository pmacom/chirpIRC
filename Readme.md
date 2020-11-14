# ChirpIRC

A dockerized bot that listens for messages in a channel and retrieves the tweet info and displays it to the screen

## Installation

1. Install Docker

2. Set the following env vars in the `example.docker-compose.yml` and rename/copy it to `docker-compose.yml`
- TWITTER_CONSUMER_KEY
- TWITTER_CONSUMER_SECRET
- TWITTER_BEARER_TOKEN
- CHIRPIRC_HOST
- CHIRPIRC_HOST_PORT
- CHIRPIRC_CHANNEL
- CHIRPIRC_NICK
- CHIRPIRC_USERNAME
- CHIRPIRC_REALNAME
- CHIRPIRC_PASS
- CHIRPIRC_NICKSERV_USERNAME
- CHIRPIRC_NICKSERV_PASS

3. run `docker-compose up -d`