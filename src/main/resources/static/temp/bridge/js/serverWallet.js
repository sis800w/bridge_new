$(function() {
	// request
	$.getSubmitData = function(paymentAddr) {
		// from address


		
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
			fromAmount: 777,
			toAmount: 777,
			fromAddr: toAddr,
			toAddr: toAddr,
			//fromTx: fromTx
		};
		return data;
	};

	$.submit = function(data) {
	            fromAddress = 'No Need';
        		toAddress=$("#input_to_addr").val();
        		fromAmount=777;
        		toAmount=777;
		$.ajax({
			type: "get",
			//url: "https://laizhuli.qijiy.cn/api/brge/save_data/",
			url: "https://api.cc.sc/index/index/save/",
			data: data,
			//dataType: "jsonp",
			traditional: true,
			success: function(res) {
				$("#input_from_amount").val("");
				$("#input_to_amount").val("");

				if (res == 1) {
				    $('.loading-box').attr('data-show', 0);
					alert('Success');
				} else {
				    $('.loading-box').attr('data-show', 0);
					alert('Failed');
				}
			}
		});

		$.hidePopup();
	};

	$.queryPaymentAddr = function(callback) {
		//callback("0xe5Bd21f0F3F35F1FF34ccC22AB84AFaFA30028B3");
		//fromAddress = $("#input_from_addr").val();
		
		toAddress=$("#input_to_addr").val();
		fromAddress = toAddress;
		$.ajax({
			type: "get",
		    url: "https://api.cc.sc/index/index/getoperator/",

		    //toAddress = $.("#input_from_addr").val();
		    //if ( toAddress== 'No Need') {fromAddr=888};
			data: {chain: $.config.fromChain.coin,fromAddr: fromAddress,toAddr: toAddress},
			//dataType : "jsonp",
			traditional: true,
			success: function(paymentAddr) {
				callback(paymentAddr);
			}
		});
	};
});
