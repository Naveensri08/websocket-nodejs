require('dotenv').config()
const { WebSocket, WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 8001 });

wss.on('connection', function connection(ws) { // req

        // const ip = req.headers['x-forwarded-for'].split(',')[0].trim();
        // ws.isAlive = true;
        ws.send('connection established');
      
        // ws.on('error', console.error);
        ws.on('error', (err) => {
            ws.isAlive = false;
            console.log(err)
        });
  
        ws.on('message', function message(data) {
        
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(`${data}`)
              }
            })
          
        });
  
      ws.on('close', () => {
        console.log(ws.name +' Client has disconnected!');
      });
  
  });