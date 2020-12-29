const bindSocketIoEvent = (io) => {
    io.on('connection', function(socket) {
        console.log(socket.id)
        console.log('客户端已经连接xx')
        socket.on('intert:message', function(msg) {
            console.log(msg)
            socket.emit("sendToClientmessage", { message: "服务端.insert" })
        })

        socket.on('update:message', function(msg) {
            console.log(msg)
            socket.emit("sendToClientmessage", { message: "服务端.update" })
        })
    })
}

module.exports = bindSocketIoEvent;
