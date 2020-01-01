//@ts-check
const Emitter = require("events");
const http = require("http");
const compose = require("@koa-compose");
const context = require("./context");
const request = require("./request");
const response = require("./response");

class Application extends Emitter {
	constructor(options) {
		super();
		options = options || {};
		this.middleware = [];
		this.env = options.env || process.env || "development";
		// 方便对实例进行修改,而不污染默认对象
		this.context = Object.create(context);
		this.request = Object.create(request);
		this.response = Object.create(response);
	}
	// 创建httpServer,入口方法
	listen(...args) {
		const server = http.createServer(this.callback());
		return server.listen(...args);
	}
	// koa初始化
	callback() {
		const middlewareFn = compose(this.middleware);

		// 注册默认error回调
		if (!this.listenerCount("error")) this.on("error", this.onerror);

		// 接收到新http请求
		const handleFN = (req, res) => {
			const ctx = this.createContext(req, res);
			this.handleRequest(ctx, middlewareFn);
		};
		return handleFN;
	}
	// 根据req,res创建ctx
	createContext(req, res) {
		const ctx = this.context;
		const request = (ctx.request = this.request);
		const response = (ctx.response = this.response);

		ctx.app = response.app = request.app = this;
		ctx.req = response.req = request.req = req;
		ctx.res = response.res = request.res = res;
		request.ctx = response.ctx = ctx;
		request.response = response; // req,res相互指向
		response.request = request; // res,req相互指向
		ctx.originalUrl = request.originalUrl = req.url;
		ctx.state = {};
		return ctx;
	}
	// 调用中间件处理请求,并下发res
	handleRequest(ctx, middlewareFn) {
		const res = ctx.res;
		res.statusCode = 404;
		const onerror = (err) => ctx.onerror(err);
		const handleResponse = () => respond(ctx);
		middlewareFn(ctx)
			.then(handleResponse)
			.catch(onerror);
	}
	use(fn) {
		this.middleware.push(fn);
		return this;
	}
	onerror(error) {
		console.log("默认的error方法");
		console.error(error);
	}
}

function respond(ctx) {
	const res = ctx.res;
	let body = ctx.body;

	// responses
	if (Buffer.isBuffer(body)) return res.end(body);
	if ("string" == typeof body) return res.end(body);
	// body: json
	body = JSON.stringify(body);
	if (!res.headersSent) {
		ctx.length = Buffer.byteLength(body);
	}
	res.end(body);
}

module.exports = Application;
