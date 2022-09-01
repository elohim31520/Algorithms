/**
 * Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

    You must write an algorithm with O(log n) runtime complexity.

    Input: nums = [1,3,5,6], target = 5
    Output: 2

    Input: nums = [1,3,5,6], target = 2
    Output: 1
 */

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var searchInsert = function(nums, target) {
    let left = 0 ,right = nums.length - 1 ,answ

    while(left <= right){
        let mid = Math.floor(left + (right - left) / 2)
        if(nums[mid] > target){
            right = mid - 1
        }else if (nums[mid] == target){
            answ = mid
            break
        }
        else left = mid + 1
    }
    if(!answ) answ = left
    return answ
};

console.log(searchInsert([1,3,5,6] ,4));