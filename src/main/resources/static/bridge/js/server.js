$(function () {
	
	// uuid
	$.uuid = function () {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
	};
	
	$.applyPayment = function(callback) {
		// from address
		var fromAmount = $("#input_from_amount").val();
		if (! fromAmount) {
			$.dialog('No from amount entered', 1000);
			return null;
		}
		
		// to address
		var toAmount = $("#input_to_amount").val();
		if (! toAmount) {
			$.dialog('No to amount entered', 1000);
			return null;
		}
		
		// from address
		var fromAddr = $("#input_from_addr").val();
		if (! fromAddr) {
			$.dialog("No from address entered", 1000);
			return null;
		}
		
		// to address
		var toAddr = $("#input_to_addr").val();
		if (! toAddr) {
			$.dialog("No to address entered", 1000);
			return null;
		}
		
		// data
		var data = {
				fromChain: $.config.fromChain.chainId, 
				toChain: $.config.toChain.chainId,
				fromAmount: fromAmount,
				toAmount: toAmount,
				fromAddr: fromAddr,
				toAddr: toAddr,
				applyTime: new Date().getTime()
		};
		
		// 去掉注释后删除
		data.key = $.uuid();
		data.paymentAddr = "0xe5Bd21f0F3F35F1FF34ccC22AB84AFaFA30028B3";
		callback(data);
		
		//$.ajax({
		// 	type: "post",
		// 	url: "/api/applyPayment",
		// 	data: data,
		// 	dataType : "jsonp",
		// 	traditional: true,
		// 	success: function(msg){
		// 		if (msg.success) {
		// 			data.key = msg.data.key;
		// 			data.paymentAddr = msg.data.paymentAddr;
		// 			callback(data);
		// 		} else {
		// 			console.log(msg);
		// 			$.dialog(msg.errorMessage, 2000);
		// 		}
		// 	}
		//});
	};
	
	$.confirmPayment = function(key, txHash) {
		var data = {
			key: key,
			confirmTime: new Date().getTime()
		};
		if (txHash) {
			data.txHash = txHash; 
		}
		
		// 去掉注释后删除
		$.hidePopup();
		$.hideDialog();
		
		//$.ajax({
		// 	type: "post",
		// 	url: "/api/confirmPayment",
		// 	data: data,
		// 	dataType : "jsonp",
		// 	traditional: true,
		// 	success: function(msg){
		// 		if (msg.success) {
		// 			$.hidePopup();
		//			$.hideDialog();
		// 		} else {
		// 			console.log(msg);
		// 			$.dialog(msg.errorMessage, 2000);
		// 		}
		// 	}
		//});
	};

});