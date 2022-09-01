/**
 * Given a collection of numbers, nums, that might contain duplicates, return all possible unique permutations in any order.


Example 1:
Input: nums = [1,1,2]
Output:
    [[1,1,2],
    [1,2,1],
    [2,1,1]]
 */

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function(nums) {
    let res = []
    nums.sort((a ,b) => a - b)
    dfs(res ,[] ,nums ,[])
    return res
};

const dfs = (answ ,arr ,nums ,indexList) =>{
    if(arr.length == nums.length){
        answ.push(arr.slice())
        return
    }
    let prev = Infinity
    for (let i = 0; i < nums.length; i++) {
        if(indexList.includes(i)) continue
        if(nums[i] == prev) continue
        arr.push(nums[i])
        indexList.push(i)
        dfs(answ ,arr ,nums ,indexList)
        arr.pop()
        indexList.pop()
        prev = nums[i]
    }
}

console.log(permuteUnique([1,1,2]));