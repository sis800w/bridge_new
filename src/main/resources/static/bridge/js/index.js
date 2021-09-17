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
			$.queryPaymentAddr(function(paymentAddr){
				var data = $.getSubmitData(paymentAddr);
				if (! data) return;
				callback(data);
			});
		});
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
				$("#input_paymentAddr").val(data.paymentAddr);
				$.copy('.btn_copy');
			});
		});
	};
});