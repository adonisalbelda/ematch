var mysql = require('mysql');

var connection = mysql.createPool({
	connectionLimit: 50,
	host: 'localhost',
	user: 'root',
	password : '',
	database: 'db_game_skills'

});	

module.exports = connection;