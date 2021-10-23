CKEDITOR.editorConfig = function( config ) {
	// *表示重要
	config.language = 'zh-cn';				// *界面语言，默认为 en
	config.width = 'auto';					// *宽度
	config.height = '500px';				// *高度
	config.uiColor = '#f5f5f5';				// *背景颜色
	config.toolbarCanCollapse = true;		// *工具栏默认是否可展开
	config.toolbarStartupExpanded = true;	// 取消"拖拽以改变尺寸"功能-plugins/resize/plugin.js
	config.autoUpdateElement = true;		// 当提交包含有此编辑器的表单时，是否自动更新元素内的数据
	config.baseHref = ''					// 设置是使用绝对目录还是相对目录，为空为相对目录
	config.baseFloatZIndex = 10000;			// 编辑器的z-index值
	config.disableNativeSpellChecker = true;// *是否拒绝本地拼写检查和提示，默认为拒绝，目前仅firefox和safari支持-plugins/wysiwygarea/plugin.js
	config.disableNativeTableHandles = true;// 进行表格编辑功能，如：添加行或列，默认为不开启，目前仅firefox支持-plugins/wysiwygarea/plugin.js
	config.fullPage = true;					// 是否使用完整的html编辑模式 如使用，其源码将包含：<html><body></body></html>等标签
	config.font_names = '微软雅黑/Microsoft YaHei;幼圆/YouYuan;宋体/SimSun;新宋体/NSimSun;仿宋/FangSong;楷体/KaiTi;仿宋_GB2312/FangSong_GB2312;'
		+ '楷体_GB2312/KaiTi_GB2312;黑体/SimHei;华文细黑/STXihei;华文楷体/STKaiti;华文宋体/STSong;华文中宋/STZhongsong;'
		+ '华文仿宋/STFangsong;华文彩云/STCaiyun;华文琥珀/STHupo;华文隶书/STLiti;华文行楷/STXingkai;华文新魏/STXinwei;'
		+ '方正舒体/FZShuTi;方正姚体/FZYaoti;细明体/MingLiU;新细明体/PMingLiU;微软正黑/Microsoft JhengHei;'
		+ 'Arial Black/Arial Black;'
		+ config.font_names;				// *增加字体
};