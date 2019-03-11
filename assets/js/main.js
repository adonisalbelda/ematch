$(document).ready(function(){
	
	var _originalSize = $(window).width() + $(window).height()
	$(window).resize(function(){
		if($(window).width() + $(window).height() != _originalSize){
			$('.duel-top-option').css('display', 'none'); 
			$('.user-home-settings').css('display', 'none'); 
		} else {
			$('.duel-top-option').css('display', 'block');  
			$('.user-home-settings').css('display', 'block');  
		}
	});
	
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

	$(window).on('load', function(){
    	ematch.socket.emit('removeUserStatus', {email: email, id: isLogin });
	});

	// localStorage.clear();
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
		dialog.confirm("Are you sure you log out ?", function(){
			ematch.userLogout(isLogin);
		}, "Confirm ?");
	});

	$(document).on('click', '.game-status-reset', function(){
		dialog.confirm("Are you sure you want reset ?", function(){
			ematch.show_loader();
			location.reload();
		}, "Confirm ?");
	});

	$(document).on('click', '#login-btn', function(e) {
		$('#click_audio').trigger('play');
		e.preventDefault();
		ematch.show_loader();
		ematch.formData['username'] = $('.log-username').val();
		ematch.formData['password'] = $('.log-password').val();

		ematch.isUserExist();
		// ematch.home_Directory("home");
	});


	$(document).on('click', "#register-btn", function(e) {
		$('#click_audio').trigger('play');
		e.preventDefault();
		ematch.show_loader();
		var url = "authenticate/register";
		ematch.redirect_To(url);
	});

	$(document).on('click', "#forgot-pass-btn", function(e) {
		$('#click_audio').trigger('play');
		e.preventDefault();
		ematch.show_loader();
		var url = "authenticate/forgot_pass";
		ematch.redirect_To(url);
	});

	$(document).on('click', '#match-dir-home, #duel-dir-home', function(){
		$('#click_audio').trigger('play');
		ematch.show_loader();
		var url = $(this).attr("data-value");
		ematch.home_Directory(url, {});
	});

	$(document).on('click', '#register-dir-login', function(e){
		$('#click_audio').trigger('play');
		e.preventDefault();
		ematch.show_loader();
		var url = "authenticate/login";
		ematch.home_Directory(url, {});
	});

	$(document).on('click', '#form-next-status', function() {
		$('#click_audio').trigger('play');
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
				ematch.formData["user_avatar"] = $('.user-avatar').val();

				ematch.insertData();
			}, "Confirm ?");
		}
	});

	$(document).on('click', '#form-prev-status', function() {
		$('#click_audio').trigger('play');
		var val = parseInt($(this).attr("data-value"));
		ematch.update_registerStatus(val, 0);

	});

	$(document).on('change', '#choose-pro-img', function() {
        var file = ematch.readURL(this);
        ematch.formData["fileToUpload"] =  file;
	});

	var next = false ;
	var number_ofItems = 10;
	var nextItem = 1;
	var answers = [];
	var ques_item_answers = {};
	$(document).on('click', '.next-arr-btn', function(){
		$('#click_audio').trigger('play');

		if (next == false) {
			return false;
		}

		if ($('.answer-option').hasClass('selected')) {
			var answer = $('.answer-option.selected').attr("data-value");
			ques_item_answers['my_answer'] = $('.answer-option.selected').text();
			if (parseInt(answer) == 1) {
				correct_answer++;
				ques_item_answers['status'] = "Checked";
			} else {
				wrong_answer++;
				ques_item_answers['status'] = "Wrong";
			}

			item_finished++;
			nextItem++;
			$('.item-left').text(number_ofItems - item_finished);
			$('.level-count-status span').text(nextItem);
		}

		$('.answer-option').each(function(){
			if ($(this).attr("data-value") == "1") {
				ques_item_answers['correct_answer'] = $(this).text();
			}
		});

		answers.push(ques_item_answers);
		ques_item_answers = {};
		console.log(answers);

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

	$(document).on('click', '.view-match-results button', function(){
		$('.match-preview-overlay').css('visibility', 'visible').addClass('animated bounce');
		var questions = JSON.parse(localStorage.getItem('questions'));
		$.each( questions, function( key, value ) {
		   	$('.preview-questions-list').append('<div class="preview-question-item">'+
			'<span class="pre-ques-sec">' +
				'<span class="pre-ques-num">'+(key+1)+')</span>' +
				'<span class="pre-ques-title">'+value.question+'</span>' +
			'</span>' +
			'<p class="pre-ques-cor">' +
				'<span>Correct answer:</span>' +
				'<span>'+answers[key]['correct_answer']+'</span' +
			'</p>' +
			'<p class="pre-ques-ans">' +
				'<span>Your answer:</span>' +
				'<span>'+answers[key]['my_answer']+'</span>' +
			'</p>' +
			'<p class="pre-ques-stats">' +
				'<span>Status:</span>' +
				'<span>'+answers[key]['status']+'</span>' +
			'</p>'+
			'</div>');
		});
		localStorage.removeItem("questions");
	});

	$(document).on('click', '.pre-image-close', function(){
		$('.match-preview-overlay').css('visibility', 'hidden').removeClass('animated bounce');
	});

	$(document).on('click', '.hide-pr', function(){
		$('.preview-result-overlay').fadeOut(500);
	});

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

	$(document).on('click', '#matches-view', function() {
		ematch.getMatches(isLogin);
	});

	var receiver_email = "";
	var receiver_id = 0;
	$(document).on('click', '.mem-online-prof', function(){
		$('.members-conversation').css('display', 'block');
		$('.members-list-online').css('display', 'none');
		
		$(".msg-convo-list").empty();
		var objDiv = $(".msg-convo-list");
		var h = objDiv.get(0).scrollHeight;
	 	objDiv.animate({scrollTop: h});

		chat = $(this).attr("data-value");
		receiver_email = $(this).attr("data-selector");
		receiver_id = $(this).attr("data-value");
		name = $(this).attr("data-name");
		$('.members-msg').text( name + " and Your "+ "conversation");

		ematch.retrieveConvo(isLogin, receiver_id);
	});

	$(document).on('click', '#send-msg', function(){
		var msg = $('.msg-content').val();
		$('.msg-content').val("");

		if (msg == "") {
			return false;
		}

		$('.msg-convo-list').append(
			'<div class="msg-sender">' +
				'<p>'+msg+'</p>' +
			'</div>'
		);
		ematch.socket.emit('send-message', {receiver: receiver_email, receiver_id: receiver_id, msg: msg, id: isLogin,});
	});

	$(document).on('focus', '.msg-content', function(){
		ematch.socket.emit('user-typing', {receiver: receiver_email, username: username});
	});

	$(document).on('focusout', '.msg-content', function(){
		ematch.socket.emit('stop-typing', {receiver: receiver_email, username: username});
	});

	$(document).on('click', '.mes-onl-mem .action', function(){
		$('.members-conversation').css('display', 'none');
		$('.members-list-online').css('display', 'block');
		$('.members-msg').text("All");
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