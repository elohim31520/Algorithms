/**
 * Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function.

Example 1:
Input: nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]

Example 2:
Input: nums = [2,0,1]
Output: [0,1,2]
 */

/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var sortColors = function(nums) {
    let l = 0 ,r = nums.length - 1 , k = 0
    while (l < r) {
        if(nums[l] == 0){
            swap(nums ,l ,k)
            l++
            k++
        } else if(nums[l] == 2){
            swap(nums ,l ,r)
            r--
        } else {
            l++
        }
    }
    return nums
};


function swap(nums ,i ,j){
    let old = nums[i]
    nums[i] = nums[j]
    nums[j] = old

}

console.log(sortColors([2,0,2,1,1,0]));
console.log(sortColors([2,2,2,1,1,1,0,0,0]));
console.log(sortColors([0,1,2]));
console.log(sortColors([1,0,2]));
console.log(sortColors([0,2,1,1,1]));