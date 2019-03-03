var mysql = require('mysql');

// var connection = mysql.createPool({
// 	connectionLimit: 50,
// 	host: 'localhost',
// 	user: 'root',
// 	password : '',
// 	database: 'db_game_skills'

// });

// var connection = mysql.createPool({
// 	connectionLimit: 50,
// 	host: 'remotemysql.com',
// 	user: 'U7jBmzPtGd',
// 	password : 'M7g5bEFE9X',
// 	database: 'U7jBmzPtGd'
// });

var connection = mysql.createPool({
	connectionLimit: 50,
	host: 'sql12.freesqldatabase.com',
	user: 'sql12281559',
	password : 'ppm86NjM5k',
	database: 'sql12281559'
});	


module.exports = connection;