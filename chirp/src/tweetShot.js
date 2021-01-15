const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const path = require('path');
const download = require('download');
const tunnel = require('tunnel');

const defaultViewport = {
  width: 800,
  height: 800,
  deviceScaleFactor: 1,
};

const deviceScaleFactor = 1;
const defaultDest = process.cwd();
const thumbnailUrlStartWith = `https://pbs.twimg.com/media/`;

const getOptions = overrides => {
  const defaultOptions = {
    headless: true,
    proxy: undefined,
    dest: '/chirp',
    scale: 1,
  }
  return { ...defaultOptions, ...overrides }
}

const sleep = async (ms) =>
    await new Promise((resolve) => setTimeout(() => resolve(), ms));

const tweetShot = async (tweet, opts = {}) => {
  const options = getOptions(opts);
  const { userId, id } = tweet;
  const tweetUrl = `https://mobile.twitter.com/${userId}/status/${id}`;
  const dest = '/chirp';
  const resultFilename = `${userId}-${id}.json`;
  const resultPathname = path.resolve(dest, resultFilename);

  const result = {
    screenshot: `${userId}-${id}_.jpg`,
    assets: [],
  };

  // Puppeteer
  const browser = await puppeteer.launch({
    headless: options.headless,
    defaultViewport: {
        ...defaultViewport,
        deviceScaleFactor: options.scale, // Todo: scale this thing right later
    },
    timeout: 0,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(tweetUrl, {
      waitUntil: 'networkidle0',
  });

  const reject = async (err) => {
    await browser.close();
    throw err;
  };

  await page._client.send('ServiceWorker.enable');
  await page._client.send('ServiceWorker.stopAllWorkers');

  const getElTweet = '__GET_ELEMENT_TWEET__';

  await page.evaluate((getElTweet) => {
    window[getElTweet] = function () {
      const articles = [
        ...document.querySelectorAll('article[role="article"]'),
      ];
      let tweet;
      while (!tweet && articles.length) {
        const el = articles[0];
        const styles = window.getComputedStyle(el);
        if (styles.cursor === 'pointer') articles.shift();
        else tweet = el;
      }
      return tweet;
    };
  }, getElTweet);

  await page
    .evaluate(
      ({ getElTweet }) => {
        const tweet = window[getElTweet]();
        if (!tweet) throw new Error('no tweet element');

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.querySelector('header[role="banner"]').style.display = 'none';
        document.querySelector('#layers').style.display = 'none';
      },
      { getElTweet }
    )
    .catch(async () => {
      await reject(new Error('tweet not found or invalid tweet page'));
    });

  await page.keyboard.press('Escape');

  if (
    await page.evaluate(
      ({ getElTweet }) => {
        const tweet = window[getElTweet]();
        if (!tweet) return;
        const link = tweet.querySelector('a[href="/settings/safety"]');
        if (!link) return;
        const buttons = link.parentNode.parentNode.parentNode.querySelectorAll(
          'div[role="button"]'
        );
        if (buttons.length) {
          buttons[0].click();
          return true;
        }
      },
      { getElTweet }
    )
  ) {
    await sleep(500);
  }




  const selectorThumbnails = `img[src^="${thumbnailUrlStartWith}"]`;
  await page.waitForSelector(selectorThumbnails).catch(() => {});
  const thumbnails = await page.evaluate(
    ({ selectorThumbnails, getElTweet }) => {
      const tweet = window[getElTweet]();
      const thumbnails = tweet.querySelectorAll(selectorThumbnails);
      if (!thumbnails || !thumbnails.length) return [];
      return Array.from(thumbnails).map((el) => el.getAttribute('src'));
    },
    { selectorThumbnails, getElTweet }
  );



  










  {
    const assets = thumbnails
        .map((thumbnail) => {
            const url = new URL(thumbnail);
            // /media/xxxxxxx?format=jpg&name=small
            const matches = /^\/media\/([a-zA-Z0-9_-]+)$/.exec(
                url.pathname
            );
            if (!Array.isArray(matches) || matches.length < 2)
                return undefined;
            return {
                filename: matches[1],
                format:
                    url.searchParams.format ||
                    url.searchParams.get('format') ||
                    'jpg',
                thumbnail,
            };
        })
        .filter((obj) => typeof obj === 'object');
    await Promise.all(
        assets.map(
            ({ filename, format }, index) =>
                new Promise(async (resolve, reject) => {
                    const downloadUrl = `${thumbnailUrlStartWith}${filename}.${format}:orig`;
                    const destFilename = `${userId}-${tweetId}-${index}-${filename}.${format}`;
                    const destPathname = path.resolve(dest, destFilename);
                    result.assets[index] = {
                        url: downloadUrl,
                        file: false,
                    };
                    const proxyUrl = proxy ? new URL(proxy) : undefined;
                    await download(downloadUrl, dest, {
                        filename: destFilename,
                        agent: proxyUrl
                            ? {
                                  https: tunnel.httpsOverHttp({
                                      proxy: {
                                          host: proxyUrl.hostname,
                                          port: proxyUrl.port,
                                      },
                                  }),
                              }
                            : undefined,
                    }).catch((err) =>
                        reject(
                            `download fail - thumbnail: ${assets[index].thumbnail} | download: ${downloadUrl} | error: ${err}`
                        )
                    );
                    if (fs.existsSync(destPathname)) {
                        result.assets[index].file = destFilename;
                    }
                    resolve();
                })
        )
    ).catch(async (err) => await reject(err));
}











await page.evaluate(
  async ({ selectorThumbnails }) => {
      const elTweet = (() => {
          const articles = [
              ...document.querySelectorAll('article[role="article"]'),
          ];
          let tweet;
          while (!tweet && articles.length) {
              const el = articles[0];
              const styles = window.getComputedStyle(el);
              if (styles.cursor === 'pointer') articles.shift();
              else tweet = el;
          }
          return tweet;
      })();
      const thumbnails = elTweet.querySelectorAll(selectorThumbnails);
      if (!thumbnails || !thumbnails.length) return true;
      await Promise.all(
          Array.from(thumbnails).map(
              (el) =>
                  new Promise((resolve) => {
                      const check = () => {
                          if (el.complete) return resolve();
                          setTimeout(check, 100);
                      };
                      check();
                  })
          )
      );
  },
  { selectorThumbnails }
);













{
  const rect = await page.evaluate(
      ({ getElTweet }) => {
          document.documentElement.scrollTop = 0;
          // document.body.scrollTop = top;
          document.body.scrollTop = 0;

          const elTweet = window[getElTweet]();
          const elFirstTweet = document.querySelectorAll('article')[0];

          // 获取位置
          const {
              top,
              left,
              height,
              width,
          } = elTweet.getBoundingClientRect();
          const offsetTop = elFirstTweet.getBoundingClientRect().top;

          // 重置滚动条
          document.body.scrollTop = top - offsetTop;

          return { top, left, height, width, offsetTop };
      },
      { getElTweet }
  );
  await page.setViewport({
      width: parseInt(rect.width),
      height: parseInt(rect.height),
      deviceScaleFactor,
  });
  await page.screenshot({
      path: path.resolve(dest, result.screenshot),
      type: 'jpeg',
      quality: 60,
      clip: {
          x: 0,
          y: rect.offsetTop,
          width: rect.width,
          height: rect.height - rect.offsetTop,
      },
  });
}










await browser.close();

// 创建 flag 文件
console.log('resultPathname=-=-=-=-=');
console.log(resultPathname);
console.log('result=-=-=-=-=');
console.log(result);
await fs.writeJSON(resultPathname, result);

return result;

}

module.exports = tweetShot;