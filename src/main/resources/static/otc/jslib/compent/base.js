var base = "";

//********************** lib（外部依赖库） *************************

//jquery
document.write('<script src="' + base + '/jslib/jquery/jquery-3.4.1.min.js" type="text/javascript"></script>');

//jqueryui
document.write('<link href="' + base + '/jslib/jquery.ui/jquery-ui.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/jquery.ui/jquery-ui.js" type="text/javascript"></script>');

//jtemplates
document.write('<script src="' + base + '/jslib/jquery.jtemplates/jquery-jtemplates.js" type="text/javascript"></script>');



//********************** compent（组件） *************************

//base（基础样式、基础工具函数）
document.write('<link href="' + base + '/jslib/compent/base/base.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/compent/base/base.js" type="text/javascript"></script>');

//弹框
document.write('<link href="' + base + '/jslib/compent/dialog/base.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/compent/dialog/base.js" type="text/javascript"></script>');

//日期输入：asDatepicker
document.write('<link href="' + base + '/jslib/jquery.asDatepicker/css/asDatepicker.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/jquery.asDatepicker/js/jquery-asDatepicker.js" type="text/javascript"></script>');
document.write('<script src="' + base + '/jslib/jquery.asDatepicker/js/language.js" type="text/javascript"></script>');

//表单
document.write('<link href="' + base + '/jslib/compent/form/base.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/compent/form/base.js" type="text/javascript"></script>');

//分页
document.write('<link href="' + base + '/jslib/compent/page/base.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/compent/page/base.js" type="text/javascript"></script>');

//表格
document.write('<link href="' + base + '/jslib/compent/table/base.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/compent/table/base.js" type="text/javascript"></script>');

//布局
document.write('<link href="' + base + '/jslib/compent/layout/base.css" type="text/css" rel="stylesheet"/>');
document.write('<script src="' + base + '/jslib/compent/layout/base.js" type="text/javascript"></script>');
