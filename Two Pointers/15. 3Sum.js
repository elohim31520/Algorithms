/**
 * Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.
 */

/**
 * Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: 
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
Notice that the order of the output and the order of the triplets does not matter.
 */

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    nums.sort((a ,b) => a- b)
    let res = []
    for (let i = 0; i < nums.length - 2; i++) {
        if(i != 0 && nums[i] == nums[i - 1]) continue
        let l = i + 1 ,r = nums.length - 1
        while (l < r) {
            if(nums[i] + nums[l] + nums[r] == 0){
                res.push([nums[i] ,nums[l] ,nums[r]])
                while (l < r && nums[l] == nums[l + 1]) l++
                while (l < r && nums[r] == nums[r - 1]) r--
                l++
                r--
            } else if (nums[i] + nums[l] + nums[r] > 0){
                r--
            } else {
                l++
            }
        }
    }
    return res
};

console.log(threeSum([-1,0,1,2,-1,-4]));
console.log(threeSum([-3,-1,0,1,2,-1,-4,3]));