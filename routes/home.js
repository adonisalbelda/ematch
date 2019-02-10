var express = require('express');
var router = express.Router();

// const redirectLogin = (req, res, next) => {
// 	if (!req.session.userId) {
// 		res.redirect('/');
// 		return false;
// 	} else {
// 		next();
// 	}
// }

router.get('/home', function(req, res){
	// var someData = { message: 'hi' };
	if (!req.session.userId) {
		res.render('login');
	} else {
		res.render('home');
	}
});

module.exports = router;
