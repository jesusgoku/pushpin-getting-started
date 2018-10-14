const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const nunjucks = require('nunjucks');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  path: '/websocket',
});

app.use(express.json());
app.use(express.static('static'));
nunjucks.configure('views', {
  autoescape: true,
  express: app
});


wss.on('connection', ws => {
  ws.on('message', message => console.log(message));


  const interval = setInterval(() => ws.send('Hello World'), 1000);
  ws.on('close', () => clearInterval(interval));
});


app.get('/', (req, res) => {
    res.render('views/index.html');
});


app.get('/stream', (req, res) => {
  res.set({
    'Cache-Control': 'no-cache',
    'Grip-Sig': req.get('grip-sig'),
    'Grip-Hold': 'stream',
    'Grip-Channel': 'test',
    // 'Content-Type': 'application/json',
    'Content-Type': 'text/event-stream',
    'Grip-Keep-Alive': ':\\n\\n; format=cstring; timeout=20',
    'Access-Control-Allow-Origin': '*',
  });

      // 2k padding for old browsers
  var padding = new Array(2048);
  res.write(':' + padding.join(' ') + '\n\n');

  res.end('Stream opened, prepare yourself!\n');
});

app.post('/events', (req, res) => {
  axios
    .get('http://api:3000/events', {
      params: {
        _sort: 'id',
        _order: 'desc',
        _limit: 1,
      },
    })
    .then(res => axios
      .post('http://api:3000/events', {
        id: res.data[0].id + 1,
        payload: {
          message: req.body.message,
        },
      })
    )
    .then(res => axios
      .post('http://realtime:5561/publish', {
        items: [
          {
            channel: 'test',
            formats: {
              'http-stream': {
                content: `event: message\nid: ${res.data.id}\ndata:${JSON.stringify(res.data.payload)}\n\n`,
              },
            },
          }
        ],
      })
    )
    .then(() => res.sendStatus(204))
  ;
});

// { "items": [ { "channel": "test", "formats": { "http-stream": { "content": "event: message\nid: 14\ndata:{ \"message\": \"Hello World\" }\n\n" } } } ] }

server.listen(8080, () => console.log('Listen on: 0.0.0.0:8080'));
