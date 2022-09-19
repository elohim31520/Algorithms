/**
 * Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.

A palindrome string is a string that reads the same backward as forward.

Example 1:
Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]

Example 2:
Input: s = "a"
Output: [["a"]]
 */

/**
 * @param {string} s
 * @return {string[][]}
 */
var partition = function(s) {
    let res = []
    dfs(s ,res ,[] ,0)
    return res
};

var dfs = function (str ,answ ,path ,idx) {
    if(idx == str.length){
        answ.push(path.slice())
        return
    }
    for (let j = idx; j < str.length; j++) {
        if(isPalindrome(str ,idx ,j)){
            path.push(str.substring( idx ,j + 1))
            dfs(str ,answ ,path ,j+1)
            path.pop()
        }
    }
}

var isPalindrome = function (str ,l ,r){
    while (l <= r) {
        if(str[l++] != str[r--]) return false
    }
    return true
}

console.log(partition("aabb"));

console.log(partition("aabbcc"));
