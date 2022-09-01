/**
 * Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that:

0 <= a, b, c, d < n
a, b, c, and d are distinct.
nums[a] + nums[b] + nums[c] + nums[d] == target
You may return the answer in any order.

 

Example 1:
Input: nums = [1,0,-1,0,-2,2], target = 0
Output: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]
 */

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function(nums, target) {
    nums.sort((a,b)=> a - b)
    let res = []
    for (let i = 0; i < nums.length - 3; i++) {
        for (let j = i + 1; j < nums.length - 3; j++) {
            let  l = j + 1 ,r = nums.length - 1
            while (l < r) {
                let sum = nums[i] + nums[j] + nums[l] + nums[r]
                if(sum == target){
                    res.push([nums[i] ,nums[j] ,nums[l] ,nums[r]])
                    while (l < r && nums[l] == nums[l - 1]) l++
                    while (l < r && nums[r] == nums[r + 1]) r--
                    l++
                    r--
                } else if (sum < target) l++
                else r--
            }
        }
    }
    return res
};

console.log(fourSum([1,0,-1,0,-2,2] ,0));
console.log(fourSum([2,2,2,2,2],8));