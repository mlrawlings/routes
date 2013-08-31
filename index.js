(function() {

var Routes
  , listeners = []

if(module && module.exports)
	Routes = module.exports = { sensitive:false, strict:false }
else
	Routes = window.Routes = { sensitive:false, strict:false }

Routes.go = function(url, state, title) {
	history.pushState(state || {}, title || '', url)
	for(var i = 0; i < listeners.length; i++) {
		routeHandler(listeners[i], url, state) 
	}
}
Routes.refresh = function(url, state, title) {
	history.replaceState(state || {}, title || '', url)
	for(var i = 0; i < listeners.length; i++) { 
		routeHandler(listeners[i], url, state) 
	}
}
Routes.on = function(path, callback) {
	var listener = {
		  regex: pathRegExp(path)
		, path: path
		, callback: callback
	}
	listeners.push(listener)
	routeHandler(listener, window.location.pathname)
}
Routes.off = function(path, callback) {
	for(var i = 0; i < listeners.length; i++) {
		if(listeners[i].path == path && (!callback || listeners[i].callback == callback)) {
			listeners.splice(i, 1)
		}
	}
}

window.onpopstate = function(event) {
	for(var i = 0; i < listeners.length; i++) {
		routeHandler(listeners[i], window.location.pathname, event.state) 
	}
}

function routeHandler(listener, path, state) {
	var matches = listener.regex.exec(path)
	if(matches) {
		var params = getParams(matches)
		listener.callback.apply(state, params)
	}
}

function getParams(matches) {
	var params = []
	for(var i = 1; i < matches.length; i++) params.push(matches[i])
	return params
}

function pathRegExp(path) {
	if ({}.toString.call(path) == '[object RegExp]') return path;
	if (Array.isArray(path)) path = '(' + path.join('|') + ')';
	path = path
		.concat(Routes.strict ? '' : '/?')
		.replace(/\/\(/g, '(?:/')
		.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
			slash = slash || '';
			return ''
				+ (optional ? '' : slash)
				+ '(?:'
				+ (optional ? slash : '')
				+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
				+ (optional || '')
				+ (star ? '(/*)?' : '');
		})
		.replace(/([\/.])/g, '\\$1')
		.replace(/\*/g, '(.*)');
	return new RegExp('^' + path + '$', Routes.sensitive ? '' : 'i');
}

})()