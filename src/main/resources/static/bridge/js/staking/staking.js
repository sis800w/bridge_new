$(function(){
	$(".div_main").setTemplateElement("project_template");
	$(".div_main").processTemplate($.config.currChain);
	
	$.init = function() {
		for (var project of $.config.currChain.projects) {
			$.queryUser(project, function(obj){
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
			$.queryUser(project, function(obj){
				project.queryAccount = obj;
				content.setTemplateElement("details_template");
				content.processTemplate(project);
				
				if (obj.stakedAllowance == 0) {
					$("#btn_deposit").hide();
					$("#btn_withdraw").hide();
					$("#btn_approve").show();
				} else {
					$("#btn_withdraw").hide();
					$("#btn_approve").hide();
					$("#btn_deposit").show();
				}
				
				$("#input_amount").on('input', function(){
					
				});
				
				$("#btn_max").on('click', function(){
					
				});
				
				$("#btn_refresh").on('click', function(){
					
				});
				
				$("#btn_claim").on('click', function(){
					
				});
				
				$("#tabs_deposit").on('click', function(){
					
				});
				
				$("#tabs_withdraw").on('click', function(){
					
				});
				
				$("#btn_approve").on('click', function(){
					$.approve(project);
				});
				
				$("#btn_deposit").on('click', function(){
					// amount
					var amount = $("#input_amount").val();
					if (! amount) {
						$.dialog("amount is null", 2000);
						return;
					}
					
					// ref
					var ref = $.getParam("ref");
					if (ref && ref != ""){
						if(! $.web3.utils.isAddress(ref)){
							$.dialog("referrer address error", 2000);
							return;
						}
					} else {
						ref = project.ref;
					}
					$.deposit(project, amount, ref);
				});
				
				$("#btn_withdraw").on('click', function(){
					$.withdraw(project);
				});
			});
		});
	});
});