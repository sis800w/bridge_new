$(function () {
	// init
	$.init = function() {
		$("#img_from").attr("src", $.logo($.config.swapCoin));
		if ($.config.swapCoin == $.config.fromChain.coin) {
			$("#img_from_chain").hide();
		} else {
			$("#img_from_chain").show();
			$("#img_from_chain").attr("src", $.logo($.config.fromChain.coin));
		}
		$("#img_to").attr("src", $.logo($.config.swapCoin));
		if ($.config.swapCoin == $.config.toChain.coin) {
			$("#img_to_chain").hide();
		} else {
			$("#img_to_chain").show();
			$("#img_to_chain").attr("src", $.logo($.config.toChain.coin));
		}
	};
	$.init();
	
	// input event
	var rate = 1;
	$("#input_from_amount").on('input', function() {
		var value = $(this).val().replace(/[^\d.]/g, '');			// clear not number & points
		value = value.replace(/\.{2,}/g,".");						// clear excess points
		value = value.replace(/^(\-)*(\d+)\.(\d{6}).*$/, '$1$2.$3');// decimals limit
		value = value == "." ? "" : value;
		$(this).val(value);
		$("#input_to_amount").val(value * rate);
	});
	$.inputFromAddrUpdate = function(walletAddress) {
		var inputFromAddr = $("#input_from_addr");
		inputFromAddr.val(walletAddress);
		inputFromAddr.attr("disabled", "disabled");
		inputFromAddr.change();
	};
	$.inputFromAddrChange = function() {
		if ($.config.fromChain.chainId > 0 && $.config.toChain.chainId > 0) {
			$("#input_to_addr").val($(this).val());
			$("#input_to_addr").attr("disabled", "disabled");
		}
	};
	$("#input_from_addr").on('input', $.inputFromAddrChange);
	$("#input_from_addr").on('change', $.inputFromAddrChange);
	
	// click event
	$(".div_from_btn").on('click', function(){
		$.showPopup("Swap from ...", function(content) {
			content.setTemplateElement("from_select_template");
			content.processTemplate($.config);
			content.find(".div_select_item").each(function(){
				var that = $(this);
				that.on('click', function(){
					for (var coin of $.config.coins) {
						if (coin == that.attr("coin")) {
							$.config.swapCoin = coin;
							$.init();
							$.hidePopup();
							break;
						}	
					}
				});
			});
		});
	});
	$(".div_to_btn").on('click', function(){
		$.showPopup("Swap to ...", function(content) {
			content.setTemplateElement("to_select_template");
			content.processTemplate($.config);
			content.find(".div_select_item").each(function(){
				var that = $(this);
				that.on('click', function(){
					for (var chain of $.config.chains) {
						if (chain.coin == that.attr("coin")) {
							$.config.toChain = chain;
							$.init();
							if ($.config.toChain.chainId <= 0) {
								$("#input_to_addr").val("");
								$("#input_to_addr").removeAttr("disabled");
							} else if ($.config.fromChain.chainId > 0) {
								$("#input_to_addr").val($("#input_from_addr").val());
								$("#input_to_addr").attr("disabled", "disabled");
							}
							$.hidePopup();
							break;
						}
					}
				});
			});
		});
	});
	$.bindSubmitEvent = function(callback) {
		$(".btn_submit").on('click', function() {
			// 获取currChainId
			// var data = {
			// 		paymentAddr: paymentAddr,
			// 		fromChain: $.config.fromChain.coin, 
			// 		toChain: $.config.toChain.coin,
			// 		fromAmount: fromAmount,
			// 		toAmount: toAmount,
			// 		fromAddr: fromAddr,
			// 		toAddr: toAddr
			// };
			// const currChainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
			if($.config.fromChain.coin == "EKTA"){
				$.queryPaymentAddr(function(paymentAddr){
					
					if(paymentAddr.length<5){
						$.toast('The maximum total for bridging EKTA this hour has been reached. Please try bridging your EKTA again next hour.', 2000);
						return;
					}
					
					var data = $.getSubmitData(paymentAddr);
					if (! data) return;
					// 判断是否>300
					if(data.toAmount > 300){
						// 提示 Your request is over the limit per transaction. Please retry your request with an amount that is equal to or less than 300 EKTA.
						$.toast('Your request is over the limit per transaction. Please retry your request with an amount that is equal to or less than 300 EKTA.', 2000);
						return;
					}
					callback(data);
				});
			} else {
				$.queryPaymentAddr(function(paymentAddr){
					var data = $.getSubmitData(paymentAddr);
					if (! data) return;
					callback(data);
				});
			}
			// console.log(paymentAddr);
			// $.queryPaymentAddr(function(paymentAddr){
			// 	var data = $.getSubmitData(paymentAddr);
			// 	if (! data) return;
			// 	callback(data);
			// });
		});
	};
	$.toast = function(msg,duration){
		duration=isNaN(duration)?3000:duration;
		      var m = document.createElement('div');
		      m.innerHTML = msg;
		      m.style.cssText="max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: rgb(255, 255, 255);line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
		      document.body.appendChild(m);
		      setTimeout(function() {
		        var d = 0.5;
		        m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
		        m.style.opacity = '0';
		        setTimeout(function() { document.body.removeChild(m) }, d * 1000);
		      }, duration);
	};
	$.bindQrcodeWindow = function() {
		$.bindSubmitEvent(function(data){
			$.showPopup("Scanning QR code ...", function(content) {
				content.setTemplateElement("qrcode_window_template");
				content.processTemplate($.config);
				
				// qrcode
				var addressQr = $('#address_qr');
				addressQr.html("");
				addressQr.qrcode({
					text: data.paymentAddr,
					width: 150,
					height: 150,
					correctLevel: 0,
					background: "rgba(71, 89, 101)",
				    foreground: "#32b1f5"
				});
				
				// text
				$("#span_amount").text(data.fromAmount);
				$("#input_paymentAddr").val(data.paymentAddr);
				$.copy('.btn_copy');
				
				// submit
				$(".btn_qrcode_submit").on('click', function(){
					$.submit(data);
				});
			});
		});
	};
});