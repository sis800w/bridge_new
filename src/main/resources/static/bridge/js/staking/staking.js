$(function(){
	$(".div_main").setTemplateElement("project_template");
	$(".div_main").processTemplate($.config.currChain);
	
	$.init = function() {
		var i = 0;
		$.user = [];
		$.dialog("query user info", 0, true);
		for (var project of $.config.currChain.projects) {
			$.queryUser(project, function(obj) {
				$.user[project.address] = obj;
				var div = $("#index_" + i);
				div.find(".stake_coin_balance").text(obj.stakedBalance);
				div.find(".reward_coin_balance").text(obj.rewardBalance);
				if (++i == $.config.currChain.projects.length - 1) $.hideDialog();
			});
		}
	};
	
	$.popupInit = function(content, project) {
		// show
		project.queryUser = $.user[project.address];
		content.setTemplateElement("details_template");
		content.processTemplate(project);
		if (project.queryUser.stakedAllowance == 0) {
			$("#tabs_withdraw").hide();
			$("#tabs_deposit").hide();
			$("#btn_deposit").hide();
			$("#btn_withdraw").hide();
		} else {
			$("#btn_withdraw").hide();
			$("#btn_approve").hide();
		}
		
		// bind event
		$("#input_amount").on('input', function(){
			var value = $(this).val();
			var max = $("#btn_max").attr("max");
			value = $.toAmount(value, max);
			$(this).val(value);
		});
		
		$("#btn_max").on('click', function(){
			var max = $(this).attr("max");
			if (max > 0) {
				$("#input_amount").val(max);
			} else {
				$.dialog("Insufficient balance", 2000);
			}
		});
		
		$("#btn_refresh").on('click', function(){
			$.dialog("query user info", 0, true);
			$.queryUser(project, function(obj){
				$.user[project.address] = obj;
				$.popupInit(content, project);
				$.hideDialog();
			});
		});
		
		$("#btn_claim").on('click', function(){
			$.deposit(project, "0", project.ref);
		});
		
		$("#tabs_deposit").on('click', function(){
			$("#tabs_withdraw").removeClass("span_method");
			$("#tabs_deposit").addClass("span_method");
			$("#btn_max").show();
			$("#btn_withdraw").hide();
			$("#btn_deposit").show();
			$("#input_amount").val("");
			$("#input_amount").removeAttr("disabled");
		});
		
		$("#tabs_withdraw").on('click', function(){
			$("#tabs_deposit").removeClass("span_method");
			$("#tabs_withdraw").addClass("span_method");
			$("#btn_max").hide();
			$("#btn_deposit").hide();
			$("#btn_withdraw").show();
			$("#input_amount").val(project.queryUser.amount);
			$("#input_amount").attr("disabled", "disabled");
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
	};
	
	$(".div_content").on('click', function(){
		var id = $(this).attr("id");
		var index = id.substring(id.indexOf("_") + 1, id.length);
		var project = $.config.currChain.projects[index];
		$.showPopup($(this).find("label").text(), function(content) {
			$.popupInit(content, project);
		});
	});
});