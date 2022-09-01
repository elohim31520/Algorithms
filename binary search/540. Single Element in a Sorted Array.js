/**
 * You are given a sorted array consisting of only integers where every element appears exactly twice, except for one element which appears exactly once.

Return the single element that appears only once.

Your solution must run in O(log n) time and O(1) space.

Example 1:
Input: nums = [1,1,2,3,3,4,4,8,8]
Output: 2

Example 2:
Input: nums = [3,3,7,7,10,11,11]
Output: 10
 */

/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNonDuplicate = function(nums) {
    let l = 0 ,r = nums.length - 1 ,mid
    while (l < r) {
        mid = (l + r) >> 1
        if (mid % 2 == 0) {
            if(nums[mid] == nums[mid + 1]){
                //單數字出現在右邊
                l = mid + 1
            } else if (nums[mid] == nums[mid - 1]){
                r = mid
            } else {
                return nums[mid]
            }
        }
        else {
            if(nums[mid] == nums[mid + 1]){
                r = mid
            } else if (nums[mid] == nums[mid - 1]){
                l = mid + 1
            } else {
                return nums[mid]
            }
        }
    }
    return nums[l]
};

console.log(singleNonDuplicate([1,1,2,3,3,4,4,8,8]));
console.log(singleNonDuplicate([3,3,7,7,10,11,11]));