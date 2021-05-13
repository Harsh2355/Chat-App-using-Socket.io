const http = require('http')
const express = require('express')
const path = require('path')
const app = express()
const server = http.createServer(app)
const socketio = require('socket.io')
const Filter = require('bad-words')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const io = socketio(server)

const port = process.env.PORT || 3000

const { messages, locmessages } = require('./utils/messages')

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on("connection", (socket) => {
    console.log('New Web Socket Connection')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', messages(user.username, 'Welcome to the chat app'))
        socket.broadcast.to(user.room).emit('message', messages(user.username, `${username} has joined the chat room ${room}`))    
        io.to(user.room).emit('room data', {
            users: getUsersInRoom(user.room),
            room: user.room
        })
        callback()
    })

    socket.on('sendmessage', (msg, callback) => {
        const user = getUser(socket.id)
        
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback({
                status: 'Error: Profanity Detected'
            })
        }
        io.to(user.room).emit('sendmessage', messages(user.username, msg))
        callback({
            status: 'Delivered'
        })
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', locmessages(user.username, `https://google.com/maps?=${location.latitude},${location.longitude}`))
        callback({
            status: 'Delivered'
        })
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', messages(user.username, `${user.username} has left`))
            io.to(user.room).emit('room data', {
                users: getUsersInRoom(user.room),
                room: user.room
            })
        }
    })
  });

server.listen(port, () => {
    console.log("server is up on 3000")
})



