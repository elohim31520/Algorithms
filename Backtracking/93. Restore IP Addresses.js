/**
 * A valid IP address consists of exactly four integers separated by single dots. Each integer is between 0 and 255 (inclusive) and cannot have leading zeros.

For example, "0.1.2.201" and "192.168.1.1" are valid IP addresses, but "0.011.255.245", "192.168.1.312" and "192.168@1.1" are invalid IP addresses.
Given a string s containing only digits, return all possible valid IP addresses that can be formed by inserting dots into s. You are not allowed to reorder or remove any digits in s. You may return the valid IP addresses in any order.

Example 1:
Input: s = "25525511135"
Output: ["255.255.11.135","255.255.111.35"]

Example 2:
Input: s = "0000"
Output: ["0.0.0.0"]
*/

/**
 * @param {string} s
 * @return {string[]}
 */
var restoreIpAddresses = function(s) {
    let answ = []
    dfs(s ,answ ,"" ,s.length + 3 ,0)
    return answ
};

var dfs = function(s ,answ ,path ,total ,deep) {
    console.log("deep: " + deep ,"---" ,path);
    if(answ.includes(path)) return
    if(deep > 4) return
    if(deep == 4){
        if(path.length == total && !s.length){
            answ.push(path.slice())
        }
        return
    }
    if(!s.length) return
    for (let i = 1; i < 4; i++) {
        let temp = path
        let str = s.slice(0 ,i)
        if(str > 255 || (str.length > 1 && str[0] == 0)) continue
        path = path + str + (deep >= 3 ? "" : ".")
        dfs(s.slice(i) ,answ ,path ,total ,deep + 1)
        path = temp
    }
};


console.log(restoreIpAddresses("25525511135"));
console.log(restoreIpAddresses("0000"));
console.log(restoreIpAddresses("101023"));

console.log(restoreIpAddresses("123456"));