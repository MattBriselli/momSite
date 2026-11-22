const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const {
  SITE_URL,
  VENUES_DATA,
  REGION_META,
  CATEGORY_META,
  generateSeoAndAgentAssets
} = require('./generate-seo-assets');

const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'views', 'pages');

const pages = [
  { template: 'index', slug: 'index', canonicalPath: '/' },
  { template: 'biographies', slug: 'biographies', canonicalPath: '/biographies' },
  { template: 'repertoire', slug: 'repertoire', canonicalPath: '/repertoire' },
  { template: 'samples', slug: 'samples', canonicalPath: '/samples' },
  { template: 'venues', slug: 'venues', canonicalPath: '/venues' },
  { template: 'testimonials', slug: 'testimonials', canonicalPath: '/testimonials' },
  { template: 'rates', slug: 'rates', canonicalPath: '/rates' },
  { template: 'FAQ', slug: 'faq', canonicalPath: '/faq' }
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    for (const childItemName of fs.readdirSync(src)) {
      if (childItemName === '.DS_Store') continue;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    }
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

async function buildStaticSite() {
  // 1. Refresh generated SEO & Agent feeds in public/ first
  generateSeoAndAgentAssets();

  // 2. Clean and recreate dist/
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 3. Copy all public/ assets (including newly generated JSON/llms/sitemap/robots & optimized images)
  copyRecursiveSync(PUBLIC_DIR, DIST_DIR);

  // 4. Render each EJS template with canonical metadata
  for (const page of pages) {
    const templatePath = path.join(VIEWS_DIR, `${page.template}.ejs`);
    const html = await ejs.renderFile(templatePath, {
      siteUrl: SITE_URL,
      canonicalPath: page.canonicalPath,
      venuesData: VENUES_DATA,
      regionMeta: REGION_META,
      categoryMeta: CATEGORY_META
    });

    fs.writeFileSync(path.join(DIST_DIR, `${page.slug}.html`), html, 'utf8');

    if (page.slug !== 'index') {
      const cleanDir = path.join(DIST_DIR, page.slug);
      fs.mkdirSync(cleanDir, { recursive: true });
      fs.writeFileSync(path.join(cleanDir, 'index.html'), html, 'utf8');
    }
  }

  console.log(`Static site + SEO/Agent feeds built successfully in ${DIST_DIR}`);
}

buildStaticSite().catch((err) => {
  console.error(err);
  process.exit(1);
});
