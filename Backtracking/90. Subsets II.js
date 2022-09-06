/**
 * Given an integer array nums that may contain duplicates, return all possible subsets (the power set).

The solution set must not contain duplicate subsets. Return the solution in any order.

 

Example 1:

Input: nums = [1,2,2]
Output: [[],[1],[1,2],[1,2,2],[2],[2,2]]
Example 2:

Input: nums = [0]
Output: [[],[0]]
 */

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsWithDup = function(nums) {
    let res = []
    nums.sort((a ,b) => a - b)
    dfs(nums ,res ,[] ,0)
    return res
};

var dfs = function(nums ,answ ,path ,start) {
    answ.push(path.slice())
    for (let i = start; i < nums.length; i++) {
        if(i > start && nums[i] == nums[i - 1]) continue
        path.push(nums[i])
        dfs(nums ,answ ,path ,i + 1)
        path.pop()
    }
};

console.log(subsetsWithDup([1,1,2,2]));