/**
 * You have n  tiles, where each tile has one letter tiles[i] printed on it.

Return the number of possible non-empty sequences of letters you can make using the letters printed on those tiles.

Example 1:
Input: tiles = "AAB"
Output: 8
Explanation: The possible sequences are "A", "B", "AA", "AB", "BA", "AAB", "ABA", "BAA".

Example 2:
Input: tiles = "AAABBC"
Output: 188

Example 3:
Input: tiles = "V"
Output: 1
 */

/**
 * @param {string} tiles
 * @return {number}
 */
var numTilePossibilities = function(tiles) {
    let res = [] ,vis = new Array(tiles.length).fill(false)
    function dfs (path){
        if(path && !res.includes(path)) res.push(path.slice())
        for (let i = 0; i < tiles.length; i++) {
            if(!vis[i]){
                vis[i] = true
                dfs(path + tiles[i])
                vis[i] = false
            }
        }
    }
    dfs("")
    return res.length
};

console.log(numTilePossibilities("AAB"));
console.log(numTilePossibilities("AAABBC"));
console.log(numTilePossibilities("V"));