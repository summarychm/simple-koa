const Emitter = require("events");
const http = require("http");
const Stream = require("stream");
const compose = require("@koa-compose");
const context = require("./context");
const request = require("./request");
const response = require("./response");

class Application extends Emitter {
	constructor(options) {
		super();
		options = Object.assign({}, options);
		this.middleware = []; // 存放中间件集合
		this.env = options.env || process.env || "development";

		// 方便对实例进行修改,而不污染默认对象(如实例listen多个端口的情况)
		this.context = Object.create(context);
		this.request = Object.create(request);
		this.response = Object.create(response);
	}
	// 创建httpServer,入口方法
	listen(...args) {
		const server = http.createServer(this.callback());
		return server.listen(...args);
	}
	// koa中间件初始化(合并中间件,构建ctx,注入http.createServer)
	callback() {
		// 注册默认error回调
		if (!this.listenerCount("error")) this.on("error", this.onerror);

		const middlewareFn = compose(this.middleware); // 合并use注册的所有中间件为一个统一的函数

		// 原生http.createServer的处理函数(request,response)
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
		ctx.state = {}; // 用于中间件间相互传值
		return ctx;
	}
	// 调用中间件处理请求,所有中间件处理完毕后,通过ctx.body下发res
	handleRequest(ctx, middlewareFn) {
		const res = ctx.res;
		res.statusCode = 404;
		middlewareFn(ctx)
			.then(() => respond(ctx))
			.catch(ctx.onerror);
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

/** 下发response,支持四种类型(Buffer/String/Stream/JSON)
 * @param {Object} ctx koa实例
 */
function respond(ctx) {
	const res = ctx.res;
	let body = ctx.body;

	if (Buffer.isBuffer(body)) return res.end(body); // Buffer
	if ("string" == typeof body) return res.end(body); // String
	if (body instanceof Stream) return body.pipe(res); // Stream,使用pipe单独处理
	// body: JSON
	body = JSON.stringify(body);
	if (!res.headersSent) ctx.length = Buffer.byteLength(body);
	res.end(body);
}

module.exports = Application;
