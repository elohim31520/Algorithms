
# dp0[i]: The maximum extra flowers could be planted inflowerbed[: i + 1] if not planting a flower at flowerbed[i + 1].
# dp1[i]: The maximum extra flowers could be planted in flowerbed[: i + 1] if planting a flower at flowerbed[i + 1].
# dp[i] = float("INF"): the state is invalid and not reachable.

class Solution(object):
    def canPlaceFlowers(self, flowerbed, n):
        """
        :type flowerbed: List[int]
        :type n: int
        :rtype: bool
        """
        N = len(flowerbed)
        dp0 = [0] * (N + 1)
        dp1 = [0] * (N + 1)
        for i in range(N):
            if flowerbed[i] == 1:
                dp1[i + 1] = dp0[i]
                dp0[i + 1] = float("-INF")
            else:
                dp1[i + 1] = dp0[i] + 1
                dp0[i + 1] = max(dp0[i], dp1[i])
        print(dp0)
        print(dp1)
        return max(dp0[N], dp1[N]) >= n 

print(Solution().canPlaceFlowers([1,0,0,0,1],2))

# print(max(float("-INF") ,0))