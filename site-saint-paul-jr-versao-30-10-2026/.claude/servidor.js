// Servidor estático simples para pré-visualizar o site: node .claude/servidor.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const porta = Number(process.env.PORT) || 5173;
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

http
  .createServer((req, res) => {
    let caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';
    const arquivo = path.join(raiz, caminho);
    if (!arquivo.startsWith(raiz + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(arquivo, (erro, dados) => {
      if (erro) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Não encontrado');
      }
      res.writeHead(200, {
        'Content-Type': tipos[path.extname(arquivo).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(dados);
    });
  })
  .listen(porta, () => console.log(`Site em http://localhost:${porta}`));
