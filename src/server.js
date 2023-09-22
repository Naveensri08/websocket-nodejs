
require('dotenv').config()
const host = process.env.HOST || 'http://localhost';
const port = process.env.PORT || 8002;
const { WebSocket, WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: port });

wss.on('connection', function connection(ws, req) {

    // const ip = req.headers['x-forwarded-for'].split(',')[0].trim();
    console.log('NodeJs Server is Started');
    // console.log(JSON.stringify({from:"NodeJs Server is Started"}));
   
    // Encoding data to Base64
    // const base64Encoded = Buffer.from(sampleParam).toString('base64');

    // Access connection details
    console.table({"Client IP": req.connection.remoteAddress, "Client Port": req.connection.remotePort, "Date": new Date().toDateString()});
    
    // On Error Close the WebSocket connection. 
    ws.on('error', function error(err) {
      ws.close(500, err); 
      console.log(err);
    });

    ws.on('message', function message(msg) { // ,isBinary

        try {
          
          // var number =  wss.clients.length - 1;
          // console.log("data of status is " + JSON.parse(msg).status);
          msg = JSON.parse(msg);
          // var res = {};
       

          if((msg['typ'] == 'send_message') || (msg['typ'] == 'delete_message')) {
            console.log("============\n Sender and Delete \n============\n");
              wss.clients.forEach(client => {

                  if(client == ws)
                    msg.from = 'Me';
                  else 
                    msg.from = msg['sender_user_name'];
                  console.log("Sender and Delete : " + req.sender_user_name);
                  // console.log("Sender and Delete : " + req);
                  client.send(JSON.stringify(msg));
              })

          } else if(msg['typ'] == 'click_user') {
            console.log("============\n click_user \n ============\n");
              wss.clients.forEach(client => {

                  if(client == ws)
                    msg.from = 'Me';
                  else 
                    msg.from = 'Not Me'

                    client.send(JSON.stringify(msg))
              })

          } 
          else if(msg['typ'] == 'online_status') {
            
            console.log("============\n online_status \n ============\n");

            wss.clients.forEach(client => {
              client.send(JSON.stringify(msg))
            })
          } 


            console.log(msg);
          // wss.clients.forEach(client => {
          //   if (ws.isAlive === false) return ws.terminate();
          //   // if (client !== ws && client.readyState === WebSocket.OPEN) { // If Not Equel Sent 
          //   if (client.readyState === WebSocket.OPEN) {
          //     client.send(data, { binary: isBinary });
          //     console.log(`distributing message: ${data}`)
          //     client.send(`${msg}`)
          //   }
          // })
          
        } catch (err) {

            // ws.close(500, "on message - "+err)
            console.warn(err)
        }

    });


    ws.on('open', function open() {

      try {
          
          // console.warn(req.url);

          // Accessing URL parameters
          let url = new URL(req.url, host + ':' + port);
          let param = new URLSearchParams(url.search.slice(1));
          
          if(param.has('encryption_userId')) {

            let encryption_userId = url.searchParams.get('encryption_userId');
            let userId = Buffer.from(param).toString('base64').toString('utf-8'); // Decoding data to Base64
            let data = JSON.stringify({
              typ : 'online_status',
              status_type : 'Online',
              user_id_status : userId
            });

            wss.clients.forEach(client => client.send(data))

          } else 
            ws.close(400, 'encryption_userId is missing');
                
      } catch (err) {

        ws.close(500, "on open - " + err)
        console.log(err)
      }
      
    });


    ws.on('close', function close() {

      try {
          
          // console.warn(req.url);

          // Accessing URL parameters
          let url = new URL(req.url, host + ':' + port);
          let param = new URLSearchParams(url.search.slice(1));
          
          if(param.has('encryption_userId')) {

            let encryption_userId = url.searchParams.get('encryption_userId');
            let userId = Buffer.from(param).toString('base64').toString('utf-8'); // Decoding data to Base64
            let data = JSON.stringify({
              typ : 'online_status',
              status_type : 'Offline',
              user_id_status : userId
            });

            wss.clients.forEach(client => client.send(data))
            ws.close();
          } else 
            ws.close(400, 'encryption_userId is missing');
                
      } catch (err) {

        ws.close(500, "on close - " + err)
        console.log(err)
      }
      console.log(' Client has disconnected!');
    });

    // ws.on('close', () => {

    //   // clearInterval(interval);
    //   console.log(' Client has disconnected!');
    // });

});