/**
 * Write an efficient algorithm that searches for a value target in an m x n integer matrix matrix. This matrix has the following properties:

Integers in each row are sorted in ascending from left to right.
Integers in each column are sorted in ascending from top to bottom.

Input: matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 5
Output: true
 */

/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function(matrix, target) {
    if(!matrix.length || !matrix[0].length) return false
    let row = 0 ,col = matrix[0].length - 1
    while (row < matrix.length && col >= 0) {
        if(matrix[row][col] == target) return true
        if(matrix[row][col] > target){
            col--
        } else {
            row++
        }
    }
    return false
};

// console.log(searchMatrix([[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]] ,9));


// 解法2
var searchMatrix2 = function(matrix, target) {
    if(!matrix.length || !matrix[0].length) return false
    for (let i = 0; i < matrix.length; i++) {
        let l = 0, r = matrix[0].length - 1 ,mid
        if(matrix[i][r] < target){
            continue
        }
        while(l <= r){
            mid = (l + r) >> 1
            if(matrix[i][mid] == target) return true
            if(matrix[i][mid] > target){
                r = mid - 1
            }
            else {
                l = mid + 1
            }
        }
    }
    return false
};

console.log(searchMatrix2([[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]] ,30));