$(function(){
	
	//********************************* session ************************************
	
	// 登陆
	$.showLogin = function() {
		$.box
			.build("login", "登 录")
			.addHtml(
					'<div class="form-item">' + 
						'<input class="phone" placeholder="手机号" style="font-weight: 200;" type="text"/>' + 
					'</div>')
			.addHtml(
					'<div class="form-item">' + 
						'<input class="password" placeholder="密码（6-20位字母数字混合）" style="font-weight: 200;" type="password"/>' + 
					'</div>')
			.addBtn("确定", function(obj) {
				// get phone
				var phone = obj.find('.phone').val();
				if (! phone) {
					$.base_dialog('请输入手机号');
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
						phone: phone,
						password: password
				};
				$.req('post', '/api/user/login', data, function(msg) {
					$.setUserinfo(msg);
					window.location.reload();
				});
			})
			.addHtml('<a style="float: right; margin-top: 10px;" href="./reg.html">注册用户</a>')
			.show(function(obj){
				obj.box.find(".close").hide();
			});
	};
	
	// 登出
	$.logout = function() {
		localStorage.clear();
		sessionStorage.clear();
		$.removeCookie("token");
		$.showLogin();
	};
	
	// 登出按钮
	$("#logout_btn").on('click', function(){
		$.req('post', '/api/user/logout', null, function() {
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
				if (! $.getCookie("token")) {
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
		if (! localStorage.userinfo) {
			$.showLogin();
		}
		return JSON.parse(localStorage.userinfo);
	};
	$.setUserinfo = function(user) {
		localStorage.userinfo = JSON.stringify(user);
	};
	
	// 币种信息
	$.coins = function() {
		return JSON.parse(localStorage.coins);
	};
	$.setCoins = function(coins, tag) {
		localStorage.coins = JSON.stringify(coins);
		localStorage.coinsTag = tag;
	};
	$.loadCoins = function() {
		if ($.tag) {
			if (! localStorage.coinsTag || localStorage.coinsTag != $.tag) {
				$.req('get', '/api/coininfo/coins', {tag: $.tag}, function(msg) {
					$.setCoins(msg, $.tag);
					window.location.reload();
				});
			}
		} else {
			if (! localStorage.coinsTag || localStorage.coinsTag != "def") {
				var coins = {
						listedCoins:["TRX","USDT"],
						freeTradeCoins:["TRX","USDT"]
				}
				$.setCoins(coins, "def");
			}
		}
	};
	$.loadCoins();
	
	
	
	//********************************* 其它 ************************************
	
	// 币信息
	$.coininfo = function(coin, callback) {
		$.req('get', '/api/coininfo/' + coin, null, function(msg) {
			callback(msg);
		});
	};
	
	// 显示充值
	$.showRecharge = function(coin) {
		$.coininfo(coin, function(coininfo){
			var id = coin + "recharge";
			$.box
				.build(id, coin + " 充 币")
				.addHtml(coininfo.chain ? ('<div style="text-align: center; font-size: 14px;">链名称：' + coininfo.chain + '</div>') : '')
				.addHtml(
						'<div class="form-img" style="text-align: center; margin-top: 5px;">' + 
							'<img id="' + id + '_qrcode" src="" style="width: 150px;"/>' + 
						'</div>')
				.addHtml(
						'<div style="margin-top: 5px;">' +
							'<div id="' + id + '_address" class="address_copy" data-clipboard-target="#' + id + '_address" style="font-size: 14px; line-height: 150%; word-wrap:break-word; text-align: center;"></div>' +
							'<div style="text-align: center;"><i style="padding: 5px 10px;" class="fa fa-copy address_copy back_qh" data-clipboard-target="#' + id + '_address"> 复制</i></div>' +
						'</div>')
				.addHtml('<ul class="div_desc" style="text-align: left;">' +
						'<li>请勿向上述地址充值任何非 ' + coininfo.assets + ' 资产，否则资产将不可找回。</li>' +
						'<li>您充值至上述地址后，需要整个网络节点的确认，' + coininfo.transferConfirmNum + '次网络确认后可到账，' + coininfo.withdrawConfirmNum + '次网络确认后可提币。</li>' +
						'<li>最小充币金额：' + coininfo.rechargeNumMin + ' ' + coin + '，小于最小金额的充值将不会上账且无法退回。</li>' +
						//'<li style="margin-bottom: 0px;">你的充币地址不会变化，可以重复充币。</li>' +
					'</ul>')
				.addBtn("我已转入", function(obj) {
					$.req('post', '/api/wallet/quickRecharge', {coin: coin}, function(time) {
						$.base_dialog('等待区块链网络节点确认，请稍后刷新查看余额变化');
						obj.hide();
						setTimeout($.loadData, time * 1000 * 2);
					});
				})
				.show(function(obj) {	// 填充
					$("#" + id + "title").css('margin-bottom', '5px');
					$.req('get', '/api/wallet/address', {coin: coin}, function(address) {
						$('#' + id + '_address').text(address);
						$('#' + id + '_qrcode').attr("src", "/qrcode/" + address);
						$.copy('.address_copy');
					});
				});
		});
	};
	
	// 显示提币
	$.showWithdraw = function(coin) {
		if (! $.userinfo().hasPayPassword) {	// 未设支付密码
			$.updatePayPsw();
			return;
		}
		$.coininfo(coin, function(coininfo){
			var id = coin + "withdraw";
			$.box
				.build(id, coin + " 提 币")
				.addInput("withdrawAddress", "提币地址", coininfo.chain ? ("链名称：" + coininfo.chain) : null)
				.addInput("withdrawNum", "提币数量", "≥ " + coininfo.withdrawNumMin + " " + coin)
				.addInput("fee", "手续费", coininfo.withdrawFee + " " + coin, null, null, true)
				.addInput("to_account_num", "到账数量", "0 " + coin, null, null, true)
				.addInput("payPassword", "支付密码", null, null, true)
				.addBtn("确定", function(obj) {
					// withdrawAddress
					var withdrawAddress = obj.find(".withdrawAddress").val();
					if (! withdrawAddress) {
						$.base_dialog('请输入提币地址');
						return;
					}
					
					// withdrawNum
					var withdrawNum = obj.find(".withdrawNum").val();
					if (! withdrawNum) {
						$.base_dialog('请输入提币数量');
						return;
					}
					
					// payPassword
					var payPassword = obj.find(".payPassword").val();
					if (! payPassword) {
						$.base_dialog('请输入支付密码');
						return;
					}
					
					// 请求
					var data = {
							withdrawAddress: withdrawAddress, 
							withdrawNum: withdrawNum,
							payPassword: payPassword,
							coin: coin
					};
					$.req('post', '/api/wallet/withdraw', data, function(msg) {
						obj.find(".withdrawNum").val("");
						obj.find(".withdrawAddress").val("");
						obj.find(".payPassword").val("");
						$.base_dialog('提币申请已提交，平台将尽快为你处理');
						$.loadData();
						obj.hide();
					});
				})
				.show(function(obj) {
					// 禁用
					$(".fee").attr("disabled", true);
					$(".to_account_num").attr("disabled", true);
					
					// 显示到账数量
					obj.box.find('.withdrawNum').on('input propertychange', function(){
						var _this = $(this);
						var num = _this.val() - coininfo.withdrawFee;
						obj.box.find(".to_account_num").attr("placeholder", num + " " + coin);
					});
				});
		});
	};
	
	// 显示选择币种
	$.showSelectCoin = function(callback) {
		var listed = $.coins().listedCoins;
		var html = 
			'<div style="text-align: center; background-color: #fff;">' + 
				'<table style="width: 100%;">';
		for (coin of listed) {
			html +=	'<tr class="font_18" style="border-bottom: 1px solid #F7F6FB;">' + 
						'<td style="padding: 10px 0;">' + coin + '</td>' + 
					'</tr>';
		}
		html += '</table>' + 
			'</div>';
		var selectCoin = $.base_window("selectCoin", listed.length * 48, html);
		selectCoin.find("tr").each(function(){
			$(this).unbind('click').on('click', function(){
				selectCoin.dialog("close");
				callback($(this).find("td").text());
			});
		});
	};
	
	// 显示添加收款方式
	$.showAddAccount = function(){
		if (! $.userinfo().hasPayPassword) {	// 未设支付密码
			$.updatePayPsw();
			return;
		}
		if (! $.userinfo().realname) {
			$.realnameAuth();
			return;
		}
		$.box
			.build("addAccount", "添 加 收 款 方 式")
			.addHtml('<div class="form-item">' + 
							'<span>收款方式：</span><select class="accountType" style="font-weight: 200; width: 65%;" >' + 
								'<option id="alipay" value="ALIPAY">支付宝</option>' + 
								'<option id="wechat" value="WECHAT">微信</option>' + 
								'<option id="unionpay" value="UNIONPAY">云闪付</option>' + 
								'<option id="bankcard" value="BANKCARD" selected="selected">银行卡</option>' + 
							'</select>' + 
						'</div>')
			.addInput("realName", "姓名", "银行卡实名", $.userinfo().realname, null, true)
			.addInput("accountNo", "账号", "银行卡卡号")
			.addInput("bank", "开户银行", "输入卡号自动获取", null, null, true)
			.addInput("subbranch", "支行名称", "可选")
			.addInput("payPassword", "支付密码", null, null, true)
			.addBtn("确定", function(obj) {
				// 收款方式类型
				var fd = new FormData();
				var accountType = obj.find('.accountType').val();
				fd.append("accountType", accountType);
				
				// 账号
				var accountNo = obj.find('.accountNo').val();
				if (! accountNo) {
					$.base_dialog('请输入账号');
					return false;
				}
				fd.append("accountNo", accountNo);
				
				// 银行卡
				if (accountType == "BANKCARD") {
					// 银行
					var bank = obj.find('.bank').val();
					if (! bank) {
						$.base_dialog('卡号有误，未能识别到银行名称');
						return false;
					}
					fd.append("bank", bank);
					
					// 支行
					var subbranch = obj.find('.subbranch').val();
					fd.append("subbranch", subbranch);
				}
				
				// 支付密码
				var payPassword = obj.find('.payPassword').val();
				if (! payPassword) {
					$.base_dialog('请输入支付密码');
					return false;
				}
				fd.append("payPassword", payPassword);
				
				// 提交
				$.ajax({
					type: "POST",
					url: "/api/account/add",
					data: fd,
					processData: false,
					contentType: false,
					success: function(msg){
						$.reqSuccess(msg, function(data){
							$.base_dialog('添加成功');
							obj.find('.payPassword').val("")
							obj.find('.accountNo').val("")
							obj.find('.bank').val("")
							obj.find('.subbranch').val("")
							$.loadData();
							obj.hide();
						});
					}
				});
			})
			.show(function(obj) {
				// 选择收款方式类型
				obj.box.find(".accountType").on('change', function(){
					obj.box.find('.bank').parent().hide();
					obj.box.find('.subbranch').parent().hide();
					var accountType = $(this).val();
					if (accountType == "ALIPAY") {
						obj.box.find('.realName').attr('placeholder', '支付宝实名');
						obj.box.find('.accountNo').attr('placeholder', '支付宝账号');
					} else if (accountType == "WECHAT") {
						obj.box.find('.realName').attr('placeholder', '微信实名');
						obj.box.find('.accountNo').attr('placeholder', '微信号');
					} else if (accountType == "UNIONPAY") {
						obj.box.find('.realName').attr('placeholder', '收款人姓名');
						obj.box.find('.accountNo').attr('placeholder', '已绑卡用户手机号');
					} else if (accountType == "BANKCARD") {
						obj.box.find('.realName').attr('placeholder', '银行卡实名');
						obj.box.find('.accountNo').attr('placeholder', '银行卡卡号');
						obj.box.find('.bank').parent().show();
						obj.box.find('.subbranch').parent().show();
					}
				});
				
				// 显示银行
				obj.box.find(".accountNo").on('change', function(){
					var accountType = obj.box.find(".accountType").val();
					if (accountType == "BANKCARD") {
						var accountNo = $(this).val();
						if (accountNo.length >= 6) {
							$.ajax({
								type: "get",
								url: 'https://api.xlongwei.com/service/bankCard.json',
								data: {bankCardNumber: accountNo},
								success: function(msg){
									if (msg.bankName) {
										obj.box.find(".bank").val(msg.bankName);
									} else {
										$.base_dialog('卡号有误，未能识别到银行名称');
									}
								}
							});
						}
					}
				});
			});
	};
	
	// 修改资料
	$.updateInfo = function () {
		var user = $.userinfo();
		$.box
			.build("info", "设 置 联 系 方 式")
			.addInput("nickname", "我的昵称", null, user.nickname)
			.addInput("wechat", "联系方式", "如微信:yy123、手机:13312345678", user.wechat)
			.addBtn("确定", function(obj) {
				// get nickname
				var nickname = obj.find('.nickname').val();
				if (! nickname) {
					$.base_dialog('请输入昵称');
					return;
				}
				
				// get wechat
				var wechat = obj.find('.wechat').val();
				if (! wechat) {
					$.base_dialog('请输入联系方式');
					return;
				}
				
				// req
				var data = {
						nickname: nickname,
						wechat: wechat
				};
				$.req('post', '/api/user/updateInfo', data, function(msg) {
					obj.find('.nickname').val("");
					obj.find('.wechat').val("");
					$.base_dialog('设置成功');
					var user = $.userinfo();
					user.wechat = wechat;
					user.nickname = nickname;
					$.setUserinfo(user);
					obj.hide();
				});
			})
			.show();
	};
	
	// 实名认证
	$.realnameAuth = function() {
		if ($.userinfo().realname) {
			$.base_dialog('已认证');
			return;
		}
		$.box
			.build("realnameAuth", "实 名 认 证")
			.addInput("idcard", "身份证号")
			.addInput("realname", "真实姓名")
			.addBtn("确定", function(obj) {
				// get idcard
				var idcard = obj.find('.idcard').val();
				if (! idcard) {
					$.base_dialog('请输入身份证号');
					return;
				}
				
				// get realname
				var realname = obj.find('.realname').val();
				if (! realname) {
					$.base_dialog('请输入真实姓名');
					return;
				}
				
				// req
				var data = {
						idcard: idcard,
						realname: realname
				};
				$.req('post', '/api/user/realnameAuth', data, function(msg) {
					obj.find('.idcard').val("");
					obj.find('.realname').val("");
					$.base_dialog('通过认证');
					var user = $.userinfo();
					user.realname = realname;
					$.setUserinfo(user);
					obj.hide();
				});
			})
			.show();
	};
	
	// 设置支付密码
	$.updatePayPsw = function() {
		var box = $.box
			.build("updatePayPsw", "设 置 支 付 密 码")
			.addInput("payPassword", "原支付密码", null, null, true)
			.addInput("newPayPassword", "新支付密码", "6位数字", null, true)
			.addInput("newPayPassword2", "重复新密码", null, null, true)
			.addBtn("确定", function(obj) {
				// get password
				var payPassword = obj.find('.payPassword').val();
				
				// get password
				var newPayPassword = obj.find('.newPayPassword').val();
				if (! newPayPassword) {
					$.base_dialog('请输入新支付密码');
					return;
				}
				
				// get password2
				var newPayPassword2 = obj.find('.newPayPassword2').val();
				if (! newPayPassword2) {
					$.base_dialog('请重复输入新支付密码');
					return;
				}
				
				// password error
				if (newPayPassword != newPayPassword2) {
					$.base_dialog('重复新支付密码错误');
					return;
				}
				
				// req
				var data = {
						payPassword: payPassword,
						newPayPassword: newPayPassword
				};
				$.req('post', '/api/user/updatePayPwd', data, function(msg) {
					var user = $.userinfo();
					user.hasPayPassword = true;
					$.setUserinfo(user);
					obj.find('.payPassword').val("");
					obj.find('.newPayPassword').val("");
					obj.find('.newPayPassword2').val("");
					$.base_dialog('设置成功');
					obj.hide();
				});
			})
			.show();
		if (! $.userinfo().hasPayPassword) {
			box.find('.payPassword').parent().hide();
		}
	};
	
});