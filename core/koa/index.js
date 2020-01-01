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
	//
	callback() {
		// const middlewareFn = compose(this.middleware);
		// 接收到新请求
		return function handleRequest(req, res) {
			console.log("============ req begin ====================");
			console.log(req);
			console.log(res);
			console.log("============ req end ======================");
		};
	}
	// 创建httpServer,内部创建
	listen(...args) {
		const server = http.createServer(this.callback());
		return server.listen(...args);
	}
}

module.exports = Application;
