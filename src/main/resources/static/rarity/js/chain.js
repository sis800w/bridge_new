$(function () {
	$.summon = function(_name, _race, _class, _gender, _ref) {
		$.tips("Summoning...");
		$.showOverlay();
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
	
	$.summoner = async function (tokenId, price, summoners) {
		let result = await $.mainContract.methods.summoner(tokenId).call();
		var obj = {
			tokenId: tokenId,
			price: $.fromWei(price, null, 18),
			name: result[0],
			clazz: result[1],
			race: result[2],
			gender: result[3],
			xp: Number(result[4]),
			level: Number(result[5]),
			adventurersLog: Number(result[6])
		};
		summoners.push(obj);
		$("#goods_body").setTemplateElement("goods_template");
		$("#goods_body").processTemplate(summoners);
	};
	
	$.getGoodsPage = async function(pageIdx, pageSize) {
		$.pageIdx = pageIdx;
		$.pageSize = pageSize;
		let result = await $.marketContract.methods.getGoodsPage(pageIdx, pageSize).call();
		var summoners = [];
		for (goods of result) {
			$.summoner(goods.tokenId, goods.price, summoners);
		}
	};
	
	$.isApprovedForAll = async function(owner, operator) {
		let result = await $.mainContract.methods.isApprovedForAll(owner, operator).call();
		if (result) {
			$("#open_list").show();
			$("#approve").hide();
		} else {
			$("#approve").show();
			$("#open_list").hide();
		}
	};
	
	$.setApprovalForAll = function (operator) {
		$.tips("Approve...");
		$.showOverlay();
		$.mainContract.methods
			.setApprovalForAll(operator, true)
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function() {
					$.hideTips();
					$.hidePopup();
					$("#approve").hide();
					$("#list").show();
				});
			});
	};
	
	$.list = function(tokenId, price) {
		$.tips("List...");
		$.showOverlay();
		price = $.toWei(price, null, 18);
		$.marketContract.methods
			.list(tokenId, price)
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function() {
					$.hideTips();
					$.hidePopup();
					$.getGoodsPage($.pageIdx, $.pageSize);
				});
			});
	};
});