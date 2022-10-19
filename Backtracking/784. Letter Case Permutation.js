/**
 * Given a string s, you can transform every letter individually to be lowercase or uppercase to create another string.

Return a list of all possible strings we could create. Return the output in any order.

Example 1:
Input: s = "a1b2"
Output: ["a1b2","a1B2","A1b2","A1B2"]

Example 2:
Input: s = "3z4"
Output: ["3z4","3Z4"]
 */

/**
 * @param {string} s
 * @return {string[]}
 */
var letterCasePermutation = function(s) {
    let res = []
    function dfs (path ,idx){
        count += 1
        if(idx >= s.length && path.length == s.length){
            res.push(path.slice())
        }
        for (let i = idx; i < s.length; i++) {
            if(isDigit(s[i])){
                dfs(path + s[i] , i + 1)
            } else {
                dfs(path + s[i].toUpperCase(), i + 1)
                dfs(path + s[i] , i + 1)
            }
        }
    }
    dfs("" ,0)
    return res
};

var isDigit = function(val){
    return /\d/.test(val)
}

console.log(letterCasePermutation("a1b2"));
console.log(letterCasePermutation("3z4"));