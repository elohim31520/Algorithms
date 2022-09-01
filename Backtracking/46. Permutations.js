/**
 * Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.


Example 1:

Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
 */

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    let res = []
    dfs(res, [] ,nums)
    return res
};

const dfs = (res ,arr ,nums) => {
    if(arr.length == nums.length) {
        res.push(arr.slice())
        return
    }
    else{
        for (let i = 0; i < nums.length; i++) {
            if(arr.includes(nums[i])) continue
            arr.push(nums[i])
            dfs(res ,arr ,nums)
            arr.pop()
        }
    }
}

console.log(permute([1,2,3]));
console.log(permute([6,7,8,9]));

console.log(permute([0 ,1]));