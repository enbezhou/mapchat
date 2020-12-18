const bindSocketIoEvent = (io) => {
    io.on('connection', function(socket) {

        console.log('客户端已经连接')

        socket.on('message', function(msg) {

            console.log(msg)

            socket.send('服务端 ' + msg)

        })
    })
}

module.exports = bindSocketIoEvent;
