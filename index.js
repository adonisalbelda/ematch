var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require("body-parser");
var multer = require('multer');
var upload = multer();
var session = require('express-session');
var socket = require('socket.io');
var sharedsession = require("express-socket.io-session");
var mysqlConf = require('./routes/config.js');
var home = require('./routes/home');
var duel = require('./routes/duel');
var match = require('./routes/match');
var authenticate = require('./routes/authenticate');
var menu = require('./routes/menu');
var challenges = require('./routes/challenges');
var EloRating = require('elo-rating');

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
  	points : req.session.points,
  	rank : req.session.rank,
  	profile : req.session.profile,
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
app.use('/', challenges);

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
var players = [];
var results = [];

io.on('connection', function(socket){
	// connections.push(socket);
	// console.log('Connected : %s sockets connected', connections.length);

	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected : %s sockets connected', connections.length);
	});

	socket.on('send-message', function(data){
		saveMessage(data.msg, data.id, data.receiver_id, function(id){
			socket.to(people[data.receiver]).emit('recieve-msg', {msg: data.msg, id: data.id, msg_id: id});
		});
	});

	socket.on('msg-seen', function(data){
		seenMessage(id)
	});

	socket.on('user-typing', function(data){
		socket.to(people[data.receiver]).emit('show-typing', {username: data.username});
	});

	socket.on('stop-typing', function(data){
		socket.to(people[data.receiver]).emit('hide-typing', {username: data.username});
	});

	socket.on('removeUserStatus', function(data){
		in_matchPeople.splice(in_matchPeople.indexOf(data.email), 1);
	});

	// socket.on('typing', function(data){
	// 	socket.broadcast.emit('typing', data);
	// });

	socket.on("join_room", ({room, data}) => {
		people[data] =  socket.id;
		connections.push(socket);
		socket.join(room);
	});

	// send duel request
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

	// reciever accept the duel request
	socket.on('accept-duel', function(data){
		io.to(people[data.sender]).emit('start-duel', {room: data.room, sender:data.sender, reciever: data.reciever});
		io.to(people[data.receiver]).emit('start-duel', {room: data.room, sender:data.sender, reciever: data.reciever});
		
	});

	// sender cancel the duel request
	socket.on('cancel-request', function(data){
		in_matchPeople.splice(in_matchPeople.indexOf(data.sender), 1);
		in_matchPeople.splice(in_matchPeople.indexOf(data.receiver), 1);
		var msg = data.username + " abort the duel request.";
		io.to(people[data.receiver]).emit('duel-abort', {msg: msg});
	});

	// reciever rejected the duel request
	socket.on('reject-duel', function(data){
		in_matchPeople.splice(in_matchPeople.indexOf(data.sender), 1);
		in_matchPeople.splice(in_matchPeople.indexOf(data.receiver), 1);
		var msg = data.username + " rejected your request, try to find someone available.";
		io.to(people[data.sender]).emit('duel-rejection', {msg: msg});
	});

	socket.on('reject-match', function(data){
		in_matchPeople.splice(in_matchPeople.indexOf(data.sender), 1);
		in_matchPeople.splice(in_matchPeople.indexOf(data.receiver), 1);
		var msg = data.username + " rejected the match request, try to find someone available.";
		io.to(people[data.sender]).emit('duel-rejection', {msg: msg});
	});

	socket.on('cancel-match', function(data){
		in_matchPeople.splice(in_matchPeople.indexOf(data.sender), 1);
		in_matchPeople.splice(in_matchPeople.indexOf(data.receiver), 1);
		var msg = data.username + " abort the match request.";
		io.to(people[data.receiver]).emit('duel-abort', {msg: msg});
	});

	socket.on('updateItemStatus', function(data){
		socket.nsp.to(data.room).emit("updateStatus", {
				data: data,
		});
	});

	socket.on('showMatch', function(data){
		var data = {
			room: data.room, 
			sender: data.sender, 
			receiver: data.receiver, 
			skill_id: data.skill_id,
			skill: data.skill
		};

		in_matchPeople.push(data.receiver);
		in_matchPeople.push(data.sender);
		
		io.to(people[data.sender]).emit('confirm-match', data);
		io.to(people[data.receiver]).emit('confirm-match', data);
	});

	// user enter to a private room
	socket.on("enter-room", ({room, username, email, points, id, skill_id = false, skill = "", rank = false}) => {
		socket.join(room);
		var selected_room = io.sockets.adapter.rooms[room];
		var data = {
			username:username,
			email:email,
			points:points,
			room: room,
			id : id
		}
		players.push(data);

		// if (match_players.hasOwnProperty(room)) {
			
		// 	match_players[room].push(data); 
		// } else {
		// 	match_players[room] = [data];
		// }

		mysqlConf.getConnection(function(error, tempCount){
			if (!!error){
				tempCount.release();
				console.log("error in the query");
			} else {
				console.log("query successed");
				tempCount.query("INSERT INTO tbl_players_inmatch (`room`, `student_id`)" +
					"VALUES ('"+room+"', '"+id+"')", function(error, rows, fields){
					tempCount.release();
				});
			}
		});
		
		if (selected_room.length == 2) {
			select_questions(skill_id, rank, function(questions){
				socket.nsp.to(room).emit("show-random-questions", {
					data: players,
					questions : questions,
					skill: skill,
				});

				players = [];
			});
		} 
	});

	socket.on("duel-result", ({email, room, score, time = 0, id, username, points, rank, timer = 0 }) => {
			
		if (results.hasOwnProperty(room)) {
			var winner = {};
			in_matchPeople.splice(in_matchPeople.indexOf(email), 1);
			in_matchPeople.splice(in_matchPeople.indexOf(results[room].email), 1);

			if (score > results[room].score) {
				winner['winner_id'] = id;
				winner['winner_email'] = email;
				winner['winner_username'] = username;
				winner['winner_oldpoints'] = points;
				winner['losser_oldpoints'] = results[room].points;
				winner['losser_username'] = results[room].username
				winner['losser_email'] = results[room].email
				winner['losser_id'] = results[room].id;
				winner['label'] = "Vanquished";
			} else if ( score < results[room].score) {
				winner['winner_id'] = results[room].id;
				winner['winner_email'] = results[room].email;
				winner['winner_username'] = results[room].username;
				winner['winner_oldpoints'] = results[room].points;
				winner['losser_oldpoints'] = points;
				winner['losser_username'] = username;
				winner['losser_email'] = email
				winner['losser_id'] = id;
				winner['label'] = "Vanquished";
			} else {
				if (results[room].timer > timer) {
					winner['winner_id'] = results[room].id;
					winner['winner_email'] = results[room].email;
					winner['winner_username'] = results[room].username;
					winner['winner_oldpoints'] = results[room].points;
					winner['losser_oldpoints'] = points;
					winner['losser_username'] = username;
					winner['losser_email'] = email
					winner['losser_id'] = id;
					winner['label'] = "Vanquished";
				} else {
					winner['winner_id'] = id;
					winner['winner_email'] = email;
					winner['winner_username'] = username;
					winner['winner_oldpoints'] = points;
					winner['losser_oldpoints'] = results[room].points;
					winner['losser_username'] = results[room].username
					winner['losser_email'] = results[room].email
					winner['losser_id'] = results[room].id;
					winner['label'] = "Vanquished";
				}
			}

			var validate_result = [
				{
					id : id,
					points : points,
					rank : rank
				},
				{
					id : results[room].id,
					points : results[room].points,
					rank : results[room].rank
				},
			];
			
			rate_Elo(validate_result, winner['winner_id'], function(data){
				winner['winner_newpoints'] = data['winner'];
				winner['losser_newpoints'] = data['losser'];
				winner['winner_rank'] = data['winner_Rank'];
				winner['losser_rank'] = data['losser_Rank'];
				updatePoints(winner['winner_newpoints'], winner['winner_rank'], winner['losser_newpoints'], winner['losser_rank'], winner['winner_id'], winner['losser_id']);
				save_gameHistory(winner['winner_id'], winner['losser_id'], winner['winner_id'], parseInt(winner['winner_newpoints']) - parseInt(winner['winner_oldpoints']));
			});

			socket.nsp.to(room).emit("display-duel-result", {
				data: winner,
			});

			var ids = [id, results[room].id];

			mysqlConf.getConnection(function(error, tempCount){
				if (!!error){
					tempCount.release();
					console.log("error in the query");
				} else {
					for (var i = 0; i < ids.length; i++) {
						tempCount.query("DELETE FROM tbl_players_inmatch WHERE student_id = '"+ids[i]+"'" , function(error, rows, fields){
						});
					}
					tempCount.release();
				}
			});

			winner = {};
			results[room] = {};
			socket.leave(room);

		} else {
			results[room] = {
				email: email,
				score: score,
				time: time,
				id:id,
				username: username,
				points: points,
				rank: rank,
				timer: timer
			}

			socket.emit("waiting-for-opponent", {
				data: "hi",
			});
		}
	});

	socket.on("reset", ({id}) => {
		mysqlConf.getConnection(function(error, tempCount){
			if (!!error){
				tempCount.release();
			} else {
				tempCount.query("DELETE FROM tbl_players_inmatch WHERE student_id = '"+id+"'" , function(error, rows, fields){
					tempCount.release();
				});
			}
		});
	});

	// send message to all members of the room except the sender
	socket.on("message", ({room, message, username}) => {
		var selected_room = io.sockets.adapter.rooms['users'];
		socket.nsp.to(room).emit("message", {
			user_id: message ,
			online: selected_room.length,
			username: username
		});
	});

	// notify all user upon your signib-in
	socket.on("send-alert", ({room, username, email, rank}) => {
		socket.to(room).emit("alert-users", {
			username: username,
			email: email,
			online: connections.length,
			rank: rank
		});
	});

	// notify all user upon your signib-in
	socket.on("in-focus", ({room, email, username, rank, id}) => {
		socket.to(room).emit("update-in-focus", {
			email: email,
			username: username,
			rank: rank,
			id: id
		});
	});

	socket.on("forceExit", ({room, id}) => {
		mysqlConf.getConnection(function(error, tempCount){
			if (!!error){
				tempCount.release();
				console.log("error in the query");
			} else {
				tempCount.query("UPDATE  tbl_students SET is_online = '0' WHERE id = '"+id+"'", function(error, rows, fields){
					tempCount.release();
				});
			}
		});

		socket.to(room).emit("update-users", {
			id: id,
			online: connections.length,
		});
	});

	socket.on("forceLogin", ({id}) => {
		mysqlConf.getConnection(function(error, tempCount){
			if (!!error){
				tempCount.release();
				console.log("error in the query");
			} else {
				tempCount.query("UPDATE  tbl_students SET is_online = '1' WHERE id = '"+id+"'", function(error, rows, fields){
					tempCount.release();
				});
			}
		});
	});


	// notify all user upon your signib-in
	socket.on("out-focus", ({room, email, username, rank, id}) => {
		socket.to(room).emit("update-out-focus", {
			email: email,
			username: username,
			rank: rank,
			id: id
		});
	});

	socket.on("send-notification", ({room, id}) => {
		socket.to(room).emit("update-users", {
			id: id,
			online: connections.length,
		});
	});

	socket.on("typing", room => {
		socket.to(room).emit("typing", "someone is typing");
	});

	socket.on("stopped_typing", ({room}) => {
		socket.to(room).emit("stopped_typing");
	});
});

function rate_Elo($results, $winner, callback) {
	var new_rating = {};
	var index = 0;
	var player1 = 0;
	var player2 = 0;
	var losser = 0

	for (var i = 0; i < $results.length; i++) {
		if ($results[i]['id'] == $winner) {
			player2 = $results[i]['points'];
		} else {
			player1 = $results[i]['points'];
			losser = player1;
		}
	}

	var result = EloRating.calculate(parseInt(player1), parseInt(player2), false, 60);

	if (result.playerRating < 100) {
		new_rating['losser'] = losser;
	} else {
		new_rating['losser'] = result.playerRating;
	}

	new_rating['losser_Rank'] = updateRank(new_rating['losser']);
	new_rating['winner'] = result.opponentRating;
	new_rating['winner_Rank'] = updateRank(new_rating['winner']);

	callback(new_rating);
	 
}

function save_gameHistory(player1_id, player2_id, winner_id, points) {
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed save match");
			tempCount.query("INSERT INTO tbl_matchhistory(`player1_id`, `player2_id`, `winner_id`, `points_earned`)" +
				"VALUES('"+player1_id+"','"+player2_id+"', '"+winner_id+"', '"+points+"')", function(error, rows, fields){
				tempCount.release();
				console.log(error)
			});
		}
	});
}

function updateRank(points) {
	var rank = "";

	if (points < 1199) {
		rank = "D";
	} else if ( points < 1399) {
		rank = "C";
	} else if ( points < 1599) {
		rank = "B" ;
	} else if (points < 1799){
		rank = "A";
	}else if (points < 1999){
		rank = "Master";
	}else if (points >= 1999){
		rank = "Legend";
	}

	return rank;
}

function updatePoints($winner_pnt, $winner_rank, $loser_pnt, $loser_rank, $winner_id, $loser_id) {
	var points = [$winner_pnt, $loser_pnt];
	var ids = [$winner_id, $loser_id];
	var rank = [$winner_rank, $loser_rank];

	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			for (var i = 0; i < 2; i++) {
				tempCount.query("UPDATE tbl_students SET `points` = '"+points[i]+"', `rank` = '"+rank[i]+"' WHERE id = '"+ids[i]+"' ", function(error, rows, fields){
				});
			}
			tempCount.release();
		}	
	});
}

function select_questions(id, rank, callback) {
	var questions = "";
	console.log(id, "id");
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			if (!id) {
				tempCount.query("SELECT DISTINCT * FROM tbl_questions ORDER BY RAND() LIMIT 10", function(error, rows, fields){
					tempCount.release();
					callback(rows);
				});
			} else {
				var difficulty = 0;

				if (rank == "A" || rank == "B") {
					difficulty = 1;
				} else if (rank == "Master" || rank == "Legend") {
					difficulty = 2;
				}

				tempCount.query("SELECT DISTINCT * FROM tbl_questions WHERE skill = '"+id+"' and difficulty = '"+difficulty+"' ORDER BY RAND() LIMIT 10", function(error, rows, fields){
					tempCount.release();
					callback(rows);
				});
			}

		}	
	});
}

function seen(id) {
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			tempCount.query("UPDATE tbl_messages SET is_seen = '1' WHERE id = '"+id+"'", function(error, rows, fields){
				tempCount.release();
			});
		}	
	});
}

function saveMessage(message, sender, receiver, callback) {
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed");
			tempCount.query("INSERT INTO tbl_messages(message, sender, reciever, is_seen, date)" +
				"VALUES ('"+message+"', '"+sender+"', '"+receiver+"', 0, '"+new Date().toISOString().slice(0, 19).replace('T', ' ')+"')", function(error, rows, fields){
				tempCount.release();
				callback(rows.insertId);
			});
		}
	});
}

function member_inMatch(person) {
	for (var i = 0; i < in_matchPeople.length; i++) {
		if (in_matchPeople[i] == person) {
			return true;
		}
	}
	return false;
}



