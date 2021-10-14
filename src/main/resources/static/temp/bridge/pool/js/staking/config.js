$(function () {
	
	$.config = {
		chains : [
			{chain: "Dogethereum", coin: "DOGE", chainId: 518, projects: [
				{
					name: "Compensation Pool", 
					stake: {coin: "DOGE"}, 
					reward: {coin: "SDOG"}, 
					apy: "300%", 
					fee: "5%", 
					address: "0x6C9CB3aEF750D47C2656aCa8C6c136F443F28e74", 
					ref: "0x29C9eaE6609f14C268FDE31673F050Ca4241c5fE"
				}
			]}
			//{chain: "Ethereum", coin: "ETH", chainId: 1, projects: []},

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