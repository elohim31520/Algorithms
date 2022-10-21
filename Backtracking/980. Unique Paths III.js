/**
 * You are given an m x n integer array grid where grid[i][j] could be:

    1 representing the starting square. There is exactly one starting square.
    2 representing the ending square. There is exactly one ending square.
    0 representing empty squares we can walk over.
    -1 representing obstacles that we cannot walk over.
    Return the number of 4-directional walks from the starting square to the ending square, that walk over every non-obstacle square exactly once.
 */

/**
 * @param {number[][]} grid
 * @return {number}
 */
var uniquePathsIII = function(grid) {
    let res = 0,
        m = grid.length,
        n = grid[0].length,
        empty = 1,
        x ,y
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if(grid[i][j] == 0){
                empty += 1
            }
            if(grid[i][j] == 1){
                [x ,y] = [i ,j]
            }
        }
    }
    function dfs (x ,y ,empty){
        if(x < 0 || x >= m || y < 0 || y >= n || grid[x][y] < 0){
            return
        }
        // 踩到2就剪枝
        if(grid[x][y] == 2){
            res += empty == 0
            return
        }
        grid[x][y] = -2
        dfs(x + 1 ,y ,empty - 1)
        dfs(x - 1 ,y ,empty - 1)
        dfs(x ,y + 1 ,empty - 1)
        dfs(x ,y - 1 ,empty - 1)
        grid[x][y] = 0
    }
    dfs(x ,y ,empty)
    return res
};

console.log(uniquePathsIII([[1,0,0,0],[0,0,0,0],[0,0,2,-1]]));