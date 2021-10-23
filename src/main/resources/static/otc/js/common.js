$(function(){
	// 默认样式
	$("body").css("--color_h", "#9EA1C0");
	$("body").css("--color_sh", "#75799D");
	$("body").css("--color_qh", "#EEEEEE");
	$("body").css("--color_m", "#2EBC84");
	$("body").css("--color_sm", "#096149");
	$("body").css("--color_qm", "#75A69A");
	
	// 取url带过来的参数
	$.getParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return decodeURI(r[2]);	//url解码
		} else {
			return "";
		}
	};
	
	// 将参数添加到url
	$.addParam = function (name, value) {
		var url = window.location.href;
		var s = url.indexOf("?") == -1 ? "?" : "&";
		window.history.pushState({}, 0, url + s + name +"=" + value);
	};
	
	// 设置Cookie
	$.setCookie = function (name, value) {
		var expires = (arguments.length > 2) ? arguments[2] : null;
		document.cookie = name + "=" + encodeURIComponent(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ";path=/";
	};

	// 获取Cookie
	$.getCookie = function (name) {
		var value = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (value != null) {
			return decodeURIComponent(decodeURIComponent(value[2]));
	    } else {
			return null;
		}
	};

	// 删除cookie
	$.removeCookie = function (name) {
		var expires = new Date();
		expires.setTime(expires.getTime() - 1000 * 60);
		document.cookie = name + "=;expires=" + expires.toGMTString() + ";path=/";
	};
	
	//ajax方法（请求方法、请求地址、请求参数、成功回调、错误回调、操作按钮、加载中图标）
	$.req = function (method, url, data, successCallback, errorCallback, opBtn, isJsonp) {
		// console.log("调用接口开始，method=" + method + "，url=" + url + "，data=" + JSON.stringify(data) + "，isJsonp=" + isJsonp);
		$.ajax({
			type: method,
			url: url,
			data: data,
			dataType : isJsonp ? "jsonp" : null,
			traditional: true,
			beforeSend : function (xhr) {
				if (opBtn) {
					opBtn.attr("disabled", "disabled");
				}
				//$.showLoading();
			},
			success: function(msg){
				// console.log("调用接口成功，method=" + method + "，url=" + url + "，data=" + JSON.stringify(data) + "，isJsonp=" + isJsonp + "，result=" + JSON.stringify(msg));
				$.reqSuccess(msg, successCallback, errorCallback);
			},
			complete: function(xhr, ts) {
				if (opBtn) {
					opBtn.removeAttr("disabled");
				}
				//$.hideLoading();
			}
		});
		// console.log("调用接口结束，method=" + method + "，url=" + url + "，data=" + JSON.stringify(data) + "，isJsonp=" + isJsonp);
	};
	$.reqSuccess = function (msg, successCallback, errorCallback) {	//请求成功处理
		if (msg.success) {
			if (successCallback) {
				successCallback(msg.data);
			}
		} else {
			console.log(msg);
			if (msg.errorCode == 'LOGIN' && $.logout) {
				$.logout();
			} else if (errorCallback) {
				errorCallback(msg.errorMessage, msg.errorCode);
			} else {
				$.base_dialog(msg.errorMessage);
			}
		}
	};
	
	// 定制标记
	$.tag = $.getParam("tag");
	if ($.tag) {	// 带参：改变cookie以便跳转后恢复参数
		if ($.tag == "def") {
			$.tag = null;
			$.removeCookie("tag");
		} else {
			$.setCookie("tag", $.tag);
		}
	} else {	// 无参：使用cookie恢复参数
		var cTag = $.getCookie("tag");
		if (cTag) {
			$.tag = cTag;
			$.addParam("tag", $.tag);
		}
	}
	
	// 更新定制样式
	$.updateStyle = function() {
		var body = $("body");
		var h = $.getCookie("h");
		var sh = $.getCookie("sh");
		var qh = $.getCookie("qh");
		var m = $.getCookie("m");
		var sm = $.getCookie("sm");
		var qm = $.getCookie("qm");
		if (h) body.css("--color_h", "#" + h);
		if (sh) body.css("--color_sh", "#" + sh);
		if (qh) body.css("--color_qh", "#" + qh);
		if (m) body.css("--color_m", "#" + m);
		if (sm) body.css("--color_sm", "#" + sm);
		if (qm) body.css("--color_qm", "#" + qm);
	};
	
	// 定制替换默认
	if ($.tag && $.tag != "all") {				// 可能有定制
		if ($.getCookie("style") == $.tag) {	// 已查询-直接应用
			$.updateStyle();
		} else {								// 未查询-查询后应用
			$.removeCookie("h");
			$.removeCookie("sh");
			$.removeCookie("qh");
			$.removeCookie("m");
			$.removeCookie("sm");
			$.removeCookie("qm");
			$.req('get', '/api/style', null, function(msg) {
				$.setCookie("style", $.tag)
				$.updateStyle();
			});
		}
	}
	
	// 日期格式化
	// 使用：new Date().format("yyyy-MM-dd hh:mm:ss,S")、new Date(时间毫秒).format("yyyy-MM-dd")
	Date.prototype.format = function(format) {
		var o = {
			"M+" : this.getMonth() + 1,						//month
			"d+" : this.getDate(), 							//day
			"h+" : this.getHours(),							//hour
			"m+" : this.getMinutes(),						//minute
			"s+" : this.getSeconds(),						//second
			"q+" : Math.floor((this.getMonth() + 3) / 3),	//quarter  
			"S" : this.getMilliseconds()					//millisecond
		}
		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	};
	
	// 添加收藏夹
	$.addFavorite = function (url, title) {
		if (document.all) {
			window.external.addFavorite(url, title);
		} else if (window.sidebar) {
			window.sidebar.addPanel(title, url, "");
		}
	};

	// html字符串转义
	$.htmlEscape = function (htmlString) {
		htmlString = htmlString.replace(/&/g, '&amp;');
		htmlString = htmlString.replace(/</g, '&lt;');
		htmlString = htmlString.replace(/>/g, '&gt;');
		htmlString = htmlString.replace(/'/g, '&acute;');
		htmlString = htmlString.replace(/"/g, '&quot;');
		htmlString = htmlString.replace(/\|/g, '&brvbar;');
		return htmlString;
	};

	// 浮点数加法运算
	$.floatAdd = function (arg1, arg2) {
		var r1, r2, m;
		try{
			r1 = arg1.toString().split(".")[1].length;
		} catch(e) {
			r1 = 0;
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch(e) {
			r2 = 0;
		}
		m = Math.pow(10, Math.max(r1, r2));
		return (arg1 * m + arg2 * m) / m;
	};

	// 浮点数减法运算
	$.floatSub = function (arg1, arg2) {
		var r1, r2, m, n;
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch(e) {
			r1 = 0
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch(e) {
			r2 = 0
		}
		m = Math.pow(10, Math.max(r1, r2));
		n = (r1 >= r2) ? r1 : r2;
		return ((arg1 * m - arg2 * m) / m).toFixed(n);
	};

	// 浮点数乘法运算
	$.floatMul = function (arg1, arg2) {
		var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length;
		} catch(e) {}
		try {
			m += s2.split(".")[1].length;
		} catch(e) {}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
	};

	// 浮点数除法运算
	$.floatDiv = function (arg1, arg2) {
		var t1 = 0, t2 = 0, r1, r2;    
		try {
			t1 = arg1.toString().split(".")[1].length;
		} catch(e) {}
		try {
			t2 = arg2.toString().split(".")[1].length;
		} catch(e) {}
		with(Math) {
			r1 = Number(arg1.toString().replace(".", ""));
			r2 = Number(arg2.toString().replace(".", ""));
			return (r1 / r2) * pow(10, t2 - t1);
		}
	};

	// 设置数值精度
	$.setScale = function (value, scale, roundingMode) {
		if (roundingMode.toLowerCase() == "roundhalfup") {
			return (Math.round(value * Math.pow(10, scale)) / Math.pow(10, scale)).toFixed(scale);
		} else if (roundingMode.toLowerCase() == "roundup") {
			return (Math.ceil(value * Math.pow(10, scale)) / Math.pow(10, scale)).toFixed(scale);
		} else {
			return (Math.floor(value * Math.pow(10, scale)) / Math.pow(10, scale)).toFixed(scale);
		}
	};
	
	// 将数字转换为货币格式
	Number.prototype.formatMoney = function (places) {
		places = ! isNaN(places = Math.abs(places)) ? places : 2;	// 小数位数
		var number = this;
		var negative = number < 0 ? "-" : "";
		var i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "";
		var j = (j = i.length) > 3 ? j % 3 : 0;
        return negative + (j ? i.substr(0, j) + "," : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1,") + (places ? "." + Math.abs(number - i).toFixed(places).slice(2) : "");
    };
    
    // 货币格式化
	$.base_money = function ($eles) {
		$eles.each(function () {
			var scale = $(this).attr('scale');
			var text = $(this).text();
			if (! isNaN(text)) {
				text = Number(text).formatMoney(scale);
			}
			$(this).text(text);
		});
	};
	$.base_money($(".base_money"));
	
    // 号码格式化
	$.base_no = function ($eles) {
		$eles.each(function () {
			var text = $(this).text();
			if (! isNaN(text)) {
				text = text.replace(/(\d{4})(?=\d)/g, "$1 ");
			}
			$(this).text(text);
		});
	};
	$.base_no($(".base_no"));
	
	// 手机号格式化
	$.base_phone = function ($eles) {
		$eles.each(function () {
			var text = $(this).text();
			if (! isNaN(text)) {
				text = text.substr(0, 3) + " " + text.substr(3).replace(/(\d{4})(?=\d)/g, "$1 ");
			}
			$(this).text(text);
		});
	};
	$.base_phone($(".base_phone"));
	
	// 取浏览器类型、版本、操作系统
	$.BrowserDetect = {
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
			this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";
		},
		searchString: function (data) {
			for (var i=0;i<data.length;i++)   {
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1) return data[i].identity;
				} else if (dataProp) {
					return data[i].identity;
				} else {
					return null;
				}
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) return;
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		},
		dataBrowser: [
			{string: navigator.userAgent,subString: "Chrome",identity: "Chrome"},
			{string: navigator.userAgent,subString: "OmniWeb",versionSearch: "OmniWeb/",identity: "OmniWeb"},
			{string: navigator.vendor,subString: "Apple",identity: "Safari",versionSearch: "Version"},
			{prop: window.opera,identity: "Opera",versionSearch: "Version"},
			{string: navigator.vendor,subString: "iCab",identity: "iCab"},
			{string: navigator.vendor,subString: "KDE",identity: "Konqueror"},
			{string: navigator.userAgent,subString: "Firefox",identity: "Firefox"},
			{string: navigator.vendor,subString: "Camino",identity: "Camino"},
			{string: navigator.userAgent,subString: "Netscape",identity: "Netscape"},// for newer Netscapes (6+)
			{string: navigator.userAgent,subString: "MSIE",identity: "IExplorer",versionSearch: "MSIE"},
			{string: navigator.userAgent,subString: "Gecko",identity: "Mozilla",versionSearch: "rv"},
			{string: navigator.userAgent,subString: "Mozilla",identity: "Netscape",versionSearch: "Mozilla"}//for older Netscapes (4-)
		],
		dataOS : [
			{string: navigator.platform,subString: "Win",identity: "Windows"},
			{string: navigator.platform,subString: "Mac",identity: "Mac"},
			{string: navigator.userAgent,subString: "iPhone",identity: "iOS"},
			{string: navigator.userAgent,subString: "Android",identity: "Android"},
			{string: navigator.platform,subString: "Linux",identity: "Linux"}
		]
	};
	$.BrowserDetect.init();
	
	// 日期格式化
	$.base_df = function ($eles) {
		$eles.each(function () {
			var format = $(this).attr('format');
			var value = $(this).text();
			var newValue = new Date(value).format(format);
			$(this).text(newValue);
		});
	};
	$.base_df($(".base_df"));
	
	//定位到页面中心（ele-要定位的元素、position-默认绝对定位）
	$.base_center = function (ele, position) {
		position = ! position ? "absolute" : position;
	    var w = ele.width();
	    var h = ele.height();
	    
	    var t = $.scrollY() + ($.windowHeight()/2) - (h/2);
	    if (t < 0) t = 0;
	    
	    var l = $.scrollX() + ($.windowWidth()/2) - (w/2);
	    if (l < 0) l = 0;
	    
	    ele.css({left: l+'px', top: t+'px', position: position});//absolute、relative
	};
	$.windowHeight = function () {			//浏览器视口的高度
	    var de = document.documentElement;
	    return self.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
	};
	$.windowWidth = function () {			//浏览器视口的宽度
	    var de = document.documentElement;
	    return self.innerWidth || (de && de.clientWidth) || document.body.clientWidth
	};
	$.scrollY = function () {				//浏览器垂直滚动位置
	    var de = document.documentElement;
	    return self.pageYOffset || (de && de.scrollTop) || document.body.scrollTop;
	};
	$.scrollX = function () {				//浏览器水平滚动位置
	    var de = document.documentElement;
	    return self.pageXOffset || (de && de.scrollLeft) || document.body.scrollLeft;
	};
	$(".base_center").each(function () {	//自动触发
		$.base_center($(this));
	});
	
	// 复制
	$.copy = function(selecter, successCallback) {
		if ($(selecter).length == 0) {
			return;
		}
		var clipboard = new ClipboardJS(selecter);
		clipboard.on('success', function(e) {
			$.base_dialog('复制成功<br><span style="font-size: 12px;">' + e.text + '</span>', successCallback);
			e.clearSelection();
		});
		clipboard.on('error', function(e) {
			$.base_dialog('复制失败');
		});
	};
	$.copy('.base_copy');
	
	// Loading
	$.showLoading = function() {	// 显示Loading
		var loading = $(".base_loading");
		if (loading.length > 0) {	// 已存在，居中、显示
			loading.each(function () {
				$.base_center($(this));
			});
			loading.show();
		} else {					// 不存在，创建、居中
			$('<div class="base_loading"/>').prependTo($("body"));
			$(".base_loading").each(function () {
				$.base_center($(this));
			});
		}
	};
	$.hideLoading = function() {	// 隐藏Loading
		var loading = $(".base_loading");
		if (loading) {
			loading.hide();
		}
	};
	
	// 纯js使用
	$.base_dialog = function(content, callback) {
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
					if (callback) {
						callback();
					}
					$( this ).dialog( "close" );
				}
			}]
		});
	};
	
	// 纯js使用
	$.base_window = function(id, height, content) {
		var box = $('#' + id);
		if (box.text().length != 0) {
			box.html(content);
			box.dialog( "open" );
			$(".ui-dialog").css('top', ($.windowHeight() - height) + "px");
			$(".ui-widget-overlay").on('click', function() {
				box.dialog("close");
			});
			return box;
		}
		var $ele_div = $("<div id=" + id + ">");
		$ele_div.html(content);
		$ele_div.appendTo($("body"));
		$ele_div.dialog({
			autoOpen: true,
			width: '100%',
			modal: true
		});
		// 点遮罩关闭弹窗
		$(".ui-widget-overlay").on('click', function() {
			$ele_div.dialog("close");
		});
		// 圆弧
		var corner = $(".ui-corner-all");
		corner.css('border-bottom-left-radius', '0');
		corner.css('border-bottom-right-radius', '0');
		corner.css('border-top-left-radius', '10px');
		corner.css('border-top-right-radius', '10px');
		var content = $(".ui-dialog-content");
		content.css('border-top-left-radius', '10px');
		content.css('border-top-right-radius', '10px');
		// 内容样式
		content.css('padding', '0');
		content.css('margin', '0');
		content.css('line-height', '200%');
		content.css('font-size', '14px');
		content.css('text-align', 'left');
		$(".ui-widget-content").css('color', '#000');
		// 窗口样式
		var dialog = $(".ui-dialog");
		dialog.css('position', 'fixed');
		dialog.css('height', height + 'px');
		dialog.css('top', ($.windowHeight() - height) + "px");
		dialog.css('color', '#000');
		dialog.css('background-color', '#F7F6FB');
		// 软键盘影响布局
		var pageHeight = $.windowHeight();
		$(window).unbind('resize').on('resize', function () {		// ios软键盘弹出不会触发resize事件
            if ($.windowHeight() < pageHeight) {
            	dialog.css('top', ($.windowHeight() - height) + "px");
            } else {
            	dialog.css('top', ($.windowHeight() - height) + "px");
            }
		});
		// 软键盘影响布局:ios(未测试)
		var bfscrolltop = document.body.scrollTop;
		$ele_div.find("input").focus(function () {
			document.body.scrollTop = document.body.scrollHeight;
		}).blur(function () {
			document.body.scrollTop = bfscrolltop;
			window.scrollTo(0, 0);
		});
		return $ele_div;
	};
	
	// 纯js使用
	$.base_confirm = function(title, content, callback, cancelCallback, okText, cancelText) {
		var $ele_div = $("<div>");
		$ele_div.addClass("base_dialog_text");
		$ele_div.attr("title", title);
		$ele_div.html(content);
		$ele_div.appendTo($("body"));
		$ele_div.dialog({
			autoOpen: true,
			width: 300,
			modal: true,
			buttons: [{
				text: cancelText ? cancelText : "取消",
				click: function() {
					$(this).dialog( "close" );
					if (cancelCallback) {
						cancelCallback();
					}
				}
			}, {
				text: okText ? okText : "确定",
				click: function() {
					$(this).dialog( "close" );
					callback($(this));
				}
			}]
		});
		var btn = $ele_div.next().find(".ui-button");
		btn.css('width', '57%');
		btn.css('margin-left', '2%');
		btn.css('margin-right', '2%');
		btn.css('font-size', '16px');
		btn.css('font-weight', '600');
		btn.first().css('background', '#B2B2B2');
		btn.first().css('width', '35%');
		var header = $ele_div.prev();
		header.css('display', 'block');
		$ele_div.css("text-align", "left");
		$ele_div.css("font-size", "14px");
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
				modal: true,
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
	
	// 纯js使用
	$.box = {
		finish : false,
		name : '',
		form : null,
		box: null,
		build : function(name, title) {
			// 已存在
			this.name = name;
			var box = $('#' + name + 'box');
			if (box.text().length != 0) {
				this.box = box;
				this.form = $('#' + name + 'form');
				return this;
			}
			
			// 构建弹窗
			box = 
				$('<div class="pop-box-model" id="' + name + 'box" style="display: none">' + 
					'<div class="pop-box" style="max-width: 450px; top: 0px; bottom: 0px;">' + 
						'<div>' + 
							'<div class="title">订单详情</div>' + 
							'<div class="content">' + 
								'<div class="form-box">' + 
									'<div class="form-content"></div>' + 
								'</div>' + 
							'</div>' + 
							'<div class="close"></div>' + 
						'</div>' + 
					'</div>' + 
				'</div>');
			box.appendTo($("body"));
			
			// 更改标题、绑定事件
			box.find('.title').text(title);
			box.find('.close').on('click', function(){
				box.hide();
			});
			this.box = box;
			this.form = box.find('.form-content');
			this.finish = false;
			return this;
		},
		addInput : function(clazz, title, desc, value, password, readonly) {
			var id = this.name + '_' + clazz;
			if (this.finish) {
				var ele = $("#" + id);
				if (value != null) ele.val(value);
				if (desc) ele.attr("placeholder", desc);
				return this;
			}
			var passwordStr = password ? ' type="password"' : ' type="text"';
			var placeholderStr = desc ? ' placeholder="' + desc + '"' : '';
			var readonlyStr = readonly ? ' readonly="readonly"' : '';
			var valueStr = value != null ? ' value="' + value + '"' : '';
			this.form.append(
					'<div class="form-item">' +
						'<span>' + title + '：</span>' + '<input id="' + id + '" class="' + clazz + (readonly ? ' back_h' : '') + '"' + valueStr + placeholderStr + passwordStr + readonlyStr + ' style="font-weight: 200;" />' +
					'</div>');
			return this;
		},
		addBtn : function(desc, clickFunction) {
			if (this.finish) return this;
			var btn = $('<button>' + desc + '</button>');
			btn.appendTo(this.form);
			var box = this.box;
			btn.on('click', function(){
				clickFunction(box);
			});
			return this;
		},
		addHtml : function(html) {
			if (this.finish) return this;
			this.form.append(html);
			return this;
		},
		attr : function(name, value) {
			this.box.attr(name, value);
			return this;
		},
		show : function(callback) {
			if (! this.finish) {
				if (callback) callback(this);
				this.finish = true;
			}
			this.box.show();
			return this.box;
		}
	};
	
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
	
	// 标签页
	$.tabs = function(clazz, callback) {
		$("#" + clazz +" div").each(function(){
			var _this = $(this);
			_this.on('click', function() {
				$("#" + clazz + " div p").each(function(){
					$(this).removeClass('color_m');
					$(this).css('border-bottom', '');
				});
				var _thisdiv = _this.find('p');
				_thisdiv.addClass('color_m');
				_thisdiv.css('border-bottom', '3px solid var(--color_m)');
				callback(_this.attr("tab"));
			})
		});
	};
	
	// 单选按钮（类似标签页，以按钮形式展现）
	$.btn_radio = function(clazz, callback) {
		$("#" + clazz +" button").each(function(){
			var _this = $(this);
			_this.on('click', function() {
				$("#" + clazz + " button").each(function(){
					$(this).removeClass("btn_radio_selected");
					$(this).addClass("btn_radio");
				});
				_this.removeClass("btn_radio");
				_this.addClass("btn_radio_selected");
				callback(_this.text());
			})
		});
	};
	
	// 微信tips
	$.weixinTips = function(){
		// 构建弹窗
		var tip = $('#weixin-tip');
		if (tip.text().length == 0) {
			tip = $(
				'<div id="weixin-tip" style="height: ' + $(window).height() + ';display: none; position: fixed; left:0; top:0; bottom:0; background: rgba(0,0,0,0.8); filter:alpha(opacity=80);  height: 100%; width: 100%; z-index: 100000000;">' + 
					'<p style="text-align: center; margin-top: 10%; padding:0 5%;">' + 
						'<img src="/image/live_weixin.png" alt="微信打开" style="max-width: 100%; height: auto;"/>' + 
					'</p>' + 
				'</div>');
			tip.appendTo($("body"));
		}

		// 微信
		if (navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger"){
			tip.show();
		}
	};
	$.weixinTips();
	
	// uuid
	$.uuid = function () {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
	}
	
	// 验证码
	$.imgKey = $.uuid();
	$(".imgCaptcha_btn").each(function(){
		$(this).on("click", function () {
			$(this).attr("src", "/captcha?imgKey=" + $.imgKey + "&r=" + new Date().getTime());
		});
	});
	
});