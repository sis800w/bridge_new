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
				$.post('user/login', data, function(msg) {
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
		$.post('user/logout', null, function() {
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
	
	
	
	//********************************* 其它 ************************************
	
	// 币信息
	$.coininfo = function(callback) {
		$.get('coininfo', null, function(msg) {
			callback(msg);
		});
	};
	
	// 显示充值
	$.showRecharge = function() {
		$.coininfo(function(coininfo){
			$.box
				.build("recharge", "USDT 充 币")
				.addHtml('<div style="text-align: center; font-size: 14px;">链名称：TRC20</div>')
				.addHtml(
						'<div class="form-img" style="text-align: center; margin-top: 5px;">' + 
							'<img id="recharge_qrcode" src="" style="width: 150px;"/>' + 
						'</div>')
				.addHtml(
						'<div style="margin-top: 5px;">' +
							'<div id="recharge_address" class="address_copy" data-clipboard-target="#recharge_address" style="font-size: 14px; line-height: 150%; word-wrap:break-word; text-align: center;"></div>' +
							'<div style="text-align: center;"><i style="padding: 5px 10px;" class="fa fa-copy address_copy back_qh" data-clipboard-target="#recharge_address"> 复制</i></div>' +
						'</div>')
				.addHtml('<ul class="div_desc" style="text-align: left;">' +
						'<li>请勿向上述地址充值任何非 TRC20_USDT 资产，否则资产将不可找回。</li>' +
						'<li>您充值至上述地址后，需要整个网络节点的确认，1次网络确认后可到账，1次网络确认后可提币。</li>' +
						'<li>最小充币金额：' + coininfo.rechargeNumMin + ' USDT，小于最小金额的充值将不会上账且无法退回。</li>' +
						//'<li style="margin-bottom: 0px;">你的充币地址不会变化，可以重复充币。</li>' +
					'</ul>')
				.addBtn("我已转入", function(obj) {
					$.post('wallet/quickRecharge', null, function(time) {
						$.base_dialog('等待区块链网络节点确认，请稍后刷新查看余额变化');
						obj.hide();
						setTimeout($.loadData, time * 1000 * 2);
					});
				})
				.show(function(obj) {	// 填充
					$("#rechargetitle").css('margin-bottom', '5px');
					$.get('wallet/address', null, function(address) {
						$('#recharge_address').text(address);
						$('#recharge_qrcode').attr("src", $.baseUrl + "qrcode/" + address);
						$.copy('.address_copy');
					});
				});
		});
	};
	
	// 买币
	$.showTrade = function () {
		// 未设支付密码
		if (! $.userinfo().hasPayPassword) {
			window.location.href = "./my.html?open=updatePayPsw";
		}
		
		// 买币弹窗
		$.box
			.build("trade", "购买 USDT")
			.addHtml('<div style="color: blue; font-size: 12px; text-align: center;">注意：请<span style="color: red;">谨慎下单</span>，超时未支付订单过多将<span style="color: red;">封号</span></div>')
			.addHtml(
					'<div class="form-item">' +
						'<span>账号类型：</span>' +
						'<select class="accountType" style="font-weight: 200; width: 65%;" >' +
							'<option value="BANKCARD" selected="selected">银行卡</option>' +
							'<option value="ALIPAY">支付宝</option>' +
							'<option value="WECHATPAY">微信</option>' +
							'<option value="UNIONPAY">云闪付</option>' +
						'</select>' +
					'</div>')
			.addInput("payAmount", "支付金额", "单位：元")
			.addInput("payPassword", "支付密码", null, null, true)
			.addBtn("确定", function(box) {
				// get accountType
				var accountType = box.find('.accountType').val();
				
				// get payAmount
				var payAmount = box.find('.payAmount').val();
				if (! payAmount) {
					$.base_dialog('请输入支付金额');
					return;
				}
				
				// get payPassword
				var payPassword = box.find('.payPassword').val();
				if (! payPassword) {
					$.base_dialog('请输入支付密码');
					return;
				}
				
				// req
				var data = {
						accountType: accountType,
						payAmount: payAmount,
						payPassword: payPassword
				};
				$.post('order/trade', data, function(msg) {
					window.location.href = "./order.html?orderSn=" + msg.orderSn + "&sign=" + msg.sign;
				});
			})
			.show();
	};
	
	// 显示提币
	$.showWithdraw = function() {
		if (! $.userinfo().hasPayPassword) {	// 未设支付密码
			$.updatePayPsw();
			return;
		}
		$.coininfo(function(coininfo){
			$.box
				.build("withdraw", "USDT 提 币")
				.addInput("withdrawAddress", "提币地址", "链名称：TRC20")
				.addInput("withdrawNum", "提币数量", "≥ " + coininfo.withdrawNumMin + " USDT")
				.addInput("fee", "手续费", coininfo.withdrawFee + " USDT", null, null, true)
				.addInput("to_account_num", "到账数量", "0 USDT", null, null, true)
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
							payPassword: payPassword
					};
					$.post('wallet/withdraw', data, function(msg) {
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
						obj.box.find(".to_account_num").attr("placeholder", num + " USDT");
					});
				});
		});
	};
	
	// 显示添加收款方式
	$.showAddAccount = function(){
		if (! $.userinfo().hasPayPassword) {	// 未设支付密码
			$.updatePayPsw();
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
			.addInput("realname", "姓名", "银行卡实名")
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
				
				// 实名
				var realname = obj.find('.realname').val();
				if (! realname) {
					$.base_dialog('请输入姓名');
					return false;
				}
				fd.append("realname", realname);
				
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
					url: $.baseUrl + "account/add",
					data: fd,
					processData: false,
					contentType: false,
					success: function(msg){
						if (msg.success) {
							$.base_dialog('添加成功');
							obj.find('.payPassword').val("")
							obj.find('.accountNo').val("")
							obj.find('.realname').val("")
							obj.find('.bank').val("")
							obj.find('.subbranch').val("")
							$.loadData();
							obj.hide();
						} else {
							console.log(msg);
							if (msg.errorCode == 'LOGIN' && $.logout) {
								$.logout();
							} else {
								$.base_dialog(msg.errorMessage);
							}
						}
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
						obj.box.find('.realname').attr('placeholder', '支付宝实名');
						obj.box.find('.accountNo').attr('placeholder', '支付宝账号');
					} else if (accountType == "WECHAT") {
						obj.box.find('.realname').attr('placeholder', '微信实名');
						obj.box.find('.accountNo').attr('placeholder', '微信号');
					} else if (accountType == "UNIONPAY") {
						obj.box.find('.realname').attr('placeholder', '收款人姓名');
						obj.box.find('.accountNo').attr('placeholder', '已绑卡用户手机号');
					} else if (accountType == "BANKCARD") {
						obj.box.find('.realname').attr('placeholder', '银行卡实名');
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
		$(".accountType").change();
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
				$.post('user/updatePayPwd', data, function(msg) {
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