function Calculator(initialValue = 0) {
	this.value = initialValue // 私有屬性，用於儲存當前值
}

// 在 Calculator 的原型上定義方法
Calculator.prototype.add = function (num) {
	this.value += num
	return this // 關鍵！返回物件本身，實現鏈式調用
}

Calculator.prototype.multiply = function (num) {
	this.value *= num
	return this // 關鍵！返回物件本身，實現鏈式調用
}

Calculator.prototype.getValue = function () {
	return this.value // 這個方法不需要返回 this，因為它是最終取值
}

// 使用鏈式調用
const result = new Calculator(5)
	.add(3) // 5 + 3 = 8，返回 Calculator 實例
	.multiply(2) // 8 * 2 = 16，返回 Calculator 實例
	.getValue() // 獲取最終的值

console.log(result) // 輸出：16

function ChainingExample(initialValue = 0) {
	this.value = initialValue

	this.add = function (num) {
		// 直接在實例上定義方法
		this.value += num
		return this // 返回當前實例
	}

	this.multiply = function (num) {
		// 直接在實例上定義方法
		this.value *= num
		return this // 返回當前實例
	}

	this.getValue = function () {
		return this.value
	}
}

const result1 = new ChainingExample(10).add(5).multiply(2).getValue()

console.log(result1) // 輸出：30


function ImmutableCalculator(initialValue = 0) {
    // 構造函數直接將傳入的值賦給 this.value
    // 這個 value 將成為這個特定實例的「狀態」
    this.value = initialValue;
}

// 在 ImmutableCalculator 的原型上定義方法
ImmutableCalculator.prototype.add = function (num) {
    // 1. 計算新的值
    const newValue = this.value + num;
    // 2. 返回一個全新的 ImmutableCalculator 實例，帶有這個新值
    return new ImmutableCalculator(newValue);
};

ImmutableCalculator.prototype.multiply = function (num) {
    // 1. 計算新的值
    const newValue = this.value * num;
    // 2. 返回一個全新的 ImmutableCalculator 實例，帶有這個新值
    return new ImmutableCalculator(newValue);
};

ImmutableCalculator.prototype.getValue = function () {
    // 這個方法仍然是獲取當前實例的值
    return this.value;
};

// --- 使用非破壞性 Calculator ---
const calc1 = new ImmutableCalculator(5);

// 鏈式調用，但每次都產生新物件
const finalResult = calc1.add(3).multiply(2).getValue();

console.log('Result after chain :', finalResult); //16

// 驗證原始物件 calc1 是否被修改
console.log('Value of original calc1 after operations:', calc1.getValue()); // 輸出: Value of original calc1 after operations: 5
// 你會看到 calc1 的值仍然是 5，它沒有被修改，這就是非破壞性！