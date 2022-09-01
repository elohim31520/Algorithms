/**
 * Given a 0-indexed string word and a character ch, reverse the segment of word that starts at index 0 and ends at the index of the first occurrence of ch (inclusive). If the character ch does not exist in word, do nothing.

For example, if word = "abcdefd" and ch = "d", then you should reverse the segment that starts at 0 and ends at 3 (inclusive). The resulting string will be "dcbaefd".
Return the resulting string.


Example 1:
Input: word = "abcdefd", ch = "d"
Output: "dcbaefd"
Explanation: The first occurrence of "d" is at index 3. 
Reverse the part of word from 0 to 3 (inclusive), the resulting string is "dcbaefd".
 */

/**
 * @param {string} word
 * @param {character} ch
 * @return {string}
 */
var reversePrefix = function(word, ch) {
    let n = word.length
    for (let i = 0; i < n; i++) {
        let  l = 0 ,r = word.indexOf(ch)
        while (l< r) {
            let temp  = word[l]
            word[l] = word[r]
            word[r] = temp
            l++
            r--
        }
    }
    return word
};

console.log(reversePrefix("abcdefd" ,"d"));