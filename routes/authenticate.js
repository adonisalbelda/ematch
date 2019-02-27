var express = require('express');
var router = express.Router();
var mysqlConf = require('./config.js')

/* API logic here */

const { check, validationResult } = require('express-validator/check');

const redirectHome = (req, res, next) => {
	if (req.session.userId) {
		res.redirect('/home');
	} else {
		next();
	}
}

router.post('/addMember',[
	check('first_name', "first name is required").not().isEmpty(),
	check('last_name', "last name is required").not().isEmpty(),
	check('username', "username is required").not().isEmpty(),
	check('email', "Invalid email address").isEmail(),
	check('password', "Password must at least minimum of 8 characters").isLength({ min: 8 }),
	check('c_password', "Your password do not match.").not().isEmpty(),
	] , (req, res) => {

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
	    return res.json({ errors: errors.array() });
	} else {
		
		if (req.body.password !== req.body.c_password) {
			return res.json({errors : "Password do not match"});
		}

		if (req.body.username.length > 7 ) {
			return res.json({errors : "Username must not above 8 characters"});
		}

		mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed");
			tempCount.query("INSERT INTO tbl_students (fname, lname, course, email, username, password)" +
				"VALUES ('"+req.body.first_name+"','"+req.body.last_name+"', 'bscs', "+
				"'"+req.body.email+"', '"+req.body.username+"', '"+req.body.password+"')", function(error, rows, fields){
				tempCount.release();
				if (!!error){
					return res.send({errors: error});
				} else {
					// res.render("login", {value: rows[0]});
					req.session.userId  = rows.insertId;
					req.session.fname  = req.body.first_name;
					req.session.lname  = req.body.last_name;
					req.session.username = req.body.username;
					req.session.email = req.body.email;
					req.session.course = 'bscs';
					req.session.points = 1000;

					return res.send({success: "done"});
				}		
			});
		}
	});
	}
});

router.post('/login',[
	check('username', "username is required").not().isEmpty(),
	check('password', "password is required").not().isEmpty(),
	] , (req, res) => {

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
	    return res.json({ errors: errors.array() });
	} else {
		mysqlConf.getConnection(function(error, tempCount){
		if (!!error){
			tempCount.release();
			console.log("error in the query");
		} else {
			console.log("query successed");
			tempCount.query("SELECT * FROM tbl_students where username = '"+req.body.username+"' and "+
				"password = '"+req.body.password+"'", function(error, rows, fields){
				tempCount.release();
				if (!!error){
					return res.send({errors: error});
				} else {
					// res.render("login", {value: rows[0]});
					if (rows.length > 0) {
						req.session.userId  = rows[0]['id'];
						req.session.fname  = rows[0]['fname'];
						req.session.lname  = rows[0]['lname'];
						req.session.username = rows[0]['username'];
						req.session.email = rows[0]['email'];
						req.session.course = rows[0]['course'];
						req.session.points = rows[0]['points'];
						req.session.rank = rows[0]['rank'];

						tempCount.query("UPDATE  tbl_students SET is_online = '1' WHERE id = '"+rows[0]['id']+"'", function(error, rows, fields){
							if (!!error){
								return res.send({errors: error});
							} 	
						});

						return res.send({success: "User exist"});
					}
					return res.send({errors : [{msg: "This account does not exist."}]});
				}		
			});
		}
	});
	}
});

router.post('/register', function(req, res){
	res.render('register');	
});

router.post('/forgot_pass', function(req, res){
	res.render('forgot_pass');	
});

router.get('/login', function(req, res){
	res.render('login');
});

module.exports = router;
