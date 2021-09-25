$(function(){
	$(".div_main").setTemplateElement("project_template");
	$(".div_main").processTemplate($.config.currChain);
	
	$.init = function() {
		for (var project of $.config.currChain.projects) {
			$.queryAccount(project, function(obj){
				var div = $("#" + project.address);
				div.find(".stake_coin_balance").text(obj.stakedBalance);
				div.find(".reward_coin_balance").text(obj.rewardBalance);
			});
		}
	};
	
	$(".div_content").on('click', function(){
		var project;
		for (project of $.config.currChain.projects) {
			if (project.address == $(this).attr("id")) {
				break;
			}
		}
		$.showPopup($(this).find("label").text(), function(content) {
			content.setTemplateElement("details_template");
			content.processTemplate(project);
		});
	});
});