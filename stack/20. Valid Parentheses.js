/**
 * Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

Open brackets must be closed by the same type of brackets.
Open brackets must be closed in the correct order.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false
 */

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    if(!s) return false
    let arr = [] ,ss = s.split('')
    ss.forEach(vo => {
        let last = arr[arr.length - 1]
        if(vo == "{" || vo == "[" || vo == "(") arr.push(vo)
        else if ((vo == "}" && last == "{") || (vo == "]" && last == "[") || (vo == ")" && last == "(")) arr.pop()
    });
    return arr.length == 0
};

console.log(isValid("{}[]()"));
console.log(isValid("{)"));
console.log(isValid("{{"));
console.log(isValid("{{{}}}"));
console.log(isValid("{{{}}}[][[]]({[]})"));
console.log(isValid("{"));