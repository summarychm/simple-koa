/** 代理对象的指定属性,操作该对象的指定属性时,转为操作该对象的target属性
 * @param {Object} proto 要代理的对象
 * @param {String} target 要代理的属性
 */
function Delegator(proto, target) {
	//! 防止用户通过Delegator()的方式调用,转为new Delegator()调用.
	if (!(this instanceof Delegator)) return new Delegator(proto, target);
	this.proto = proto;
	this.target = target;
}
/** 代理对象的getter属性,可读
 *  @param {String} name 要代理的属性名
 *  @returns {Delegator} self
 */
Delegator.prototype.getter = function(name) {
	let proto = this.proto;
	let target = this.target;
	proto.__defineGetter__(name, function() {
		// console.log("============ delegator this begin ====================");
		// console.log(this);
		// console.log("============ delegator this end ======================");
		return this[target][name];
	});
	return this; // 方便链式调用
};
/** 代理对象的setter属性,可写
 * @param {String} name 要代理的属性
 * @returns {Delegator} self
 */
Delegator.prototype.setter = function(name) {
	let proto = this.proto;
	let target = this.target;

	proto.__defineSetter__(name, function(val) {
		return (this[target][name] = val);
	});
	return this;
};

/** 代理对象的getter & setter 属性
 * @param {String} name 要代理的属性名
 * @returns {Delegator} self
 */
Delegator.prototype.access = function(name) {
	return this.getter(name).setter(name);
};

/** 代理对象的method到this[target][name]
 * @param {String} name 要代理的方法名
 * @returns {Delegator} self
 */
Delegator.prototype.method = function(name) {
	var proto = this.proto;
	var target = this.target;
	proto[name] = function() {
		return this[target][name].apply(this[target], arguments);
	};
	return this;
};

module.exports = Delegator;
