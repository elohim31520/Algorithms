/**
 * Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target.

Return the sum of the three integers.

You may assume that each input would have exactly one solution.

Example 1:
Input: nums = [-1,2,1,-4], target = 1
Output: 2
Explanation: The sum that is closest to the target is 2. (-1 + 2 + 1 = 2).
 */


/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var threeSumClosest = function(nums, target) {
    nums.sort((a,b) => a - b)
    let closest = Infinity ,answ = 0
    for (let i = 0; i < nums.length - 2; i++) {
        let l = i + 1 ,r = nums.length - 1
        while (l < r) {
            let sum = nums[l] + nums[i] + nums[r]
            if(Math.abs(target - sum) <= closest){
                closest = Math.abs(target - sum)
                answ = sum
            }
            if (sum < target) l++
            else r-- 
        }
    }
    return answ
};

console.log(threeSumClosest([-1,2,1,-4] ,2));