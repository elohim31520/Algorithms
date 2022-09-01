/**
 * Given a non-negative integer c, decide whether there're two integers a and b such that a2 + b2 = c.

Example 1:
Input: c = 5
Output: true
Explanation: 1 * 1 + 2 * 2 = 5

Example 2:
Input: c = 3
Output: false
 */

/**
 * @param {number} c
 * @return {boolean}
 */
var judgeSquareSum = function(c) {
    let l = 0 ,r = Math.floor(Math.sqrt(c))
    while(l <= r){
        let temp = l*l + r*r
        if(temp == c) return true
        else if (temp > c){
            r--
        }
        else l++
    }
    return false
};

console.log(judgeSquareSum(5));
console.log(judgeSquareSum(0));
console.log(judgeSquareSum(1));
console.log(judgeSquareSum(3));
console.log(judgeSquareSum(6));
console.log(judgeSquareSum(8));
console.log(judgeSquareSum(10));