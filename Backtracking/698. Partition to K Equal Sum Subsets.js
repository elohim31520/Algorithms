/**
 * Given an integer array nums and an integer k, return true if it is possible to divide this array into k non-empty subsets whose sums are all equal.
 * 
 * Example 1:
    Input: nums = [4,3,2,3,5,2,1], k = 4
    Output: true
    Explanation: It is possible to divide it into 4 subsets (5), (1, 4), (2,3), (2,3) with equal sums.

    Example 2:
    Input: nums = [1,2,3,4], k = 3
    Output: false
 */

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var canPartitionKSubsets = function(nums, k) {
    let total = nums.reduce((a ,b) => a + b)
        used = new Array(nums.length).fill(false)
    if(total % k != 0) return false
    average = total / k
    nums.sort((a ,b) => a - b < 0)

    var dfs = function(k ,currTotal) {
        if(k == 0 ) return true
        if(currTotal > average) return false
        for (let i = 0; i < nums.length; i++) {
            if(used[i]) continue
            currTotal += nums[i]
            used[i] = true
            if(dfs(k - 1 ,currTotal)) return true
            currTotal -= nums[i]
            used[i] = false
        }
        return false
    };
    return dfs(k ,0)
};

console.log(canPartitionKSubsets([4,3,2,3,5,2,1] ,4));