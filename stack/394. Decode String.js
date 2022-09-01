/**
 * Given an encoded string, return its decoded string.

The encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times. Note that k is guaranteed to be a positive integer.

You may assume that the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc. Furthermore, you may assume that the original data does not contain any digits and that digits are only for those repeat numbers, k. For example, there will not be input like 3a or 2[4].

The test cases are generated so that the length of the output will never exceed 105.


Example 1:
Input: s = "3[a]2[bc]"
Output: "aaabcbc"
Example 2:

Input: s = "3[a2[c]]"
Output: "accaccacc"

Example 3:
Input: s = "2[abc]3[cd]ef"
Output: "abcabccdcdcdef"
 */

/**
 * @param {string} s
 * @return {string}
 */
var decodeString = function(s) {
    let stack = []
    for (let i = 0; i < s.length; i++) {
        if(s[i] != "]"){
            stack.push(s[i])
        } else {
            let substr = ''
            while (stack[stack.length - 1] != "[") {
                substr = stack.pop() + substr
            }
            stack.pop()

            let digit  = 0
            while (/\d/.test(stack[stack.length - 1])) {
                digit  = Number(stack.pop()) + digit 
            }
            stack.push(substr.repeat(digit))
        }
    }
    return stack.join("")
};

console.log(decodeString("2[abc]3[cd]ef"));
console.log(decodeString("3[a2[c]]"));
console.log("3[a]2[bc]");