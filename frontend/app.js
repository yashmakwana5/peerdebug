const socket = io();

const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const messagesDiv = document.getElementById("messages");
const usersDiv = document.getElementById("users");

let currentRoom = "";
let currentUser = "";

joinBtn.onclick = () => {
  const userName = nameInput.value.trim();
  const roomId = roomInput.value.trim();

  if (!userName || !roomId)
    return alert("Enter name & room");

  currentRoom = roomId;
  currentUser = userName;

  socket.emit("room:join", { roomId, userName });

  document.getElementById("startDebugBtn").style.display = "inline-block";
};

sendBtn.onclick = () => {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit("chat:message", {
    roomId: currentRoom,
    message: msg
  });

  messageInput.value = "";
};

socket.on("chat:message", (data) => {
  const div = document.createElement("div");
  div.textContent = `${data.userName}: ${data.message}`;
  messagesDiv.appendChild(div);
});

socket.on("room:users", (users) => {
  usersDiv.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.textContent = u.name;
    usersDiv.appendChild(div);
  });
});

// START DEBUG BUTTON
document.getElementById("startDebugBtn").onclick = () => {
  if (!currentRoom || !currentUser)
    return alert("Join a room first");

  window.location.href =
    `/editor.html?room=${currentRoom}&user=${currentUser}`;
};