$(function () {
	var MAIN_ABI = [{"inputs":[{"internalType":"contract ERC20","name":"_stakedToken","type":"address"},{"internalType":"contract ERC20","name":"_rewardToken","type":"address"},{"internalType":"bool","name":"_isStakedERC20","type":"bool"},{"internalType":"bool","name":"_isRewardERC20","type":"bool"},{"internalType":"uint256","name":"_refRewardRate","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"tokenRecovered","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"AdminTokenRecovery","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"poolLimitPerUser","type":"uint256"}],"name":"NewPoolLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"rewardPerBlock","type":"uint256"}],"name":"NewRewardPerBlock","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_ref","type":"address"}],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"query_account","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"query_stake","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"query_summary","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_tokenAmount","type":"uint256"}],"name":"recoverWrongTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"refRewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rewardToken","outputs":[{"internalType":"contract ERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stakedToken","outputs":[{"internalType":"contract ERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_poolLimitPerUser","type":"uint256"}],"name":"updatePoolLimitPerUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_rewardPerBlock","type":"uint256"}],"name":"updateRewardPerBlock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"bool","name":"activated","type":"bool"},{"internalType":"address","name":"ref","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
	
	$.mainContract = function(project) {
		return new $.web3.eth.Contract(MAIN_ABI, project.address);
	};
	
	$.queryUser = async function(project, callback) {
		// query_stake
		let result = await $.mainContract(project).methods.query_stake($.walletAddress).call();
		var obj = {
			amount: Number($.fromWei(result[0]), project.stake.unit, project.stake.decimals),
			shares: Number($.fromWei(result[1]), project.stake.unit, project.stake.decimals),
			rewardDebt: Number($.fromWei(result[2]), project.stake.unit, project.stake.decimals),
			pendingReward: Number($.fromWei(result[3]), project.stake.unit, project.stake.decimals)
		};
		
		// query_account
		result = await $.mainContract(project).methods.query_account($.walletAddress).call();
		obj.activated = result[0] === "true" ? true : false;
		obj.ref = result[1];
		obj.balance = Number($.fromWei(result[2]));
		if (project.stake.address) {
			obj.stakedAllowance = Number($.fromWei(result[3], project.stake.unit, project.stake.decimals));
			obj.stakedBalance = Number($.fromWei(result[4], project.stake.unit, project.stake.decimals));
		} else {
			obj.stakedAllowance = -1;
			obj.stakedBalance = obj.balance;
		}
		if (project.reward.address) {
			obj.rewardBalance = Number($.fromWei(result[5], project.reward.unit, project.reward.decimals));
		} else {
			obj.rewardBalance = obj.balance;
		}
		callback(obj);
	};
	
	$.querySummary = async function(project, callback) {
		let result = await $.mainContract(project).methods.query_summary().call();
		var obj = {
			totalUsers: result[0],
            totalAmount: Number($.fromWei(result[1], project.stake.unit, project.stake.decimals)),
            totalShares: Number($.fromWei(result[2], project.stake.unit, project.stake.decimals)),
            lastRewardBlock: result[3], 
            accruedTokenPerShare: result[4],
            rewardPerBlock: Number($.fromWei(result[5], project.stake.unit, project.stake.decimals)),
            poolLimitPerUser: Number($.fromWei(result[6], project.stake.unit, project.stake.decimals)),
            minable: Number($.fromWei(result[7], project.stake.unit, project.stake.decimals)),
            blockNumber: result[8]
		};
		callback(obj);
	};
	
	$.approve = function(project) {
		$.tips("Approve...");
		$.coinContract($.config.currChain.chainId, project.stake.coin).methods
			.approve(project.address, $.toWei("100000000", project.stake.unit, project.stake.decimals))
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function(){
					$.hideTips();
				});
			});
	};
	
	$.deposit = function(project, amount, ref) {
		var amountWei = $.toWei(amount, project.stake.unit, project.stake.decimals);
		var sendParam = {from: $.walletAddress};
		if (! project.stake.address) {
			sendParam.value = amountWei;
		}
		$.tips("Deposit...");
		$.mainContract(project).methods
			.deposit(amountWei, ref)
			.send(sendParam, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function(){
					$.hideTips();
				});
			});
	};
	
	$.withdraw = function(project) {
		$.tips("Withdraw...");
		$.mainContract(project).methods
			.withdraw()
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function(){
					$.hideTips();
				});
			});
	};
	
});