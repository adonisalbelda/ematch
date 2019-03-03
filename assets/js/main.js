$(document).ready(function(){
	
	$(window).bind('load', function() {
		ematch.hide_loader();
		$('body').trigger('click');
		setTimeout(function() {
			$('.login-content > img:first-child').addClass('animated bounce');
			$('.home-content > img:first-child ').addClass('animated shake');
			$('.login-form-input input:first-child').addClass('animated slideInLeft');
			$('.login-form-input input:last-child').addClass('animated slideInRight');
			$('.login-content > p').addClass('animated fadeInUp');
		},200);
	});

	$(document).on('click', 'body', function() {
		var myAudio = document.getElementById('myAudio');
		if (!myAudio.currentTime) {
			$('#myAudio').trigger('play');
		}
	});

	$(document).on('focus', 'input', function(){
  		$('.duel-top-option').css('display', 'none');
	});

	$(document).on('focusout', 'input', function(){
  		$('.duel-top-option').css('display', 'block');
	});

	$(document).on('click', '.game-status-option', function(){
		ematch.formData['id'] = isLogin;
		dialog.confirm("Are you sure you want to sign out ?", function(){
			ematch.show_loader();
			ematch.userLogout(isLogin);
		}, "Confirm ?");
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

	var next = false ;
	var number_ofItems = 3;
	var nextItem = 1;
	$(document).on('click', '.next-arr-btn', function(){
		
		if (next == false) {
			return false;
		}

		if ($('.answer-option').hasClass('selected')) {
			var answer = $('.answer-option.selected').attr("data-value");
			if (parseInt(answer) == 1) {
				correct_answer++;
			} else {
				wrong_answer++;
			}

			item_finished++;
			nextItem++;
			$('.item-left').text(number_ofItems - item_finished);
			$('.level-count-status span').text(nextItem);
		}

		if (item_finished == (number_ofItems-1)) {
			$('.next-arr-btn').text("Done ").append('<img src="images/next_arrow.png">');
		}

		$('.answer-option').find('.choice-selected').remove();
		$('.answer-option').removeClass('selected');

		questions = JSON.parse(localStorage.getItem('questions'));
        current_question++;

        if ( item_finished == number_ofItems) {
        	var room = $('.match-content').attr("data-room");
        	var info = {
        		email: email, 
        		room: room, 
        		score: correct_answer, 
        		id:isLogin, 
        		username: username, 
        		points: points ,
        		rank: rank , 
        		timer: (minute * 60) + seconds,
        	}

        	console.log(info, "info");
			ematch.socket.emit('duel-result', info);
			return false;
		}

        if (current_question == number_ofItems) {
        	current_question = 0;
        }

        $('.match-question').text(questions[current_question]['question']);
        ematch.getquestionChoices(questions[current_question]['id']);

        var room = $('.match-content').attr('data-room');
        ematch.show_loader();
        ematch.socket.emit('updateItemStatus', {room: room, item: current_question, email: email, id: isLogin });
		
		next = false;
	});

	$(document).on('click', '.hide-pr', function(){
		$('.preview-result-overlay').fadeOut(500);
	});

	$(document).on('click', '.duel-done-btn', function() {
		alert("dad");
	});
	// console.log(JSON.parse(localStorage.getItem('questions')), 'ds');

	localStorage.clear();

	$(document).on('click', '#battle-btn', function() {

		$.ajax({
	        url: "/findCategory",
	        method:"GET",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	           if (data.hasOwnProperty("skills")) {
					dialog.findMatch(data['skills'], function(data) {
						$('.searching-enemy-loading').addClass('show');
						ematch.findMatch("findMatch", data);
					});
				} else {
					dialog.showErrors(data, "Erros found.")
				}
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});


	});

	$(document).on('click', '.answer-option', function() {
		next = true;
		$('.answer-option').removeClass('selected');
		$('.answer-option').find('.choice-selected').remove();
		$(this).append('<span class="choice-selected"><i class="fa fa-check"></i></span>');
		$(this).addClass('selected');
	});

	$(document).on('click', '.close-find-match', function() {
		removeInterval = true;
		$('.searching-enemy-loading').removeClass('show');
	});

	$(document).on('click', '#duel-btn', function() {
		ematch.show_loader();
		$.ajax({
	        url: "/duel",
	        method:"POST",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
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

	$(document).on('click', '.find-skills-list div', function(){
		$('.find-skills-list div i').remove();
		$('.find-skills-list div').removeClass('selected');
		$(this).prepend('<i class="fa fa-check"></i>');
		$(this).addClass('selected');
	});
	// dialog.duelCountdown();

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
		dialog.request_Duel("Waiting for "+ name +" to accept your request", function(){
			ematch.socket.emit("cancel-request", data);
		});
		
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