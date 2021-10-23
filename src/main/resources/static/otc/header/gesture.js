$(function(){
	
	// 阻止safari浏览器手势缩放
	document.addEventListener("gesturestart", function (event) {
		event.preventDefault();
	});
	
	// 阻止safari浏览器双击放大
	var lastTouchEnd = 0;
	document.addEventListener('touchend', function (event) {
		var now = (new Date()).getTime();
		if (now - lastTouchEnd <= 450) {
			event.preventDefault();
		}
		lastTouchEnd = now;
	}, false);
	
	// 两点的距离
	$.getDistance = function(p1, p2) {
		var x = p2.pageX - p1.pageX, y = p2.pageY - p1.pageY;
		return Math.sqrt((x * x) + (y * y));
	}
	
	// 两点的夹角
	$.getAngle = function(p1, p2) {
		var x = p1.pageX - p2.pageX, y = p1.pageY - p2.pageY;
		return Math.atan2(y, x) * 180 / Math.PI;
	}
	
	// 获取中点
	$.getMidpoint = function(p1, p2) {
		var x = (p1.pageX + p2.pageX) / 2, y = (p1.pageY + p2.pageY) / 2;
		return [ x, y ];
	}
	
	// android终端
	$.isAndroid = function () {
		var u = navigator.userAgent;
		return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; 
	};
	
	// 手势
	$.gesture = function(eles, gestureZoomCallback, swipeMoveCallback) {
		// 手势缩放
		var isDoubleTouch = false;	// 是否为多触点
		var start;					// 存放触点坐标
		var midPoint;				// 起点相对元素中点
		
		// 单指滑动
		var isTouch = false;		// 是否为单触点
		var startPosition;			// 滑动起点
		
		// 记录手势起点
		eles.on('touchstart', function(e) {
			if (e.touches.length >= 2) {							// 是否有两个点在屏幕上
				isDoubleTouch = true;
				start = e.touches;									// 得到第一组两个点
				var sMinPoint = $.getMidpoint(start[0], start[1]);	// 获取两个触点中心坐标
				midPoint = [										// 获取中心点坐标相对目标元素坐标
						sMinPoint[0] - e.target.offsetLeft,
						sMinPoint[1] - e.target.offsetTop];
			} else {
				isTouch = true;
				startPosition = [ e.touches[0].pageX, e.touches[0].pageY ];
			}
		});
	
		// 监听touchmove事件
		eles.on('touchmove', function(e) {
			event.preventDefault();
			if (e.touches.length >= 2 && isDoubleTouch) {			// 手势事件
				var now = e.touches;								// 得到第二组两个点
				var scale = $.getDistance(now[0], now[1]) / $.getDistance(start[0], start[1]);	// 缩放比例
				var rotation = $.getAngle(now[0], now[1]) - $.getAngle(start[0], start[1]);		// 旋转角度差
				if (gestureZoomCallback) gestureZoomCallback(scale, rotation);
			} else if (isTouch) {
				var movePosition = [ e.touches[0].pageX - startPosition[0], e.touches[0].pageY - startPosition[1] ];
				startPosition = [ e.touches[0].pageX, e.touches[0].pageY ];
				if (swipeMoveCallback) swipeMoveCallback([ movePosition[0], movePosition[1]]);
			}
		});
	};
	
});