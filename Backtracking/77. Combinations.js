/**
 * Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n].

You may return the answer in any order.

Input: n = 4, k = 2
Output: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
Explanation: There are 4 choose 2 = 6 total combinations.
Note that combinations are unordered, i.e., [1,2] and [2,1] are considered to be the same combination.
 */

/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function(n, k) {
    let res = []
    dfs(n, k ,res ,[] ,1)
    return res
};

var dfs = (n ,k ,answ ,arr ,start) =>{
    if(arr.length == k){
        answ.push(arr.slice())
        return
    }
    for (let i = start; i <= n; i++) {
        if(arr.includes(i)) continue
        arr.push(i)
        dfs(n ,k ,answ ,arr ,i + 1)
        arr.pop()
    }
}

console.log(combine(4 ,2));