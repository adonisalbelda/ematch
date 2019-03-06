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

router.get('/people', function(req, res){
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
						return res.render('footer/people', {data: rows});
					}
					return res.send({errors : [{msg: "This account does not exist."}]});
				}		
			});
		}	
	});
});

module.exports = router;