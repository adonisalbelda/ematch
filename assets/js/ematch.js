function ematchModel(argument) {

	this.formData = {};
	this.socket = io.connect(host);
	var elem = this;

	this.hide_loader =  function() {
		$('.page-loading').css('display', 'none');
	}

	this.animatePoints = function() {
		if (localStorage.getItem("my_points")) {
        	setTimeout(function() {
	        	$('.home-user-points small.home-points').animateNumber(
					{ 
						number: parseInt(localStorage.getItem("my_points")),
					},
					2000
				);
			},1000);

        	$('.user-level-status .user-rank').text(localStorage.getItem("my_rank"));
    	}
	}

	this.updatePoints =  function(id) {
		elem.formData["id"] = id;
		$.ajax({
	        url: "/updatePoints",
	        method:"POST",
	        data : JSON.stringify(elem.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {
	        	elem.formData = {};
	        	points = parseInt(data['success'].points);
	        	rank = data['success'].rank;

	        	elem.animatePoints();
	        },	
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.show_loader = function() {
		$('.page-loading').css('display', 'flex');
	}

	if (email != "") {
		elem.hide_loader();


		ifvisible.setIdleDuration(180);
	
		ifvisible.idle(function(){
			elem.socket.emit('forceExit', {id: isLogin});
		});

		if( ifvisible.now() ){
			elem.socket.emit('forceLogin', {id: isLogin});
		}

		elem.socket.emit('join_room', {room: "users", data: email});
		elem.socket.emit('message', {room: "users", message: isLogin, username:username});
		if (localStorage.getItem('logged') === null) {
			elem.socket.emit('send-alert', {room: "users", username: username, email: email, rank:rank });
			localStorage.setItem("logged", "yes");
		}
		elem.updatePoints(isLogin);
	} else {
		localStorage.clear();
		elem.hide_loader();
	}

	if (localStorage.getItem("logged")) {
		$(window).focus(function() {
			console.log("das");
	   		elem.socket.emit('in-focus', {room: "users",email: email, username: username, rank: rank, id: isLogin });
		}).blur(function() {
		    elem.socket.emit('out-focus', {room: "users",email: email, username: username, rank: rank, id: isLogin });
		});
	}

	this.socket.on('message', function(data){
		var user_id = data.user_id;
		var user_row = $('.people-table').find('.'+user_id+"-user");
		$(user_row).find('.online-status i').removeClass('offline').addClass('online');

		if (data.online > 0) {
			$('.total-online').text(data.online - 1);
		} else {
			$('.total-online').text('0');
		}

	});

	this.socket.on('recieve-msg', function(data){
		if ($('.msg-convo-list').is(":visible")) {
			$('.msg-convo-list').append(
				'<div class="msg-reciever">' +
					'<p>'+data.msg+'</p>' +
				'</div>'
			);

			var objDiv = $(".msg-convo-list");
			var h = objDiv.get(0).scrollHeight;
    	 	objDiv.animate({scrollTop: h});

			$('.msg-reciever.user-typing').remove();
		}

		if ($('.members-list-online').is(":visible")) {
			var unread = parseInt($('.mem-online-prof[data-value="'+data.id+'"]').find('.unread-msg').text());
			$('.mem-online-prof[data-value="'+data.id+'"]').find('.unread-msg').css('display', 'inline-block').text(unread+1);
		}
	});

	this.socket.on('show-typing', function(data){
		if ($('.msg-convo-list').is(":visible")) {
			$('.msg-convo-list').append(
				'<div class="msg-reciever user-typing">' +
					'<p>'+data.username+ " is typing.."+'</p>' +
				'</div>'
			);

			var objDiv = $(".msg-convo-list");
			var h = objDiv.get(0).scrollHeight;
    	 	objDiv.animate({scrollTop: h});

		}
	});

	this.socket.on('hide-typing', function(data){
		$('.msg-reciever.user-typing').remove();
	});

	this.socket.on('remove', function(data){
		alert("dadda");
	});

	this.socket.on('duel-abort', function(data){
		dialog.reject_Duel(data.msg);
	});

	this.socket.on('confirm-match', function(data){
		$('#ready_audio').trigger('play');
		dialog.matchReady(function(){

			var info = {
				room: data.room, 
				username: username, 
				email: email, 
				points: points, 
				id: isLogin, 
				skill_id : data.skill_id,
				skill: data.skill,
				rank: rank,
			}

			elem.socket.emit('enter-room', info );

			var msg = "Waiting for the opponent to accept the request";
			dialog.waitingResult(function(){
				elem.home_Directory("home", {});
			}, msg);

		}, function(){
			elem.socket.emit('reject-match', {sender: data.sender, receiver: data.receiver, username: username});
		});
	});

	this.socket.on('update-in-focus', function(data){
		var row = "<tr data-value='"+data.username+"' data-id='"+data.id+"'>"+
					"<td class='duel-profile-image'>" +
						"<img src='images/profile.png'>"+
					"</td>" +
					"<td class='duel-name'>" +
						"<p>"+data.username+"</p>" +
					"</td>"+
					"<td class='duel-level'>" +
						"<p> Rank"+data.rank+"</p>" +
					"</td>" +
					"<td class='duel-player-btn text-center' data-value='"+data.email+"'>" +
						"<img src='../images/duel_player.png' id='duel-selected-player'>" +
					"</td>"+
				"</tr>";
		if (!check_rowExists(data.id)) {
			$('.duel-member-list tbody').append(row);
		}

		$('.people-table .members-status').each(function(){
			var elem = this;
			if ($(this).attr("data-value") == data.id) {
				$(this).find('.members-status-option').text('active');
			}
		});

	});

	function check_rowExists(id) {
		$('.duel-member-list tbody tr').each(function(){
			console.log($(this).attr("data-id"));
			if (parseInt($(this).attr("data-id")) == id ) {
				return true;
			}
		});

		return false;
	}

	this.socket.on('update-out-focus', function(data){
		$('.duel-member-list table tr').each(function(){
			var elem = this;
			if ($(this).attr("data-value") == data.username) {
				$(this).remove();
			}
		});

	});

	this.socket.on('alert-users', function(data){
			$('.popup-logged-user').append("<span class='notify-user-logged'>" +
					data.username + " is now online" +
					"<img src='../images/profile.png'>" +
					"</span><br>");
			
			setTimeout(function() {
				$('.notify-user-logged').addClass('show').fadeOut(2000, function(){
					$(this).removeClass('show');
					$(this).remove();
					$('.popup-logged-user').empty();
				});
			},100);

			var row = "<tr data-value='"+data.username+"'>"+
					"<td class='duel-profile-image'>" +
						"<img src='images/profile.png'>"+
					"</td>" +
					"<td class='duel-name'>" +
						"<p>"+data.username+"</p>" +
					"</td>"+
					"<td class='duel-level'>" +
						"<p> Rank"+data.rank+"</p>" +
					"</td>" +
					"<td class='duel-player-btn text-center' data-value='"+data.email+"'>" +
						"<img src='../images/duel_player.png' id='duel-selected-player'>" +
					"</td>"+
				"</tr>";
		if ($('.empty-online').is(":visible")) {
			$('.empty-online').remove();

			$('.duel-content').append("<div class='duel-member-list'> " +
					"<table><tbody>"+row+"</tbody></table>"+
				"</div>");
		} else {
			$('.duel-member-list tbody').append(row);
		}
	});

	this.socket.on('duel-confirmation', function(data){
		$('#ready_audio').trigger('play');
		dialog.show_request(data.username + " wants wants to Duel you!", function() {
			var room = elem.generate_Room();
			elem.socket.emit('accept-duel', {sender: data.sender, room: room, receiver: data.receiver});
		}, "Confirm ?", function() {
			elem.socket.emit('reject-duel', {sender: data.sender, receiver: data.receiver, username: username});
		});
	});

	this.socket.on('player-inMatch', function(data){
		dialog.reject_Duel(data.msg, "Duel match failed.");
	});

	this.socket.on('show-random-questions', function(data){
		console.log(data);
		$('.dialog-wrapper').remove();
		elem.show_loader();
		localStorage.setItem('questions', JSON.stringify(data['questions']));
		elem.showQuestions("match", data['data'], data['skill']);
	});

	this.socket.on('duel-rejection', function(data){
		dialog.reject_Duel(data.msg, "Duel match failed.");
	});	

	this.socket.on('display-duel-result', function(data){
		$('.dialog-wrapper').remove();
		elem.show_loader();
		canvas1.render();

		elem.home_Directory("result", {}, function(){

			var C_number = 0;
			gameDone = true;

			localStorage.removeItem('my_points');
			localStorage.removeItem('my_rank');

			C_number = parseInt(data['data']['winner_newpoints']) - parseInt(data['data']['winner_oldpoints'])
			if (parseInt(data['data']['winner_id']) == parseInt(isLogin)) {
				$('#victory_audio').trigger('play');
				$('.preview-result p').text("You win!");
				$('.points-indicator').text("+");
				localStorage.setItem('my_points', data['data']['winner_newpoints']);
				localStorage.setItem('my_rank', data['data']['winner_rank']);
			} else {
				$('#lose_audio').trigger('play');
				$('.preview-result p').text("You lost!");
				$('.points-indicator').text("-");
				localStorage.setItem('my_points',data['data']['losser_newpoints']);
				localStorage.setItem('my_rank',data['data']['losser_rank']);
			}

			$('.player-earned-points').animateNumber(
				{ 
					number: parseInt(C_number)
				},
				2000
			);

			$('.result-winner-points').text(data['data']['winner_newpoints']); 
			$('.result-losser-points').text(data['data']['losser_newpoints'])
			$('.result-winner').text(data['data']['winner_username']);
			$('.result-label').text(data['data']['label']);
			$('.result-winner-rank').text(data['data']['winner_rank']);
			$('.result-losser').text(data['data']['losser_username']);
		});
	});

	this.socket.on('waiting-for-opponent', function(data){
		elem.hide_loader();
		var msg = "Waiting for the opponent to finish the game";
		dialog.waitingResult(function(){
			elem.home_Directory("home", {});
		}, msg);
	});

	this.socket.on('update-users', function(data){
		var user_id = data.id;
		var user_row = $('.people-table').find('.'+user_id+"-user");
		$(user_row).find('.online-status i').removeClass('online').addClass('offline');
		$('.total-online').text(data.online - 1);
	});

	this.socket.on('updateStatus', function(data){
		$('.match-players-info .user-'+data['data'].id+ '').find('.match-question-status span').removeClass('selected');
		$('.match-players-info .user-'+data['data'].id +'').find('.match-question-status').find('span').eq(data['data'].item).addClass('selected');
	});

	this.socket.on('start-duel', function(data){
		if ($('.dialog-wrapper').is(":visible")){
			$('.dialog-wrapper').fadeOut(500, function() {
				$(this).remove();
				dialog.duelCountdown();
			    elem.runCountdown(function(){
			    	$('.dialog-wrapper').remove();
			    	elem.socket.emit('enter-room', {room: data.room, username: username, email: email, points: points, id: isLogin});
			    });
			});
		} else {
			dialog.duelCountdown();
		    elem.runCountdown(function(){
		    	$('.dialog-wrapper').remove();
		    	elem.socket.emit('enter-room', {room: data.room, username: username, email: email, points: points, id: isLogin});
		    });
		}
	});

	this.runCountdown = function(callback) {
		var counter = 5;
		var interval = setInterval(function() {
		    counter--;
		    if (counter == 0) {
		        $('.timerCount').text("...");
		        clearInterval(interval);
		    	callback();
		    } else {
		    	$('.timerCount').text(counter);
		    }
		}, 1000);
	}

	this.generate_Room = function (){
		var random = Math.random().toString(36).substring(7);
		
		return "duel_match-"+random;
	};

	this.isUserExist = function () {
		var popup = this;
		this.show_loader();
		$.ajax({
	        url: "/authenticate/login",
	        method:"POST",
	        data : JSON.stringify(this.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {	
	        	popup.hide_loader();
				if (data.hasOwnProperty("success")) {
					elem.formData = {};
					location.reload();
				} else {
					dialog.showErrors(data, "Invalid authentication.");	    		
				}

	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	        	popup.hide_loader();
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.userLogout = function (id) {
		var popup = this;
		this.formData["id"] = id;
		this.show_loader();
		$.ajax({
	        url: "/authenticate/logout",
	        method:"POST",
	        data : JSON.stringify(this.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {
	        	popup.hide_loader();
				if (data.hasOwnProperty("success")) {
					elem.socket.emit('send-notification', {room: "users", id: id});
					elem.formData = {};
					localStorage.clear();
					location.reload();	
				} else {
					dialog.showErrors(data, "Invalid authentication.");	    		
				}

	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	        	popup.hide_loader();
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.insertData = function() {
		var popup = this;
		this.show_loader();
		$.ajax({
	        url: "/authenticate/addMember",
	        method:"POST",
	        data : JSON.stringify(elem.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {
				popup.hide_loader();
				console.log(data);
				if (data.hasOwnProperty("success")) {
					dialog.alert("Successfuly registered.", "Status", function() {
						elem.socket.emit('send-alert', {room: "users", username: elem.formData['username']});
						localStorage.setItem("logged_in", "true");
						location.reload();
						this.formData = {};
					});
				} else {
					console.log(data);
					dialog.showErrors(data, "Erros found.")
				}

	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	        	popup.hide_loader();
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.update_registerStatus =  function (val, action, data = {}) {

		var statuses = ['personal-info', 'security-info', 'profile-info'];
		var label = ['personal info', 'security info', 'profile info'];

		if (val == (statuses.length-1) && action == 1) {
			return true;
		}

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

	this.showQuestions = function(url, players, skill) {
		var popup = this;
		$.ajax({
	        url: "/"+url,
	        method:"POST",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            questions = JSON.parse(localStorage.getItem('questions'));

	            if (skill == "") {
		            $('.match-category').text("RANDOM");
	            } else {
		            $('.match-category').text(skill);
	            }

	            $('.match-question').text(questions[current_question]['question']);
	            $('.left-player-box .player-details p:first-child').text(players[0]['username']);
	            $('.left-player-box .player-details p:last-child').text(players[0]['points'] + " pts.");
	            $('.right-player-box .player-details p:first-child').text(players[1]['username']);
	            $('.right-player-box .player-details p:last-child').text(players[1]['points'] + " pts.");
	            $('.left-info').addClass("user-"+players[0]['id']);
	            $('.right-info').addClass("user-"+players[1]['id']);
	            $('.left-info').attr('data-value', players[1]['email']);
	            $('.right-info').attr('data-value', players[1]['email']);
	            $('.match-content').attr('data-room', players[0]['room'] );
	            elem.getquestionChoices(questions[current_question]['id']);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});

    	var interval = setInterval(function() {
    		seconds--;

    		if (removeInterval == true) {
    			removeInterval = false;
    			clearInterval(interval);
    		}

    		if (minute == 1) {
    			$('.question-timer').css('background-color', '#820920').addClass('animated infinite shake delay-3s');
    		}

    		if (seconds == 0 ) {
    			if (minute == 0) {
    				var room = $('.match-content').attr("data-room");

		        	var info = {
		        		email: email, 
		        		room: room, 
		        		score: correct_answer, 
		        		id:isLogin, 
		        		username: username, 
		        		points:  points,
		        		rank: rank, 
		        		timer: 0
		        	}
					ematch.socket.emit('duel-result', info);
    				clearInterval(interval);
    			}

    			minute--;
				seconds = 60;	
				$('.set-minute-timer').text(minute);
    		} else {
    			$('.set-seconds-timer').text(seconds);
    		}
		}, 1000);
	}


	this.getquestionChoices = function(questionId) {
		this.formData["questionid"] = questionId;
		$.ajax({
	        url: "/duelChoices",
	        method:"POST",
	        data : JSON.stringify(this.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {
				if (data.hasOwnProperty("error")) {
					alert('error');
				} else {
					elem.hide_loader();
					elem.formData = {};
					var letter = ['a)', 'b)', 'c)', 'd)'];
					$('.question-multiple-type').empty();
					$.each(data['choices'], function( key, value ) {
					   	$('.question-multiple-type').append(
					   		'<div class="answer-option animated slideInLeft" data-value="'+value.answer+'">'+
								'<span>'+letter[key]+'</span>'+
								'<span class="question-choice">'+value.label+'</span>'+
							'</div>'
					   	);
					});
				}
				elem.hide_loader();

	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	        	elem.hide_loader();
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	};

	this.getMatches = function(id) {
		this.formData["id"] = id;
		elem.show_loader();
		$.ajax({
	        url: "/matches",
	        method:"POST",
	        data : JSON.stringify(this.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {
				elem.formData = {};
				console.log(data);
				$('.child-wrapper').html(data);
				$('#match-dir-home').attr("data-value", "home");
				$('.main-wrapper').addClass('animated bounceInUp');
				elem.hide_loader();
				setTimeout(function() {
	        		$('.main-wrapper').removeClass('animated bounceInUp');
				},1000);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	        	elem.hide_loader();
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	};

	this.redirect_To = function(url) {
		var popup = this;
		popup.show_loader();
		$.ajax({
	        url: "/"+url,
	        method:"POST",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            $('#register-dir-login').attr("data-value", "login");
	            $('.main-wrapper').addClass('animated bounceInUp');
	            popup.hide_loader();
	            setTimeout(function() {
	        		$('.main-wrapper').removeClass('animated bounceInUp');
				},1000);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	        	popup.hide_loader();
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.home_Directory = function (url, data, callback = "") {
		var popup = this;
		popup.show_loader();
		$.ajax({
	        url: "/"+url,
	        method:"GET",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            $('.main-wrapper').addClass('animated bounceInDown')
	            $('#match-dir-home').attr("data-value", "home");
	            elem.animatePoints();
	            if (gameDone) {
	            	gameDone = false;
	            	location.reload();
	            } 

	            if (callback != "") {
		            callback();
	            }
	            popup.hide_loader();

	            setTimeout(function() {
	        		$('.main-wrapper').removeClass('animated bounceInDown');
				},1000);
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	        	popup.hide_loader();
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.findMatch = function (url, category) {
		var popup = this;

		var interval = setInterval(function() {

			if ( removeInterval == true ) {
				removeInterval = false;
				clearInterval(interval);
			}

			elem.formData["rank"] = rank;
			elem.formData['id'] = isLogin;
			$.ajax({
		        url: "/"+url,
		        method:"POST",
		        data : JSON.stringify(elem.formData),
		        processData: false,
				contentType: "application/json",
		        success: function(data) {
		        	console.log(data);
		            if (data.hasOwnProperty("students")) {
		            	if (data['students'].length > 0) {
			            	$('.searching-enemy-loading').removeClass('show');
			            	var room = elem.generate_Room();
			            	ematch.socket.emit('showMatch', {sender: email, receiver: data['students'][0].email, room: room, skill_id : category['id'], skill: category['text'] });
			            	clearInterval(interval);
		            	} 
					} 
		        },
		        error: function(jqXHR, textStatus, errorThrown) {
		            alert('error ' + textStatus + " " + errorThrown);
		        }
	    	});
		}, 1000);

	}

	this.retrieveConvo = function (sender, receiver) {
		var popup = this;
		elem.formData["sender"] = sender;
		elem.formData['receiver'] = receiver;
		$.ajax({
	        url: "/conversation",
	        method:"POST",
	        data : JSON.stringify(elem.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {
	        	elem.formData = {};
	            if (data.hasOwnProperty("success")) {
					$.each(data['success'], function( key, value ) {
					   	if(parseInt(value.sender) == isLogin) {
					   		$('.msg-convo-list').append(
								'<div class="msg-sender" data-value>' +
									'<p>'+value.message+'</p>' +
								'</div>'
							);
					   	} else {
					   		$('.msg-convo-list').append(
								'<div class="msg-reciever">' +
									'<p>'+value.message+'</p>' +
								'</div>'
							);
					   	}
					});
				} 
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.readURL = function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            var file =  input.files[0];
            var _URL = window.URL || window.webkitURL;

            img = new Image();
            var imgwidth = 0;
			var imgheight = 0;
			var maxwidth = 200;
			var maxheight = 200;

			img.src = _URL.createObjectURL(file);
			img.onload = function() {
				imgwidth = this.width;
				imgheight = this.height;

				if (imgwidth <= maxwidth && imgheight <= maxheight){
		            reader.onload = function (e) {
		                $('#profile-img-tag').attr('src', e.target.result);
		            }
		            reader.readAsDataURL(file);
		            return file;
			
				} else {
					$('#choose-pro-img').val('');
					dialog.alert("Invalid image size, at least 200x200 size only.", "Error found");
				}
			};
        }
    }
}

var ematch = new ematchModel();