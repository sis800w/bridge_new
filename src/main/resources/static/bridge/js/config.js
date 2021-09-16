$(function () {
	// config
	$.config = {
		chains : [
			{chain: "Smart Chain", coin: "BNB", chainId: "0x38", coins: {
				BNB: {},
				DOGE: {address: "0xba2ae424d960c26247dd6c32edc70b295c744c43", decimals: 8},
				USDT: {address: "0x55d398326f99059ff775485246999027b3197955"}
			}},
			{chain: "Ethereum", coin: "ETH", chainId: "0x1", coins: {
				BNB: {},
				DOGE: {},
				USDT: {}
			}},
			{chain: "Doge Blockchain", coin: "DOGE", coins: {
				DOGE: {},
				BNB: {},
				USDT: {}
			}},
			{chain: "DeFi Chain", coin: "DFC", chainId: "", coins: {
				BNB: {},
				DOGE: {},
				USDT: {}
			}},
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
	for (var chain of $.config.chains) {
		if (chain.coin != $.config.fromChain.coin && chain.coins[$.config.swapCoin] != null) {
			$.config.toChain = chain;
			break;
		}
	}
});