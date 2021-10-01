// const socket_chanel = io("http://localhost:8080/chanel", {
// 	withCredentials: true,
//	 });
const socket = io("http://localhost:8080/chat", {
	withCredentials: true,
});

// socket_namespace_chanel = socket.of('/chanel');

const chanelName = document.getElementById('chanel_name');
const chanelPassword = document.getElementById('chanel_password')

const message = document.getElementById('message');
const messages = document.getElementById('messages');

const handleSubmitNewMessage = () => {
	socket.emit('message', { data: message.value })
}

const handleCreateChanel = () => {
	socket.emit('chanel_create', { name: chanelName.value, password: chanelPassword.value })
}

socket.on('chanel-new', ({ data }) => {
console.log(data);
	const li = document.createElement("li");
	li.appendChild(document.createTextNode(data.name))
	messages.appendChild(li);
})

const handleNewChanel = (message) => {
}
	
const buildNewChanel = (message) => {
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