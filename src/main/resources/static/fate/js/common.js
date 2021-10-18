$(function(){
	$.baseUrl = "http://ip1:8080/api/";
	
	// 阻止safari浏览器手势缩放
	document.addEventListener("gesturestart", function (event) {
		event.preventDefault();
	});
	
	// 阻止safari浏览器双击放大
	var lastTouchEnd = 0;
	document.addEventListener('touchend', function (event) {
		var now = (new Date()).getTime();
		if (now - lastTouchEnd <= 450) {
			event.preventDefault();
		}
		lastTouchEnd = now;
	}, false);
	
	$.getParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return decodeURI(r[2]);
		} else {
			return "";
		}
	};
	
	$.addParam = function (name, value) {
		var url = window.location.href;
		var s = url.indexOf("?") == -1 ? "?" : "&";
		window.history.pushState({}, 0, url + s + name +"=" + value);
	};
	
	$.setCookie = function (name, value) {
		var expires = (arguments.length > 2) ? arguments[2] : null;
		document.cookie = name + "=" + encodeURIComponent(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ";path=/";
	};

	$.getCookie = function (name) {
		var value = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (value != null) {
			return decodeURIComponent(decodeURIComponent(value[2]));
	    } else {
			return null;
		}
	};
	
	$.copy = function(selecter) {
		if ($(selecter).length == 0) {
			return;
		}
		var clipboard = new ClipboardJS(selecter);
		clipboard.on('success', function(e) {
			$.tips("Copy success", 1000);
			e.clearSelection();
		});
		clipboard.on('error', function(e) {
			$.tips("Copy error", 1000);
		});
	};
	
	$.sleep = function(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	};
	
	$.uuid = function () {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
	};
	
	$.decompose = function(num, length) {
		var str = num ? num.toString(2) : "";
		var arr = [];
		for (var i = 0; i < length; i++) {
			arr[i] = str.charAt(str.length - 1 - i) == "1" ? true : false;
		}
		return arr;
	};
	
	$.req = function (method, url, data, successCallback, errorCallback, opBtn, isJsonp) {
		url = $.baseUrl + url;
		console.log("start." + method + (isJsonp ? ".jsonp" : "") + "，url=" + url + "，data=" + JSON.stringify(data));
		$.ajax({
			type: method,
			url: url,
			data: data,
			dataType : isJsonp ? "jsonp" : null,
			traditional: true,
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true,
			beforeSend : function (xhr) {
				if (opBtn) {
					opBtn.attr("disabled", "disabled");
				}
			},
			success: function(msg){
				console.log("success." + method + (isJsonp ? ".jsonp" : "") + "，url=" + url + "，data=" + JSON.stringify(data) + "，result=" + JSON.stringify(msg));
				if (msg.success) {
					if (successCallback) {
						successCallback(msg.data);
					}
				} else {
					if (msg.errorCode == 'LOGIN' && $.logout) {
						$.logout();
					} else if (errorCallback) {
						errorCallback(msg.errorMessage, msg.errorCode);
					} else {
						$.tips(msg.errorMessage, 2000);
					}
				}
			},
			complete: function(xhr, ts) {
				if (opBtn) {
					opBtn.removeAttr("disabled");
				}
			}
		});
		console.log("end." + method + (isJsonp ? ".jsonp" : "") + "，url=" + url + "，data=" + JSON.stringify(data));
	};
	$.get = function(url, data, successCallback) {
		$.req("get", url, data, successCallback, null, null, false);
	};
	$.post = function(url, data, successCallback, errorCallback, opBtn) {
		$.req("post", url, data, successCallback, errorCallback, opBtn, false);
	};
	$.jsonpGet = function(url, data, successCallback) {
		$.req("get", url, data, successCallback, null, null, true);
	};
	$.jsonpPost = function(url, data, successCallback, errorCallback, opBtn) {
		$.req("post", url, data, successCallback, errorCallback, opBtn, true);
	};
	
	$.lodding = function(msg) {
		$.hideTips();
		var id = "id_div_lodding";
		var lodding = $('#' + id);
		if (lodding.text().length == 0) {
			// lodding
			lodding = $("<div>");
			lodding.css({
				"position": "fixed",
				"top": 0,
				"left": 0,
				"width": "100%",
				"height": "100%",
				"background-color": "rgba(0,0,0,.7)",
				"color": "#fff",
				"font-size": "14px",
				"display": "flex",
				"flex-direction": "column",
				"justify-content": "center",
				"align-items": "center",
				"z-index": 10002
			});
			lodding.attr("id", id);
			lodding.appendTo($("body"));
			
			var iconWarp = $("<span>");
			iconWarp.appendTo(lodding);
			
			// icon
			var icon = $("<i>");
			icon.addClass("fa");
			icon.addClass("fa-spinner");
			icon.addClass("fa-pulse");
			icon.addClass("fa-3x");
			icon.addClass("fa-fw");
			icon.appendTo(iconWarp);
			
			// text
			var text = $("<div>");
			text.css("margin-top", "8px");
			text.text(msg);
			text.appendTo(lodding);
		} else {
			var text = lodding.children("div");
			text.text(msg)
			lodding.show();
		}
	};
	
	$.hideLodding = function() {
		$('#id_div_lodding').hide();
	};
	
	$.dialog = function(msg, ms) {
		$.hideTips();
		var id = "id_div_dialog";
		var dialog = $('#' + id);
		if (dialog.text().length == 0) {
			// dialog
			dialog = $("<div>");
			dialog.css({
				"position": "fixed",
				"top": "50%",
				"left": "50%",
				"margin-left": "-90px",
				"margin-top": "-39px",
				"width": "150px",
				"padding": "15px",
				"color": "#fff",
				"font-size": "14px",
				"line-height": "20px",
				"text-align": "center",
				"background-color": "rgba(0,0,0,.7)",
				"border-radius": "8px",
				"z-index": 10002
			});
			dialog.attr("id", id);
			dialog.appendTo($("body"));
			
			// text
			var text = $("<div>");
			text.text(msg);
			text.appendTo(dialog);
		} else {
			var text = dialog.children("div");
			text.text(msg);
			dialog.show();
		}
		
		// public
		if (ms > 0) {
			setTimeout(function () {
				dialog.hide();
			}, ms);
		}
	};
	
	$.hideDialog = function() {
		$('#id_div_dialog').hide();
	};
	
	$.tips = function(msg, ms) {
		if (ms) {
			$.dialog(msg, ms);
		} else {
			$.lodding(msg);
		}
	};
	
	$.hideTips = function() {
		$.hideDialog();
		$.hideLodding();
	};
	
	$.showOverlay = function() {
		var id = "id_div_overlay";
		var overlay = $('#' + id);
		if (! overlay.css("display")) {
			overlay = $("<div>");
			overlay.css({
				"position": "fixed",
				"top": 0,
				"left": 0,
				"width": "100%",
				"height": "100%",
				"background-color": "rgba(0,0,0,.7)",
				"z-index": 10000
			});
			overlay.addClass("class_div_popup");
			overlay.attr("id", id);
			overlay.appendTo($("body"));
			overlay.on('click', function(){
				$.hidePopup();
			});
		} else {
			overlay.show();
		}
	};
	
	$.showPopup = function(id, title, callback) {
		$.showOverlay();
		id = id ? id : "id_div_popup";
		var popup = $('#' + id);
		if (popup.text().length == 0) {
			// popup
			popup = $("<div>");
			popup.css({
				"background-color": "var(--back_m)",
				"border-radius": "16px 16px 0 0",
				"bottom": 0,
				"left": 0,
				"right": 0,
				"width": "100%",
				"position": "fixed",
				"z-index": 10001,
				"max-width": "450px",
				"margin": "auto",
				"font-family": "Ubuntu,Roboto,sans-serif"
			});
			popup.addClass("class_div_popup");
			popup.attr("id", id);
			popup.appendTo($("body"));
			
			// header
			var header = $("<div>");
			header.css({
				"font-size": "20px",
				"color": "#fff",
				"line-height": 1.5,
				"text-align": "left",
				"border-bottom": "1px solid var(--back_j2)",
				"padding": "15px"
			});
			header.appendTo(popup);
			
			// title
			var titleSpan = $("<span>");
			titleSpan.html(title);
			titleSpan.appendTo(header);
			
			// close
			var close = $("<i>");
			close.addClass("fa");
			close.addClass("fa-times");
			close.attr("aria-hidden", true);
			close.css({
				"top": "1rem",
				"position": "absolute",
				"right": "0",
				"padding": "0 16px",
				"color": "#c8c9cc",
				"font-size": "22px",
				"line-height": "inherit"
			});
			close.appendTo(header);
			close.on('click', function(){
				$.hidePopup();
			});
			
			// content
			var content = $("<div>");
			content.appendTo(popup);
			callback(content);
		} else {
			var children = popup.children("div");
			var header = children.first();
			header.children("span").html(title);
			var content = children.last();
			callback(content);
			popup.show();
		}
	};
	
	$.hidePopup = function() {
		$(".class_div_popup").hide();
	};
	
	$.formPopup = {
		form : null,
		build : function(id, title) {
			var form = $("<div>");
			form.addClass("div_form");
			$.showPopup(id, title, function(content){
				content.html(form);
			});
			this.form = form;
			return this;
		},
		addInput : function(clazz, title, desc, value, password, readonly) {
			var item = $("<div>");
			item.appendTo(this.form);
			
			var titleDiv = $("<div>");
			titleDiv.text(title + "：");
			titleDiv.appendTo(item);
			
			var input = $("<input>");
			input.addClass(clazz);
			input.attr("type", password ? "password" : "text");
			if (desc) input.attr("placeholder", desc);
			if (readonly) input.attr("readonly", "readonly");
			if (value) input.val(value);
			input.appendTo(item);
			return this;
		},
		addText : function(clazz, title, desc, value) {
			return this.addInput(clazz, title, desc, value, false, false);
		},
		addPassword : function(clazz, title, desc) {
			return this.addInput(clazz, title, desc, null, true, false);
		},
		addStatic : function(clazz, title, value) {
			return this.addInput(clazz, title, null, value, false, true);
		},
		addBtn : function(title, clickFunction) {
			var button = $("<button>");
			button.addClass("button_full");
			button.html(title);
			button.appendTo(this.form);
			
			var form = this.form;
			button.on('click', function(){
				clickFunction(form);
			});
			return this;
		}
	};
	
	$.select = function(eles) {
		eles.each(function(){
			// 隐藏本体
			var that = $(this);
			that.css("display", "none");
			
			// 伪装控件
			var selected = $("<div>");
			selected.css({
				"background-color": "var(--back_l3)",
				"padding": "0 10px",
				"display": "flex",
				"justify-content": "space-between",
				"align-items": "center",
				"height": "36px"
			});
			that.after(selected);
			
			// 伪装控件文本
			var span = $("<span>");
			span.css("font-size", "16px");
			span.appendTo(selected);
			
			// 伪装控件图标
			var i = $("<i>");
			i.addClass("fa");
			i.addClass("fa-angle-down");
			i.appendTo(selected);
			
			// 伪装控件选项
			var id = 'popup_' + that.attr("id");
			var title = that.attr("title");
			title = title ? title : "选择";
			var column = that.attr("column");
			$.showPopup(id, title, function(content){
				if (column) content.css({"display": "flex", "flex-wrap": "wrap"});
				that.find("option").each(function() {
					// 伪装控件选项样式
					var realOption = $(this);
					var option = $("<div>");
					option.text(realOption.text());
					option.css({
						"padding": "0 15px",
						"border-bottom": "1px solid var(--back_j2)",
						"display": "flex",
						"align-items": "center",
						"height": "48px",
						"font-size": "16px"
					});
					if (column) option.css("width", "calc(" + 100/column + "% - 30px)");
					option.appendTo(content);
					
					// 默认值
					if (realOption.attr("selected") == "selected") {
						span.text(realOption.text());
					}
					
					// 伪装控件选项事件
					option.on("mouseover", function() {
						option.css("background-color", "var(--back_l1)");
					});
					option.on("mouseout", function() {
						option.css("background-color", "var(--back_m)");
					});
					option.on("click", function() {
						span.text(option.text());
						$.hidePopup();
						realOption.siblings().attr("selected", null);
						realOption.attr("selected", "selected");
					});
				});
			});
			$.hidePopup();
			
			// 伪装控件事件
			selected.on('click', function() {
				$.showPopup(id, title, function(content){});
			});
		});
	};
	$.select($(".select"));
	
	$.radio = function($ele_radio) {
		$ele_radio.each(function() {
			var width = $(this).attr("width");
			if (! $(this).attr("y")) {
				$(this).css({
					"display": "flex",
					"flex-wrap": "wrap"
				});
			}
			$(':radio + label', this).each(function() {
				// 取文本
				var that = $(this);
				that.css("display", "flex");
				that.css("font-size", "16px");
				that.css("line-height", "36px");
				if (width) that.css("width", width);
				var text = that.text();
				that.html('');
				
				// 加入图标
				var span1 = $("<span>");
				span1.css("width", "20px");
				span1.appendTo(that);
				var i = $("<i>");
				i.addClass("fa");
				i.addClass("fa-circle-o");
				i.appendTo(span1);
				
				// 加入文本
				var span2 = $("<span>");
				span2.css("padding-right", "20px");
				span2.text(text);
				span2.appendTo(that);
				
				// 默认选中
				if (that.prev().is(":checked")) {
					i.removeClass("fa-circle-o");
					i.addClass("fa-dot-circle-o");
					i.css("color", "var(--color_j)");
				}
			}).click(function(event) {
				// 全部设为未选中
				var that = $(this);
				var is = that.parent().find("i");
				is.removeClass("fa-dot-circle-o");
				is.addClass("fa-circle-o");
				is.css("color", "");
				that.siblings().attr("checked", null);
				
				// 当前设为选中
				if (! that.prev().is(':checked')) {
					var i = that.find("i");
					i.removeClass("fa-circle-o");
					i.addClass("fa-dot-circle-o");
					i.css("color", "var(--color_j)");
					that.prev().attr("checked", "checked");
				}
				event.stopPropagation();
			}).prev().hide();
		});
	};
	$.radio($('.radio'));
	
	$.checkbox = function($ele_checkboxs) {
		$ele_checkboxs.each(function() {
			var width = $(this).attr("width");
			if (! $(this).attr("y")) {
				$(this).css({
					"display": "flex",
					"flex-wrap": "wrap"
				});
			}
			$(':checkbox + label', this).each(function() {
				// 取文本
				var that = $(this);
				that.css("display", "flex");
				that.css("font-size", "16px");
				that.css("line-height", "36px");
				var text = that.text();
				that.html('');
				
				// 加入图标
				var span1 = $("<span>");
				span1.css("width", "20px");
				span1.appendTo(that);
				var i = $("<i>");
				i.addClass("fa");
				i.addClass("fa-square-o");
				i.appendTo(span1);
				
				// 加入文本
				var span2 = $("<span>");
				span2.css("padding-right", "20px");
				span2.text(text);
				span2.appendTo(that);
				
				// 默认选中
				if (that.prev().is(':checked')) {
					i.removeClass("fa-square-o");
					i.addClass("fa-check-square-o");
					i.css("color", "var(--color_j)");
				}
			}).click(function(event) {
				var that = $(this);
				if (! that.prev().is(":disabled")) {
					var i = that.find("i");
					if(! that.prev().is(':checked')) {
						if (that.attr("all")) {
							var is = that.parent().find("i");
							is.each(function(){
								var thisI = $(this);
								thisI.removeClass("fa-square-o");
								thisI.addClass("fa-check-square-o");
								thisI.css("color", "var(--color_j)");
								thisI.parent().parent().prev().attr("checked", "checked");
							});
						} else {
							i.removeClass("fa-square-o");
							i.addClass("fa-check-square-o");
							i.css("color", "var(--color_j)");
							that.prev().attr("checked", "checked");
						}
					} else {
						i.removeClass("fa-check-square-o");
						i.addClass("fa-square-o");
						i.css("color", "");
						that.prev().attr("checked", null);
						var all = that.parent().find("label[all='true']");
						var alli = all.find("i");
						alli.removeClass("fa-check-square-o");
						alli.addClass("fa-square-o");
						alli.css("color", "");
						all.prev().attr("checked", null);
					}
					event.stopPropagation();
				}
			}).prev().hide();
		});
	};
	$.checkbox($('.checkbox'));

	$.checkboxVal = function(box) {
		var val = [];
		box.find("input:checkbox:checked").each(function(){
			val.push($(this).val());
		});
		return val;
	};
	
	$.imgKey;
	$.captcha = function(eles){
		eles.each(function(){
			// 用div包起来
			var div = $("<div>");
			div.css({
				"display": "flex", 
				"justify-content": "space-between"
			});
			$(this).wrap(div);

			// 添加img
			var img = $("<img>");
			img.css({
				"height": "36px",
				"margin-left": "5px"
			});
			$(this).after(img);
			
			img.on("click", function () {
				if (! $.imgKey) $.imgKey = $.uuid();
				img.attr("src", $.baseUrl + "captcha?imgKey=" + $.imgKey + "&r=" + new Date().getTime());
			});
			img.click();
		});
	};
	$.captcha($(".imgCaptcha"));	// img事件
});