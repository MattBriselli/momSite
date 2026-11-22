const { spawn } = require('child_process');
const http = require('http');
const test = require('tape');

const TEST_PORT = 5055;
const env = Object.assign({}, process.env, { PORT: TEST_PORT });
const child = spawn('node', ['index.js'], { env });

function fetchPage(pathname) {
    return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${TEST_PORT}${pathname}`, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => resolve({ statusCode: res.statusCode, body }));
        }).on('error', reject);
    });
}

test('Arioso String Quartet routes render cleanly', (t) => {
    const routes = [
        { path: '/', expected: 'Arioso String Quartet' },
        { path: '/biographies', expected: 'Meet the Arioso Quartet' },
        { path: '/repertoire', expected: 'Musical Repertoire' },
        { path: '/samples', expected: 'Music Samples' },
        { path: '/venues', expected: 'Selected Venues' },
        { path: '/testimonials', expected: 'Client Testimonials' },
        { path: '/rates', expected: 'Rates &amp; Availability' },
        { path: '/FAQ', expected: 'Frequently Asked Questions' }
    ];

    t.plan(routes.length * 2);

    child.stdout.once('data', async () => {
        try {
            for (const route of routes) {
                const { statusCode, body } = await fetchPage(route.path);
                t.equal(statusCode, 200, `${route.path} returns HTTP 200`);
                t.ok(body.includes(route.expected), `${route.path} includes "${route.expected}"`);
            }
        } finally {
            child.kill();
        }
    });
});
