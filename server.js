const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');

const app = express();
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
    debug: true  // Bật debug để xem log kết nối
});

app.use('/peerjs', peerServer);  // Mount PeerServer tại /peerjs
app.use(express.static('public'));  // Phục vụ file tĩnh từ thư mục public

server.listen(9000, () => {
    console.log('Server is running on http://localhost:9000');
});