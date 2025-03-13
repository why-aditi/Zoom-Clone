const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");

const { v4: uuidV4 } = require("uuid");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));

// Store room participants
const roomParticipants = {};

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);

    // Initialize room participants array if it doesn't exist
    if (!roomParticipants[roomId]) {
      roomParticipants[roomId] = [];
    }

    // Add participant to the room
    const participant = {
      id: userId,
      name: userName || `User-${userId.substring(0, 5)}`,
      socketId: socket.id,
    };

    roomParticipants[roomId].push(participant);

    // Emit updated participants list to all users in the room
    io.to(roomId).emit("participants-updated", roomParticipants[roomId]);

    // Notify others that a new user has connected
    socket.to(roomId).emit("user-connected", userId, participant.name);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, participant.name);
    });

    // Handle participant name update
    socket.on("update-user-name", (newName) => {
      const participantIndex = roomParticipants[roomId].findIndex(
        (p) => p.id === userId
      );
      if (participantIndex !== -1) {
        roomParticipants[roomId][participantIndex].name = newName;
        io.to(roomId).emit("participants-updated", roomParticipants[roomId]);
      }
    });

    // Handle invite participant
    socket.on("invite-participant", (email) => {
      // In a real application, you would send an email with the room link
      // For now, we'll just emit an event to acknowledge the invite
      socket.emit("invite-sent", email);
    });

    socket.on("disconnect", () => {
      // Remove participant from the room
      if (roomParticipants[roomId]) {
        roomParticipants[roomId] = roomParticipants[roomId].filter(
          (p) => p.id !== userId
        );

        // Clean up empty rooms
        if (roomParticipants[roomId].length === 0) {
          delete roomParticipants[roomId];
        } else {
          // Emit updated participants list
          io.to(roomId).emit("participants-updated", roomParticipants[roomId]);
        }
      }

      // Notify others that user has disconnected
      io.to(roomId).emit("user-disconnected", userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
