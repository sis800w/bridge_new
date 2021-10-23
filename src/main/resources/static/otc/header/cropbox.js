"use strict";
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}(function ($) {
	var cropbox = function (options, el) {
		var obj = {
				state: {},
				ratio: 1,
				options: options,
				thumb_box: el.find(options.thumb_box),
				spinner: el.find(options.spinner),
				image: new Image(),
				left: 0,
				top: 0,
				getDataURL: function () {
					var width = this.thumb_box.width(),
						height = this.thumb_box.height(),
						canvas = document.createElement("canvas"),
						dim = el.css('background-position').split(' '),
						size = el.css('background-size').split(' '),
						dx = parseInt(dim[0]) - el.width() / 2 + width / 2,
						dy = parseInt(dim[1]) - el.height() / 2 + height / 2,
						dw = parseInt(size[0]),
						dh = parseInt(size[1]),
						sh = parseInt(this.image.height),
						sw = parseInt(this.image.width);
					canvas.width = width;
					canvas.height = height;
					var context = canvas.getContext("2d");
					context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
					var imageData = canvas.toDataURL('image/png');
					return imageData;
				},
				getBlob: function () {	// formData.append('header', blob);
					var imageData = this.getDataURL();
					var b64 = imageData.replace('data:image/png;base64,', '');
					var binary = atob(b64);
					var array = [];
					for (var i = 0; i < binary.length; i++) {
						array.push(binary.charCodeAt(i));
					}
					return new Blob([new Uint8Array(array)], { type: 'image/png' });
				},
				reset: function() {
					this.left = 0;
					this.top = 0;
					resetRatio();
					setBackground();
				},
				zoom: function(ratio) {
					this.ratio *= Math.sqrt(Math.sqrt(ratio));
					setBackground();
				},
				zoomIn: function () {
					this.ratio *= 1.1;
					setBackground();
				},
				zoomOut: function () {
					this.ratio *= 0.9;
					setBackground();
				},
				move: function (left, top) {
					this.left += left;
					this.top += top;
					setBackground();
				},
				moveRight: function () {
					this.left += parseInt(obj.image.width) * obj.ratio * 0.02;
					setBackground();
				},
				moveLeft: function () {
					this.left -= parseInt(obj.image.width) * obj.ratio * 0.02;
					setBackground();
				},
				moveUp: function () {
					this.top -= parseInt(obj.image.height) * obj.ratio * 0.02;
					setBackground();
				},
				moveDown: function () {
					this.top += parseInt(obj.image.height) * obj.ratio * 0.02;
					setBackground();
				},
				loadAfter: options.loadAfter || function () { }
		},
		setBackground = function (IsOnload) {
			var w = parseInt(obj.image.width) * obj.ratio;
			var h = parseInt(obj.image.height) * obj.ratio;
			var pw = (el.width() - w) / 2 + obj.left;
			var ph = (el.height() - h) / 2 + obj.top;
			el.css({
					'background-image': 'url(' + obj.image.src + ')',
					'background-size': w + 'px ' + h + 'px',
					'background-position': pw + 'px ' + ph + 'px',
					'background-repeat': 'no-repeat'
			});
		},
		resetRatio = function() {
			var wimg = obj.image.width;
			var himg = obj.image.height;
			var wbody = $("body").width();
			var max, min;
			if (wimg > himg) {
				max = wimg;
				min = himg;
			} else {
				max = himg;
				min = wimg;
			}
			if (min > wbody) {
				obj.ratio = wbody / min;
			}
			if (max < wbody) {
				obj.ratio = wbody / max;
			}
		},
		imgMouseDown = function (e) {
			e.stopImmediatePropagation();
			obj.state.dragable = true;
			obj.state.mouseX = e.clientX;
			obj.state.mouseY = e.clientY;
		},
		imgMouseMove = function (e) {
			e.stopImmediatePropagation();
			if (obj.state.dragable) {
				var x = e.clientX - obj.state.mouseX;
				var y = e.clientY - obj.state.mouseY;
				var bg = el.css('background-position').split(' ');
				var bgX = x + parseInt(bg[0]);
				var bgY = y + parseInt(bg[1]);
				el.css('background-position', bgX + 'px ' + bgY + 'px');
				obj.state.mouseX = e.clientX;
				obj.state.mouseY = e.clientY;
			}
		},
		imgMouseUp = function (e) {
			e.stopImmediatePropagation();
			obj.state.dragable = false;
		},
		zoomImage = function (e) {
			e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio *= 1.1 : obj.ratio *= 0.9;
			setBackground();
		};
		obj.spinner.show();
		obj.image.onload = function () {
			obj.spinner.hide();
			resetRatio();
			setBackground('onload');
			el.bind('mousedown', imgMouseDown);
			el.bind('mousemove', imgMouseMove);
			$(window).bind('mouseup', imgMouseUp);
			el.bind('mousewheel DOMMouseScroll', zoomImage);
			obj.loadAfter();
		};
		obj.image.src = options.imgSrc;
		el.on('remove', function () { $(window).unbind('mouseup', imgMouseUp) });
		return obj;
	};
	jQuery.fn.cropbox = function (options) {
		return new cropbox(options, this);
	};
}));

$.fn.extend({
	"preventScroll": function () {
		$(this).each(function () {
			var _this = this;
			if (navigator.userAgent.indexOf('Firefox') >= 0) {   // firefox
				_this.addEventListener('DOMMouseScroll', function (e) { e.preventDefault(); }, false);
			} else {
				_this.onmousewheel = function (e) {
					return false;
				};
			}
		})
	},
	"autoScroll": function () {
		$(this).each(function () {
			var _this = this;
			if (navigator.userAgent.indexOf('Firefox') >= 0) {   // firefox
				_this.addEventListener('DOMMouseScroll', function (e) {
					_this.scrollTop += e.detail > 0 ? 60 : -60;
					e.preventDefault();
				}, false);
			} else {
				_this.onmousewheel = function (e) {
					e = e || window.event;
					_this.scrollTop += e.wheelDelta > 0 ? -60 : 60;
					return false;
				};
			}
		})
	}
});