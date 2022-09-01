/**
 * 
 * Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.

    If target is not found in the array, return [-1, -1].

    You must write an algorithm with O(log n) runtime complexity.

    Input: nums = [5,7,7,8,8,10], target = 8
    Output: [3,4]
 */

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */

let searchRange = function(nums, target) {
    let left = 0 ,right =nums.length - 1, outputL = -1 ,outputR = -1
    // 先查起始
    while(left <= right){
        let mid = Math.floor(left + (right - left) / 2)
        if(nums[mid] > target){
            right = mid - 1
        }
        else if(nums[mid] == target){
            right = mid - 1
            outputL = mid
        }
        else left = mid + 1
    }

    // 再查最後位置
    right = nums.length - 1
    while(left <= right){
        let mid = Math.floor(left + (right - left) / 2)
        if(nums[mid] == target){
            left = mid + 1
            outputR = mid
        }else if(nums[mid] > target){
            left = mid + 1
        }
        else right = mid - 1
    }

    return [outputL ,outputR]
};

console.log(searchRange([5,7,7,8,8,10] ,8));

console.log(searchRange([5,7,7,8,8,10] ,0));