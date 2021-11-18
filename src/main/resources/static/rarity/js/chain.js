$(function () {
	$.summon = function(_name, _race, _class, _gender, _ref) {
		$.mainContract.methods
			.summon(_name, _race, _class, _gender, _ref)
			.send({from: $.walletAddress}, $.errorProcess)
			.then((tx) => {
				$.resultProcess(tx, function() {
					
				});
			});
	};
	
});