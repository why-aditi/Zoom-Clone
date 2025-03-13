const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",
});
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
let myUserId;
let myUserName = prompt("Enter your name") || "Anonymous";

// Initialize UI panels
const chatPanel = document.querySelector(".chat__panel");
const participantsPanel = document.querySelector(".participants__panel");

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // Handle incoming calls
    myPeer.on("call", (call) => {
      call.answer(stream); // Answer the call with your own stream
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream); // Add the remote user's video stream
      });
    });

    // Socket.IO event listeners for chat and user connections
    socket.on("user-connected", (userId, userName) => {
      connectToNewUser(userId, myVideoStream); // Call function to establish WebRTC connection
      addSystemMessage(`${userName} joined the meeting`);
    });

    // Handling sending and receiving messages
    let text = $("input#chat_message");
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (message, userName) => {
      $(".messages").append(
        `<li class="message"><b>${userName}</b><br/>${message}</li>`
      );
      scrollToBottom();
    });

    // Handle participants list updates
    socket.on("participants-updated", (participants) => {
      updateParticipantsList(participants);
    });

    // Handle invite sent confirmation
    socket.on("invite-sent", (email) => {
      addSystemMessage(`Invitation sent to ${email}`);
    });

    // Handle user disconnection
    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) {
        peers[userId].close();
        delete peers[userId];
      }
    });
  });

myPeer.on("open", (id) => {
  myUserId = id;
  socket.emit("join-room", ROOM_ID, id, myUserName);
});

// Set up invite button functionality
document.getElementById("invite_button").addEventListener("click", () => {
  const email = document.getElementById("participant_email").value;
  if (email && email.includes("@")) {
    socket.emit("invite-participant", email);
    document.getElementById("participant_email").value = "";
  } else {
    alert("Please enter a valid email address");
  }
});

// Function to toggle between chat and participants panels
function toggleChatPanel() {
  chatPanel.classList.add("active");
  participantsPanel.classList.remove("active");
}

function toggleParticipantsPanel() {
  participantsPanel.classList.add("active");
  chatPanel.classList.remove("active");
}

// Function to update the participants list in the UI
function updateParticipantsList(participants) {
  const participantsList = document.querySelector(".participants__list");
  participantsList.innerHTML = "";

  participants.forEach((participant) => {
    const listItem = document.createElement("li");
    listItem.className = "participant__item";

    const avatar = document.createElement("div");
    avatar.className = "participant__avatar";
    avatar.innerHTML = `<i class="fas fa-user"></i>`;

    const name = document.createElement("div");
    name.className = "participant__name";
    name.textContent = participant.name;

    // Highlight the current user
    if (participant.id === myUserId) {
      name.textContent += " (You)";
      listItem.style.fontWeight = "bold";
    }

    listItem.appendChild(avatar);
    listItem.appendChild(name);
    participantsList.appendChild(listItem);
  });
}

// Function to add a system message to the chat
function addSystemMessage(message) {
  $(".messages").append(
    `<li class="message system-message"><i>${message}</i></li>`
  );
  scrollToBottom();
}

const connectToNewUser = (userId, stream) => {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};
