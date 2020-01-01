const URL = require("url").URL;
const contentType = require("content-type");
const stringify = require("url").format;
const parse = require("parseurl");
const qs = require("querystring");

const request = {
	/**
	 * Return request header.
	 *
	 * @return {Object}
	 * @api public
	 */
	get header() {
		return this.req.headers;
	},
	/**
	 * Set request header.
	 *
	 * @api public
	 */
	set header(val) {
		this.req.headers = val;
	},
	/**
	 * Return request header, alias as request.header
	 *
	 * @return {Object}
	 * @api public
	 */

	get headers() {
		return this.req.headers;
	},

	/**
	 * Set request header, alias as request.header
	 *
	 * @api public
	 */

	set headers(val) {
		this.req.headers = val;
	},

	/**
	 * Get request URL.
	 *
	 * @return {String}
	 * @api public
	 */

	get url() {
		return this.req.url;
	},

	/**
	 * Set request URL.
	 *
	 * @api public
	 */

	set url(val) {
		this.req.url = val;
	},
	/**
	 * Get request method.
	 *
	 * @return {String}
	 * @api public
	 */

	get method() {
		return this.req.method;
	},

	/**
	 * Set request method.
	 *
	 * @param {String} val
	 * @api public
	 */

	set method(val) {
		this.req.method = val;
	},

	/**
	 * Get request pathname.
	 *
	 * @return {String}
	 * @api public
	 */

	get path() {
		return parse(this.req).pathname;
	},

	/**
	 * Set pathname, retaining the query-string when present.
	 *
	 * @param {String} path
	 * @api public
	 */

	set path(path) {
		const url = parse(this.req);
		if (url.pathname === path) return;

		url.pathname = path;
		url.path = null;

		this.url = stringify(url);
	},

	/**
	 * Get parsed query-string.
	 *
	 * @return {Object}
	 * @api public
	 */

	get query() {
		const str = this.querystring;
		const c = (this._querycache = this._querycache || {});
		return c[str] || (c[str] = qs.parse(str));
	},

	/**
	 * Set query-string as an object.
	 *
	 * @param {Object} obj
	 * @api public
	 */

	set query(obj) {
		this.querystring = qs.stringify(obj);
	},

	/**
	 * Get query string.
	 *
	 * @return {String}
	 * @api public
	 */

	get querystring() {
		if (!this.req) return "";
		return parse(this.req).query || "";
	},

	/**
	 * Set querystring.
	 *
	 * @param {String} str
	 * @api public
	 */

	set querystring(str) {
		const url = parse(this.req);
		if (url.search === `?${str}`) return;

		url.search = str;
		url.path = null;

		this.url = stringify(url);
	},

	/**
	 * Get the search string. Same as the querystring
	 * except it includes the leading ?.
	 *
	 * @return {String}
	 * @api public
	 */

	get search() {
		if (!this.querystring) return "";
		return `?${this.querystring}`;
	},

	/**
	 * Set the search string. Same as
	 * request.querystring= but included for ubiquity.
	 *
	 * @param {String} str
	 * @api public
	 */

	set search(str) {
		this.querystring = str;
	},

	/**
	 * Parse the "Host" header field host
	 * and support X-Forwarded-Host when a
	 * proxy is enabled.
	 *
	 * @return {String} hostname:port
	 * @api public
	 */

	get host() {
		const proxy = this.app.proxy;
		let host = proxy && this.get("X-Forwarded-Host");
		if (!host) {
			if (this.req.httpVersionMajor >= 2) host = this.get(":authority");
			if (!host) host = this.get("Host");
		}
		if (!host) return "";
		return host.split(/\s*,\s*/, 1)[0];
	},

	/**
	 * Parse the "Host" header field hostname
	 * and support X-Forwarded-Host when a
	 * proxy is enabled.
	 *
	 * @return {String} hostname
	 * @api public
	 */

	get hostname() {
		const host = this.host;
		if (!host) return "";
		if ("[" == host[0]) return this.URL.hostname || ""; // IPv6
		return host.split(":", 1)[0];
	},

	/**
	 * Get WHATWG parsed URL.
	 * Lazily memoized.
	 *
	 * @return {URL|Object}
	 * @api public
	 */

	get URL() {
		/* istanbul ignore else */
		if (!this.memoizedURL) {
			const originalUrl = this.originalUrl || ""; // avoid undefined in template string
			try {
				this.memoizedURL = new URL(`${this.origin}${originalUrl}`);
			} catch (err) {
				this.memoizedURL = Object.create(null);
			}
		}
		return this.memoizedURL;
	},

	/**
	 * Get the charset when present or undefined.
	 *
	 * @return {String}
	 * @api public
	 */

	get charset() {
		try {
			const { parameters } = contentType.parse(this.req);
			return parameters.charset || "";
		} catch (e) {
			return "";
		}
	},

	/**
	 * Return parsed Content-Length when present.
	 *
	 * @return {Number}
	 * @api public
	 */

	get length() {
		const len = this.get("Content-Length");
		if (len == "") return;
		return ~~len;
	},

	/**
	 * Return the request mime type void of
	 * parameters such as "charset".
	 *
	 * @return {String}
	 * @api public
	 */

	get type() {
		const type = this.get("Content-Type");
		if (!type) return "";
		return type.split(";")[0];
	},

	/**
	 * Return request header.
	 *
	 * The `Referrer` header field is special-cased,
	 * both `Referrer` and `Referer` are interchangeable.
	 *
	 * Examples:
	 *
	 *     this.get('Content-Type');
	 *     // => "text/plain"
	 *
	 *     this.get('content-type');
	 *     // => "text/plain"
	 *
	 *     this.get('Something');
	 *     // => ''
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	get(field) {
		const req = this.req;
		switch ((field = field.toLowerCase())) {
			case "referer":
			case "referrer":
				return req.headers.referrer || req.headers.referer || "";
			default:
				return req.headers[field] || "";
		}
	},
};

module.exports = request;
