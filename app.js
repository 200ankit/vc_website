const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCallButton');
const endCallButton = document.getElementById('endCallButton');
const startRecordingButton = document.getElementById('startRecordingButton');
const stopRecordingButton = document.getElementById('stopRecordingButton');

let localStream;
let remoteStream;
let recorder;
let recordedChunks = [];

// ... (previous code) ...

async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
  
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
  
    peerConnection.ontrack = (event) => {
      remoteStream = event.streams[0];
      remoteVideo.srcObject = remoteStream;
    };
  
    startRecordingButton.disabled = false;
    startCallButton.disabled = true;
    endCallButton.disabled = false;
    stopRecordingButton.disabled = true;
  
    // Create an offer and set it as local description
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
  
      // Send the offer to the remote peer
      // Here, you would typically send the offer to the other peer using a signaling server
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  
    return peerConnection;
  }
  
  // ... (remaining code) ...
  

startCallButton.addEventListener('click', async () => {
  const peerConnection = await startCall();

  peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .catch(error => console.error('Error creating offer:', error));
});

endCallButton.addEventListener('click', () => {
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
  localStream.getTracks().forEach(track => track.stop());
  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }
  startRecordingButton.disabled = true;
  startCallButton.disabled = false;
  endCallButton.disabled = true;
  stopRecordingButton.disabled = true;
});

startRecordingButton.addEventListener('click', () => {
  recordedChunks = [];
  recorder = new MediaRecorder(remoteStream);
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  recorder.start();
  startRecordingButton.disabled = true;
  stopRecordingButton.disabled = false;
});

stopRecordingButton.addEventListener('click', () => {
  if (recorder) {
    recorder.stop();
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'recorded-video.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  }
});



