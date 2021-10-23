$(document).ready(function() {
	/* 
	取得分页链接：
		<ul class="base_page">
			<li><a>首页</a></li>
			<li><a>上一页</a></li>
			<li><a>1</a></li>
			<li><a>2</a></li>
			<li><strong>3</strong></li>	<!-- 当前页 -->
			<li><a>4</a></li>
			<li><a>5</a></li>
			<li><a>下一页</a></li>
			<li><a>尾页</a></li>
		</ul>
	参数：
		{
			pagerDivs : $(".base_page"),	//展示分页链接的div，$("#ele_pager_div")、$(".base_page")
			currentPage : 6,				//当前页数
			totalPage : 66,					//总页数
			totalRow : 656,					//可选，总行数（默认不显示总行数）
			url : "/fuchao/find.html",		//可选，请求链接（默认""）
			linkNo : 10,					//可选，数字链接的个数（默认10）
			pageNoParamName : "pageNo",		//可选，页号参数名（默认pageNo）
			otherParams : {					//可选，其它参数（不含页号参数）
				aaa : 111,
				bbb : 222,
				ccc : 333
			},
			clickCallback : function ($a) {	//可选，回调（用于实现ajax加载，如果传了这个参数，则不可传url、pageNoParamName、otherParams）
				pageNo = $a.attr('href');
				$.loadData();	//ajax加载
			}
		}
	*/
	$.base_page = function (settings) {
		//不到2页以上不显示分页链接
		settings.pagerDivs.each(function(){
			$(this).show();
		});
		if (settings.totalPage <= 1) {
			settings.pagerDivs.each(function(){
				$(this).hide();
			});
			return;
		}
		
		//给默认值
		if (! settings.linkNo) {					//数字链接的个数，默认10个
			settings.linkNo = 10;
		}
		if (! settings.pageNoParamName) {
			settings.pageNoParamName = "pageNo";	//分页查询页数参数名，默认pageNo
		}
		if (! settings.currentPage) {				//undefined、null、""、0、false
			settings.currentPage = 1;
		} else if (typeof(settings.currentPage) == "string") {
			settings.currentPage = parseInt(settings.currentPage);
		}
		
		//生成otherParams
		var otherParams = "";
		if (settings.otherParams) {
			for (var p in settings.otherParams){
				otherParams += "&" + p + "=" + settings.otherParams[p];
			}
		}
		
		//生成url前段
		if (settings.url) {
			settings.url += "?" + settings.pageNoParamName + "=";	//如：/xxx/yyy.html?pageNo=
		} else {
			settings.url = "";	//默认
		}
		
		/** 2页以上显示分页链接 */
		/* *****计算起止页数***** */
		var begin, end;
		if (settings.totalPage <= settings.linkNo) {		//总页数不超过linkNo页
			begin = 1;
			end = settings.totalPage;
		} else {				//总页数超过linkNo页
			if (settings.linkNo % 2 == 0) {	//偶数个
				begin = settings.currentPage - (settings.linkNo / 2);
			} else {				//奇数个
				begin = settings.currentPage - ((settings.linkNo - 1) / 2);
			}
			
			if (begin < 1) {
				begin = 1;
			}
			
			end = begin + settings.linkNo - 1;
			if (end > settings.totalPage) {
				end = settings.totalPage;
			}
			
			if (end - begin < settings.linkNo - 1) {
				begin = end - settings.linkNo + 1;
			}
		}
		
		/* *****链接字符串拼装***** */
		var lingStr = "";
		
		//首页、上一页
		if (begin > 1) {
			lingStr += "<li class='page'><a href='" + settings.url + "1" + otherParams + "'>" + "首页" + "</a></li>";
		}
		if (settings.currentPage > 2) {
			lingStr += "<li class='page'><a href='" + settings.url + (settings.currentPage-1) + otherParams + "'>" + "上一页" + "</a></li>";
		}
		
		//[1][2][3][4][5][6][7][8][9][10]
		for (var i = begin; i <= end; i++) {
			if (i == settings.currentPage) {
				lingStr += "<li class='active'><a href='javascript:void(0)'>" + settings.currentPage + "</a></li>";
			} else {
				lingStr += "<li class='page'><a href='" + settings.url + i + otherParams + "'>" + i + "</a></li>";
			}
		}
		
		//下一页、尾页
		if (settings.currentPage < settings.totalPage - 1) {
			lingStr += "<li class='page'><a href='" + settings.url + (settings.currentPage+1) + otherParams + "'>" + "下一页" + "</a></li>";
		}
		if (end < settings.totalPage) {
			lingStr += "<li class='page'><a href='" + settings.url + settings.totalPage + otherParams + "'>" + "尾页" + "</a></li>";
		}
		
		//文字部分
		if (settings.totalRow) {
			lingStr += "<li class='disabled'><a href='javascript:void(0)'>共" + settings.totalRow + "行</a></li>";
		}
		lingStr += "<li class='disabled'><a href='javascript:void(0)'>共" + settings.totalPage + "页</a></li>";
		if (settings.linkNo <= 0) {
			lingStr += "<li class='disabled'><a href='javascript:void(0)'>第" + settings.currentPage + "页</a></li>";
		}
		
		//显示分页链接
		settings.pagerDivs.each(function(){
			$(this).html(lingStr);
			if (settings.clickCallback) {
				$(this).children("li[class='page']").each(function() {
					$(this).on('click', function() {
						settings.clickCallback($(this).children("a"));
						return false;
					});
				});
			}
		});
	};
	
	
	// 简单分页
	$.base_page_simple = function (pagerDivs, params, result, callback) {
		$.base_page({
			pagerDivs : pagerDivs,
			currentPage : params.pageNo, 
			totalPage : result.totalPage, 
			totalRow : result.totalRow,
			linkNo : 10,
			clickCallback : function ($ele_a) {
				params.pageNo = $ele_a.attr('href');
				callback();
			}
		});
	};
	
});