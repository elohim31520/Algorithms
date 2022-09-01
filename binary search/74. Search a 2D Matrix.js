/**
 * Write an efficient algorithm that searches for a value target in an m x n integer matrix matrix. This matrix has the following properties:

Integers in each row are sorted from left to right.
The first integer of each row is greater than the last integer of the previous row.

Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
Output: true
 */

/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function(matrix, target) {
    let rows = matrix.length,
        cols = matrix[0].length,
        l = 0,
        r = rows * cols - 1
        while(l <= r){
            let mid = l + ((r - l)>>1),
                temp = matrix[Math.floor(mid / cols)][mid % cols]
                if(temp == target) return true
                else if(temp > target){
                    r = mid - 1
                }
                else l = mid + 1
        }
        return false
};

console.log(searchMatrix( [[1,3,5,7],[10,11,16,20],[23,30,34,60]] ,11));