const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const html = fs.readFileSync('./index.html', 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', (ws) => {
  const clientId = Date.now();
  clients.set(clientId, ws);
  console.log(`Klien ${clientId} terhubung. Total: ${clients.size}`);

  ws.send(JSON.stringify({
    senderId: 'server',
    text: `Selamat datang! Kamu adalah pengguna ke-${clients.size}.`,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    isSelf: false
  }));

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    clients.forEach((client, id) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          senderId: clientId,
          text: message.text,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          isSelf: id === clientId
        }));
      }
    });
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Klien ${clientId} terputus. Sisa: ${clients.size}`);
  });
});

server.listen(8080, () => {
  console.log('Server berjalan di http://localhost:8080');
});