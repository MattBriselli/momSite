const express = require('express');
const path = require('path');
const { SITE_URL, VENUES_DATA, REGION_META, CATEGORY_META } = require('./generate-seo-assets');
const REVIEWS = require('./data/reviews.json');

const PORT = process.env.PORT || 9000;
const app = express();

app.locals.siteUrl = SITE_URL;
app.locals.venuesData = VENUES_DATA;
app.locals.regionMeta = REGION_META;
app.locals.categoryMeta = CATEGORY_META;
app.locals.reviews = REVIEWS;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 1. Permanent (301) redirects from every previous URL to its new home, so old links and search rankings carry over.
const legacyRedirects = {
  '/index': '/',
  '/index.html': '/',
  '/samples': '/music#samples',
  '/samples.html': '/music#samples',
  '/repertoire': '/music#repertoire',
  '/repertoire.html': '/music#repertoire',
  '/biographies': '/about',
  '/biographies.html': '/about',
  '/venues': '/about#venues',
  '/venues.html': '/about#venues',
  '/testimonials': '/reviews',
  '/testimonials.html': '/reviews',
  '/FAQ': '/rates#faq',
  '/faq': '/rates#faq',
  '/FAQ.html': '/rates#faq',
  '/faq.html': '/rates#faq',
  '/rates.html': '/rates'
};

app.use((req, res, next) => {
  const target = legacyRedirects[req.path];
  if (target) {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const [targetPath, hash] = target.split('#');
    return res.redirect(301, `${targetPath}${qs}${hash ? '#' + hash : ''}`);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

// 2. Canonical page routes
app.get('/', (req, res) => res.render('pages/index', { canonicalPath: '/' }));
app.get('/music', (req, res) => res.render('pages/music', { canonicalPath: '/music' }));
app.get('/about', (req, res) => res.render('pages/about', { canonicalPath: '/about' }));
app.get('/reviews', (req, res) => res.render('pages/reviews', { canonicalPath: '/reviews' }));
app.get('/rates', (req, res) => res.render('pages/rates', { canonicalPath: '/rates' }));

// 3. Structured Booking Inquiry Endpoint (for Web Forms & Autonomous Agents)
app.post('/api/inquiry', (req, res) => {
  // Honeypot check
  if (req.body.website_url) {
    return res.status(200).json({ ok: true });
  }

  const name = String(req.body.full_name || '').trim();
  const email = String(req.body.email || '').trim();
  const phone = String(req.body.phone || '').trim();
  const eventDate = String(req.body.event_date || '').trim();
  const ensemble = String(req.body.ensemble || 'String Quartet').trim();
  const duration = String(req.body.duration || '').trim();
  const venue = String(req.body.venue || '').trim();
  const addons = Array.isArray(req.body.addons)
    ? req.body.addons.join(', ')
    : String(req.body.addons || '').trim();
  const notes = String(req.body.notes || '').trim();

  if (!name || !email || !email.includes('@')) {
    return res.status(400).json({
      ok: false,
      error: 'Please provide both your name and a valid email address.'
    });
  }

  const subject = `Arioso Booking Inquiry — ${eventDate || 'Upcoming Event'} (${ensemble})`;
  const summaryLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    eventDate ? `Event Date: ${eventDate}` : null,
    `Ensemble: ${ensemble}`,
    duration ? `Estimated Duration: ${duration}` : null,
    venue ? `Venue / Location: ${venue}` : null,
    addons ? `Enhancements: ${addons}` : null,
    notes ? `\nEvent Details & Song Requests:\n${notes}` : null
  ].filter(Boolean);

  const summaryText = summaryLines.join('\n');
  const mailtoUrl = `mailto:carol@ariosoquartet.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(summaryText)}`;

  if ((req.accepts('json') && !req.accepts('html')) || req.headers['x-requested-with'] === 'fetch') {
    return res.status(200).json({
      ok: true,
      recipient: 'carol@ariosoquartet.com',
      phone: '+1-484-841-6445',
      subject,
      summary: summaryText,
      mailtoUrl
    });
  }

  return res.redirect(303, mailtoUrl);
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
