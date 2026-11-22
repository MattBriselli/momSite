const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 9000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .listen(PORT, () => console.log(`Listening on http://localhost:${ PORT }`));

app.get(["/", "/index", "/index.html"], (req, res) => res.render('pages/index'));
app.get(["/biographies", "/biographies.html"], (req, res) => res.render('pages/biographies'));
app.get(["/FAQ", "/faq", "/FAQ.html", "/faq.html"], (req, res) => res.render('pages/FAQ'));
app.get(["/rates", "/rates.html"], (req, res) => res.render('pages/rates'));
app.get(["/repertoire", "/repertoire.html"], (req, res) => res.render('pages/repertoire'));
app.get(["/samples", "/samples.html"], (req, res) => res.render('pages/samples'));
app.get(["/testimonials", "/testimonials.html"], (req, res) => res.render('pages/testimonials'));
app.get(["/venues", "/venues.html"], (req, res) => res.render('pages/venues'));
