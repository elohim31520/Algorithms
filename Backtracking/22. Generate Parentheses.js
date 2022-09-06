/**
 * Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

Example 1:
Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]

 */


/**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function(n) {
    let res = []
    dfs(res ,n ,'' ,0 ,0)
    return res
};

const dfs = (answ ,n ,path ,left ,right) =>{
    if(path.length == n * 2){
        answ.push(path.slice())
        return
    }
    if(left < n){
        dfs(answ ,n ,path + "(" ,left + 1 ,right)
    }
    if(right < left){
        dfs(answ ,n ,path + ")" ,left ,right + 1)
    }
}

console.log(generateParenthesis(3));
console.log(generateParenthesis(2));
