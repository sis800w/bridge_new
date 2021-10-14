$(function () {
	// config
	$.config = {
		chains : [
			{chain: "Dogethereum", coin: "DOGE", chainId: 518, coins: {
			    DOGE: {},
				DOGECOIN: {address: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"},
				BNB: {address: "0xba2ae424d960c26247dd6c32edc70b295c744c43"},
				USDT: {address: "0x7d8f299A092fccFa0876E511786262c42a423598"},
				SDOG: {address: "0xBd90EfDf4c5543bc9be1033F84e1162E40F61365"}

			}},		
			{chain: "Doge Blockchain", coin: "DOGECOIN", chainId: -3, coins: {
				DOGECOIN: {},
				DOGE: {address: "0x3C8a7B3e97060Ad50E257ae2d27576bF53D9e10C"}

			}},
			{chain: "Smart Chain", coin: "BNB", chainId: 56, coins: {
				BNB: {},
				//DOGE: {address: "0xba2ae424d960c26247dd6c32edc70b295c744c43"},
				USDT: {address: "0x55d398326f99059ff775485246999027b3197955"},
				EKTA: {address: "0x2d2dc094218d9608dd2ca15eff8433d8fea0f1c5"},
				DOGE: {address: "0x2d2dc094218d9608dd2ca15eff8433d8fea0f1c5",decimals: 8}
			}},
			{chain: "Heco Chain", coin: "HT", chainId: 128, coins: {
				HT: {},
				DOGE: {address: "0x40280e26a572745b1152a54d1d44f365daa51618"}
			}},
			{chain: "Ethereum", coin: "ETH", chainId: 1, coins: {
				ETH: {},
				DOGE: {address: "0xba2ae424d960c26247dd6c32edc70b295c744c43"},
				HT: {address: "0x6f259637dcd74c767781e37bc6133cd6a68aa161"},
				USDT: {address: "0xdac17f958d2ee523a2206206994597c13d831ec7",decimals: 6}
			}},
			{chain: "Ekta Chain", coin: "EKTA", chainId: 998, coins: {
				EKTA: {}
			}}
		]
	};
	
	// default from chain
	var fromChain = $.getParam("fromChain");
	if (fromChain) {
		for (var chain of $.config.chains) {
			if (fromChain == chain.coin) {
				$.config.fromChain = chain;
				break;
			}
		}
	} else {
		$.config.fromChain = $.config.chains[0];
	}
	
	// default coins & swapCoin
	var coins = $.config.fromChain.coins;
	$.config.coins = coins == null ? [] : Object.keys(coins);
	$.config.swapCoin = $.config.coins[0];
	
	// default to chain
	$.changeTo = function() {
		if ($.config.coins.length > 1) {
			$.config.toChain = $.config.fromChain;
			for (var coin of $.config.coins) {
				if (coin != $.config.swapCoin) {
					$.config.toCoin = coin;
					break;
				}
			}
		} else {
			for (var chain of $.config.chains) {
				if (chain.coin != $.config.fromChain.coin && chain.coins[$.config.swapCoin] != null) {
					$.config.toChain = chain;
					break;
				}
			}
		}
	};
	$.changeTo();
});