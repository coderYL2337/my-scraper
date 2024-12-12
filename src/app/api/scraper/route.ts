import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { v2 as cloudinary } from "cloudinary";

chromium.setHeadlessMode = true;

chromium.setGraphicsMode = false;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  // Optional: Load any fonts you need. Open Sans is included by default in AWS Lambda instances
  const { siteUrl } = await request.json();
  await chromium.font(
    "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
  );
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
  console.log("isLocal:", isLocal); // Log whether the function is running locally or on Vercel

  // Resolve the correct executable path
  const executablePath = isLocal
    ? process.env.CHROME_EXECUTABLE_PATH
    : await chromium.executablePath(
        "https://myscrbuckethst.s3.us-east-1.amazonaws.com/chromium-v131.0.1-pack.tar"
      );
  console.log("Resolved executablePath:", executablePath); // Log the resolved path

  const browser = await puppeteer.launch({
    args: isLocal
      ? puppeteer.defaultArgs()
      : [...chromium.args, "--hide-scrollbars", " --incognito", "--no-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
    headless: chromium.headless,
    // Log the resolved path
  });

  // const browser = await puppeteer.launch({
  //   args: isLocal
  //     ? puppeteer.defaultArgs()
  //     : [...chromium.args, "--hide-scrollbars", " --incognito", "--no-sandbox"],
  //   defaultViewport: chromium.defaultViewport,
  //   executablePath:
  //     process.env.CHROME_EXECUTABLE_PATH ||
  //     await chromium.executablePath(
  //       "https://myscrbuckethst.s3.us-east-1.amazonaws.com/chromium-v131.0.1-pack.tar"
  //     ),
  //   headless: chromium.headless,
  //   // Log the resolved path
  // });

  const page = await browser.newPage();
  await page.goto(siteUrl);
  const pageTitle = await page.title();
  const screenshot = await page.screenshot();
  await browser.close();
  console.log(pageTitle);

  const resource = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, function (error, result) {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      })
      .end(screenshot);
  });

  console.log("Screenshot captured.");

  return Response.json({
    pageTitle,
    resource,
  });
}
