$(function () {
	$.config = {
		chains : {
			"-3": {name: "Doge Blockchain", coins: {
				"0x": {name: "DOGE"}
			}},
			"1": {name: "Ethereum", coins: {
				"0x": {name: "ETH"},
				"0xdac17f958d2ee523a2206206994597c13d831ec7": {name: "USDT", unit: "Mwei"}
			}},
			"56": {name: "Smart Chain", coins: {
				"0x": {name: "BNB"},
				"0xba2ae424d960c26247dd6c32edc70b295c744c43": {name: "DOGE", decimals: 8},
				"0x55d398326f99059ff775485246999027b3197955": {name: "USDT"},
				"0x6bb1425890bf7176d26b474a4099fd05a89566b2": {name: "DFC", unit: "Mwei"}
			}},
			"518": {name: "DeFi Chain", coins: {
				"0x": {name: "DFC"},
				"0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C": {name: "WDOGE"},
				"0x7d8f299A092fccFa0876E511786262c42a423598": {name: "USDT"},
				"0xBd90EfDf4c5543bc9be1033F84e1162E40F61365": {name: "SDOG"}
			}},
			"1000": {name: "Routereum", coins: {
				"0x": {name: "RDFC"},
				"0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C": {name: "DFC"},
				"0x7d8f299A092fccFa0876E511786262c42a423598": {name: "USDT"},
				"0x6Bf654F5873AAeCaee75e328B7977c256D906829": {name: "SDOG"}
			}}
		},
		pairs : [
			[		// 1ETH : 1USDT
				{chain: "1", coin: "0x"},
				{chain: "1", coin: "0xdac17f958d2ee523a2206206994597c13d831ec7"}
			],  [	// 56BNB : 56DOGE
				{chain: "56", coin: "0x"},
				{chain: "56", coin: "0xba2ae424d960c26247dd6c32edc70b295c744c43"}
			],[		// 56BNB : 56USDT
				{chain: "56", coin: "0x"},
				{chain: "56", coin: "0x55d398326f99059ff775485246999027b3197955"}
			],[		// 56BNB : 56DFC
				{chain: "56", coin: "0x"},
				{chain: "56", coin: "0x6bb1425890bf7176d26b474a4099fd05a89566b2"}
			], [	// 56DOGE : 56USDT
				{chain: "56", coin: "0xba2ae424d960c26247dd6c32edc70b295c744c43"},
				{chain: "56", coin: "0x55d398326f99059ff775485246999027b3197955"}
			], [	// 56DOGE : 56DFC
				{chain: "56", coin: "0xba2ae424d960c26247dd6c32edc70b295c744c43"},
				{chain: "56", coin: "0x6bb1425890bf7176d26b474a4099fd05a89566b2"}
			], [	// 56USDT : 56DFC
				{chain: "56", coin: "0x55d398326f99059ff775485246999027b3197955"},
				{chain: "56", coin: "0x6bb1425890bf7176d26b474a4099fd05a89566b2"}
			], [	// 518DFC : 518WDOGE
				{chain: "518", coin: "0x"},
				{chain: "518", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"}
			], [	// 518DFC : 518USDT
				{chain: "518", coin: "0x"},
				{chain: "518", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			], [	// 518DFC : 518SDOG
				{chain: "518", coin: "0x"},
				{chain: "518", coin: "0xBd90EfDf4c5543bc9be1033F84e1162E40F61365"}
			], [	// 518WDOGE : 518USDT
				{chain: "518", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"},
				{chain: "518", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			], [	// 518WDOGE : 518SDOG
				{chain: "518", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"},
				{chain: "518", coin: "0xBd90EfDf4c5543bc9be1033F84e1162E40F61365"}
			], [	// 518USDT : 518SDOG
				{chain: "518", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"},
				{chain: "518", coin: "0xBd90EfDf4c5543bc9be1033F84e1162E40F61365"}
			], [	// 1000RDFC : 1000DFC
				{chain: "1000", coin: "0x"},
				{chain: "1000", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"}
			],[		// 1000RDFC : 1000USDT
				{chain: "1000", coin: "0x"},
				{chain: "1000", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			],[		// 1000RDFC : 1000SDOG
				{chain: "1000", coin: "0x"},
				{chain: "1000", coin: "0x6Bf654F5873AAeCaee75e328B7977c256D906829"}
			], [	// 1000DFC : 1000USDT
				{chain: "1000", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"},
				{chain: "1000", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			],[		// 1000DFC : 1000SDOG
				{chain: "1000", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"},
				{chain: "1000", coin: "0x6Bf654F5873AAeCaee75e328B7977c256D906829"}
			],[		// 1000USDT : 1000SDOG
				{chain: "1000", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"},
				{chain: "1000", coin: "0x6Bf654F5873AAeCaee75e328B7977c256D906829"}
			], [	// 1USDT : 56USDT
				{chain: "1", coin: "0xdac17f958d2ee523a2206206994597c13d831ec7"},
				{chain: "56", coin: "0x55d398326f99059ff775485246999027b3197955"}
			], [	// 1USDT : 518USDT
				{chain: "1", coin: "0xdac17f958d2ee523a2206206994597c13d831ec7"},
				{chain: "518", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			], [	// 1USDT : 1000USDT
				{chain: "1", coin: "0xdac17f958d2ee523a2206206994597c13d831ec7"},
				{chain: "1000", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"},
			], [	// 56USDT : 518USDT
				{chain: "56", coin: "0x55d398326f99059ff775485246999027b3197955"},
				{chain: "518", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			], [	// 56USDT : 1000USDT
				{chain: "56", coin: "0x55d398326f99059ff775485246999027b3197955"},
				{chain: "1000", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			], [	// 518USDT : 1000USDT
				{chain: "518", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"},
				{chain: "1000", coin: "0x7d8f299A092fccFa0876E511786262c42a423598"}
			], [	// -3DOGE : 56DOGE
				{chain: "-3", coin: "0x"},
				{chain: "56", coin: "0xba2ae424d960c26247dd6c32edc70b295c744c43"}
			], [	// 56DFC : 518DFC
				{chain: "56", coin: "0x6bb1425890bf7176d26b474a4099fd05a89566b2"},
				{chain: "518", coin: "0x"},
			], [	// 56DFC : 1000DFC
				{chain: "56", coin: "0x6bb1425890bf7176d26b474a4099fd05a89566b2"},
				{chain: "1000", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"}
			], [	// 518DFC : 1000DFC
				{chain: "518", coin: "0x"},
				{chain: "1000", coin: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"}
			], [	// 518SDOG : 1000SDOG
				{chain: "518", coin: "0xBd90EfDf4c5543bc9be1033F84e1162E40F61365"},
				{chain: "1000", coin: "0x6Bf654F5873AAeCaee75e328B7977c256D906829"}
			]
		]
	};
	
	// param
	var fromCoin = $.getParam("fromCoin");
	var fromChain = $.getParam("fromChain");
	if (! fromChain) fromChain = $.getCookie("chain");
	
	// default from/to
	$.updateFromTo = function(fromChain, fromCoin) {
		for(var pair of $.config.pairs) {
			if ((! fromChain || pair[0].chain == fromChain) && (! fromCoin || pair[0].coin == fromCoin)) {
				$.config.from = pair[0];
				$.config.to = pair[1];
				break;
			}
			if ((! fromChain || pair[1].chain == fromChain) && (! fromCoin || pair[1].coin == fromCoin)) {
				$.config.from = pair[1];
				$.config.to = pair[0];
				break;
			}
		}
	};
	$.updateFromTo(fromChain, fromCoin);
	
	// Cookie & No pair
	if ($.config.from) {
		$.setCookie("chain", $.config.from.chain);
	} else {
		$.tips("The current chain has no trading pairs");
		return;
	}
	
	// default from list
	var fromMap = {};
	for(var pair of $.config.pairs) {
		if (pair[0].chain == $.config.from.chain) {
			fromMap[pair[0].chain + "_" + pair[0].coin] = pair[0];
		}
		if (pair[1].chain == $.config.from.chain) {
			fromMap[pair[1].chain + "_" + pair[1].coin] = pair[1];
		}
	}
	$.config.fromList = Object.values(fromMap);
	
	// default to list
	$.updateToList = function() {
		$.config.toList = [];
		var toMap = {};
		for(var pair of $.config.pairs) {
			if (pair[0].chain == $.config.from.chain && pair[0].coin == $.config.from.coin) {
				toMap[pair[1].chain + "_" + pair[1].coin] = pair[1];
			} else if (pair[1].chain == $.config.from.chain && pair[1].coin == $.config.from.coin) {
				toMap[pair[0].chain + "_" + pair[0].coin] = pair[0];
			}
		}
		$.config.toList = Object.values(toMap);
	};
	$.updateToList();
	
});