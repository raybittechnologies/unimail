const socketIo = require("socket.io");
const { socketAuth } = require("./socketAuth");

const {
  saveTextMessage,
  fetchChatRoomDetails,
} = require("../Controllers/chats.controller");
const {
  changeConsultationStatus,
  scheduleConsultEnd,
} = require("../Controllers/consultation.controller");

let io;
function initWebSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.connectedUsers = {};

  io.use(async (socket, next) => {
    await socketAuth(socket, next);
  });

  io.on("connection", (socket) => {
    if (!io.connectedUsers[socket.user.phone]) {
      io.connectedUsers[socket.user.phone] = socket;
    }
    if (socket.user.role === "consultant") {
    }

    //Join the room for chat
    socket.on("join_room_chat", async ({ roomId }) => {
      const room = await fetchChatRoomDetails(socket, roomId);
      if (room) {
        socket.join(room);
        socket.emit("joinedRoom", { room });

        const myRoom = io.sockets.adapter.rooms.get(roomId);

        if (socket.user.role === "consultant") {
          await changeConsultationStatus(socket, "inprogress", roomId);
          await scheduleConsultEnd(io, socket, roomId);
        }
      }
    });

    //Consultation messages
    socket.on("consult_message", async ({ roomId, message }) => {
      const room = await fetchChatRoomDetails(socket, roomId);
      if (room)
        io.to(roomId).emit("rec", message, async () => {
          await saveTextMessage(socket.user.id, roomId, message);
        });
    });

    socket.on("disconnect", () => {
      delete io.connectedUsers[socket.user.phone];
    });
  });
}
function getSocketIoServer() {
  return io;
}

module.exports = { initWebSocket, getSocketIoServer };
