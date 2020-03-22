const Cookies = require("cookies");
const delegate = require("@delegates");

const COOKIES = Symbol.for("context@cookies");

const ctx = {
	get cookies() {
		if (!this[COOKIES]) {
			this[COOKIES] = new Cookies(this.req, this.res, {
				keys: this.app.keys, // 从koa实例上获取keys属性
				//TODO 这里应该可以直接用this.secure.
				secure: this.secure, // 从req上获取secure this.request.secure
			});
		}
		return this[COOKIES];
	},
	set cookies(_cookies) {
		this[COOKIES] = _cookies;
	},
	onerror(err) {
		if (null == err) return;
		this.app.emit("error", err, this);
		// respond
		const msg = err.expose ? err.message : statuses[err.status];
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
