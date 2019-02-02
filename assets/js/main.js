function hide_loader() {
	$('.page-loading').css('display', 'none');
}

function show_loader() {
	$('.page-loading').css('display', 'block');
}

$(document).ready(function(){

	$(window).on('load', function() {
		hide_loader();
		$('#myAudio').play();
	});

	$(document).on('click', '#login-btn', function(e) {
		e.preventDefault();
		show_loader();
		var data = {
			'mytext' : "hello world"
		}

		var url = "home";
		home_Directory(url, data);
	});


	$(document).on('click', "#register-btn", function(e) {
		e.preventDefault();
		show_loader();
		var url = "register";
		redirect_To(url);
	});

	$(document).on('click', "#forgot-pass-btn", function(e) {
		e.preventDefault();
		show_loader();
		var url = "forgot_pass";
		redirect_To(url);
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
		show_loader();
		var url = $(this).attr("data-value");
		home_Directory(url, {});
	});

	$(document).on('click', '#register-dir-login', function(){
		show_loader();
		var url = "login";
		home_Directory(url, {});
	});

	$(document).on('click', '#form-next-status', function() {
		var val = parseInt($(this).attr("data-value"));
		update_registerStatus(val, 1);
	});

	$(document).on('click', '#form-prev-status', function() {
		var val = parseInt($(this).attr("data-value"));
		update_registerStatus(val, 0);
	});

	function update_registerStatus(val, action) {
		var statuses = ['personal-info', 'security-info', 'profile-info'];
		var label = ['personal info', 'security info', 'profile info'];
		var new_val;
		for (var i = 0; i < statuses.length; i++) {
			if ($('.'+statuses[i]).not('.status-hide')) {
				$('.'+statuses[i]).addClass('status-hide');
			}
		}

		if (action == 1) {
			new_val = val+1;
			$('.'+statuses[new_val]).removeClass('status-hide');
		} else {
			new_val = val-1
			$('.'+statuses[new_val]).removeClass('status-hide');
		}

		$('.register-status').text(label[new_val]);
		$('#form-prev-status').attr("data-value", new_val);
		$('#form-next-status').attr("data-value", new_val);
		
		if (new_val == 0) {
			$('#form-prev-status').css('display', 'none');
		} else {
			$('#form-prev-status').css('display', 'inline-block');
		}
	}

	function redirect_To(url) {
		$.ajax({
	        url: "/"+url,
	        method:"POST",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            $('#register-dir-login').attr("data-value", "login");
	            hide_loader();
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	function home_Directory(url, data) {
		$.ajax({
	        url: "/"+url,
	        method:"POST",
	        data : data,
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            hide_loader();
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}
});