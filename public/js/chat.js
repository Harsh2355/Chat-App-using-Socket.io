
let socket = io()

socket.on('message', (msgObj) => {
    console.log(msgObj.text)
    const html = Mustache.render(messageTemplate, {
        message: msgObj.text,
        createdAt: moment(msgObj.createdAt).format('hh:mm A'),
    })
    messages.insertAdjacentHTML('beforeend', html)
})

let form = document.querySelector('#message-form')
let input = document.querySelector('#message-input')
let send = document.querySelector('#send')
let sendloc = document.querySelector('#send-location')
let messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // new message element
    const new_message = messages.lastElementChild
    
    // height of the new message
    const new_message_styles = getComputedStyle(new_message)
    const new_message_margin = parseInt(new_message_styles.marginBottom)
    const new_message_height = new_message.offsetHeight + new_message_margin

    // visible height
    const visible_height = messages.offsetHeight

    // messages container height
    const content_height = messages.scrollHeight

    // how far have I scrolled
    const scrollOffset = messages.scrollTop + visible_height

    if (content_height - new_message_height <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    send.setAttribute('disabled', 'disabled')
    socket.emit('sendmessage', input.value, (response) => {
        console.log(response.status)
        send.removeAttribute('disabled')
    })
    input.value = ''
})

socket.on('sendmessage', (msgObj) => {
    console.log(msgObj.text)
    console.log("Hello")
    const html = Mustache.render(messageTemplate, {
        message: msgObj.text,
        createdAt: moment(msgObj.createdAt).format('hh:mm A'),
        username: msgObj.username
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

sendloc.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        return alert("Geolocation isn't supported by browse");
    } 
})

const showPosition = (position) => {
    sendloc.setAttribute('disabled', 'disabled')
    socket.emit('sendLocation', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    }, (response) => {
        console.log(response.status)
        sendloc.removeAttribute('disabled')
    })
}

socket.on('locationMessage', (locationObj) => {
    console.log(locationObj.text)
    const html = Mustache.render(locationTemplate, {
        link: locationObj.text,
        createdAt: moment(locationObj.createdAt).format('hh:mm A'),
        username: locationObj.username
        
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.emit('join', {
    username,
    room,
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('room data', ({users, room}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

