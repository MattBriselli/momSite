const express = require('express');
const path = require('path');
const { SITE_URL, VENUES_DATA, REGION_META, CATEGORY_META } = require('./generate-seo-assets');

const PORT = process.env.PORT || 9000;
const app = express();

app.locals.siteUrl = SITE_URL;
app.locals.venuesData = VENUES_DATA;
app.locals.regionMeta = REGION_META;
app.locals.categoryMeta = CATEGORY_META;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 1. Canonical 301 Redirects for Legacy & Duplicate Paths
const legacyRedirects = {
  '/index': '/',
  '/index.html': '/',
  '/biographies.html': '/biographies',
  '/repertoire.html': '/repertoire',
  '/samples.html': '/samples',
  '/venues.html': '/venues',
  '/testimonials.html': '/testimonials',
  '/rates.html': '/rates',
  '/FAQ': '/faq',
  '/FAQ.html': '/faq',
  '/faq.html': '/faq'
};

app.use((req, res, next) => {
  const target = legacyRedirects[req.path];
  if (target) {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, `${target}${qs}`);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

// 2. Canonical Page Routes
app.get('/', (req, res) => res.render('pages/index', { canonicalPath: '/' }));
app.get('/biographies', (req, res) => res.render('pages/biographies', { canonicalPath: '/biographies' }));
app.get('/repertoire', (req, res) => res.render('pages/repertoire', { canonicalPath: '/repertoire' }));
app.get('/samples', (req, res) => res.render('pages/samples', { canonicalPath: '/samples' }));
app.get('/venues', (req, res) => res.render('pages/venues', { canonicalPath: '/venues' }));
app.get('/testimonials', (req, res) => res.render('pages/testimonials', { canonicalPath: '/testimonials' }));
app.get('/rates', (req, res) => res.render('pages/rates', { canonicalPath: '/rates' }));
app.get('/faq', (req, res) => res.render('pages/FAQ', { canonicalPath: '/faq' }));

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
  const mailtoUrl = `mailto:carolbriselli@verizon.net?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(summaryText)}`;

  if (req.accepts('json') && !req.accepts('html')) {
    return res.status(200).json({
      ok: true,
      recipient: 'carolbriselli@verizon.net',
      phone: '+1-484-841-6445',
      subject,
      summary: summaryText,
      mailtoUrl
    });
  }

  if (req.headers['x-requested-with'] === 'fetch') {
    return res.status(200).json({
      ok: true,
      recipient: 'carolbriselli@verizon.net',
      phone: '+1-484-841-6445',
      subject,
      summary: summaryText,
      mailtoUrl
    });
  }

  return res.redirect(303, mailtoUrl);
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
