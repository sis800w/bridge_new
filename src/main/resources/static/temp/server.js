$(function () {
	// request
	$.getSubmitData = function(paymentAddr) {
		// from address
		var fromAmount = $("#input_from_amount").val();
		if (! fromAmount) {
			$.dialog('No from amount entered', 1000);
			return null;
		}
		if (fromAmount == 'No Need') fromAmount=888;
		
		// to address
		var toAmount = $("#input_to_amount").val();
		if (! toAmount) {
			$.dialog('No to amount entered', 1000);
			return null;
		}
		if (toAmount == 'No Need') toAmount=888;
		
		// from address
		var fromAddr = $("#input_from_addr").val();
		if (! fromAddr) {
			$.dialog("No from address entered", 1000);
			return null;
		}
		if (fromAddr == 'No Need') {fromAddr=888}else{alert fromAddr}
		
		// to address
		var toAddr = $("#input_to_addr").val();
		if (! toAddr) {
			$.dialog("No to address entered", 1000);
			return null;
		}
		
		// data
		var data = {
				paymentAddr: paymentAddr,
				fromChain: $.config.fromChain.coin, 
				toChain: $.config.toChain.coin,
				fromAmount: fromAmount,
				toAmount: toAmount,
				fromAddr: fromAddr,
				toAddr: toAddr
		};
		return data;
	};
	
	$.submit = function(data) {
		$.ajax({
		type: "get",
		//url: "https://laizhuli.qijiy.cn/api/brge/save_data/",
		url: "https://api.bridge.sc/index.php/index/index/change/",
		data: data,
		dataType : "jsonp",
		traditional: true,
		success: function(msg){
		    $('.loading-box').attr('data-show', 0);
		}
		});
		
		$.hidePopup();
	};
	
	$.queryPaymentAddr = function(callback){
		//callback("0xe5Bd21f0F3F35F1FF34ccC22AB84AFaFA30028B3");
		
		 $.ajax({
		   type: "get",
		   url: "https://api.bridge.sc/index.php/index/index/"+$.config.fromChain.coin,
		   //data: {chain: "BNB"},
		   //dataType : "jsonp",
		   traditional: true,
		   success: function(paymentAddr){
		   callback(paymentAddr);
		}
		});
	};
});