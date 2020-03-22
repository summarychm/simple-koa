//@ts-check
const fs = require("fs");
const path = require("path");
const mime = require("mime");

let fsPromise = fs.promises;

/** 静态服务
 * @param {String} root 静态资源路径
 * @param {any} opts
 */
function static(root, opts) {
	opts = Object.assign({}, opts); // 读取opts
	opts.root = path.resolve(root); // 将root转为绝对路径
	opts.index = opts.index || "index.html";

	return async (ctx, next) => {
		try {
			// 只处理GET|HEAD请求,其他请求直接调用next()
			if (ctx.method !== "HEAD" && ctx.method !== "GET") return next();
			let requestPath = path.join(opts.root, ctx.path);
			let reqStats = await fsPromise.stat(requestPath);
			if (reqStats.isDirectory()) {
				requestPath += opts.index;
				reqStats = await fsPromise.stat(requestPath);
			}
			ctx.set("Content-Type", mime.getType(requestPath) + ";charset=utf8");
			ctx.set("Content-Length", reqStats.size);
			ctx.body = fs.createReadStream(requestPath); // 使用readStream下发资源
		} catch (error) {
			return next(); // 路径不存在等,直接next()
		}
	};
}

module.exports = static;
