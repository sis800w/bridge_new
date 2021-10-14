$(function(){
	// 用户信息
	$.userinfo = function() {
		if (! localStorage.userinfo) {
			$.showLogin();
		}
		return JSON.parse(localStorage.userinfo);
	};
	$.setUserinfo = function(user) {
		localStorage.userinfo = JSON.stringify(user);
	};
	
	// 登出
	$.logout = function() {
		localStorage.clear();
		sessionStorage.clear();
		$.removeCookie("token");
		$.showLogin();
	};
	
	// 登录
	$.showLogin = function() {
		$.formPopup
			.build("login", "登录")
			.addText("phone", "手机号")
			.addPassword("password", "密码")
			.addBtn("登&nbsp;&nbsp;&nbsp;&nbsp;录", function(form) {
				// get phone
				var phone = form.find('.phone').val();
				if (! phone) {
					$.tips('请输入手机号', 2000);
					return;
				}
				
				// get password
				var password = form.find('.password').val();
				if (! password) {
					$.tips('请输入密码', 2000);
					return;
				}
				
				// req
				var data = {
						phone: phone,
						password: password
				};
				$.post('user/login', data, function(msg) {
					$.setUserinfo(msg);
					window.location.reload();
				});
			});
	};
});