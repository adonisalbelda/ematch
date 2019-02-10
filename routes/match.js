var express = require('express');
var router = express.Router();

router.post('/match', function(req, res){
	res.render('match');	
});

module.exports = router;
