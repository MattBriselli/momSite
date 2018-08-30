const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .listen('9000', () => console.log(`Listening on 9000`))

app.get('/', (req, res) => {
    res.render('pages/index', {});
});
app.get("/index.html", (req, res) => res.redirect('/'));
app.get("/biographies.html", (req, res) => res.render('pages/biographies'));
app.get("/repertoire.html", (req, res) => res.render('pages/repertoire'));

// app.get("/profile", (req, res) => res.render('pages/profile'));
// app.get("/tile", (req, res) => res.redirect('http://www.tinyurl.com/tabtiles'))
// app.get("/*", (req, res) => res.redirect('http://www.tinyurl.com/tabtiles'))