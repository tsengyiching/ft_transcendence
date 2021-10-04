// const socket_channel = io("http://localhost:8080/channel", {
// 	withCredentials: true,
//	 });
const socket = io("http://localhost:8080/chat", {
	withCredentials: true,
});

// socket_namespace_channel = socket.of('/channel');

const channelName = document.getElementById('channel_name');
const channelPassword = document.getElementById('channel_password')

const message = document.getElementById('message');
const messages = document.getElementById('messages');

const handleSubmitNewMessage = () => {
	socket.emit('message', { data: message.value })
}

const handleCreateChannel = () => {
	socket.emit('channel_create', { name: channelName.value, password: channelPassword.value })
}

socket.on('channel_new', ({ data }) => {
console.log(data);
	const li = document.createElement("li");
	li.appendChild(document.createTextNode(data.name))
	messages.appendChild(li);
})

const handleNewChannel = (message) => {
}
	
const buildNewChannel = (message) => {
	return li;
}

socket.on('message', ({ data }) => {
	handleNewMessage(data);
})

const handleNewMessage = (message) => {
	messages.appendChild(buildNewMessage(message));
}

const buildNewMessage = (message) => {
	const li = document.createElement("li");
	li.appendChild(document.createTextNode(message))
	return li;
}