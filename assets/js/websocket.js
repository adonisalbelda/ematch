var socket = io.connect('http://localhost:3000');

socket.emit('send message', "dasdad");

socket.on('new message', function(data){
	console.log(data.msg);
});