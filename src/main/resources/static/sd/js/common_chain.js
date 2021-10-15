$(function(){
	const networks = {
		1: [{
			chainId: '0x1'
		}],
		3: [{	// Ropsten 测试网络
			chainId: '0x3'
		}],
		4: [{	// Rinkeby 测试网络
			chainId: '0x4'
		}],
		5: [{	// Goerli 测试网络
			chainId: '0x5'
		}],
		42: [{	// Kovan 测试网络
			chainId: '0x2a'
		}],
		56: [{
			chainId: '0x38',
			chainName: 'Binance Smart Chain',
			nativeCurrency: {
				name: 'BNB',
				symbol: 'BNB',
				decimals: 18
			},
			rpcUrls: ['https://bsc-dataseed.binance.org/'],
			blockExplorerUrls: ['https://bscscan.com/']
		}],
		97: [{
			chainId: '0x61',
			chainName: 'Binance Smart Chain - Testnet',
			nativeCurrency: {
				name: 'BNB',
				symbol: 'BNB',
				decimals: 18
			},
			rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
			blockExplorerUrls: ['https://testnet.bscscan.com']
		}],
		128: [{
			chainId: '0x80',
			chainName: 'Heco',
			nativeCurrency: {
				name: 'HT',
				symbol: 'HT',
				decimals: 18
			},
			rpcUrls: ['https://http-mainnet.hecochain.com/'],
			blockExplorerUrls: ['https://scan.hecochain.com']
		}]
	};
	
	$.toAmount = function(value, max) {
		value = value == "." ? "" : value;
		value = value == "00" ? "0" : value;
		value = value.indexOf(".") == value.lastIndexOf(".") ? value : value.substring(0, value.lastIndexOf("."));
		value = value.replace(/[^\d.]/g, '');						// clear not number & points
		value = value.replace(/^(\-)*(\d+)\.(\d{6}).*$/, '$1$2.$3');// decimals limit
		value = Number(value) >= 10000000000 ? "9999999999.999999" : value;
		if (max) {
			value = Number(max) < Number(value) ? max : value;
			if (Number(max) == 0) {
				value = "";
				$.tips("Insufficient balance", 2000);
			}
		}
		return value;
	};
	
	$.fromWei = function(amount, decimals) {
		if (decimals) {
			return $.floatDiv(amount, Math.pow(10, decimals));
		} else {
			return $.web3.utils.fromWei(amount);
		}
	};
	
	$.toWei = function(amount, decimals) {
		if (decimals) {
			return $.floatMul(amount, Math.pow(10, decimals));
		} else {
			return $.web3.utils.toWei(amount);
		}
	};
	
	$.errorProcess = function(error){
		if (error) {
			if (error.code == 4001) {
				$.tips(error.message, 2000);
			}
		}
	};
	
	$.resultProcess = function(tx, callback) {
		$.waitForReceipt(tx.transactionHash, 6, (receipt) => {
			$.hideTips();
			callback();
		});
	};
	
	$.waitForReceipt = async function(tx_hash, max_try, callback) {
		if (max_try <= 0) {
			$.tips("Wait for receipt timeout", 2000);
			return;
		}
		let receipt = await $.web3.eth.getTransactionReceipt(tx_hash);
		if (receipt != null) {
			callback(receipt);
		} else {
			await $.sleep(1500);
			$.waitForReceipt(tx_hash, max_try - 1, callback);
		}
	};
	
	$.switchNetwork = async function(chainId) {
		var data = networks[chainId];
		if (data[0].rpcUrls) {
			await window.ethereum.request({method: 'wallet_addEthereumChain', params: data}).catch();
		} else {
			await window.ethereum.request({method: 'wallet_switchEthereumChain', params: data}).catch();
		}
	};
	
	$.connectWallet = function(chain, callback, errorCallback, errorMsgTimeout, errorMsgAppend) {
		errorMsgTimeout = errorMsgTimeout ? errorMsgTimeout : 0;
		errorMsgAppend = errorMsgAppend ? ", " + errorMsgAppend : "";
		if (window.ethereum) {
			try {
				// connect wallet
				$.lodding("Connect Wallet...", 0, true);
				window.ethereum.enable().then(accounts => {
					$.hideLodding();
					$.web3 = new Web3(window.ethereum);
					
					// network changed
					window.ethereum.on("networkChanged", function (networkId) {
						location.reload();
					});
					
					// verify chainId
					$.web3.eth.getChainId().then(chainId => {
						if (chain.id == chainId) {
							// accounts changed
							window.ethereum.on("accountsChanged", function(accounts) {
								$.walletAddress = accounts[0];
								if (callback) callback();
							});
							
							// bind
							$.walletAddress = accounts[0];
							if (callback) callback();
						} else {
							$.switchNetwork(chain.id);
							$.tips("Not in \"" + chain.name.toLowerCase() + "\"  network" + errorMsgAppend, errorMsgTimeout);
							if (errorCallback) errorCallback();
						}
					});
				});
			} catch (error) {
				$.tips(error + errorMsgAppend, errorMsgTimeout);
				if (errorCallback) errorCallback();
			}
		} else {
			$.tips("Not in dapp browser" + errorMsgAppend, errorMsgTimeout);
			if (errorCallback) errorCallback();
		}
	};
	
});