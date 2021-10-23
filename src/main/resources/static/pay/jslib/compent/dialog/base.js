$(document).ready(function() {
	// 纯js使用
	$.base_dialog = function(content) {
		var $ele_div = $("<div>");
		$ele_div.addClass("base_dialog_text");
		$ele_div.html(content);
		$ele_div.appendTo($("body"));
		$ele_div.dialog({
			autoOpen: true,
			width: 300,
			modal: true,
			buttons: [{
				text: "确定",
				click: function() {
					$( this ).dialog( "close" );
				}
			}]
		});
	};
	
	// 纯js使用
	$.base_confirm = function(title, content, callback) {
		var $ele_div = $("<div>");
		$ele_div.addClass("base_dialog_text");
		$ele_div.attr("title", title);
		$ele_div.html(content);
		$ele_div.appendTo($("body"));
		$ele_div.dialog({
			autoOpen: true,
			width: 300,
			buttons: [{
				text: "确定",
				click: function() {
					callback($(this));
				}
			}, {
				text: "取消",
				click: function() {
					$( this ).dialog( "close" );
				}
			}]
		});
	};
	
	// js+html使用
	$.base_dialog_html = function(eles, title, callback) {
		eles.each(function(){
			var ele = $(this);
			ele.addClass("base_dialog_ele");
			ele.attr("title", title);
			ele.dialog({
				autoOpen: true,
				width: 400,
				buttons: [{
					text: "确定",
					click: function() {
						callback($(this));
					}
				}, {
					text: "取消",
					click: function() {
						$(this).dialog("close");
					}
				}]
			});
		});
	};
	
	// 简单使用：<div class="base_dialog" title="标题">内容</div>
	$(".base_dialog").each(function(){
		$(this).dialog();
	});
	
	// 复杂使用：
	/*
	 	html：
	 	<div class="dialog" title="标题">内容</div>
		
		js：
		$("#dialog").dialog({
			autoOpen: false,	//true-自动打开、false-不自动打开
			width: 400,
			buttons: [
				{
					text: "Ok",
					click: function() {
						$( this ).dialog( "close" );
					}
				},
				{
					text: "Cancel",
					click: function() {
						$( this ).dialog( "close" );
					}
				}
			]
		});
		//手动开：$("#dialog").dialog("open");
		//手动关：$("#dialog").dialog("close");
	*/
});