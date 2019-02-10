function ematchModel(argument) {

	this.formData = {};
	this.socket = io.connect(host);
	var elem = this;

	this.hide_loader =  function() {
		$('.page-loading').css('display', 'none');
	}

	this.show_loader = function() {
		$('.page-loading').css('display', 'block');
	}

	// $(document).on('keypress', '.log-username', function() {
	// 	socket.emit('typing', 'users');
	// });
	if (email != "") {
		this.socket.emit('join_room', {room: "users", data: email});
		this.socket.emit('message', {room: "users", message: isLogin, username:username});
		// socket.emit('message', {room: "users", message: ""});
	}

	this.socket.on('message', function(data){
		var user_id = data.user_id;
		var user_row = $('.people-table table').find('.'+user_id+"-user");
		$(user_row).find('.online-status i').removeClass('offline').addClass('online');

		// $('.online-member-total').text(data['online']);
	});

	this.socket.on('alert-users', function(data){
		$('.popup-logged-user').append("<span class='notify-user-logged'>" +
				data.username + " is now online" +
				"<img src='../images/profile.png'>" +
				"</span>");

		setTimeout(function() {
			$('.notify-user-logged').addClass('show').fadeOut(2000, function(){
				$(this).removeClass('show');
				$(this).remove();
			});
		},500);

		// $('.online-member-total').text(data['online']);
	});


	this.socket.on('duel-confirmation', function(data){
		dialog.show_request(data.username + " wants wants to duel you!", function() {
			var room = elem.generate_Room();
			elem.socket.emit('accept-duel', {sender: data.sender, room: room, receiver: data.receiver});
			dialog.duelCountdown();
			 elem.runCountdown(function() {
			 	$('.dialog-wrapper').remove();
				elem.socket.emit('enter-room', {room: room, player: email});
			 });
		}, "Confirm ?", function() {
			elem.socket.emit('reject-duel', {sender: data.sender, receiver: data.receiver, username: data.username});
		});
	});

	this.socket.on('player-inMatch', function(data){
		dialog.alert(data.msg, "Duel match failed.");
	});

	this.socket.on('show-random-questions', function(data){
		var url = "match";
		elem.redirect_To(url, {});
	});

	this.socket.on('duel-rejection', function(data){
		dialog.alert(data.msg, "Duel match failed.");
	});



	this.socket.on('start-duel', function(data){
		$('.dialog-wrapper').fadeOut(500, function() {
			$(this).remove();
			dialog.duelCountdown();
		    elem.runCountdown(function(){
		    	$('.dialog-wrapper').remove();
		    	elem.socket.emit('enter-room', {room: data.room, player: email});
				// var url = "match";
			 // 	elem.redirect_To(url, {});
		    });
			
		});
	});

	this.runCountdown = function(callback) {
		var counter = 5;
		var interval = setInterval(function() {
		    counter--;
		    // Display 'counter' wherever you want to display it.
		    if (counter == 0) {
		        // Display a login box
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
					elem.socket.emit('send-alert', {room: "users", username: elem.formData['username']});
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

	this.insertData = function() {
		var popup = this;
		this.show_loader();
		$.ajax({
	        url: "/authenticate/addMember",
	        method:"POST",
	        data : JSON.stringify(this.formData),
	        processData: false,
			contentType: "application/json",
	        success: function(data) {
				popup.hide_loader();
				if (data.hasOwnProperty("success")) {
					dialog.alert("Successfuly registered.", "Status", function() {
						elem.socket.emit('send-alert', {room: "users", username: elem.formData['username']});
						location.reload();
						this.formData = {};
					});
				} else {
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

	this.redirect_To = function(url) {
		var popup = this;
		$.ajax({
	        url: "/"+url,
	        method:"POST",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            $('#register-dir-login').attr("data-value", "login");
	            popup.hide_loader();
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert('error ' + textStatus + " " + errorThrown);
	        }
    	});
	}

	this.home_Directory = function (url, data, callback = "") {
		var popup = this;
		$.ajax({
	        url: "/"+url,
	        method:"GET",
	        contentType: "application/x-www-form-urlencoded",
	        success: function(data) {
	            $('.child-wrapper').html(data);
	            $('#match-dir-home').attr("data-value", "home");

	            if (callback != "") {
		            callback();
	            }

	            popup.hide_loader();
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