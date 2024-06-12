const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const PORT = process.env.PORT || 9000;


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // To store user information
const alertClasses = ['alert-primary', 'alert-secondary', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info', 'alert-light', 'alert-dark'];

io.on('connection', (socket) => {
  console.log("New User Connected", socket.id);

  // Handle user login
  socket.on('user-login', (username) => {
    const userClass = alertClasses[Math.floor(Math.random() * alertClasses.length)];
    users[socket.id] = { username, alertClass: userClass };
    console.log(`${username} connected with socket ID: ${socket.id}`);

    // Emit user join event to all clients
    io.emit('user-join', username);
  });


  // Handle incoming messages
  socket.on('user-message', (data) => {
    if (users.hasOwnProperty(socket.id)) {
      const user = users[socket.id];
      console.log(`Message from ${user.username}: ${data.message}`);
      io.emit('message', { username: user.username, message: data.message, alertClass: user.alertClass });
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      console.log(`${user.username} disconnected`);
      delete users[socket.id];
      io.emit('user-leave', user.username); // Emit user leave event
    }
  });
});

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
