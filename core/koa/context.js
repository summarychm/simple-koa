const Cookies = require("cookies");
const delegate = require("@delegates");

const COOKIES = Symbol.for("context@cookies");

const ctx = {
	get cookies() {
		if (!this[COOKIES]) {
			this[COOKIES] = new Cookies(this.req, this.res, {
				keys: this.app.keys, // 从koa实例上获取keys属性
				//TODO 这里应该可以直接用this.secure.
				secure: this.secure, // 从req上获取secure
				// secure: this.request.secure, // 从req上获取secure
			});
		}
		return this[COOKIES];
	},
	set cookies(_cookies) {
		this[COOKIES] = _cookies;
	},
	onerror(err) {
		// don't do anything if there is no error.
		// this allows you to pass `this.onerror`
		// to node-style callbacks.
		if (null == err) return;

		// delegate
		this.app.emit("error", err, this);
		// respond
		const code = statuses[err.status];
		const msg = err.expose ? err.message : code;
		this.status = err.status;
		this.length = Buffer.byteLength(msg);
		res.end(msg);
	},
};

/** Response delegation.
 */
delegate(ctx, "response")
	.method("remove")
	.method("has")
	.method("set")
	.method("append")
	.access("status")
	.access("body")
	.access("length")
	.access("type");

/** Request delegation.
 */
delegate(ctx, "request")
	.method("get")
	.access("querystring")
	.access("method")
	.access("query")
	.access("path")
	.access("url")
	.getter("origin")
	.getter("href")
	.getter("host")
	.getter("hostname")
	.getter("URL")
	.getter("header");

module.exports = ctx;
