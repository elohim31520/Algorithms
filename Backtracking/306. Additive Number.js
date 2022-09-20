/**
 * An additive number is a string whose digits can form an additive sequence.

A valid additive sequence should contain at least three numbers. Except for the first two numbers, each subsequent number in the sequence must be the sum of the preceding two.

Given a string containing only digits, return true if it is an additive number or false otherwise.

Note: Numbers in the additive sequence cannot have leading zeros, so sequence 1, 2, 03 or 1, 02, 3 is invalid.

Example 1:
Input: "112358"
Output: true
Explanation: 
The digits can form an additive sequence: 1, 1, 2, 3, 5, 8. 
1 + 1 = 2, 1 + 2 = 3, 2 + 3 = 5, 3 + 5 = 8

Example 2:
Input: "199100199"
Output: true
Explanation: 
The additive sequence is: 1, 99, 100, 199. 
1 + 99 = 100, 99 + 100 = 199
 */

/**
 * @param {string} num
 * @return {boolean}
 */
var isAdditiveNumber = function(num) {
    let res = []
    dfs(num , res ,[] ,0)
    return res.length > 0
};

var dfs = function(num ,answ ,path ,idx) {
    if(idx == num.length && path.length >= 3){
        answ.push(path.slice())
        return
    }
    let len = path.length
    for (let j = idx; j < num.length; j++) {
        let target = num.substring(idx ,j + 1)
        if(len < 2 || (+(path[len - 1]) + +(path[len - 2]) == +target)){
            path.push(target)
            dfs(num ,answ ,path ,j + 1)
            path.pop()
        }
    }
};

console.log(isAdditiveNumber("112358"));
console.log(isAdditiveNumber("199100199"));
console.log(isAdditiveNumber("5510"));