// var socket = io.connect('http://localhost:3000');
var socket = io.connect('https://e-match.herokuapp.com/');

socket.emit('send message', "dasdad");

socket.on('new message', function(data){
	console.log(data.msg);
});