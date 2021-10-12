const socket = io("http://localhost:8080/chat", {
	withCredentials: true,
});

const channelName = document.getElementById('channel_name');
const channelPassword = document.getElementById('channel_password')

const alerts =  document.getElementById('alerts');
const alert =  document.getElementById('alert');
const channels = document.getElementById('channels');
const messages = document.getElementById('messages');
const message = document.getElementById('message');


// Send Event.

const handleSubmitNewMessage = () => {
	socket.emit('channel-message', {
		channelId: 1,
		message: message.value,
	})
}

const handleCreateChannel = () => {
	socket.emit('channel_create', { name: channelName.value, password: channelPassword.value })
}

// Recive Event.

socket.on('exception', (data) => {
	console.log(data);

	const newAlert = alert.cloneNode(true);

	newAlert.style = false
	newAlert.getElementsByClassName("alert-message")[0].textContent = data.message;
	console.log(newAlert.getElementsByClassName("alert-message"));

	alerts.appendChild(newAlert);
})

socket.on('channel_new', (data) => {
	console.log(data);

	const li = document.createElement("li");
	li.appendChild(document.createTextNode(data.name))
	channels.appendChild(li);
})

socket.on('message', ({ data }) => {
	console.log(data);

	const li = document.createElement("li");
	li.appendChild(document.createTextNode(data))
	channels.appendChild(li);
})
