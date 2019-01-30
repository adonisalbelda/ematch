$(document).ready(function(){
	$(document).on('click', '#login-btn', function() {
		var mytext = "hello world";

		$.ajax({
	        url: "/home",
	        method:"POST",
	        data : {
	        	text : mytext
	        },
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.main-wrapper').html(data);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	});

	$(document).on('click', '#battle-btn', function() {
		var mytext = "hello world";

		$.ajax({
	        url: "/match",
	        method:"POST",
	        data : {
	        	text : mytext
	        },
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.main-wrapper').html(data);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	});

	$(document).on('click', '#duel-btn', function() {
		var mytext = "hello world";

		$.ajax({
	        url: "/duel",
	        method:"POST",
	        data : {
	        	text : mytext
	        },
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.main-wrapper').html(data);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	});
});