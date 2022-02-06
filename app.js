require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const server = require('http').Server(app);
const uuid = require('uuid').v4;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.json());
app.use(fileUpload());

const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, { debug: true })

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuid().substring(0, 7)}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
  })
})

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started at port ${port}`);
})