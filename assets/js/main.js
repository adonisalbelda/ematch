$(document).ready(function(){
	$(document).on('click', '#login-btn', function() {
		var data = {
			'mytext' : "hello world"
		}

		var url = "home";
		home_Directory(url, data);
	});

	$(document).on('click', '#battle-btn', function() {
		var mytext = "hello world";
		$('.searching-enemy-loading').removeClass('hide').addClass('show');

		$.ajax({
	        url: "/match",
	        method:"POST",
	        data : {
	        	text : mytext
	        },
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
            	$('.searching-enemy-loading').addClass('hide').removeClass('show');
	            $('#match-dir-home').attr("data-value", "home");
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	});

	$(document).on('click', '#duel-btn', function() {
		var mytext = "hello world";
		$('.searching-enemy-loading').removeClass('hide').addClass('show');

		$.ajax({
	        url: "/duel",
	        method:"POST",
	        data : {
	        	text : mytext
	        },
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            $('.searching-enemy-loading').addClass('hide').removeClass('show');
	            $('#duel-dir-home').attr("data-value", "home");
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	});

	$(document).on('click', '#match-dir-home, #duel-dir-home', function(){
		var url = $(this).attr("data-value");
		home_Directory(url, {});
	});

	function home_Directory(url, data) {
		$.ajax({
	        url: "/"+url,
	        method:"POST",
	        data : data,
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}
});