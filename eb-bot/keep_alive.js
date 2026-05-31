// keep_alive.js — mantém o bot online no Replit
const http = require('http');

function keepAlive() {
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('✅ Bot EB online!');
  });
  server.listen(3000, () => {
    console.log('🌐 Servidor keep-alive rodando na porta 3000');
  });
}

module.exports = keepAlive;
