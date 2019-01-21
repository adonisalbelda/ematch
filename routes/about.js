var express = require('express');
var router = express.Router();

router.get('/about', function(req, res){
	res.render("students", {name : "hello world"});	
});

module.exports = router;
