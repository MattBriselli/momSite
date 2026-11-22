const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'views', 'pages');

const pages = [
  'index',
  'biographies',
  'repertoire',
  'samples',
  'venues',
  'testimonials',
  'rates',
  'FAQ'
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    for (const childItemName of fs.readdirSync(src)) {
      if (childItemName === '.DS_Store') continue;
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    }
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

async function buildStaticSite() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy static assets from public/ to dist/
  copyRecursiveSync(PUBLIC_DIR, DIST_DIR);

  // Render each EJS template to static HTML
  for (const page of pages) {
    const templatePath = path.join(VIEWS_DIR, `${page}.ejs`);
    const html = await ejs.renderFile(templatePath, {});

    // Write <page>.html
    fs.writeFileSync(path.join(DIST_DIR, `${page}.html`), html, 'utf8');

    // Also write directory index (dist/<page>/index.html) so clean URLs (/biographies, /FAQ, etc.) work on any static host
    if (page !== 'index') {
      const cleanDir = path.join(DIST_DIR, page);
      fs.mkdirSync(cleanDir, { recursive: true });
      fs.writeFileSync(path.join(cleanDir, 'index.html'), html, 'utf8');

      // Also support lowercase /faq
      if (page !== page.toLowerCase()) {
        fs.writeFileSync(path.join(DIST_DIR, `${page.toLowerCase()}.html`), html, 'utf8');
        const lowerDir = path.join(DIST_DIR, page.toLowerCase());
        fs.mkdirSync(lowerDir, { recursive: true });
        fs.writeFileSync(path.join(lowerDir, 'index.html'), html, 'utf8');
      }
    }
  }

  console.log(`Static site built successfully in ${DIST_DIR}`);
}

buildStaticSite().catch((err) => {
  console.error(err);
  process.exit(1);
});
