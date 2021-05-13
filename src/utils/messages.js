const messages = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const locmessages = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    messages,
    locmessages
}