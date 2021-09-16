$(function(){
	// base
	$.getParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return decodeURI(r[2]);
		} else {
			return "";
		}
	};
	
	$.dialog = function(msg, ms, lodding) {
		$(".div_loading div").text(msg);
		if (lodding) {
			$(".div_loading i").show();
		} else {
			$(".div_loading i").hide();
		}
		$(".div_loading").show();
		setTimeout(function () {
			$(".div_loading").hide();
		}, ms);
	};
	
	$.copy = function(selecter, successCallback) {
		if ($(selecter).length == 0) {
			return;
		}
		var clipboard = new ClipboardJS(selecter);
		clipboard.on('success', function(e) {
			$.dialog("Copy success", 1000);
			e.clearSelection();
		});
		clipboard.on('error', function(e) {
			$.dialog("Copy error", 1000);
		});
	};
	
	$.logo = function(coin){
		return "img/coin/" + coin + ".png";
	};
});