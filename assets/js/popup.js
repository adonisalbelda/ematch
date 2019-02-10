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
		var dialog = '<div class="dialog"></div>';
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
		var dialog = '<div class="dialog"></div>';
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

	this.request_Duel = function($message) {
		this.init();
		var dialog = '<div class="dialog request-dialog"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append('<div class="dialog-head"> Time elapsed : <span class="timer well"></span></div>')
			.append('<div class="dialog-body request-overlay">' + $message + '...</div>')
			.append(
				$('<div class="dialog-foot"></div>').html(
					$('<button class="btn btn-primary popup-btn">Cancel request</button>').click(function() {
						popup.closePopup();
					})
				)
			)
		);
	};

	this.confirm = function($msg, callback ,$heading = '') {
		this.init();
		var dialog = '<div class="dialog"></div>';
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
		var dialog = '<div class="dialog"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append('<div class="dialog-head">' + $heading + '</div>')
			.append('<div class="dialog-body">' + $msg + '</div>')
			.append(
				$('<div class="dialog-foot"></div>')
				.append(
					$('<button class="btn btn-default popup-btn">Decline</button>').click(function() {						
						popup.closePopup();
						reject();
					})
				)
				.append(
					$('<button class="btn btn-primary popup-btn">Accept</button>').click(function() {
						$('.dialog-wrapper').fadeOut(500, function() {
							$(this).remove();
							callback();
						});
					})
				)
			)
		);
	};

	this.duelCountdown = function() {
		this.init();
		var dialog = "<div class='duelTimer'> " +
					 "<p>THE GAME WILL <br></br> START IN</p>" +
					 "<p class='timerCount'>5</p>" +
					 "<p class='timer-reminder text-left'><span>Reminder: </span> Use Messages for web to send SMS, MMS and chat messages from your computer."+ 
					 "Open the Messages app on your Android phone to get started.</p>" +
					 "</div>";

		$('.dialog-wrapper').html(dialog);
	};

	this.promt = function($msg, callback ,$heading = '') {
		this.init();
		var dialog = '<div class="dialog"></div>';
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