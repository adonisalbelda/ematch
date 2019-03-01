function CustomModal() {
	this.name = '';	

	this.init = function() {
		this.wrapper = '<div class="dialog-wrapper">';
		popup = this;
		$('.main-wrapper').append(
			$(this.wrapper).hide().fadeIn(300).click(function(e) {
				var senderElement = e.target;
				if($(e.target).is(".dialog-wrapper")) {
					// popup.closePopup();
				}
			})
		);
	}

	this.alert = function($msg, $heading = '', callback) {
		this.init();
		var dialog = '<div class="dialog animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append('<div class="dialog-head">' + $heading + '</div>')
			.append('<div class="dialog-body">' + $msg + '</div>')
			.append(
				$('<div class="dialog-foot"></div>').html(
					$('<button class="btn btn-primary popup-btn">OK</button>').click(function() {
						if (callback !== undefined) {
							callback();
						}
						
						popup.closePopup();
					})
				)
			)
		);
	};

	this.showErrors = function($data, $heading = '') {
		this.init();
		var dialog = '<div class="dialog animated slideInRight"></div>';
		popup = this;
		var msgs = "";

		$.each( $data['errors'], function( key, value ) {
			msgs += "<li>"+value['msg']+"</li>";
		});

		msgs = "<ul>"+msgs+"</ul>";

		$('.dialog-wrapper').html(
			$(dialog).append('<div class="dialog-head">' + $heading + '</div>')
			.append('<div class="dialog-body">' + msgs + '</div>')
			.append(
				$('<div class="dialog-foot"></div>').html(
					$('<button class="btn btn-primary popup-btn">OK</button>').click(function() {
						popup.closePopup();
					})
				)
			)
		);
	};

	this.reject_Duel = function($message) {
		this.init();
		var dialog = '<div class="dialog dialog-show-request animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append($('<div class="dialog-body"></div>').append(
				"<div><img src='../images/profile.png' class='duel-waiting-player'>"+
				"<span class='user-tag-text'>You</span><div>"
			).append($('<div class="duel-actions"></div>')
			.append('<p>'+$message+'.</p>')
			.append(
					$('<button class="btn btn-default popup-decline-btn">Okay</button>').click(function() {
						$('.dialog-wrapper').fadeOut(500, function() {
							$(this).remove();
						});
					})
			))
			.append(
				"<div><img src='../images/profile.png' class='duel-sender-player'>"+
				"<span class='opponent-tag-text'>Rival</span></div>"
			))
		);
	};

	this.request_Duel = function($message, callback) {
		this.init();
		var dialog = '<div class="dialog dialog-show-request animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append($('<div class="dialog-body"></div>').append(
				"<div><img src='../images/profile.png' class='duel-waiting-player'>"+
				"<span class='user-tag-text'>You</span><div>"
			).append($('<div class="duel-actions"> Time elapsed : <span class="timer well"></span></div>')
			.append('<p>'+$message+'.</p>')
			.append(	
					$('<button class="btn btn-default popup-decline-btn">Cancel</button>').click(function() {
						$(this).attr('disabled','disabled');
						$('.dialog-wrapper').fadeOut(500, function() {
							$(this).remove();
							callback();
						});
					})
			))
			.append(
				"<div><img src='../images/profile.png' class='duel-sender-player'>"+
				"<span class='opponent-tag-text'>Rival</span></div>"
			))
		);
	};

	this.confirm = function($msg, callback ,$heading = '') {
		this.init();
		var dialog = '<div class="dialog animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append('<div class="dialog-head">' + $heading + '</div>')
			.append('<div class="dialog-body">' + $msg + '</div>')
			.append(
				$('<div class="dialog-foot"></div>')
				.append(
					$('<button class="btn btn-default popup-btn">No</button>').click(function() {
						popup.closePopup();
					})
				)
				.append(
					$('<button class="btn btn-primary popup-btn">Yes</button>').click(function() {
						$('.dialog-wrapper').fadeOut(500, function() {
							$(this).remove();
							callback();
						});
					})
				)
			)
		);
	};

	this.show_request = function($msg, callback ,$heading = '', reject) {
		this.init();
		var dialog = '<div class="dialog dialog-show-request animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append($('<div class="dialog-body"></div>').append(
				"<div><img src='../images/profile.png' class='duel-waiting-player'>"+
				"<span class='user-tag-text'>You</span><div>"
			).append($('<div class="duel-actions"></div>')
			.append('<span>'+$msg+'.</span>')
			.append(
					$('<button class="btn btn-primary popup-accept-btn">Accept</button>').click(function() {
						$(this).attr('disabled','disabled');	
						$('.dialog-wrapper').fadeOut(500, function() {
							$(this).remove();
							callback();
						});
					})
			)
			.append(
					$('<button class="btn btn-default popup-decline-btn">Decline</button>').click(function() {						
						popup.closePopup();
						reject();
					})
				)
			)
			.append(
				"<div><img src='../images/profile.png' class='duel-sender-player'>"+
				"<span>Dueller</span></div>"
			))
		);
	};

	this.duelCountdown = function() {
		this.init();
		var dialog = "<div class='duelTimer'> " +
					 "<p>DUEL ACCEPTED</p>" +
					 "<p class='timerCount'>5</p>" +
					 "<p>THE GAME WILL START IN</p>"
					 "</div>";

		$('.dialog-wrapper').html(dialog);
	};

	this.findMatch = function(skills, callback) {
		this.init();
		var dialog = '<div class="dialog-find-match animated slideInLeft"></div>';
		popup = this;
		var list_of_skills = "";
		console.log(skills);
		for (var i = 0; i < skills.length; i++) {
			list_of_skills += "<div data-value='"+skills[i].id+"'>"+skills[i].name+"</div>";
		}

		$('.dialog-wrapper').html(
			$(dialog).append($('<div class="dialog-body"></div>')
			.append($('<div id="close-findmatch-box"><img src="../images/close.png"></div><br>').click(function(){
				popup.closePopup();
			})
			)
			.append($("<div class='find-skills-list'>" +
						"<p class='categories-list'>CHOOSE MASTERY</p>"+
						list_of_skills +
					"</div>"
			))
			.append($('<div class="duel-actions"></div>')
			.append(
					$('<button class="btn btn-default popup-accept-btn">Find Match</button>').click(function() {						
						if ($('div.selected').text() != "") {
							popup.closePopup();
							var data = {
								id : $('div.selected').attr("data-value"),
								text : $('div.selected').text(),
							}

							callback(data);
						}
					})
				)
			))
		);
	}

	this.matchReady = function(callback , reject) {
		this.init();
		var dialog = '<div class="dialog dialog-show-request animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append($('<div class="dialog-body"></div>')
			.append($('<div class="match-actions"></div>')
			.append('<span>Your game is ready.</span>')
			.append(
					$('<button class="btn btn-primary popup-accept-btn">Accept</button>').click(function() {
						$('.dialog-wrapper').fadeOut(500, function() {
							$(this).remove();
							callback();
						});
					})
			)
			.append(
					$('<button class="btn btn-default popup-decline-btn">Decline</button>').click(function() {						
						popup.closePopup();
						reject();
					})
				)
			))
		);
	}

	this.waitingResult = function(callback, msg) {
		this.init();
		var dialog = '<div class="dialog dialog-show-request animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append($('<div class="dialog-body"></div>')
			.append($('<div class="match-actions"></div>')
			.append('<span>'+msg+' .</span>')
			)
			.append(
					$('<button class="btn btn-primary popup-accept-btn notify-me-hide">Just notify me.</button>').click(function() {
						$('.dialog-wrapper').fadeOut(500, function() {
							$(this).remove();
							callback();
						});
					})
			)
			)
		);
	}

	this.promt = function($msg, callback ,$heading = '') {
		this.init();
		var dialog = '<div class="dialog animated slideInRight"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append('<div class="dialog-head">' + $heading + '</div>')
			.append('<div class="dialog-body">' + $msg + '</div>')
			.append(
				$('<div class="dialog-foot"></div>')
				.append('<input type="text" class="dialog-input">')
				.append(
					$('<button class="popup-btn">OK</button>').click(function() {
						popup.closePopup();

						input = $('.dialog-input').val();
						callback(input);
					})
				)
			)
		);
	};

	this.closePopup = function() {
		if ($('.dialog-wrapper').length) {
			$('.dialog-wrapper').fadeOut(500, function() {
				$(this).remove();
			});
		}
	}
}

var dialog = new CustomModal();