/** 合并中间件数组为中间件执行器(单一函数,通过next调用下一个中间件).
 * @param {Function[]} middlewares 中间件数组
 */
function compose(middlewares) {
	let idx = -1; // flag
	return function(ctx, callBack) {
		function dispatch(i) {
			idx = i;
			let fn = middlewares[idx];
			// 边界条件跳出循环
			if (idx === middlewares.length) fn = callBack;

			if (!fn) return Promise.resolve(); //处理fn为空的情况
			try {
				// 延迟绑定,next都被绑定为调用下一个中间的懒执行函数,用于中间件链式调用.
				return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
			} catch (err) {
				return Promise.reject(err);
			}
		}
		return dispatch(0);
	};
}
module.exports = compose;
