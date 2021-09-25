$(function(){
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
				$.dialog(error.message, 2000);
			}
		}
	};
	
	$.resultProcess = function(tx, callback) {
		$.waitForReceipt(tx.transactionHash, 6, (receipt) => {
			$.hideDialog();
			callback();
		});
	};
	
	$.waitForReceipt = async function(tx_hash, max_try, callback) {
		if (max_try <= 0) {
			$.dialog("Wait for receipt timeout", 2000);
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
	
	$.connectWallet = function(chain, callback, errorCallback, errorMsgTimeout, errorMsgAppend) {
		errorMsgTimeout = errorMsgTimeout ? errorMsgTimeout : 0;
		errorMsgAppend = errorMsgAppend ? ", " + errorMsgAppend : "";
		if (window.ethereum) {
			try {
				// connect wallet
				$.dialog("Connect Wallet...", 0, true);
				window.ethereum.enable().then(accounts => {
					$.hideDialog();
					$.web3 = new Web3(window.ethereum);
					
					// network changed
					window.ethereum.on("networkChanged", function (networkId) {
						location.reload();
					});
					
					// verify chainId
					$.web3.eth.getChainId().then(chainId => {
						if (chain.chainId == chainId) {
							// accounts changed
							window.ethereum.on("accountsChanged", function(accounts) {
								$.walletAddress = accounts[0];
								if (callback) callback();
							});
							
							// bind
							$.walletAddress = accounts[0];
							if (callback) callback();
						} else {
							$.dialog("Not in " + chain.chain.toLowerCase() + " network" + errorMsgAppend, errorMsgTimeout);
							if (errorCallback) errorCallback();
						}
					});
				});
			} catch (error) {
				$.dialog(error + errorMsgAppend, errorMsgTimeout);
			}
		} else {
			$.dialog("Not in dapp browser" + errorMsgAppend, errorMsgTimeout);
		}
	};
});