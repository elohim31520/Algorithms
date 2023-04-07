# 343. Integer Break
# Medium
# 3.6K
# 364
# Companies
# Given an integer n, break it into the sum of k positive integers, where k >= 2, and maximize the product of those integers.

# Return the maximum product you can get.

# Example 1:
# Input: n = 2
# Output: 1
# Explanation: 2 = 1 + 1, 1 × 1 = 1.

# Example 2:
# Input: n = 10
# Output: 36
# Explanation: 10 = 3 + 3 + 4, 3 × 3 × 4 = 36.

class Solution:
    def integerBreak(self, n: int) -> int:
        dp = [0] * (n + 1)
        dp[2] = 1
        for i in range(3, n + 1):
            for j in range(1, int(n / 2 + 1)):
                dp[i] = max(dp[i], (i - j) * j, dp[i - j] * j)
        return dp[-1]

solution = Solution()
answ = solution.integerBreak(10)

print(answ)