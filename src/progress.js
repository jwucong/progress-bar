import {
	exec,
	hasKey,
	random,
	safeValue,
	isFunction,
	getContainer,
	createElement,
	insertBefore,
	animation,
	defineReadOnlyProps
} from './utils';

class JwcProgress {
	constructor(options) {
		const defaults = {
			template: '',
			container: null,
			containerStyle: null,
			customClass: '',
			classPrefix: 'jwc',
			inlineStyle: true,
			duration: 1500,
			timeout: 0,
			slowRange: '85-96',
			stopAt: 99,
			onReady: null,
			onInited: null,
			onStart: null,
			onProgress: null,
			onDone: null,
			onTimeout: null
		};
		defineReadOnlyProps.call(this, [
			{ key: 'name', value: 'jwcProgress' },
			{ key: 'version', value: '1.0.0' }
		]);
		this.options = Object.assign({}, defaults, options || {});
		this.$wrapNode = null;
		this.$lineNode = null;
		this.$textNode = null;
		this.waker = null;
		this.queue = [];
		this.running = false;
		this.ended = false;
		this.progress = 0;
		this.container = getContainer(this.options.container) || null;
		this.ready = Boolean(this.container);
		if (!this.ready) {
			const timerId = setInterval(() => {
				const container = getContainer(this.options.container);
				if (Boolean(container)) {
					clearInterval(timerId);
					this.ready = true;
					this.container = container;
					exec.call(this, this.options.onReady);
					this.queue.forEach(item => item.api.apply(this, item.args), this);
					this.queue = [];
				}
			}, 10);
		}
		this.init();
	}

	init() {
		if (this.$wrapNode) {
			return this;
		}
		const conf = this.options;
		const classList = ls => {
			return [].concat(ls).map(item => conf.classPrefix + '-' + item);
		};
		const template = conf.template;
		let node = null;
		if (template) {
			const pattern = /^\<[a-z]+\>[^<]+\>$/;
			let div = document.createElement('div');
			div.innerHTML = template;
			node = pattern.test(template) ? div.firstElementChild : div;
		} else {
			const css = style => (conf.inlineStyle ? style : null);
			const wrapCss = Object.assign(
				{
					position: 'fixed',
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					zIndex: 999,
					backgroundColor: '#fff'
				},
				conf.containerStyle
			);
			const wrapper = createElement(
				classList('progress-container'),
				css(wrapCss)
			);
			const lineBox = createElement(
				classList('progressbar-full'),
				css({
					position: 'absolute',
					top: '50%',
					left: 0,
					width: '100%',
					height: '1px',
					overflow: 'hidden'
				})
			);
			const line = createElement(
				classList('progressbar-now'),
				css({
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: 0,
					borderTop: '1px solid #000',
					transform: 'scaleY(0.5) translateX(-100%)'
				})
			);
			const value = createElement(
				classList('progress-val'),
				css({
					position: 'absolute',
					bottom: '35px',
					left: 0,
					width: '100%',
					textAlign: 'center',
					fontSize: '12px',
					color: '#999'
				}),
				'0%'
			);
			lineBox.appendChild(line);
			wrapper.appendChild(lineBox);
			wrapper.appendChild(value);
			node = wrapper;
			this.$lineNode = line;
			this.$textNode = value;
		}
		if (conf.customClass && !node.classList.contains(conf.customClass)) {
			node.classList.add(conf.customClass);
		}
		this.$wrapNode = node;
		insertBefore(this.$wrapNode, this.container);
		exec.call(this, conf.onInited);
		return this;
	}

	setProgress(value) {
		const progress = safeValue(value, 0, 100);
		const p1 = parseInt(this.progress, 10);
		const p2 = parseInt(progress, 10);
		if (this.$lineNode) {
			const x = progress - 100;
			this.$lineNode.style.transform = `scaleY(0.5) translateX(${x}%)`;
		}
		if (this.$textNode && p2 - p1 >= 1) {
			this.$textNode.innerText = p2 + ' %';
		}
		this.progress = progress;
		exec.call(this, this.options.onProgress, progress);
	}

	start(duration) {
		if (this.running) {
			return this;
		}
		const that = this;
		const conf = this.options;
		const stopAt = parseFloat(conf.stopAt) || 99;
		const slowRange = conf.slowRange.split('-');
		const slowMin = Math.min.apply(null, slowRange);
		const slowMax = Math.max.apply(null, slowRange);
		const time = parseInt(duration || conf.duration, 10) || 1200;
		const min = safeValue(slowMin, 70, stopAt);
		const max = safeValue(slowMax, min, stopAt);
		const p1 = random(5, 20);
		const p2 = random(min, max);
		const ratio = random(24, 30) / 10;
		const t1 = Math.floor(((p1 * ratio) / 100) * time);
		const t2 = time - t1;
		const timeout = parseInt(conf.timeout, 10);
		let intervalId = null;
		const startTime = Date.now();
		const next = function(data, stop) {
			if (timeout && Date.now() - startTime >= timeout) {
				stop();
				clearInterval(intervalId);
				exec.call(that, conf.onTimeout);
				return;
			}
			let progress = that.progress;
			if (!that.ended && progress >= p2) {
				stop();
				const step = 0.028;
				intervalId = setInterval(function() {
					if (progress >= stopAt) {
						return clearInterval(intervalId);
					}
					if (timeout && Date.now() - startTime >= timeout) {
						clearInterval(intervalId);
						exec.call(that, conf.onTimeout);
						return;
					}
					progress += step;
					that.setProgress(progress);
				}, 200);
				return;
			}
			that.ended && clearInterval(intervalId);
			var first = data.current - data.start === 0;
			var delta = data.current - data.previous;
			if (progress < p1) {
				progress += (p1 / t1) * (first ? 17 : delta);
				progress = progress > p1 ? p1 : progress;
			} else if (progress < p2) {
				progress += (p2 / t2) * (first ? 17 : delta);
				progress = progress > p2 ? p2 : progress;
			} else {
				progress += that.ended ? 1.5 : (p1 / t1) * (first ? 17 : delta);
			}
			that.setProgress(progress);
			if (that.progress >= 100) {
				stop();
				that.running = false;
				that.waker = null;
				exec.call(that, conf.onDone);
			}
		};
		const runer = animation(false);
		this.waker = function() {
			this.running = true;
			runer(time, next);
		};
		this.waker();
		exec.call(that, conf.onStart);
		return this;
	}

	done() {
		this.ended = true;
		exec.call(this, this.waker);
		this.waker = null;
		return this;
	}

	show() {
		if (!this.$wrapNode) {
			return this;
		}
		this.$wrapNode.style.opacity = 1;
		this.$wrapNode.style.display = 'block';
		return this;
	}

	hide() {
		if (!this.$wrapNode) {
			return this;
		}
		this.$wrapNode.style.opacity = 0;
		this.$wrapNode.style.display = 'none';
		return this;
	}

	fadeIn(duration, callback) {
		const el = this.$wrapNode;
		if (!el || el.style.display !== 'none') {
			return this;
		}
		const setOpacity = function(value) {
			el.style.opacity = safeValue(value, 0, 1);
		};
		setOpacity(0);
		el.style.display = 'block';
		const that = this;
		const time = parseInt(duration, 10) || 750;
		let opacity = 0;
		const next = function(data) {
			const first = data.current - data.start === 0;
			const delta = data.current - data.previous;
			opacity += (1 / time) * (first ? 17 : delta);
			setOpacity(opacity);
		};
		const end = function() {
			opacity < 1 && setOpacity(1);
			exec.call(that, callback);
		};
		const runer = animation();
		runer(time, next, end);
		return this;
	}

	fadeOut(duration, callback) {
		const el = this.$wrapNode;
		if (!el || el.style.display === 'none') {
			return this;
		}
		const setOpacity = function(value) {
			el.style.opacity = safeValue(value, 0, 1);
		};
		setOpacity(1);
		el.style.display = 'block';
		const that = this;
		const time = parseInt(duration, 10) || 750;
		let opacity = 1;
		const next = function(info) {
			const first = info.current - info.start === 0;
			const delta = info.current - info.previous;
			opacity -= (1 / time) * (first ? 17 : delta);
			setOpacity(opacity);
		};
		const end = function() {
			opacity > 0 && setOpacity(0);
			el.style.display = 'none';
			exec.call(that, callback);
		};
		const runer = animation();
		runer(time, next, end);
		return this;
	}

	remove() {
		if (this.$wrapNode) {
			this.$wrapNode.parentNode.removeChild(this.$wrapNode);
		}
		this.$wrapNode = null;
		this.$lineNode = null;
		this.$textNode = null;
		this.progress = 0;
		this.ended = false;
		this.running = false;
		this.waker = null;
		this.queue = [];
		return this;
	}
}

const rewrite = function(api) {
	return function(...args) {
		if (this.ready) {
			return api.apply(this, args);
		}
		this.queue.push({ api, args });
		return this;
	};
};

const rewriteApi = function() {
	const proto = JwcProgress.prototype;
	const keys = Object.getOwnPropertyNames(proto);
	const apis = keys.filter(key => key !== 'constructor');
	apis.forEach(api => {
		if (hasKey(proto, api) && isFunction(proto[api])) {
			proto[api] = rewrite(proto[api]);
		}
	});
};

rewriteApi();

export default JwcProgress;
