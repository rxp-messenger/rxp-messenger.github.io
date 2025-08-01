const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 3000;

app.use(express.static('public'));

const users = {};
let onlineUsersCount = 0;
const MAX_MESSAGES = 100; // Maximum number of messages to store
const MESSAGE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let messages = [];

// Function to clean up old messages
function cleanupMessages() {
    const currentTime = Date.now();
    messages = messages.filter(msg => (currentTime - msg.timestamp) <= MESSAGE_EXPIRATION_TIME);
}

io.on('connection', (socket) => {
    console.log("User connected");
    onlineUsersCount++;
    io.emit('online-users-count', onlineUsersCount);
    
    // Send existing messages to the newly connected user
    socket.emit('existing-messages', messages);
    
    // Användare ansluter
    socket.on("new-user", userName => {
        users[socket.id] = userName;
        socket.broadcast.emit('user-connected', userName);
    });
   
    // skicka meddelande
    socket.on("message", incoming => {
        // Add the new message to the messages array
        messages.push({
            userName: incoming.userName,
            message: incoming.message,
            timestamp: Date.now()
        });

        // Limit the number of messages stored
        if (messages.length > MAX_MESSAGES) {
            messages.shift(); // Remove the oldest message
        }

        io.emit('message', incoming);
    });

    // skicka joke
    socket.on("joke", incomingJoke => {
        io.emit('joke', incomingJoke);
    });

    // Nudge
    socket.on("nudge", userName => {
        socket.broadcast.emit('nudge', userName);
    });
    
    //Användare skriver meddelande
    socket.on('typing', incoming => {
        socket.broadcast.emit('typing', incoming);
    });

    // Användare lämnar
    socket.on("disconnect", () => {
        console.log("User disconnected");
        onlineUsersCount--;
        io.emit('online-users-count', onlineUsersCount);
        delete users[socket.id];
        // Cleanup messages when a user disconnects
        cleanupMessages();
    });
});

http.listen(port, () => console.log("Listening on port " + port));

