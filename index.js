const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get(["/", "/index", "/index.html"], (req, res) => res.render('pages/index'));
app.get(["/biographies.html", "/biographies"], (req, res) => res.render('pages/biographies'));
app.get(["/FAQ.html", "/faq", "/FAQ", "/faq.html"], (req, res) => res.render('pages/FAQ'));
app.get(["/rates.html", "rates"], (req, res) => res.render('pages/rates'));
app.get(["/repertoire.html", "/repertoire"], (req, res) => res.render('pages/repertoire'));
app.get(["/samples.html", "samples"], (req, res) => res.render('pages/samples'));
app.get(["/testimonials.html", "testimonials"], (req, res) => res.render('pages/testimonials'));
app.get(["/venues.html", "/venues", "venues"], (req, res) => res.render('pages/venues'));