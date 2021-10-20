$(function () {
	
	$.config = {
		chains : [
			{name: "Doge Blockchain", nativeCurrencyName: "DOGE", chainId: -3, projects: []},
			{name: "Ethereum", nativeCurrencyName: "ETH", chainId: 1, projects: []},
			{name: "Smart Chain", nativeCurrencyName: "BNB", chainId: 56, projects: [
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
			{name: "Smart Chain - Testnet", nativeCurrencyName: "BNB", chainId: 97, projects: [
				{
					name: "ERC20挖原生", 
					stake: {name: "ERC20", address: "0xdB5556A2d8765BCE5f5c4b239A815D3C5d3eA812"}, 
					reward: {name: "BNB", address: "0x"}, 
					apy: "500%", 
					fee: "5%", 
					address: "0x3c34d8ce4Cd3c06dA69F80a349758E8Cf3094489", 
					ref: "0x9293aa9221C7eB219B702db5CA6B5986759C72F4"
				}, {
					name: "原生挖ERC20", 
					stake: {name: "BNB", address: "0x"}, 
					reward: {name: "ERC20", address: "0xdB5556A2d8765BCE5f5c4b239A815D3C5d3eA812"}, 
					apy: "500%", 
					fee: "5%", 
					address: "0xa289F8554c20d60a24fef660595477D24dfF9240", 
					ref: "0x9293aa9221C7eB219B702db5CA6B5986759C72F4"
				}, {
					name: "原生挖原生", 
					stake: {name: "BNB", address: "0x"}, 
					reward: {name: "BNB", address: "0x"}, 
					apy: "500%", 
					fee: "5%", 
					address: "0x57f84a35097C76D2Df6911EEd675240cc127Bb3B", 
					ref: "0x9293aa9221C7eB219B702db5CA6B5986759C72F4"
				}, {
					name: "ERC20挖ERC20", 
					stake: {name: "ERC20", address: "0xdB5556A2d8765BCE5f5c4b239A815D3C5d3eA812"}, 
					reward: {name: "TEST2", address: "0xc80af98BdD271B4c84FFf51a519CA400d72C8A10"}, 
					apy: "500%", 
					fee: "5%", 
					address: "0x0E792F672357CC90f151454a7Fc30bd5202a0F06", 
					ref: "0x9293aa9221C7eB219B702db5CA6B5986759C72F4"
				}
			]},
			{name: "DeFi Chain", nativeCurrencyName: "DFC", chainId: 518, projects: []},
			{name: "Routereum", nativeCurrencyName: "RDFC", chainId: 1000, projects: []}
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