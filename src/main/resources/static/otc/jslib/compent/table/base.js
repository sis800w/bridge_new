$(document).ready(function() {
	$.base_table = function ($ele_tables, template, data) {
		$ele_tables.each(function () {
			// 模板套数据
			if (template && data) {
				var tbody = $(this).children("tbody");
				tbody.setTemplateElement(template);
				tbody.processTemplate(data);
			}
			
			//构造HTML
			var size = $(this).attr("size");
			if (size != undefined) {								//<table>是否定义了size
				var rs = $(this).find('tbody>tr').length;			//已有行数
				if (rs < size) {									//是否需要增加空白行
					var cs = $(this).find('thead>tr>th').length;	//列数
					var addrow = size - rs; 						//增加行数
					for (var i = 0; i < addrow; i++) {				//增加空白行
						var tr = $("<tr></tr>").appendTo($(this));
						for (var j = 0; j < cs; j++) {
							$('<td>&nbsp;</td>').appendTo(tr);
						}
					}
				}
			}
			
			//勾选checkbox
			$('.base_table tr').on('click', function () {
				if ($(this).parents('table').find('.base_table_checkbox').length !==0 ){
					$(this).children('.')
				}
			});
		});
	};

	$.base_table($('.base_table'));
});