const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { join } = require('path');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: 'src' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const rootStaticFiles = ['/favicon.ico'];
    if (parsedUrl.pathname === '/resume.pdf' || parsedUrl.pathname === '/resume') {
      const path = join(__dirname, 'src', 'static', 'resume.pdf');
      app.serveStatic(req, res, path);
    } else if (rootStaticFiles.indexOf(parsedUrl.pathname) > -1) {
      const path = join(__dirname, 'src', 'static', parsedUrl.pathname);
      app.serveStatic(req, res, path);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
