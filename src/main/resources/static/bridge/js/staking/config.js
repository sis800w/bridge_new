$(function () {
	
	$.config = {
		chains : [
			{name: "Smart Chain", chainId: 56, projects: [
				{
					name: "Compensation Pool", 
					stake: {name: "BNB", address: "0x"}, 
					reward: {name: "DFC", address: "0x6bb1425890bf7176d26b474a4099fd05a89566b2", unit: "Mwei"}, 
					apy: "500%", 
					fee: "5%", 
					address: "0xe7f455382f8de2f463f989853262aa2200e634d9", 
					ref: "0xb1212021F60cD24b2A40d9f9A052539D88fcf958"
				}, {
					name: "Compensation Pool", 
					stake: {name: "DOGE", address: "0xba2ae424d960c26247dd6c32edc70b295c744c43", decimals: 8}, 
					reward: {name: "DFC", address: "0x6bb1425890bf7176d26b474a4099fd05a89566b2", unit: "Mwei"}, 
					apy: "500%", 
					fee: "5%", 
					address: "0xe7f455382f8de2f463f989853262aa2200e634d9", 
					ref: "0xb1212021F60cD24b2A40d9f9A052539D88fcf958"
				}, {
					name: "Compensation Pool", 
					stake: {name: "USDT", address: "0x55d398326f99059ff775485246999027b3197955"}, 
					reward: {name: "DOGE", address: "0xba2ae424d960c26247dd6c32edc70b295c744c43", decimals: 8}, 
					apy: "500%", 
					fee: "5%", 
					address: "0xe7f455382f8de2f463f989853262aa2200e634d9", 
					ref: "0xb1212021F60cD24b2A40d9f9A052539D88fcf958"
				}
			]},
			{name: "Ethereum", chainId: 1, projects: []},
			{name: "Doge Blockchain", chainId: -3, projects: []},
			{name: "DeFi Chain", chainId: 518, projects: []}
		]
	};
	
	// default from chain
	var chain = $.getParam("chain");
	if (! chain) {
		chain = $.getCookie("chain");
	}
	if (chain) {
		for (var currChain of $.config.chains) {
			if (Number(chain) == currChain.chainId) {
				$.config.currChain = currChain;
				break;
			}
		}
	} else {
		$.config.currChain = $.config.chains[0];
	}
	$.setCookie("chain", $.config.currChain.chainId + "");
});