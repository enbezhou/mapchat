'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var CURRENT_REMOTE_USER = null;
var REMOTE_USER_MAP = null;
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
var miniVideo = document.querySelector('#miniVideo');
var videoDiv = document.querySelector('#videos');
var initImageDiv = document.querySelector('#initImage');
var mapContainer = document.querySelector('#map-container');
var remoteUserContainer = document.querySelector('#remote-user-containner');
var remoteUserMapDiv = document.querySelector('#remote-user-map');
var closeVideoChatContainner = document.querySelector('#close-video-chat-container');
var closeLocalVideoChatBtn = document.querySelector('#close-local-video-chat-btn');
var closeOnlineVideoChatBtn = document.querySelector('#close-online-video-chat-btn');

var pcConfig = {
    'iceServers': [
        {
            "urls": "stun:stun.mapchat.cn:3478",
            "username": "",
            "credential": ""
        },
        {
            "urls": "turn:stun.mapchat.cn:3478",
            "username": "zgh",
            "credential": "123456"
        }
    ]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

/////////////////////////////////////////////

var room = 'foo';
// Could prompt for room name:
videoDiv.style.visibility="hidden";
mapContainer.style.visibility = "hidden";
document.getElementsByClassName("callEnter")[0].addEventListener('click', start);
document.getElementById("accept-remote-user-btn").addEventListener('click', acceptRemoteUser);
document.getElementById("reject-remote-user-btn").addEventListener('click', rejectRmoteUser);
closeLocalVideoChatBtn.addEventListener('click', closeLocalVideoChat);
closeOnlineVideoChatBtn.addEventListener('click', closeOnlineVideoChat);

function closeOnlineVideoChat() {
    var roomId = generateRoom(getAndSaveUuid(), CURRENT_REMOTE_USER);
    destroyLocalVideoScreen();
    if (CURRENT_REMOTE_USER != null) {
        var roomId = generateRoom(getAndSaveUuid(), CURRENT_REMOTE_USER);
        socket.emit('apply-destroy-room', CURRENT_REMOTE_USER, roomId);
    }
    CURRENT_REMOTE_USER = null;
    isChannelReady = false;
    isInitiator = false;
    isStarted = false;
}

function start() {
    if (!!window.navigator.mediaDevices){
        loadOnlineUsers();
    } else {
        alert("当前浏览器不支持视频聊天功能，请换用Chrome浏览器接着使用");
    }
}

function startVideoChat(room) {
    if (room !== '') {
        socket.emit('create or join', room);
        console.log('Attempted to create or  join room', room);
    }
    try {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
            .then(gotStream)
            .catch(function(e) {
                alert('getUserMedia() error: ' + e.name);
            });
    } catch (e) {
        alert(`请您打开浏览器的获取摄像头的权限之后，刷新页面`);
    }
}

var socket = io.connect();

function registerUserSocket(uuid) {
    socket.emit('registerUserSocket', uuid);
}

function inviteFriend(inviteInfo) {
    CURRENT_REMOTE_USER = inviteInfo.friendUuid;
    socket.emit('inviteFriend', inviteInfo);
}

socket.on('confirmInvite', function (uuid) {
    if (!CURRENT_REMOTE_USER) {
        CURRENT_REMOTE_USER = uuid;
        showRemoteUserPoint(getRemoteUserInfo(uuid));
    } else {
        var inviteInfo = {
            currentUuid: getAndSaveUuid(),
            friendUuid: uuid
        }
        socket.emit('confirmInviteReject', inviteInfo);
    }

    // var confirmInvite = confirm("accept invite:" + uuid);
    // // TODO
    // if (confirmInvite == true) {
    //     //socket.emit('confirmInviteOk', inviteInfo);
    //     startVideoChat(generateRoom(getAndSaveUuid(), uuid));
    // } else {
    //     var inviteInfo = {
    //         currentUuid: getAndSaveUuid(),
    //         friendUuid: uuid
    //     }
    //     socket.emit('confirmInviteReject', inviteInfo);
    // }
});

function acceptRemoteUser() {
    startVideoChat(generateRoom(getAndSaveUuid(), CURRENT_REMOTE_USER));
    hiddenRemoteUserMap();
}

function rejectRmoteUser() {
    var inviteInfo = {
        currentUuid: getAndSaveUuid(),
        friendUuid: CURRENT_REMOTE_USER
    }
    var roomId = generateRoom(inviteInfo.currentUuid, inviteInfo.friendUuid);
    socket.emit('confirmInviteReject', inviteInfo, roomId);
    hiddenRemoteUserMap();
    CURRENT_REMOTE_USER = null;
}

function hiddenRemoteUserMap() {
    REMOTE_USER_MAP && REMOTE_USER_MAP.destroy();
    REMOTE_USER_MAP = null;
    remoteUserContainer.style.visibility = "hidden";
}

socket.on('receiveReject', function (roomId) {
    socket.emit('leave-room', roomId);
    isChannelReady = false;
    isInitiator = false;
    isStarted = false;
    loadOnlineUsers();
    localVideo.classList.remove("active");
    if (!!localVideo.srcObject) {
        localVideo.srcObject.getTracks()[0].stop();
        localVideo.srcObject.getTracks()[1].stop();
    }
    localVideo.srcObject = null;
    videoDiv.style.visibility="hidden";
    mapContainer.style.visibility = "visible";
    mapContainer.style.height = "100%";
    closeOnlineVideoChatBtn.style.display="none";
    closeLocalVideoChatBtn.style.display="none";
    closeVideoChatContainner.style.visibility="hidden";


});

socket.on('destroy-second-chat', function (uuid, roomId) {
    if (!!uuid && uuid ==getAndSaveUuid() && CURRENT_REMOTE_USER != null) {
        destroyLocalVideoScreen();
        isChannelReady = false;
        isInitiator = false;
        isStarted = false;
        // if (!!roomId) {
        //     socket.emit('leave-room', roomId);
        // }
    }
    CURRENT_REMOTE_USER = null;
});

function destroyLocalVideoScreen() {
    loadOnlineUsers();
    if (!!remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks()[0].stop();
        remoteVideo.srcObject.getTracks()[1].stop();
    }
    if (!!miniVideo.srcObject) {
        miniVideo.srcObject.getTracks()[0].stop();
        miniVideo.srcObject.getTracks()[1].stop();
    }
    remoteVideo.srcObject = null;
    miniVideo.srcObject = null;
    remoteVideo.classList.remove("active");
    miniVideo.classList.remove("active");
    videoDiv.classList.remove("active");
    closeOnlineVideoChatBtn.style.display="none";
    closeLocalVideoChatBtn.style.display="none";
    closeVideoChatContainner.style.visibility="hidden";
    videoDiv.style.visibility="hidden";
    mapContainer.style.visibility = "visible";
    mapContainer.style.height = "100%";
}


function closeLocalVideoChat() {
    loadOnlineUsers();
    localVideo.classList.remove("active");
    if (!!localVideo.srcObject) {
        localVideo.srcObject.getTracks()[0].stop();
        localVideo.srcObject.getTracks()[1].stop();
    }
    localVideo.srcObject = null;
    videoDiv.style.visibility="hidden";
    mapContainer.style.visibility = "visible";
    mapContainer.style.height = "100%";
    hiddenVideoBtn();
    var roomId = generateRoom(CURRENT_REMOTE_USER, getAndSaveUuid());
    socket.emit('leave-room', roomId)
    CURRENT_REMOTE_USER = null;

}

function hiddenVideoBtn() {
    closeLocalVideoChatBtn.style.display = 'none';
    closeOnlineVideoChatBtn.style.display = 'none';
    closeVideoChatContainner.style.visibility="hidden";
}

socket.on('created', function(room) {
    console.log('Created room ' + room);
    isInitiator = true;
});

socket.on('full', function(room) {
    console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
    console.log('Another peer made a request to join room ' + room);
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true;
});

socket.on('joined', function(room) {
    console.log('joined: ' + room);
    isChannelReady = true;
});

socket.on('log', function(array) {
    console.log.apply(console, array);
});

socket.on('client-health-check', function(uuid) {
    socket.emit('confirm-health-check', uuid);
});

////////////////////////////////////////////////

function sendMessage(message) {
    console.log('Client sending message: ', message);
    socket.emit('message', message);
}

// This client receives a message
socket.on('message', function(message) {
    console.log('Client received message:', message);
    if (message === 'got user media') {
        maybeStart();
    } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    } else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
    }
});

////////////////////////////////////////////////////
function gotStream(stream) {
    console.log('Adding local stream.');
    localStream = stream;
    localVideo.srcObject = stream;
    sendMessage('got user media');
    if (isInitiator) {
        maybeStart();
    }
    initImageDiv.style.visibility = "hidden";
    mapContainer.style.visibility = "hidden";
    mapContainer.style.height = 0;
    videoDiv.style.visibility="visible";
    localVideo.classList.add("active");
    // closeOnlineVideoChatBtn.style.visibility = "hidden";
    closeOnlineVideoChatBtn.style.display = 'none';
    closeLocalVideoChatBtn.style.display = 'inline';
    closeVideoChatContainner.style.visibility="visible";
}

var constraints = {
    video: true
};

console.log('Getting user media with constraints', constraints);

if (location.hostname !== 'localhost') {
    requestTurn(
        'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    );
}

function maybeStart() {
    console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
    if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
        console.log('>>>>>> creating peer connection');
        createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        console.log('isInitiator', isInitiator);
        if (isInitiator) {
            doCall();
        }
    }
}

window.onbeforeunload = function() {
    sendMessage('bye');
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
    try {
        pc = new RTCPeerConnection(pcConfig);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnnection');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

function handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    } else {
        console.log('End of candidates.');
    }
}

function handleCreateOfferError(event) {
    console.log('createOffer() error: ', event);
}

function doCall() {
    console.log('Sending offer to peer');
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer().then(
        setLocalAndSendMessage,
        onCreateSessionDescriptionError
    );
}

function setLocalAndSendMessage(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
    trace('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
    var turnExists = false;
    for (var i in pcConfig.iceServers) {
        if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
            turnExists = true;
            turnReady = true;
            break;
        }
    }
    if (!turnExists) {
        console.log('Getting TURN server from ', turnURL);
        // No TURN server. Get one from computeengineondemand.appspot.com:
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var turnServer = JSON.parse(xhr.responseText);
                console.log('Got TURN server: ', turnServer);
                pcConfig.iceServers.push({
                    'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
                    'credential': turnServer.password
                });
                turnReady = true;
            }
        };
        xhr.open('GET', turnURL, true);
        xhr.send();
    }
}

function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
    miniVideo.srcObject = localVideo.srcObject;

    // Transition opacity from 0 to 1 for the remote and mini videos.
    remoteVideo.classList.add("active");
    miniVideo.classList.add("active");
    // Transition opacity from 1 to 0 for the local video.
    localVideo.classList.remove("active");
    localVideo.srcObject = null;
    videoDiv.classList.add("active");
    closeOnlineVideoChatBtn.style.display="inline";
    closeLocalVideoChatBtn.style.display="none";
    closeVideoChatContainner.style.visibility="visible";
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

function hangup() {
    console.log('Hanging up.');
    stop();
    sendMessage('bye');
}

function handleRemoteHangup() {
    console.log('Session terminated.');
    stop();
    isInitiator = false;
}

function stop() {
    isStarted = false;
    pc.close();
    pc = null;
}
setTimeout(checkBrowser, 1000);

function checkBrowser() {
    if (!window.navigator.mediaDevices){
        alert("当前浏览器不支持视频聊天功能，请换用Chrome|safari浏览器接着使用^_^");
    }
}

function getRemoteUserInfo(uuid) {
    if (!!ONLINE_USER_LIST) {
        for(var i=0; i<ONLINE_USER_LIST.length; i++){
            if (ONLINE_USER_LIST[i].uuid == uuid) {
                return ONLINE_USER_LIST[i];
            }
        }
    }
}
