$(function () {
	
	$.config = {
		chains : [
			{chain: "Smart Chain", coin: "BNB", chainId: 56, projects: [
				{name: "Compensation Pool", stake: {coin: "BNB"}, reward: {coin: "DFC"}, apy: "500%", address: "0xe7f455382f8de2f463f989853262aa2200e634d9"}
				//,
				//{name: "Compensation Pool", stake: {coin: "DOGE", address: "0xba2ae424d960c26247dd6c32edc70b295c744c43", decimals: 8}, reward: {coin: "DFC"}, apy: "500%", address: "0xb7ca6e69D7d14aE9F068037F4B10Fb62F1DA8d18"},
				//{name: "Compensation Pool", stake: {coin: "USDT", address: "0x55d398326f99059ff775485246999027b3197955"}, reward: {coin: "DOGE", decimals: 8}, apy: "500%", address: "0xb7ca6e69D7d14aE9F068037F4B10Fb62F1DA8d17"}
			]},
			{chain: "Ethereum", coin: "ETH", chainId: 1, projects: []},
			{chain: "Doge Blockchain", coin: "DOGE", chainId: -3, projects: []},
			{chain: "DeFi Chain", coin: "DFC", chainId: 518, projects: []}
		]
	};
	
	// default from chain
	var chain = $.getParam("chain");
	if (! chain) {
		chain = $.getCookie("chain");
	}
	if (chain) {
		for (var currChain of $.config.chains) {
			if (chain == currChain.coin) {
				$.config.currChain = currChain;
				break;
			}
		}
	} else {
		$.config.currChain = $.config.chains[0];
	}
	$.setCookie("chain", $.config.currChain.coin);
});