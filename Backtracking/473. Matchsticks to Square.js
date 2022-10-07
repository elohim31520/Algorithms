/**
 * You are given an integer array matchsticks where matchsticks[i] is the length of the ith matchstick. You want to use all the matchsticks to make one square. You should not break any stick, but you can link them up, and each matchstick must be used exactly one time.

Return true if you can make this square and false otherwise.

Input: matchsticks = [1,1,2,2,2]
Output: true
Explanation: You can form a square with length 2, one side of the square came two sticks with length 1.

Example 2:
Input: matchsticks = [3,3,3,3,4]
Output: false
Explanation: You cannot find a way to form a square with all the matchsticks.

 */

/**
 * @param {number[]} matchsticks
 * @return {boolean}
 */
var makesquare = function(matchsticks) {
    let totol = matchsticks.reduce((a ,b) => a + b)
    if(totol % 4 != 0) return false
    matchsticks.sort((a ,b) => a - b)
    let = sides = [0,0,0,0]
    return dfs(0 ,matchsticks ,sides ,totol / 4)
};

var dfs = function(idx ,matchsticks ,sides ,sideLen) {
    if(idx >= matchsticks.length){
        let [a ,b ,c ,d] = sides
        return a == b && a == c && a == d
    }
    for (let j = 0; j < sides.length; j++) {
        if(sides[j] + matchsticks[idx] > sideLen) continue
        sides[j] += matchsticks[idx]
        if(dfs(idx + 1 ,matchsticks ,sides ,sideLen)) return true
        sides[j] -= matchsticks[idx]
    }
};

console.log(makesquare([2,2,2,2]));
console.log(makesquare([2,2,2,2,4,4]));
console.log(makesquare([7,4,3,4,3,7,3]));