$(function(){
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
	
	// 获取url带过来的参数值
	$.getParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return decodeURI(r[2]);	//url解码
		} else {
			return "";
		}
	};
	
	// 将url带过来的参数添加到对象
	$.addParam = function (name, data, defaultValue) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			data[name] = decodeURI(r[2]);	//url解码
		} else {
			data[name] = defaultValue;
		}
	};
	
	// 初始化参数
	$.initParam = function(name, data, callback) {
		// url取参
		$.addParam(name, data);
		
		// 参数填入表单控件
		if (! data) {
			return;
		}
		var ele = $("#ele_" + name);
		ele.val(data[name]);
		
		// 表单控件参数值变更
		ele.on('change', function(){
			data.pageNo = 1;
			if (ele.val() == "") {
				delete data[name];
			} else {
				data[name] = ele.val();
			}
			if (callback) {
				callback();
			}
		});
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
			{string: navigator.userAgent,subString: "iPhone",identity: "iPhone/iPod"},
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
			if (errorCallback) {
				errorCallback(msg.errorMessage, msg.errorCode);
			} else {
				$.base_dialog(msg.errorMessage);
			}
		}
	};
	
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
});