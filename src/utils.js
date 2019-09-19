export function exec(fn) {
	if (typeof fn === 'function') {
		fn.apply(this, [].slice.call(arguments, 1));
	}
}

export function random(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

export function safeValue(value, min, max) {
	return value < min ? min : value > max ? max : value;
}

export function hasKey(obj, key) {
	return Object.prototype.hasOwnProperty.call(obj, key);
}

export function kebabCase(str) {
	const pattern = /[A-Z]/g;
	return str.replace(pattern, function(m, i) {
		return (i > 0 ? '-' + m : m).toLowerCase();
	});
}

export function getType(value) {
	if (value === null) {
		return 'Null';
	}
	if (value === undefined) {
		return 'Undefined';
	}
	return Object.prototype.toString.call(value).slice(8, -1);
}

export function isElement(value) {
	const pattern = /^HTML(\w+)Element$/;
	const match = pattern.exec(getType(value));
	return match && match[1] !== 'Unknown';
}

export function isString(value) {
	return getType(value) === 'String';
}

export function isObject(value) {
	return getType(value) === 'Object';
}

export function isFunction(value) {
	return getType(value) === 'Function';
}

export function getContainer(container) {
	if (isElement(container)) {
		return container;
	}
	if (isString(container)) {
		return document.querySelector(container);
	}
	return document.body;
}

export function insertBefore(el, container) {
	const first = container.firstChild;
	if (first) {
		container.insertBefore(el, first);
	} else {
		container.appendChild(el);
	}
}

export function setStyle(element, style) {
	const css = [];
	for (const key in style) {
		if (hasKey(style, key)) {
			css.push(kebabCase(key) + ':' + style[key]);
		}
	}
	element.style.cssText = css.join(';');
}

export function createElement(classList, style, html) {
	const list = [].concat(classList);
	const el = document.createElement('div');
	el.className = list.join(' ');
	isObject(style) && setStyle(el, style);
	if (html) {
		el.innerHTML = html;
	}
	return el;
}

export function createAnimationFrame() {
	const frames = [
		window.requestAnimationFrame,
		window.webkitRequestAnimationFrame,
		window.mozRequestAnimationFrame,
		window.oRequestAnimationFrame,
		window.msRequestAnimationFrame
	];
	const frame = frames.filter(Boolean)[0];
	if (frame) {
		return frame;
	}
	return function(fn) {
		return setTimeout(function() {
			exec(fn, Date.now());
		}, 1000 / 60);
	};
}

export function stopAnimationFrame(id) {
	if (typeof window.cancelAnimationFrame === 'function') {
		return window.cancelAnimationFrame(id);
	}
	return clearTimeout(id);
}

export function animation(autoStop = true) {
	let prev = 0;
	let start = null;
	let animationFrameId = null;
	let cancel = false;
	const animationFrame = createAnimationFrame();
	const stop = function() {
		stopAnimationFrame(animationFrameId);
		cancel = true;
	};
	return function(duration, next, end) {
		var run = function(timestamp) {
			if (!start) {
				start = timestamp;
			}
			var delta = timestamp - start;
			var data = {
				current: timestamp,
				previous: prev,
				start: start,
				delta: delta,
				durationEnd: delta >= duration
			};
			if (autoStop && data.durationEnd) {
				stopAnimationFrame(animationFrameId);
				return exec(end, data, stop);
			}
			exec(next, data, stop);
			if (!cancel) {
				prev = timestamp;
				animationFrameId = animationFrame(run);
			}
		};
		cancel = false;
		animationFrameId = animationFrame(run);
	};
}

export function defineReadOnlyProps(props) {
	const properties = props.reduce((acc, item) => {
		acc[item.key] = {
			value: item.value,
			writable: false,
			enumerable: true,
			configurable: false
		};
		return acc;
	}, {});
	Object.defineProperties(this, properties);
}
