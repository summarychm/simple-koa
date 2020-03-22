const path = require("path");
const Koa = require("@koa");
const static = require("@koa-static");
const better = require("@koa-better-body");

const app = new Koa();
app.use(static(path.join(__dirname, "../public")));

app.use(
	better({
		uploadDir: path.resolve(__dirname, "../upload"),
	}),
);
app.use(async (ctx, next) => {
	if (ctx.path === "/form" && ctx.method === "POST") {
		// let obj = await bodyPaser(ctx.req); ctx.request.body
		ctx.type = "json";
		ctx.body = ctx.request.fields;
	}
});

app.use(async (ctx, next) => {
	console.log("顺序", 5);
	ctx.body = "Hello World";
	console.log("顺序", 6);
	next();
});

app.listen(3000);
