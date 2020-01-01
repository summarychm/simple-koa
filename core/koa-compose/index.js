/** 合并中间件数组为中间件执行器,通过next调用下一个中间件.
 * @param {Function[]} middlewares 中间件数组

 */
function compose(middlewares) {
	let idx = -1; // flag
	return function(ctx, callBack) {
		function dispatch(i) {
			idx = i;
			let fn = middlewares[idx];
			// 中间件数组已经执行完毕,如还在执行(最后一个中间件还调用next的错误情况)
			if (idx === middlewares.length) fn = callBack;

			// 如果fn不存在则直接Promise.resolve().
			if (!fn) return Promise.resolve();

			// 每个middleWare接收的next形参都绑定为调用下一个中间的next函数,用于链式调用.
			return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
		}
		return dispatch(0);
	};
}
module.exports = compose;
