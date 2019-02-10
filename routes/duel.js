var express = require('express');
var router = express.Router();
var mysqlConf = require('./config.js');

router.post('/duel', function(req, res){
	mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed");
			tempCount.query("SELECT * FROM tbl_students WHERE is_online = '1'", function(error, rows, fields){
				tempCount.release();
				if (!!error){
					return res.send({errors: error});
				} else {
					// res.render("login", {value: rows[0]});
					if (rows.length > 0) {
						return res.render('duel', {data: rows});
					}
					return res.send({errors : [{msg: "This account does not exist."}]});
				}		
			});
		}	
	});
});

module.exports = router;
