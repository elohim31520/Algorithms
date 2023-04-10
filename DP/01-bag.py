# 背包最大重量为4。

# 物品为：

# 重量	价值
# 物品0	1	15
# 物品1	3	20
# 物品2	4	30
# 问背包能背的物品最大价值是多少？

class Solution:
    def maxValue(self, bag_sieze: int,  weights: list[int], values: list[int]) -> int:
        rows = len(weights)
        cols = bag_sieze + 1
        dp = [[0 for _ in range(cols)] for _ in range(rows)]

        for j in range(1, cols):
            if weights[0] <= j:
                dp[0][j] = values[0]

        for i in range(rows):
            for j in range(cols):
                if j < weights[i]:
                    dp[i][j] = dp[i - 1][j]
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - weights[i]] + values[i])

        print(dp)
        return dp[-1][-1]
            


solution = Solution()

max_value = solution.maxValue(4, [1, 3, 4], [15, 20, 30])

print(max_value)
