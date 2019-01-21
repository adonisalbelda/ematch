var express = require('express');
var http = require('http');
var path = require('path');
// var mysql = require('mysql');

// var about = require('./routes/about');

//database connection
// var connection = mysql.createPool({
// 	connectionLimit: 50,
// 	host: 'localhost',
// 	user: 'root',
// 	password : '',
// 	database: 'hotel'

// });	

// connection.connect(function(error){
// 	if(!!error) {
// 		console.log('error');
// 	} else {
// 		console.log('connected');
// 	}
// });
// App setup
var port = Number(process.env.PORT || 3000);
var app = express();
var server  = app.listen(port, function(){
	console.log('listening to request on port'+ port);
});

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use('/about', about);

//Static files
// app.use(app.router);
app.use(express.static('public'));
app.use(express.static('assets'));
// app.use(express.static('views'));

// app.get('/about', function(req, res){
// 	res.render("index", {name : "hello world"});	
// });

// app.get('/students', function(req, res){
// 	res.render("students", {name : "hello world"});	
// });

// app.get('/login', function(req, res){
// 	connection.getConnection(function(error, tempCount){
// 		if (!!error){
// 			tempCount.release();
// 			console.log("error in the query");
// 		} else {
// 			console.log("query successed");
// 			tempCount.query("SELECT * FROM gas", function(error, rows, fields){
// 				tempCount.release();
// 				if (!!error){
// 					console.log('Error in the query');
// 				} else {
// 					res.render("login", {value: rows[0]});
// 				}		
// 			});
// 		}
// 	});
// });

// app.get('/home', function(req, res){
// 	res.render("home", {name : "hello world"});	
// });

// app.get('/duel', function(req, res){
// 	res.render("duel", {name : "hello world"});	
// });

// app.get('/match', function(req, res){
// 	res.render("match", {name : "hello world"});	
// });

// app.get('*', function(req, res){
// 	res.render("home", {name : "hello world"});
// });