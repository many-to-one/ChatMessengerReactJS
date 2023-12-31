// import React, { useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import SimplePeer from 'simple-peer';

// const VideoChat = () => {
//   const videoRef = useRef();
//   const socket = useRef();

//   useEffect(() => {
//     // Replace 'localhost' with your Django backend address
//     socket.current = io.connect('http://localhost:8000/ws/video_chat/');

//     const peer = new SimplePeer({ initiator: window.location.hash === '#init' });

//     peer.on('stream', (stream) => {
//       videoRef.current.srcObject = stream;
//     });

//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         videoRef.current.srcObject = stream;
//         peer.addStream(stream);

//         socket.current.on('message', (data) => {
//           peer.signal(data);
//         });
//       })
//       .catch((err) => console.error(err));

//     peer.on('signal', (data) => {
//       socket.current.emit('message', data);
//     });

//     return () => {
//       peer.destroy();
//       socket.current.disconnect();
//     };
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} autoPlay playsInline></video>
//     </div>
//   );
// };

// export default VideoChat;


import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';


const AcceptCall = () => {

    const [stream, setStream] = useState(null);
    const [call, setCall] = useState({});
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true})
        .then((currentStream) => {
          setStream(currentStream);
          console.log('currentStream', currentStream)
          myVideo.current.srcObject = currentStream;
          console.log('myVideo', myVideo)
        })
        .catch((error) => {
          console.log('currentStream error', error)
        })
    
        const peer = new Peer({ initiator: false, trickle: false, stream });
    
        peer.on('stream', (currentStream) => {
          myVideo.current.srcObject = currentStream;
        });
    
        connectionRef.current = peer;
    
      },[])

  return (
    <div>

        {stream &&
          <div>
            <video ref={myVideo} autoPlay playsInline width="250" height="250" controls></video>
          </div>
        }

    </div>
  )
}

export default AcceptCall