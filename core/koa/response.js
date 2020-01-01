"use strict";

/**
 * Module dependencies.
 */

const getType = require("cache-content-type");
const statuses = require("statuses");

/**
 * Prototype.
 */

module.exports = {
	/**
	 * Return response header.
	 *
	 * @return {Object}
	 * @api public
	 */

	get header() {
		const { res } = this;
		return typeof res.getHeaders === "function" ? res.getHeaders() : res._headers || {}; // Node < 7.7
	},
	/**
	 * Get response status code.
	 *
	 * @return {Number}
	 * @api public
	 */

	get status() {
		return this.res.statusCode;
	},

	/**
	 * Set response status code.
	 *
	 * @param {Number} code
	 * @api public
	 */

	set status(code) {
		if (this.headerSent) return;
		this._explicitStatus = true;
		this.res.statusCode = code;
		if (this.req.httpVersionMajor < 2) this.res.statusMessage = statuses[code];
		if (this.body && statuses.empty[code]) this.body = null;
	},

	/**
	 * Get response body.
	 *
	 * @return {Mixed}
	 * @api public
	 */

	get body() {
		return this._body;
	},

	/**
	 * Set response body.
	 *
	 * @param {String|Buffer|Object} val
	 * @api public
	 */

	set body(val) {
		const original = this._body;
		this._body = val;

		// no content
		if (null == val) {
			if (!statuses.empty[this.status]) this.status = 204;
			this.remove("Content-Type");
			this.remove("Content-Length");
			this.remove("Transfer-Encoding");
			return;
		}

		// set the status
		if (!this._explicitStatus) this.status = 200;

		// set the content-type only if not yet set
		const setType = !this.has("Content-Type");

		// string
		if ("string" == typeof val) {
			if (setType) this.type = /^\s*</.test(val) ? "html" : "text";
			this.length = Buffer.byteLength(val);
			return;
		}

		// buffer
		if (Buffer.isBuffer(val)) {
			if (setType) this.type = "bin";
			this.length = val.length;
			return;
		}

		// json
		this.remove("Content-Length");
		this.type = "json";
	},

	/**
	 * Set Content-Length field to `n`.
	 *
	 * @param {Number} n
	 * @api public
	 */

	set length(n) {
		this.set("Content-Length", n);
	},

	/**
	 * Return parsed response Content-Length when present.
	 *
	 * @return {Number}
	 * @api public
	 */

	get length() {
		if (this.has("Content-Length")) {
			return parseInt(this.get("Content-Length"), 10) || 0;
		}

		const { body } = this;
		if (!body) return undefined;
		if ("string" === typeof body) return Buffer.byteLength(body);
		if (Buffer.isBuffer(body)) return body.length;
		return Buffer.byteLength(JSON.stringify(body));
	},

	/**
	 * Set Content-Type response header with `type` through `mime.lookup()`
	 * when it does not contain a charset.
	 *
	 * Examples:
	 *
	 *     this.type = '.html';
	 *     this.type = 'html';
	 *     this.type = 'json';
	 *     this.type = 'application/json';
	 *     this.type = 'png';
	 *
	 * @param {String} type
	 * @api public
	 */

	set type(type) {
		type = getType(type);
		if (type) {
			this.set("Content-Type", type);
		} else {
			this.remove("Content-Type");
		}
	},

	/**
	 * Return the response mime type void of
	 * parameters such as "charset".
	 *
	 * @return {String}
	 * @api public
	 */

	get type() {
		const type = this.get("Content-Type");
		if (!type) return "";
		return type.split(";", 1)[0];
	},

	/**
	 * Returns true if the header identified by name is currently set in the outgoing headers.
	 * The header name matching is case-insensitive.
	 *
	 * Examples:
	 *
	 *     this.has('Content-Type');
	 *     // => true
	 *
	 *     this.get('content-type');
	 *     // => true
	 *
	 * @param {String} field
	 * @return {boolean}
	 * @api public
	 */
	has(field) {
		return typeof this.res.hasHeader === "function"
			? this.res.hasHeader(field)
			: // Node < 7.7
			  field.toLowerCase() in this.headers;
	},
	/**
	 * Return response header.
	 *
	 * Examples:
	 *
	 *     this.get('Content-Type');
	 *     // => "text/plain"
	 *
	 *     this.get('content-type');
	 *     // => "text/plain"
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	get(field) {
		return this.header[field.toLowerCase()] || "";
	},
	/**
	 * Set header `field` to `val`, or pass
	 * an object of header fields.
	 *
	 * Examples:
	 *
	 *    this.set('Foo', ['bar', 'baz']);
	 *    this.set('Accept', 'application/json');
	 *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
	 *
	 * @param {String|Object|Array} field
	 * @param {String} val
	 * @api public
	 */

	set(field, val) {
		if (this.headerSent) return;

		if (2 == arguments.length) {
			if (Array.isArray(val)) val = val.map((v) => (typeof v === "string" ? v : String(v)));
			else if (typeof val !== "string") val = String(val);
			this.res.setHeader(field, val);
		} else {
			for (const key in field) {
				this.set(key, field[key]);
			}
		}
	},

	/**
	 * Remove header `field`.
	 *
	 * @param {String} name
	 * @api public
	 */

	remove(field) {
		if (this.headerSent) return;

		this.res.removeHeader(field);
	},
};
