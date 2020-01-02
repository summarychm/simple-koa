const path = require("path");
const Koa = require("@koa");
const static = require("@koa-static");
const app = new Koa();

app.use(static(path.join(__dirname, "../public")));

app.use(async (ctx, next) => {
	console.log("顺序", 5);
	ctx.body = "Hello World";
	console.log("顺序", 6);
	next();
});

app.listen(3000);
