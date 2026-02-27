const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/models", express.static(path.join(__dirname, "../frontend/models")));
const users = {};

io.on("connection", (socket) => {

  // ===== JOIN ROOM =====
  socket.on("room:join", ({ roomId, userName }) => {

    socket.join(roomId);

    users[socket.id] = {
      name: userName,
      room: roomId
    };

    const roomUsers = Object.values(users).filter(
      user => user.room === roomId
    );

    io.to(roomId).emit("room:users", roomUsers);

    io.to(roomId).emit("chat:message", {
      userName: userName,
      message: "joined the room"
    });
  });

  // ===== CHAT MESSAGE =====
  socket.on("chat:message", ({ roomId, message }) => {

    const user = users[socket.id];
    if (!user) return;

    io.to(roomId).emit("chat:message", {
      userName: user.name,
      message: message
    });
  });

  // ===== CODE SYNC =====
  socket.on("code:change", ({ roomId, code }) => {
    socket.to(roomId).emit("code:update", code);
  });

  // ===== DISCONNECT =====
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (!user) return;

    io.to(user.room).emit("chat:message", {
      userName: user.name,
      message: "left the room"
    });

    delete users[socket.id];

    const roomUsers = Object.values(users).filter(
      u => u.room === user.room
    );

    io.to(user.room).emit("room:users", roomUsers);
  });

});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});