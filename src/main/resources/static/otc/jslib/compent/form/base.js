$(function(){
	// 按钮（自定义样式）
	$.base_btn = function($ele_buttons, clickCallback){
		$ele_buttons.each(function() {
			var _this = $(this);
			
			//绑定事件-点击回调
			if (clickCallback) {
				_this.bind({
					'click' : function() {
						clickCallback(_this);
					}
				});
				return;
			}
			
			//绑定事件-点击跳转
			var href = _this.attr("href");
			if (href) {
				_this.bind({
					'click' : function() {
						window.location.href=href;
					}
				});
			}
		});
	};
	$.base_btn($('.base_btn'), null);
	
	
	
	// 单选框
	$.base_radio = function($ele_radio) {
		$ele_radio.each(function() {
			$(':radio + label', this).each(function() {
				$(this).addClass('base_radio_item');
				if ($(this).prev().is(":checked")) {
					$(this).addClass('base_radio_item_checked');
				}
			}).click(function(event) {
				$(this).siblings().removeClass("base_radio_item_checked");
				$(this).siblings().attr("checked", null);
				if (! $(this).prev().is(':checked')) {
					$(this).addClass("base_radio_item_checked");
					$(this).prev().attr("checked", "checked");
				}
				event.stopPropagation();
			}).prev().hide();
		});
	};
	$.base_radio($('.base_radio'));
	
	
	
	// 模拟多选框
	$.base_checkbox = function($ele_checkboxs) {
		$ele_checkboxs.each(function() {
			$(':checkbox + label', this).each(function() {
				$(this).addClass('base_checkbox_item');
				if (! $(this).prev().is(":disabled")) {
					if ($(this).prev().is(':checked')) {
						$(this).addClass("base_checkbox_item_checked");
					}
				} else {
					if ($(this).prev().is(':checked')) {
						$(this).addClass("base_checkbox_item_disabled_checked");
					} else {
						$(this).addClass("base_checkbox_item_disabled");
					}
				}
			}).click(function(event) {
				if (! $(this).prev().is(":disabled")) {
					if(! $(this).prev().is(':checked')) {
						$(this).addClass("base_checkbox_item_checked");
						$(this).prev().attr("checked", "checked");
					} else {
						$(this).removeClass('base_checkbox_item_checked');			
						$(this).prev().attr("checked", null);
					}
					event.stopPropagation();
				}
			}).prev().hide();
		});
	};
	$.base_checkbox($('.base_checkbox'));

	// 模拟多选框-全选
	$(".base_checkbox_all_select").each(function() {
		$(this).click(function() {
			$("input + label[class=base_checkbox_item]").each(function() {
				$(this).click();
			});
		});
	});
	
	// 模拟多选框-反选
	$(".base_checkbox_re_select").each(function() {
		$(this).click(function() {
			$(":checkbox + label").each(function() {
				$(this).click();
			});
		});
	});
	
	
	
	// 日期输入框
	$.base_date = function($ele_dates) {
		$ele_dates.each(function() {
			$(this).asDatepicker({
				namespace: 'calendar',
				lang: 'zh',
				position: 'bottom'
			});
		});
	};
	$.base_date($(".base_date"));

	// 日期输入框-日期范围
	$.base_date_range = function($ele_dates) {
		$ele_dates.each(function() {
			$(this).asDatepicker({
				mode: 'range',
				lang: 'zh'
			});
		});
	};
	$.base_date_range($(".base_date_range"));
});