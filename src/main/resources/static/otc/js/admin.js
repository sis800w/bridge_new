$(function(){

	//********************************* session ************************************
	
	// 登陆
	$.showLogin = function() {
		$.box
			.build("login", "管 理 员 登 录")
			.addHtml(
					'<div class="form-item">' + 
						'<input class="username" placeholder="用户名" style="font-weight: 200;" type="text"/>' + 
					'</div>')
			.addHtml(
					'<div class="form-item">' + 
						'<input class="password" placeholder="密码" style="font-weight: 200;" type="password"/>' + 
					'</div>')
			.addBtn("确定", function(obj) {
				// get username
				var username = obj.find('.username').val();
				if (! username) {
					$.base_dialog('请输入用户名');
					return;
				}
				
				// get password
				var password = obj.find('.password').val();
				if (! password) {
					$.base_dialog('请输入密码');
					return;
				}
				
				// req
				var data = {
						username: username,
						password: password
				};
				$.post('admin/login', data, function(msg) {
					$.setUserinfo(msg);
					window.location.reload();
				});
			})
			.show(function(obj){
				obj.box.find(".close").hide();
			});
	};
	
	// 登出
	$.logout = function() {
		localStorage.clear();
		sessionStorage.clear();
		$.removeCookie("admin_token");
		$.showLogin();
	};
	
	// 登出按钮
	$("#logout_btn").on('click', function(){
		$.post('admin/logout', null, function() {
			$.logout();
		});
	});
	
	// 链接打开
	$.open = function() {
		var open = $.getParam('open');
		if (open) {
			var url = window.location.href;
			var valiable = url.split("?")[0];
			window.history.pushState({}, 0, valiable);
			
			if (open == 'login') {
				if (! $.getCookie("admin_token")) {
					$.showLogin();
				}
			} else {
				$("#" + open).click();
			}
		}
	};

	
	
	//********************************* storage ************************************
	
	// 用户信息
	$.userinfo = function() {
		if (! localStorage.username) {
			$.showLogin();
		}
		return JSON.parse(localStorage.username);
	};
	$.setUserinfo = function(username) {
		localStorage.username = JSON.stringify(username);
	};
	
});