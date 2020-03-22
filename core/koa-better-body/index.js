let fs = require("fs");
let uuid = require("uuid");
let path = require("path");

let betterBody = ({ uploadDir }) => {
	return async (ctx, next) => {
		await new Promise((resolve, reject) => {
			let arr = [];
			ctx.req.on("data", function(data) {
				arr.push(data);
			});
			ctx.req.on("end", function() {
				let contentType = ctx.get("Content-Type");
				if (contentType.includes("multipart/form-data")) {
					let boundary = "--" + contentType.split("=")[1];
					let buffer = Buffer.concat(arr);
					let lines = buffer.split(boundary).slice(1, -1);
					ctx.request.fields = {};
					lines.forEach((line) => {
						let [head, body] = line.split("\r\n\r\n");
						head = head.toString(); // 字符串
						let key = head.match(/name="([\s\S]+?)"/)[1];
						// 文件
						if (head.includes("filename")) {
							// body 不一定是完整的数据
							let content = line.slice(head.length + 4, -2);
							// content文件的二进制内容
							let filename = uuid.v4();
							let pathname = path.join(uploadDir, filename);
							fs.writeFileSync(pathname, content);
							let obj = {
								size: content.length,
								path: pathname,
							};
							ctx.request.fields[key] ? ctx.request.fields[key].push(obj) : (ctx.request.fields[key] = [obj]);
						} else {
							let value = body.toString().slice(0, -2);
							ctx.request.fields[key] = value;
						}
					});
					resolve();
				}
			});
		});
		await next();
	};
};
module.exports = betterBody;

Buffer.prototype.split = function(sep) {
	let arr = [];
	let len = Buffer.from(sep).length;
	let offset = 0;
	let current;
	while (-1 !== (current = this.indexOf(sep, offset))) {
		arr.push(this.slice(offset, current));
		offset = current + len;
	}
	arr.push(this.slice(offset));
	return arr;
};
