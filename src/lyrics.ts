import puppeteer from "puppeteer";
import { sleep } from "./utils.js";

export const getLyricsFromSpotify = async (trackId: string) => {
  const browser = await puppeteer.launch({
    env: {
      ...process.env,
      LANG: "ja_JP.UTF-8",
    },
    args: ["--no-sandbox", "--disabled-setuid-sandbox"],
    headless: true,
    slowMo: 5,
  });
  const page = await browser.newPage();
  await page.setBypassCSP(true);
  page.on("console", (ConsoleMessage) => console.log(ConsoleMessage.text()));

  try {
    await page.goto(`https://accounts.spotify.com/ja/login`);
    await page.click("#login-username");
    await page.type("#login-username", process.env.SPOTIFY_EMAIL ?? '');
    await page.click("#login-password");
    await page.type("#login-password", process.env.SPOTIFY_PASSWORD ?? '');
    await page.click("#login-button");
    await page.waitForNavigation({
      waitUntil: "domcontentloaded",
    });
  } catch (err) {
    console.log(err);
  }

  try {
    await page.goto(`https://open.spotify.com/track/${trackId}`, {
      waitUntil: "domcontentloaded",
    });

    // 5秒待機
    await sleep(5000);

    return await page.evaluate(async () => {
      const a = Array.from(document.querySelectorAll("p.ipKmGr"));
      const array = a
        .filter(
          (elm) =>
            elm != undefined &&
            elm.textContent != null &&
            elm.textContent != undefined &&
            elm.textContent != "" &&
            elm.textContent.length
        )
        .map((elm) => elm.textContent!.trim());
      // 外部関数を呼び出すとエラーになるので evaluate 内に定義
      const sliceByNum = (array: string[], n: number) => {
        const length = Math.ceil(array.length / n);
        return new Array(length)
          .fill("")
          .map((_, i) => array.slice(i * n, (i + 1) * n));
      };
      const lyrics = sliceByNum(array, 4);
      //console.log(JSON.stringify(lyrics))
      return lyrics; // 4個セットに配列化して返却
    });
  } catch (err) {
    console.log(err);
  } finally {
    browser.close();
  }
};