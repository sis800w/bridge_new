$(function () {
	$.summon = function(_name, _race, _class, _gender, _ref) {
		$.tips("Summoning...");
		$.mainContract.methods
			.summon(_name, _race, _class, _gender, _ref)
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function() {
					$.hidePopup();
					$.hideTips();
				});
			});
	};
	
	$.approve = function() {
		$.tips("Approve...");
		$.erc20Contract.methods
			.approve($.MARKET_ADDR, $.toWei("100000000"))
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function(){
					$.tips("Success", 2000);
					$("#goods_body").find(".btn_buy").removeAttr("disabled");
					$("#buy_approve").hide();
				});
			});
	};
	
	$.summoner = async function (goods, summoners) {
		// query
		let result = await $.mainContract.methods.summoner(goods.tokenId).call();
		var obj = {
			tokenId: goods.tokenId,
			price: $.fromWei(goods.price),
			my: goods.owner.toLowerCase() == $.walletAddress ? true : false,
			name: result[0],
			clazz: result[1],
			race: result[2],
			gender: result[3],
			xp: Number(result[4]),
			level: Number(result[5]),
			adventurersLog: Number(result[6])
		};
		summoners.push(obj);
		
		// show & bind event
		$("#goods_body").setTemplateElement("goods_template");
		$("#goods_body").processTemplate(summoners);
		$.isApprovedErc20();
		$("#goods_body").find(".btn_buy").each(function() {
			var _this = $(this);
			_this.on('click', function(){
				var tokenId = _this.attr("tokenId");
				$.buy(tokenId);
			});
		});
	};
	
	$.getGoodsPage = async function(pageIdx, pageSize) {
		$.pageIdx = pageIdx;
		$.pageSize = pageSize;
		let result = await $.marketContract.methods.getGoodsPage(pageIdx, pageSize).call();
		var summoners = [];
		for (goods of result) {
			$.summoner(goods, summoners);
		}
	};
	
	$.isApprovedForAll = async function() {
		let result = await $.mainContract.methods.isApprovedForAll($.walletAddress, $.MARKET_ADDR).call();
		if (result) {
			$("#open_list").show();
			$("#sell_approve").hide();
		} else {
			$("#sell_approve").show();
			$("#open_list").hide();
		}
	};
	
	$.isApprovedErc20 = async function() {
		let result = await $.erc20Contract.methods.allowance($.walletAddress, $.MARKET_ADDR).call();
		var allowance = Number($.fromWei(result[0]));
		if (allowance > 0) {
			$("#goods_body").find(".btn_buy").removeAttr("disabled");
			$("#buy_approve").hide();
		} else {
			$("#goods_body").find(".btn_buy").attr("disabled", "disabled");
			$("#buy_approve").show();
		}
	};
	
	$.setApprovalForAll = function () {
		$.tips("Approve...");
		$.mainContract.methods
			.setApprovalForAll($.MARKET_ADDR, true)
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function() {
					$.tips("Success", 2000);
					$("#sell_approve").hide();
					$("#open_list").show();
				});
			});
	};
	
	$.list = function(tokenId, price) {
		$.tips("List...");
		price = $.toWei(price);
		$.marketContract.methods
			.list(tokenId, price)
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function() {
					$.tips("Success", 2000);
					$.hidePopup();
					$.getGoodsPage($.pageIdx, $.pageSize);
				});
			});
	};
	
	$.buy = function(tokenId) {
		$.tips("Buy...");
		$.marketContract.methods
			.buy(tokenId)
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function() {
					$.tips("Success", 2000);
					$.getGoodsPage($.pageIdx, $.pageSize);
				});
			});
	};
});