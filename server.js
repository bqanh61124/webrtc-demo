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

// Sử dụng process.env.PORT cho Heroku
const port = process.env.PORT || 9000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});