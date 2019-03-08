var express = require('express');
var router = express.Router();
var mysqlConf = require('./config.js');

router.get('/settings', function(req, res){

	data = {
	  	id : req.session.userId,
	  	username : req.session.username,
	  	fname : req.session.fname,
	  	lname : req.session.lname,
	  	email : req.session.email,
	  	course : req.session.course,
  	}

	res.render('footer/settings', data);	
});

router.get('/ranking', function(req, res){
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed");
			tempCount.query("SELECT * FROM tbl_students", function(error, rows, fields){
				tempCount.release();
				if (!!error){
					return res.send({errors: error});
				} else {
					// res.render("login", {value: rows[0]});
					if (rows.length > 0) {
						return res.render('footer/rankings', {data:rows});	
					}
					return res.send({errors : [{msg: "This account does not exist."}]});
				}		
			});
		}	
	});
});

router.post('/matches', function(req, res){
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log(req.body.id);
			tempCount.query("SELECT * FROM tbl_matchhistory WHERE player1_id = '"+req.body.id+"' or player2_id = '"+req.body.id+"' ORDER By id DESC ", function(error, matches, fields){
				tempCount.query("SELECT * FROM tbl_students ", function(error, members, fields){
					tempCount.release();
						// res.render("login", {value: rows[0]});
					return res.render('footer/matches', {data:matches, members:members});	
				});
					
			});
		}	
	});
});

router.post('/conversation', function(req, res){
	console.log(req.body);
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed");
			tempCount.query("SELECT * FROM tbl_messages WHERE (sender = '"+req.body.sender+"' and reciever = '"+req.body.receiver+"') or (sender = '"+req.body.receiver+"' and reciever = '"+req.body.sender+"') ORDER BY date ASC", function(error, rows, fields){
				if (!!error){
					return res.send({errors: error});
				} else {
					for (var i = 0; i < rows.length; i++) {
						tempCount.query("UPDATE tbl_messages SET is_seen = '1' WHERE id = '"+rows[i].id+"'", function(error, rows, fields){
							if (!!error){
								return res.send({errors: error});
							} 
						});
					}
					res.send({"success": rows});	
				}		
				tempCount.release();
			});
		}	
	});
});

router.get('/people', function(req, res){
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed");
			tempCount.query("SELECT * FROM tbl_students", function(error, rows, fields){
				if (!!error){
					return res.send({errors: error});
				} else {
					// res.render("login", {value: rows[0]});
					if (rows.length > 0) {
						return res.render('footer/people', {data: rows});
					}
					return res.send({errors : [{msg: "This account does not exist."}]});
				}		
				tempCount.release();
			});
		}	
	});
});

module.exports = router;