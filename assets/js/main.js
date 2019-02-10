$(document).ready(function(){
	
	ematch.hide_loader();
	$(window).on('load', function() {
		ematch.hide_loader();
		$('body').trigger('click');
	});

	$(document).on('click', 'body', function() {
		var myAudio = document.getElementById('myAudio');
		// if (!myAudio.currentTime) {
		// 	$('#myAudio').trigger('play');
		// }
	});



	$(document).on('click', '#login-btn', function(e) {
		e.preventDefault();
		ematch.show_loader();
		ematch.formData['username'] = $('.log-username').val();
		ematch.formData['password'] = $('.log-password').val();

		ematch.isUserExist();
		// ematch.home_Directory("home");
	});


	$(document).on('click', "#register-btn", function(e) {
		e.preventDefault();
		ematch.show_loader();
		var url = "authenticate/register";
		ematch.redirect_To(url);
	});

	$(document).on('click', "#forgot-pass-btn", function(e) {
		e.preventDefault();
		ematch.show_loader();
		var url = "authenticate/forgot_pass";
		ematch.redirect_To(url);
	});

	$(document).on('click', '#match-dir-home, #duel-dir-home', function(){
		ematch.show_loader();
		var url = $(this).attr("data-value");
		ematch.home_Directory(url, {});
	});

	$(document).on('click', '#register-dir-login', function(e){
		e.preventDefault();
		ematch.show_loader();
		var url = "authenticate/login";
		ematch.home_Directory(url, {});
	});

	$(document).on('click', '#form-next-status', function() {
		var val = parseInt($(this).attr("data-value"));
		var isDone = ematch.update_registerStatus(val, 1);

		if (isDone) {
			dialog.confirm("are you sure want to save this info ?", function() {
				ematch.formData["first_name"] =  $('.first-name').val();
				ematch.formData["last_name"] = $('.last-name').val();
				ematch.formData["email"] =    $('.envelope').val();
				ematch.formData["username"]  = $('.username').val();
				ematch.formData["password"]  = $('.password').val();
				ematch.formData["c_password"] =  $('.c-password').val();
				ematch.formData["user-avatar"] = $('.user-avatar').val();

				ematch.insertData();
			}, "Confirm ?");
		}
	});

	$(document).on('click', '#form-prev-status', function() {
		var val = parseInt($(this).attr("data-value"));
		ematch.update_registerStatus(val, 0);

	});

	$(document).on('change', '#choose-pro-img', function() {
        var file = ematch.readURL(this);
        ematch.formData["fileToUpload"] =  file;
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
		ematch.show_loader();

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
	            ematch.hide_loader();
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	});

	$(document).on('click', '#settings-view', function() {
		var url = "settings";
		ematch.home_Directory(url, {}, function() {
			
		});
	});

	$(document).on('click', '#people-view', function() {
		var url = "people";
		ematch.home_Directory(url, {}, function(data) {
			ematch.socket.emit('message', {room: "users", message: isLogin});

		});
	});

	$(document).on('click', '#rankings-view', function() {
		var url = "ranking";
		ematch.home_Directory(url, {});
	});

	$(document).on('click', '#duel-selected-player', function() {
		var id = $(this).closest('td').attr("data-value");
		var name = $(this).closest('tr').find('.duel-name').text();
		
		var data = {
				receiver : id,
				username : username,
				sender : email,
				enemy: name
			}

		ematch.socket.emit("request-duel", data);
		dialog.request_Duel("Waiting for "+ name +" to accept your request");
		
		$('.timer').countimer({
			autoStart : true
		});
	});


	$(document).on('click', '.edit-title-box', function() {
		var popup = this;
		if (!$(this).closest('.edit-head-box').find('.edit-box-content').is(":visible")) {
			$('.edit-user-info .edit-box-content').each(function() {
				var el = this;
				if ($(el).is(":visible")) {
					$(el).slideUp();
					$(el).closest('.edit-head-box').find('span').removeClass('active');
				}
			});
			$(popup).closest('.edit-head-box').find('.edit-box-content').slideDown();
			$(popup).find('span').addClass('active');
		}
	});

});