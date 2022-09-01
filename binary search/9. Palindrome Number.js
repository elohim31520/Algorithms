/**
 * 
 * Given an integer x, return true if x is palindrome integer.

    An integer is a palindrome when it reads the same backward as forward.
/**
 * @param {number} x
 * @return {boolean}
 */
let  isPalindrome = function(x) {
    let input = String(x).split("")
    if(!x || !input.length) return false
    let arr = []
    while (input.length){
        arr.push(input.pop())
    }
    return arr.join("") == x + ""
};

console.log(isPalindrome(515));
