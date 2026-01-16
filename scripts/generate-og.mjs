import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function generateOG() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport to OG image dimensions
  await page.setViewport({ width: 1200, height: 630 });

  // Navigate to the template
  const templatePath = `file://${join(rootDir, 'public', 'og-template.html')}`;
  console.log(`Loading: ${templatePath}`);
  await page.goto(templatePath, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Take screenshot
  const outputPath = join(rootDir, 'public', 'social.jpg');
  await page.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 95
  });

  console.log(`Generated: ${outputPath}`);

  await browser.close();
}

generateOG().catch(console.error);
