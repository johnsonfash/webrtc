const socket = io('/');

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: "443" || window.location.port
})

const user = prompt("Enter your name");

var myVideoStream;
const videoGrid = document.getElementById("video-grid");
const myVideoEl = document.createElement("video");
myVideoEl.muted = true;

const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
    videoGrid.append(videoEl);
  });
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
}


navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true,
})
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideoEl, stream);

    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream)
    })
  });


peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id, user)
})

let text = document.querySelector('#chat_message')
let send = document.querySelector('#send')
let messages = document.querySelector('.messages')

send.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || text.value.legth !== 0) {
    socket.emit('message', text.value);
    text.value = '';
  }
})

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});


stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});