/**
 * You are given a 0-indexed integer array nums and a target element target.

A target index is an index i such that nums[i] == target.

Return a list of the target indices of nums after sorting nums in non-decreasing order. If there are no target indices, return an empty list. The returned list must be sorted in increasing order.

Example 1:
Input: nums = [1,2,5,2,3], target = 2
Output: [1,2]
Explanation: After sorting, nums is [1,2,2,3,5].
The indices where nums[i] == 2 are 1 and 2.

Example 2:
Input: nums = [1,2,5,2,3], target = 3
Output: [3]
Explanation: After sorting, nums is [1,2,2,3,5].
The index where nums[i] == 3 is 3.
 */

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var targetIndices = function(nums, target) {
    let arr = nums.sort((a ,b)=> a - b)
    let l = 0 ,r = nums.length - 1 ,mid ,answ = []
    while (l <= r) {
        mid = (l + r) >> 1
        if(arr[mid] == target){
            if(arr[l] < target){
                l++
            } else if (arr[r] > target){
                r--
            } else if(arr[l] == target && arr[r] == target){
                answ.push(l)
                l++
            }
        }
        else if (arr[mid] > target){
            r = mid - 1 
        }
        else l = mid + 1
    }
    return answ
};

console.log(targetIndices([1,2,5,2,3,2,2] ,2));
// console.log(targetIndices([1,2,5,2,3] ,3));