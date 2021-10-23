$(function () {
	document.addEventListener("gesturestart", function (event) {
		event.preventDefault();
	});
	
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
	
	$.copy = function(selecter) {
		if ($(selecter).length == 0) {
			return;
		}
		var clipboard = new ClipboardJS(selecter);
		clipboard.on('success', function(e) {
			$.dialog("Copy success");
			e.clearSelection();
		});
		clipboard.on('error', function(e) {
			$.dialog("Copy error");
		});
	};
	$.copy(".copy");
	
	$.dialog = function(txt){
		$.hide();
		$('tip').find("span").text(txt);
		$('tip').show();
	};
	
	$.loading = function(txt){
		$.hide();
		$("#loading_txt").html(txt);
		$('.power-pop').show();
	};
	
	$.hide = function() {
		$('tip').hide();
		$('.power-pop').hide();
	};
	
	$.waitForReceipt = async function(tx_hash, max_try, callback) {
		if (max_try <= 0) {
			$.dialog("Wait for receipt timeout", 2000);
			return;
		}
		let receipt = await $.web3.eth.getTransactionReceipt(tx_hash);
		if (receipt != null) {
			callback(receipt);
		} else {
			await $.sleep(1500);
			$.waitForReceipt(tx_hash, max_try - 1, callback);
		}
	};
	
	$.sleep = function(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	};
	
});