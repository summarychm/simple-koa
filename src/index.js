const Koa = require("@koa");
const app = new Koa();

// logger

app.use(async (ctx, next) => {
	console.log("顺序", 1);

	await next();
	console.log("顺序", 2);
	const rt = ctx.response.get("X-Response-Time");
	console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
	console.log("顺序", 3);
	const start = Date.now();
	await next();
	console.log("顺序", 4);
	const ms = Date.now() - start;
	ctx.set("X-Response-Time", `${ms}ms`);
});

// response

app.use(async (ctx, next) => {
	console.log("顺序", 5);
	ctx.body = "Hello World";
	console.log("顺序", 6);
	next();
});

app.listen(3000);
