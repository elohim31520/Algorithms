/**
 * Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.

A mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.

Example 1:

Input: digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]
Example 2:

Input: digits = ""
Output: []
Example 3:

Input: digits = "2"
Output: ["a","b","c"]
*/

/**
 * @param {string} digits
 * @return {string[]}
 */

const key = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
var letterCombinations = function(digits) {
    if(!digits) return []
    let res = []
    dfs(digits ,0 ,res ,[])
    return res
};

var dfs = function(digits ,deep ,answ ,path){
    if(deep > digits.length) return
    if(answ.includes(path)) return
    if(deep == digits.length){
        answ.push(path.slice())
        return
    }
    let str = key[digits[deep]]
    for (let i = 0; i < str.length; i++) {
        let temp = path
        path += str[i]
        dfs(digits ,deep + 1 ,answ ,path)
        path = temp
    }
}

console.log(letterCombinations("23"));
console.log(letterCombinations("2"));
console.log(letterCombinations("89"));
console.log(letterCombinations("479"));
console.log(letterCombinations("345").length);