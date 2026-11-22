const { spawn } = require('child_process');
const http = require('http');
const test = require('tape');

const TEST_PORT = 5055;
const env = Object.assign({}, process.env, { PORT: TEST_PORT });
const child = spawn('node', ['index.js'], { env });

function requestPath(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: pathname,
        method: options.method || 'GET',
        headers: options.headers || {}
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () =>
          resolve({ statusCode: res.statusCode, headers: res.headers, body })
        );
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

test('Arioso String Quartet canonical routes, 301 redirects, SEO schemas & agent feeds', (t) => {
  child.stdout.once('data', async () => {
    try {
      // 1. Canonical HTML pages
      const canonicalRoutes = [
        { path: '/', expected: 'Arioso String Quartet', canonical: 'https://ariosoquartet.com/' },
        { path: '/biographies', expected: 'Meet the Arioso Quartet', canonical: 'https://ariosoquartet.com/biographies' },
        { path: '/repertoire', expected: 'Musical Repertoire', canonical: 'https://ariosoquartet.com/repertoire' },
        { path: '/samples', expected: 'Music Samples', canonical: 'https://ariosoquartet.com/samples' },
        { path: '/venues', expected: 'Selected Venues', canonical: 'https://ariosoquartet.com/venues' },
        { path: '/testimonials', expected: 'Client Testimonials', canonical: 'https://ariosoquartet.com/testimonials' },
        { path: '/rates', expected: 'At a Glance: Booking &amp; Venue Details', canonical: 'https://ariosoquartet.com/rates' },
        { path: '/faq', expected: 'Frequently Asked Questions', canonical: 'https://ariosoquartet.com/faq' }
      ];

      for (const route of canonicalRoutes) {
        const { statusCode, body } = await requestPath(route.path);
        t.equal(statusCode, 200, `${route.path} returns HTTP 200`);
        t.ok(body.includes(route.expected), `${route.path} contains expected copy`);
        t.ok(
          body.includes(`<link rel="canonical" href="${route.canonical}">`),
          `${route.path} emits canonical tag`
        );
        t.ok(
          body.includes('application/ld+json') && body.includes('og:image'),
          `${route.path} emits JSON-LD and OpenGraph tags`
        );
      }

      // 2. Legacy 301 Redirects
      const redirects = [
        { from: '/index', to: '/' },
        { from: '/FAQ', to: '/faq' },
        { from: '/repertoire.html', to: '/repertoire' }
      ];
      for (const r of redirects) {
        const { statusCode, headers } = await requestPath(r.from);
        t.equal(statusCode, 301, `${r.from} returns HTTP 301`);
        t.equal(headers.location, r.to, `${r.from} redirects to ${r.to}`);
      }

      // 3. SEO & Agent Feeds
      const robots = await requestPath('/robots.txt');
      t.equal(robots.statusCode, 200, '/robots.txt returns 200');
      t.ok(robots.body.includes('OAI-SearchBot') && robots.body.includes('sitemap.xml'), '/robots.txt includes AI search bots & sitemap');

      const sitemap = await requestPath('/sitemap.xml');
      t.equal(sitemap.statusCode, 200, '/sitemap.xml returns 200');
      t.ok(sitemap.body.includes('<loc>https://ariosoquartet.com/rates</loc>'), '/sitemap.xml lists canonical URLs');

      const llms = await requestPath('/llms.txt');
      t.equal(llms.statusCode, 200, '/llms.txt returns 200');
      t.ok(llms.body.includes('Carol Briselli'), '/llms.txt includes ensemble facts');

      const repJson = await requestPath('/repertoire.json');
      t.equal(repJson.statusCode, 200, '/repertoire.json returns 200');
      const repParsed = JSON.parse(repJson.body);
      t.ok(repParsed.totalSelections > 500, `/repertoire.json contains ${repParsed.totalSelections} selections`);

      const venJson = await requestPath('/venues.json');
      t.equal(venJson.statusCode, 200, '/venues.json returns 200');
      const venParsed = JSON.parse(venJson.body);
      t.ok(venParsed.totalVenuesListed >= 80, `/venues.json contains ${venParsed.totalVenuesListed} venues`);

      // 4. Structured Inquiry POST endpoint
      const payload = JSON.stringify({
        full_name: 'Test Planner',
        email: 'planner@example.com',
        event_date: '2027-06-12',
        ensemble: 'String Quartet ($1,075+)',
        venue: 'Cairnwood Estate'
      });
      const inquiryRes = await requestPath('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'fetch',
          'Content-Length': Buffer.byteLength(payload)
        },
        body: payload
      });
      t.equal(inquiryRes.statusCode, 200, 'POST /api/inquiry returns 200');
      const inquiryData = JSON.parse(inquiryRes.body);
      t.ok(inquiryData.ok && inquiryData.mailtoUrl.includes('carolbriselli%40verizon.net') || inquiryData.mailtoUrl.includes('carolbriselli@verizon.net'), 'POST /api/inquiry returns structured summary & mailto');
    } finally {
      child.kill();
      t.end();
    }
  });
});
