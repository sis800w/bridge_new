$(function(){
	$.lodding = function(msg) {
		$.hideTips();
		var id = "lodding";
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
		$('#lodding').hide();
	};
	
	$.dialog = function(msg, ms) {
		$.hideTips();
		var id = "dialog";
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
			
			// icon
			var icon = $("<i>");
			icon.addClass("fa");
			icon.addClass("fa-spinner");
			icon.addClass("fa-pulse");
			icon.addClass("fa-3x");
			icon.addClass("fa-fw");
			icon.appendTo(dialog);
			
			// text
			var text = $("<div>");
			text.css("margin-top", "8px");
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
		$('#dialog').hide();
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
	
	$.floatMul = function (arg1, arg2) {
		var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length;
		} catch(e) {}
		try {
			m += s2.split(".")[1].length;
		} catch(e) {}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
	};
	
	$.floatDiv = function (arg1, arg2) {
		var t1 = 0, t2 = 0, r1, r2;    
		try {
			t1 = arg1.toString().split(".")[1].length;
		} catch(e) {}
		try {
			t2 = arg2.toString().split(".")[1].length;
		} catch(e) {}
		with(Math) {
			r1 = Number(arg1.toString().replace(".", ""));
			r2 = Number(arg2.toString().replace(".", ""));
			return (r1 / r2) * pow(10, t2 - t1);
		}
	};
	
	$.sleep = function(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	};
	
});