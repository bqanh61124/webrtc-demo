let localStream;
let peers = {};

// Lấy stream từ webcam/micro
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

// Khởi tạo Peer với signaling server
const peer = new Peer({
    host: window.location.hostname,  // Tự động dùng domain Render (ví dụ: webrtc-demo.onrender.com)
    port: window.location.port || (window.location.protocol === 'https:' ? 443 : 80),  // HTTPS dùng 443, HTTP dùng 80
    path: '/peerjs',
    secure: window.location.protocol === 'https:',  // Bật secure cho HTTPS trên Render
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },  // STUN mặc định
            {
                urls: 'turn:openrelay.metered.ca:80',  // TURN miễn phí
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ]
    },
    debug: 3  // Bật debug chi tiết để dễ troubleshoot
});

// Hiển thị ID của peer khi kết nối signaling
peer.on('open', id => {
    document.getElementById('peer-id').value = id;
});

// Nút Call: Kết nối đến peer khác
document.getElementById('connect-button').addEventListener('click', () => {
    const peerId = document.getElementById('connect-id').value;
    if (peerId) {
        connectToPeer(peerId);
    } else {
        alert('Please enter a peer ID to connect.');
    }
});

// Nút Disconnect: Ngắt tất cả kết nối
document.getElementById('disconnect-button').addEventListener('click', () => {
    for (let peerId in peers) {
        peers[peerId].close();
    }
    peers = {};
    document.getElementById('remote-video-container').innerHTML = '';
});

// Nút Mute/Unmute audio
document.getElementById('mute-button').addEventListener('click', () => {
    localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
    document.getElementById('mute-button').textContent = localStream.getAudioTracks()[0].enabled ? 'Mute' : 'Unmute';
});

// Nút Stop/Start video
document.getElementById('stop-video-button').addEventListener('click', () => {
    localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
    document.getElementById('stop-video-button').textContent = localStream.getVideoTracks()[0].enabled ? 'Stop Video' : 'Start Video';
});

// Xử lý cuộc gọi đến (answer và hiển thị stream)
peer.on('call', call => {
    call.answer(localStream);
    handleIncomingCall(call);
});

// Function kết nối đến peer
function connectToPeer(peerId) {
    const call = peer.call(peerId, localStream);
    handleIncomingCall(call);
    peers[peerId] = call;
}

// Xử lý stream từ call (hiển thị video)
function handleIncomingCall(call) {
    call.on('stream', remoteStream => {
        addVideoStream(call.peer, remoteStream);
    });

    call.on('close', () => {
        document.getElementById(call.peer).remove();
        delete peers[call.peer];
    });

    call.on('error', err => {
        console.error('Call failed:', err);
        alert('Call failed.');
    });
}

// Thêm video element cho remote stream
function addVideoStream(peerId, stream) {
    if (document.getElementById(peerId)) return;

    const videoWrapper = document.createElement('div');
    videoWrapper.id = peerId;
    videoWrapper.className = 'video-wrapper';

    const video = document.createElement('video');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `Peer: ${peerId}`;

    videoWrapper.append(video);
    videoWrapper.append(label);

    document.getElementById('remote-video-container').append(videoWrapper);
}