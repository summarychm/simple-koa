//@ts-check
const Emitter = require("events");
const http = require("http");
const compose = require("@koa-compose");
class Application extends Emitter {
	constructor(options) {
		super();
		options = options || {};
		this.middleware = [];
		this.env = options.env || process.env || "development";
		this.context = {};
		this.request = {};
		this.response = {};
	}
	// koa初始化
	callback() {
		const middlewareFn = compose(this.middleware);
		if (!this.listenerCount("error")) this.on("error", this.onerror);

		// 接收到新http请求
		const handleRequest = (req, res) => {
			console.log("============ req begin ====================");
			console.log(req);
			console.log(res);
			console.log("============ req end ======================");
		};
		return handleRequest;
	}
	// 创建httpServer,内部创建
	listen(...args) {
		const server = http.createServer(this.callback());
		return server.listen(...args);
	}
	onerror(error) {
		console.log("默认的error方法");
		console.error(error);
	}
}

module.exports = Application;
