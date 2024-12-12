import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

chromium.setHeadlessMode = true;

chromium.setGraphicsMode = false;

export async function POST() {
  // Optional: Load any fonts you need. Open Sans is included by default in AWS Lambda instances
  await chromium.font(
    "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
  );
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const browser = await puppeteer.launch({
    args: isLocal
      ? puppeteer.defaultArgs()
      : [...chromium.args, "--hide-scrollbars", " --incognito", "--no-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://myscrbuckethst.s3.us-east-1.amazonaws.com/chromium-v131.0.1-pack.tar"
      )),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto("https://example.com");
  const pageTitle = await page.title();
  await browser.close();
  return Response.json({
    test: true,
  });
}
