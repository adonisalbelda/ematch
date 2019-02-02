function CustomModal() {
	this.name = '';	

	this.init = function() {
		this.wrapper = '<div class="dialog-wrapper">';
		popup = this;
		$('.main-wrapper').append(
			$(this.wrapper).hide().fadeIn(300).click(function(e) {
				var senderElement = e.target;
				if($(e.target).is(".dialog-wrapper")) {
					popup.closePopup();
				}
			})
		);
	}

	this.alert = function($msg, $heading = '') {
		this.init();
		var dialog = '<div class="dialog"></div>';
		popup = this;

		$('.dialog-wrapper').html(
			$(dialog).append('<div class="dialog-head">' + $heading + '</div>')
			.append('<div class="dialog-body">' + $msg + '</div>')
			.append(
				$('<div class="dialog-foot"></div>').html(
					$('<button class="popup-btn">OK</button>').click(function() {
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