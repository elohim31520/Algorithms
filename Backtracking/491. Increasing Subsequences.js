/**
 * Given an integer array nums, return all the different possible increasing subsequences of the given array with at least two elements. You may return the answer in any order.

The given array may contain duplicates, and two equal integers should also be considered a special case of increasing sequence.
 */

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var findSubsequences = function(nums) {
    if(nums.length < 2) return []
    let res = []
    dfs(nums ,[] ,res ,0)
    return res
};

var dfs = function(nums ,path ,answ ,idx) {
    if(path.length > 1){
        answ.push(path.slice())
        if(path.length >= nums.length){
            return
        }
    }
    let temp
    for (let i = idx; i < nums.length; i++) {
        if(i > 0 && nums[i] < nums[i - 1]) continue
        if(temp == nums[i]) continue
        temp = nums[i]
        path.push(nums[i])
        dfs(nums ,path ,answ ,i + 1)
        path.pop()
    }
};

console.log(findSubsequences([4,6,7,7]));
console.log(findSubsequences([4,4,3,2,1]));