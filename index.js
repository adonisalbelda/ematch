var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require("body-parser");
var multer = require('multer');
var upload = multer();
var session = require('express-session');
var socket = require('socket.io');
var sharedsession = require("express-socket.io-session");

var home = require('./routes/home');
var duel = require('./routes/duel');
var match = require('./routes/match');
var authenticate = require('./routes/authenticate');
var menu = require('./routes/menu');

// App setup
var app = express();
var port = Number(process.env.PORT || 3000);
var server  = app.listen(port, function(){
	console.log('listening to request on port'+ port);
});

//Socket setup

var io = socket(server);
connections = [];

app.set('view engine', 'ejs');

var sess = {
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {}
}

app.use(session(sess));

app.use(function(req, res, next) {
  res.locals.user = {
  	id : req.session.userId,
  	username : req.session.username,
  	fname : req.session.fname,
  	lname : req.session.lname,
  	email : req.session.email,
  }
  next();
})

app.use(express.static('views'));
app.use(express.static('assets'));
// app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use('/', home);
app.use('/', duel);
app.use('/', match);
app.use('/authenticate', authenticate);
app.use('/', menu);

app.get('/', function(req, res){

	if (!req.session.userId) {
		res.render('index');	
	} else {
		res.render('index');
	}
});

// io.use(sharedsession(session));
var people = {};
var in_matchPeople = [];
var private_rooms = {};
var player = [];

io.on('connection', function(socket){
	// connections.push(socket);
	// console.log('Connected : %s sockets connected', connections.length);

	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected : %s sockets connected', connections.length);
	});

	socket.on('send message', function(data){
		socket.emit('new message', {msg: data});
	});

	// socket.on('typing', function(data){
	// 	socket.broadcast.emit('typing', data);
	// });

	socket.on("join_room", ({room, data}) => {
		console.log("joined");
		people[data] =  socket.id;
		connections.push(socket);
		socket.join(room);
	});

	// socket.on("accept-duel", ({room, player1, player2}) => {
	// 	private_rooms[room] = {
	// 		player1: player1,
	// 		player2: player2
	// 	};

	// 	in_matchPeople.push(data);	
	// 	socket.join(room);

	// 	console.log()
	// });

	socket.on('request-duel', function(data){
		if(member_inMatch(data.receiver)) {
			var msg = data.enemy + "is in match, try again later";
			io.to(people[data.sender]).emit('player-inMatch', {msg: msg});
		} else {
			in_matchPeople.push(data.receiver);
			in_matchPeople.push(data.sender);
			io.to(people[data.receiver]).emit('duel-confirmation', {username: data.username, sender: data.sender, receiver: data.receiver});
		}
	});

	socket.on('accept-duel', function(data){
		io.to(people[data.sender]).emit('start-duel', {room: data.room});
	});

	socket.on('reject-duel', function(data){
		in_matchPeople.splice(in_matchPeople.indexOf(data.sender), 1);
		in_matchPeople.splice(in_matchPeople.indexOf(data.receiver), 1);
		var msg = data.username + " rejected your request, try to find someone available.";
		io.to(people[data.sender]).emit('duel-rejection', {msg: msg});
	});

	socket.on("enter-room", ({room, data}) => {
		socket.join(room);

		var selected_room = io.sockets.adapter.rooms[room];
		if (selected_room.length == 2) {
			socket.nsp.to(room).emit("show-random-questions", {
				username: "hello world"
			});
		} 

	});

	socket.on("message", ({room, message, username}) => {
		//message , room
		console.log("send msg");
		//nsp
		socket.to(room).emit("message", {
			user_id: message ,
			online: connections.length,
			username: username
		});
	});

	socket.on("send-alert", ({room, username}) => {
		console.log(username);
		socket.to(room).emit("alert-users", {
			username: username
		});
	});

	socket.on("typing", room => {
		socket.to(room).emit("typing", "someone is typing");
	});

	socket.on("stopped_typing", ({room}) => {
		socket.to(room).emit("stopped_typing");
	});
});

function member_inMatch(person) {
	for (var i = 0; i < in_matchPeople.length; i++) {
		if (in_matchPeople[i] == person) {
			return true;
		}
	}

	return false;
}



