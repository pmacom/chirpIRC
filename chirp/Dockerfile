FROM node:11-alpine
    
    ENV CHROME_BIN="/usr/bin/chromium-browser"\
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
    
    # apk add --no-cache curl jq python3 py3-pip
    
    RUN set -x \
      && apk update \
      && apk upgrade \
      # replacing default repositories with edge ones
      && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" > /etc/apk/repositories \
      && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
      && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories

    RUN apk add --no-cache curl py-pip
    RUN apk add dumb-init curl make gcc g++
    RUN apk add linux-headers binutils-gold
    RUN apk add gnupg libstdc++ nss chromium
    # RUN npm install puppeteer@0.13.0

    RUN apk del --no-cache make gcc g++ binutils-gold gnupg libstdc++
    RUN rm -rf /usr/include
    RUN rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/*
    RUN echo

RUN mkdir /chirp
RUN mkdir /app
WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci --no-save

CMD ["npm", "run", "start"]
