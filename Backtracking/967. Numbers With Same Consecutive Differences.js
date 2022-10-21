/**
 * Given two integers n and k, return an array of all the integers of length n where the difference between every two consecutive digits is k. You may return the answer in any order.

Note that the integers should not have leading zeros. Integers as 02 and 043 are not allowed.

Example 1:
Input: n = 3, k = 7
Output: [181,292,707,818,929]
Explanation: Note that 070 is not a valid number, because it has leading zeroes.

Example 2:
Input: n = 2, k = 1
Output: [10,12,21,23,32,34,43,45,54,56,65,67,76,78,87,89,98]
 */

/**
 * @param {number} n
 * @param {number} k
 * @return {number[]}
 */
var numsSameConsecDiff = function(n, k) {
    let path = []
    function dfs (str ,idx){
        if(str.length == n){
            path.push(+str)
            return
        }
        for (let i = 0; i < 10; i++) {
            let temp = str
            str += String(i)
            if(str[0] == "0"){
                str = temp
                continue
            }
            if(str.length < 2 || Math.abs(i - str[idx - 1]) == k){
                dfs(str ,idx + 1)
            }
            str = temp
        }
    }
    dfs("" ,0)
    return path
};

console.log(numsSameConsecDiff(3 ,7));
console.log(numsSameConsecDiff(2 ,1));
console.log(numsSameConsecDiff(4 ,5));