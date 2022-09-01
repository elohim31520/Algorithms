/**
 * Given a positive integer num, write a function which returns True if num is a perfect square else False.

Follow up: Do not use any built-in library function such as sqrt.

Example 1:

Input: num = 16
Output: true
Example 2:

Input: num = 14
Output: false
 */


/**
 * @param {number} num
 * @return {boolean}
 */
var isPerfectSquare = function(num) {
    let l = 0 ,r = num ,mid
    while(l <= r){
        mid = l + ((r - l)>>1)
        if(mid == num / mid) return true
        if(mid > num / mid){
            r = mid - 1
        }
        else {
            l = mid + 1
        }
    }
    return false
};
console.log(isPerfectSquare(64));
console.log(isPerfectSquare(16));
console.log(isPerfectSquare(1));
console.log(isPerfectSquare(14));
console.log(isPerfectSquare(0));