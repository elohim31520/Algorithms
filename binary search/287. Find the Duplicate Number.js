/**
 * Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.

There is only one repeated number in nums, return this repeated number.

You must solve the problem without modifying the array nums and uses only constant extra space.


Example 1:

Input: nums = [1,3,4,2,2]
Output: 2
Example 2:

Input: nums = [3,1,3,4,2]
Output: 3
 */

/**
 * @param {number[]} nums
 * @return {number}
 */
var findDuplicate = function(nums) {
    let n = nums.length - 1 ,l = 1 ,r = n ,mid
    while(l < r){
        mid = l + ((r - l)>> 1)
        let count = 0
        for (let i = 0; i < nums.length; i++) {
            if(nums[i] <= mid){
                count++
            }
        }
        if(count > mid){
            r = mid
        }
        else{
            l = mid + 1
        }
    }
    return l
};

// console.log(findDuplicate([1,3,4,2,2]));
// console.log(findDuplicate([3,1,3,4,2]));

var findDuplicate2 = function(nums) {
    let ns = nums.sort((a,b)=>a-b)
    for (let i = 0; i < ns.length; i++) {
        if(ns[i] == ns[i+1]){
            return nums[i]
        }
    }
    return - 1
};

console.log(findDuplicate2([1,3,4,2,2]));
console.log(findDuplicate2([3,1,3,4,2]));