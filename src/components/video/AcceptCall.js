import React, { useEffect, useRef, useState } from 'react';
import { TiCameraOutline } from 'react-icons/ti';
import Peer from 'simple-peer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { wsIP } from '../../config';


const AcceptCall = ({ onConfirm }) => {

    // const navigate = useNavigate();
    // const { user, ssock } = useUser();
    // const location = useLocation();
    // const receiver = location.state;

    // const [stream, setStream] = useState(null);
    // const [call, setCall] = useState(false);
    // const myVideo = useRef();
    // const userVideo = useRef();
    // const connectionRef = useRef();

    // const ws = new WebSocket(`${wsIP}/ws/conversation/${receiver.conv}/?userId=${user.id}`); 

    // useEffect(() => {

    //   ws.onmessage = (event) => {
    //     const data = JSON.parse(event.data);

    //     if (data.type === 'start_call_response') {
    //       console.log('start_call_response @@@@@@', data)
    //       setCall(true)
    //     }
    //   }

    // }, [ws])

    // useEffect(() => {
    //     navigator.mediaDevices.getUserMedia({ video: true, audio: true})
    //     .then((currentStream) => {
    //       setStream(currentStream);
    //       console.log('currentStream', currentStream)
    //       // myVideo.current.srcObject = currentStream;
    //       if (myVideo.current) {
    //         myVideo.current.srcObject = currentStream;
    //       }
    //       console.log('myVideo', myVideo)
    //     })
    //     .catch((error) => {
    //       console.log('currentStream error', error)
    //     })
    
    //     const peer = new Peer({ initiator: false, trickle: false, stream });
    
    //     peer.on('stream', (currentStream) => {
    //       myVideo.current.srcObject = currentStream;
    //     });
    
    //     connectionRef.current = peer;
    //     // window.location.reload()
    //   },[call])



    //   useEffect(() => {
    //     navigator.mediaDevices.getUserMedia({ video: true, audio: true})
    //     .then((currentStream) => {
    //       setStream(currentStream);
    //       console.log('currentStream', currentStream)
    //       // myVideo.current.srcObject = currentStream;
    //       if (myVideo.current) {
    //         myVideo.current.srcObject = currentStream;
    //       }
    //       console.log('myVideo', myVideo)
    //     })
    //     .catch((error) => {
    //       console.log('currentStream error', error)
    //     })
    
    //     const peer = new Peer({ initiator: false, trickle: false, stream });
    
    //     peer.on('stream', (currentStream) => {
    //       myVideo.current.srcObject = currentStream;
    //     });
    
    //     connectionRef.current = peer;
    //     // window.location.reload()
    //   },[call])


    //   const startCall = () => {
    //     setCall(true)
    //     const peer = new Peer({ initiator: true, trickle: false, stream });
    //     peer.on('signal', (data) => {
    //       if (ws && ws.readyState === WebSocket.OPEN){
    //         ws.send(JSON.stringify({
    //           type: 'start_call', 
    //           caller: user.id,
    //           signalData: data,
    //         }));
    //       }
    //     });
    //   }

    //   const stopCall = () => {
    //     navigate("/AllUsers")
    //     setCall(false)
    //   }


    //   const answerCall = () => {
    
    //     const peer = new Peer({ initiator: false, trickle: false, stream });

    //     peer.on('signal', (data) => {
    //       ws.send({ type: 'answerCall', signal: data, to: user.id });
    //     });
    
    //     peer.on('stream', (currentStream) => {
    //       userVideo.current.srcObject = currentStream;
    //     });
    
    //     peer.signal(call.signal);
    
    //     connectionRef.current = peer;
    //   };

  return (
    <div>
        <p>AcceptCall</p>
        <button onClick={onConfirm}>Call</button>
        
    </div>
  )
}

export default AcceptCall