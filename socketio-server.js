var userDB = require('./userDB');

const bindSocketIoEvent = (io) => {
    io.on('connection', function(socket) {
        console.log("test connect");
        // convenience function to log server messages on the client
        function log() {
            var array = ['Message from server:'];
            array.push.apply(array, arguments);
            socket.emit('log', array);
        }

        socket.on('registerUserSocket', function(uuid) {
            userDB.userSocketList.set(uuid, socket.id);
            console.log(userDB.userSocketList);
            log('Client said: registerUserSocket:', uuid);
        });

        socket.on('inviteFriend', function(inviteInfo) {
            console.log(inviteInfo);
            var friendSocketId = userDB.userSocketList.get(inviteInfo.friendUuid);
            var mySocketId = userDB.userSocketList.get(inviteInfo.currentUuid);
            socket.to(friendSocketId).emit('confirmInvite', inviteInfo.currentUuid);
            // io.sockets.connected[mySocketId].emit('friendNotOnline', inviteInfo.friendUuid);
            // userDB.userSocketList.set(uuid, socket.id);
        });

        socket.on('confirmInviteReject', function(inviteInfo) {
            var friendSocketId = userDB.userSocketList.get(inviteInfo.friendUuid);

            socket.to(friendSocketId).emit('receiveReject');
        });

        socket.on('message', function(message) {
            log('Client said: ', message);
            // for a real app, would be room-only (not broadcast)
            socket.broadcast.emit('message', message);
        });

        socket.on('create or join', function(room) {
            log('Received request to create or join room ' + room);
            log("onlineUserList:" + userDB.userList);
            var clientsInRoom = io.sockets.adapter.rooms.get(room);
            var numClients = clientsInRoom ? clientsInRoom.size : 0;
            log('Room ' + room + ' now has ' + numClients + ' client(s)');

            if (numClients === 0) {
                socket.join(room);
                log('Client ID ' + socket.id + ' created room ' + room);
                socket.emit('created', room, socket.id);

            } else if (numClients === 1) {
                log('Client ID ' + socket.id + ' joined room ' + room);
                io.sockets.in(room).emit('join', room);
                socket.join(room);
                socket.emit('joined', room, socket.id);
                io.sockets.in(room).emit('ready');
            } else { // max two clients
                socket.emit('full', room);
            }
        });

        socket.on('ipaddr', function() {
            var ifaces = os.networkInterfaces();
            for (var dev in ifaces) {
                ifaces[dev].forEach(function(details) {
                    if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                        socket.emit('ipaddr', details.address);
                    }
                });
            }
        });

        socket.on('bye', function(){
            console.log('received bye');
        });
    })
}

module.exports = bindSocketIoEvent;
