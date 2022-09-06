/**
 * Given an integer array nums of unique elements, return all possible subsets (the power set).

The solution set must not contain duplicate subsets. Return the solution in any order.

Example 1:

Input: nums = [1,2,3]
Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
Example 2:

Input: nums = [0]
Output: [[],[0]]
 */

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsets = function(nums) {
    let res = []
    dfs(nums ,0 ,res ,[])
    return res
};

var dfs = function(nums ,start ,answ ,path){
    answ.push(path.slice())
    for (let i = start; i < nums.length; i++) {
        path.push(nums[i])
        dfs(nums ,i + 1 ,answ ,path)
        path.pop()
    }
}

console.log(subsets([1,2,3]));
console.log(subsets([0]));
console.log(subsets([10 ,12 ,144 ,169]));