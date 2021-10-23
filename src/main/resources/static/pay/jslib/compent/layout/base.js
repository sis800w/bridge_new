$(function(){
	$("#base_layout_121").each(function(){
		// 标签
		var nav = $('#base_layout_121 #nav');
		var content = $('#base_layout_121 #content');
		var iframe = $('#base_layout_121 #content iframe');
		
		// 函数
		$.resize = function() {
			var height = $(window).height() - 72;
			nav.height(height);
			content.height(height);
			iframe.height(height - 4);
		};
		
		// 事件
		$(window).on('resize', function(){
			$.resize();
		});
		
		// 立即执行
		$.resize();
		iframe.attr("frameborder", "no");
		// iframe.attr("scrolling", "no");
	});
});