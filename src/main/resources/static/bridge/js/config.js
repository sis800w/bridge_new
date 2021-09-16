$(function () {
	// config
	$.config = {
		chains : [
			{chain: "Smart Chain", coin: "BNB", chainId: "0x38", addresses: {
				BNB: "",
				DOGE: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
				USDT: "0x55d398326f99059ff775485246999027b3197955"
			}},
			{chain: "Ethereum", coin: "ETH", chainId: "0x1", addresses: {
				BNB: "",
				DOGE: "",
				USDT: ""
			}},
			{chain: "Doge Blockchain", coin: "DOGE", addresses: {
				DOGE: "",
				BNB: "",
				USDT: ""
			}},
			{chain: "DeFi Chain", coin: "DFC", chainId: "", addresses: {
				BNB: "",
				DOGE: "",
				USDT: ""
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
	var addrs = $.config.fromChain.addresses;
	$.config.coins = addrs == null ? [] : Object.keys(addrs);
	$.config.swapCoin = $.config.coins[0];
	
	// default to chain
	for (var chain of $.config.chains) {
		if (chain.coin != $.config.fromChain.coin && chain.addresses[$.config.swapCoin] != null) {
			$.config.toChain = chain;
			break;
		}
	}
});