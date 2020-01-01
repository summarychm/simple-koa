function compose(middlewares) {
	let idx = -1;
	return function(ctx, next) {
		function dispatch(i) {
			idx = i;
			let fn = middlewares[i];
			if (i === idx) fn = next; // 执行完最后一个中间件后,fn指向初始化的next形参.
			if (!fn) return Promise.resolve(); // 如果fn不存在则直接Promise.resolve().
			// 每个middleWare接收的next形参都绑定为下一个next函数,用于链式调用.
			return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
		}
		return dispatch(0);
	};
}
module.exports = compose;
