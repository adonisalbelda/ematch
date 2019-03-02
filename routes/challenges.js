var express = require('express');
var router = express.Router();
var mysqlConf = require('./config.js')

var questions = "";

router.post('/duelChoices', function(req, res){
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
		} else {
			console.log(req.body);
			tempCount.query("SELECT * FROM tbl_answers where question_id = '"+req.body.questionid+"'", function(error, rows, fields){
				tempCount.release();
				if (!!error){
					return res.send({erros: error});
				} else {
					return res.send({choices: rows});
				}		
			});
		}	
	});
});

router.get('/findCategory', function(req, res){
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
		} else {
			tempCount.query("SELECT * FROM tbl_skills", function(error, rows, fields){
				tempCount.release();
				if (!!error){
					return res.send({erros: error});
				} else {
					return res.send({skills: rows});
				}		
			});
		}	
	});
});

router.post('/findMatch', function(req, res){
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
		} else {
			tempCount.query("SELECT * FROM tbl_students where is_online = '1' and id != '"+req.body.id+"' and rank = '"+req.body.rank+"' and id not in (SELECT student_id from tbl_players_inmatch) ORDER BY RAND() LIMIT 1", function(error, rows, fields){
				tempCount.release();
				console.log(req.body.id);
				if (!!error){
					return res.send({erros: error});
				} else {
					return res.send({students: rows});
				}		
			});
		}	
	});
});

router.post('/updatePoints', (req, res) => {
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
		} else {

			tempCount.query("SELECT * FROM tbl_students where id = '"+req.body.id+"'", function(error, rows, fields){
				tempCount.release();
				var data = {
				  	points : rows[0]['points'],
				  	rank : rows[0]['rank'],
				}
				
				return res.send({success: data});
			});

		}
	});
});

router.get('/result', function(req, res){
	res.render('result');	
});


module.exports = router;