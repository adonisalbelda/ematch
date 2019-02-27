var mysql = require('mysql');

var connection = mysql.createPool({
	connectionLimit: 50,
	host: 'localhost',
	user: 'root',
	password : '',
	database: 'db_game_skills'

});

// var connection = mysql.createPool({
// 	connectionLimit: 50,
// 	host: 'remotemysql.com',
// 	user: 'U7jBmzPtGd',
// 	password : 'M7g5bEFE9X',
// 	database: 'U7jBmzPtGd'

// });	

module.exports = connection;