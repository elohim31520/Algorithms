/**
 * 
 * Given an m x n grid of characters board and a string word, return true if word exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

nput: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true
 */

/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
var exist = function(board, word) {
    let rows = board.length,
        cols = board[0].length
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if(dfs(board ,word ,i ,j ,0)) return true
        }
    }
    return false
};

var dfs = function(board ,word ,row ,col ,index){
    if(row < 0 || row >= board.length || col < 0 || col >= board[0].length) return
    if(board[row][col] != word[index]) return
    if(index == word.length - 1) return true
    let temp = board[row][col]
    board[row][col] = "$"
    if(dfs(board ,word ,row + 1,col ,index + 1)) return true
    if(dfs(board ,word ,row ,col + 1 ,index + 1)) return true
    if(dfs(board ,word ,row - 1,col ,index + 1)) return true
    if(dfs(board ,word ,row ,col - 1 ,index + 1)) return true
    board[row][col] = temp
    return false
}

console.log(exist([["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]] ,"SFB"));

