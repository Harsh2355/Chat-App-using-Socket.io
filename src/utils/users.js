const users = []

// add user

const addUser = ({id, username, room}) => {

    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    // validate data
    if (!username || !room) {
        return {
            error: "username and room are required"
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username 
    })
    if (existingUser) {
        return {
            error: "Username is in use"
        }
    }

    // store
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return {user}
}

// remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// getUser
const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })

    return user
}

// getUsersInRoom
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const room_users = users.filter((user) => {
        return user.room === room
    })

    return room_users
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}