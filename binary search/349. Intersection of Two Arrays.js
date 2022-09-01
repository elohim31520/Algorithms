/**
 * Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.
 * 
 * Example 1:
Input: nums1 = [1,2,2,1], nums2 = [2,2]
Output: [2]

Example 2:
Input: nums1 = [4,9,5], nums2 = [9,4,9,8,4]
Output: [9,4]
Explanation: [4,9] is also accepted.
 */

/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersection = function(nums1, nums2) {
    let arr = []
    if(!nums1.length || !nums2.length) return []
    if(nums2.length > nums1.length) return intersection(nums2 ,nums1)
    nums1 = nums1.sort((a,b) => a - b)
    for (let i = 0; i < nums2.length; i++) {
        let l = 0 ,r = nums1.length - 1 ,mid ,target = nums2[i]
        while (l < r) {
            mid = (l + r) >> 1
            if(nums1[mid] == target){
                arr.push(nums1[mid])
                break
            }
            else if (nums1[mid] < target){
                l = mid + 1
            }
            else r = mid
        }
    }
    return [...new Set(arr)]
};

console.log(intersection([4,9,5,9] ,[9,4,9,8,4]));