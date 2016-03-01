var Util = {

	/* class 操作 */
	addSingleClass: function(node, cls) {
		if (!this.hasClass(node, cls)) {
			node.className += (node.className === '' ? '' : ' ') + cls;
		}
	},
	removeSingleClass: function(node, cls) {
		var reg = new RegExp('\\b' + cls + '\\b', 'g'),
			tmp = node.className.replace(reg, '').replace(/\s{2,}/g, ' ');
		node.className = this.trim(tmp);
	},
	hasClass: function(node, cls) {
		var reg = new RegExp('\\b' + cls + '\\b', 'g');
		return reg.test(node.className);
	},
	addClass: function(nodes, cls) {
		if (nodes.length) {
			for (var i = 0; i < nodes.length; i++) {
				this.addSingleClass(nodes[i], cls);
			}
		} else {
			this.addSingleClass(nodes, cls);
		}
	},
	removeClass: function(nodes, cls) {
		if (nodes.length) {
			for (var i = 0; i < nodes.length; i++) {
				this.removeSingleClass(nodes[i], cls);
			}
		} else {
			this.removeSingleClass(nodes, cls);
		}
	},
	trim: function(str) {
		return str.replace(/(^\s+)|(\s+$)/g, '');
	},


	/*dom 事件*/

	bind: function(node, type, handler) {
		if (!node) return false;
		if (node.addEventListener) {
			node.addEventListener(type, handler, false);
			return true;
		} else if (node.attachEvent) {
			node['e' + type + handler] = handler;
			node[type + handler] = function() { //处理 ie 里的 this，同时方便 unbind
				node['e' + type + handler](window.event);
			};
			node.attachEvent('on' + type, node[type + handler]);
			return true;
		}
		return false;
	},

	unbind: function(node, type, handler) {
		if (!node) return false;
		if (node.removeEventListener) {
			node.removeEventListener(type, handler, false);
			return true;
		} else if (node.detachEvent) {
			node.detachEvent('on' + type, node[type + handler]);
			node[type + handler] = null;
		}
		return false;
	},

	//给dom数组批量绑定事件
	batchBind: function(nodes, type, handler) {
		for (var i = 0; i < nodes.length; i++) {
			this.bind(nodes[i], type, handler);
		}
	},

	batchUnBind: function(nodes, type, handler) {
		for (var i = 0; i < nodes.length; i++) {
			this.unbind(nodes[i], type, handler);
		}
	},

	getEvent: function(e) {
		return e || window.event;
	},

	getTarget: function(e) {
		return e.target || e.scrElement;
	},

	preventDefault: function(e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
	},

	stopPropagation: function(e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}

	},

	//返回一个元素是父亲的第几个孩子
	index: function(node) {
		var parent = node.parentElement,
			siblings = parent.children;
		for (var i = 0; i < siblings.length; i++) {
			if (node === siblings[i]) return i;
		}
		return -1;
	},

	/*JSON 操作*/
	extend: function(objTarget, objSrc1, objSrc2) {
		if (arguments.length < 2) {
			return;
		}
		var target;
		for (var i = 1; i < arguments.length; i++) {
			target = arguments[i];
			for (var key in target) {
				objTarget[key] = target[key];
			}
		}
	},

	/**
	 * 格式化输出日期
	 * @param  date 日期对象
	 * @return  String  替换后的字符串
	 * @eg:  Util.dateFormat(date, '%y-%M-%d %h:%m%s') => 2016-03-10 18:03:09
	 */
	dateFormat: function(date, fmtStr) {
		var y = date.getFullYear(),
			M = date.getMonth() + 1,
			d = date.getDate(),
			h = date.getHours(),
			m = date.getMinutes(),
			s = date.getSeconds();
		M = M >= 10 ? M : '0' + M;
		d = d >= 10 ? d : '0' + d;
		h = h >= 10 ? h : '0' + h;
		m = m >= 10 ? m : '0' + m;
		s = s >= 10 ? s : '0' + s;
		var tpl = fmtStr || '%y-%m-%d %h:%m:%s',
			result;
		result = tpl.replace('%y', y).replace('%m', M).replace('%d', d)
			.replace('%h', h).replace('%m', m).replace('%s', s);
		return result;
	},

	ajax: function(opts) {
		opts.success = opts.success || function() {};
		opts.error = opts.error || function() {};
		opts.type = opts.type || 'get';
		opts.dataType = opts.dataType || 'json';
		opts.data = opts.data || {};
		var dataStr = '';
		for (var key in opts.data) {
			dataStr += key + '=' + opts.data[key] + '&';
		}
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {

			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					//如数据类型是 text, 则不解析
					if (opts.dataType === 'text') {
						opts.success(xmlhttp.responseText);
					}
					if (opts.dataType === 'json') {
						var json = JSON.parse(xmlhttp.responseText);
						opts.success(json);
					}
				} else {
					opts.error();
				}
			}
		};

		dataStr = dataStr.substr(0, dataStr.length - 1);

		if (opts.type.toLowerCase() === 'post') {
			xmlhttp.open(opts.type, opts.url, true);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.send(dataStr);
		}
		if (opts.type.toLowerCase() === 'get') {
			xmlhttp.open(opts.type, opts.url + '?' + dataStr, true);
			xmlhttp.send();
		}
	},

	/**
	 * 通过传递模版字符串和json格式数据，获取替换后的字符串
	 * @param  {String} tpl  模版字符串;
	 * @param  {JSON} data 传递的json格式对象
	 * @return {String}      返回模版变量替换后的字符串
	 * @eg:
	 * var str = 'hello {{name}}, My friend is {{friend.name}}';
	 * var data = {name: 'hunger', friend: {name: 'valley'}};
	 * Util.template(str, data);
	 * //返回字符串： hello hunger, My friend is valley
	 */
	template: function(tpl, data) {
		var re = /{{([a-zA-Z$_][a-zA-Z$_0-9\.]*)}}/g;
		return tpl.replace(re, function(raw, key, offset, string) {
			var paths = key.split('.'),
				lookup = data;
			while (paths.length > 0) {
				lookup = lookup[paths.shift()];
			}
			return lookup || raw;
		});
	}

};