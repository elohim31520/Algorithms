/**
 * 704. Binary Search
Easy

5903

136

Add to List

Share
Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4
 */

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let l = 0 ,r = nums.length - 1 ,mid
    while (l <= r) {
        mid = l + ((r - l)>>1)
        if(nums[mid] == target) return mid
        if(nums[mid] > target){
            r = mid - 1
        }
        else l = mid + 1
    }
    return -1
};

console.log(search([-1,0,3,5,9,12] ,9));
console.log(search([-1,0,3,5,9,12] ,2));