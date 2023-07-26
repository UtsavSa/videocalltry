


const socket = io('/'); //socket connect to root path of localhost 3000

const videoGrid = document.getElementById('video-grid');



const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
// peer server takes all the webRTC information of user and turns into easy to use ID 
// which we fan pass between different people to connect

const myVideo = document.createElement('video');
myVideo.muted = true;


const peers = {};



navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);

        });
    });

    socket.on('user-connected', userId => {
        connecToNewUser(userId, stream);
        
    });
});



//socket.emit('join-room', ROOM_ID, 10);
// 10 is the userId we have hard coded.
// id connection - hard code and write code by hand to set up these fancy connection or
// use the library peerJS which can create connections between different users
// using webRTC and peerJS has a serverSetup to create dynamic Ids to for users to join

//socket.on('user-connected', userId =>{

  //  console.log('User connected: '+userId)
//});

socket.on('user-disconnected', userId =>{

    if(peers[userId]) {
        peers[userId].close();
        //delete peers[userId];
    };

});

myPeer.on('open', id =>{

    socket.emit('join-room', ROOM_ID, id);


}); 


function connecToNewUser(userId, stream){

    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () =>{
        video.remove();
    });
    
    peers[userId] = call;
};

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () =>{
        video.play();
    });
    videoGrid.append(video);
};