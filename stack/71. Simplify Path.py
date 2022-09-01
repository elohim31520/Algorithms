
class Solution:
    def simplifyPath(self, path: str) -> str:        
        # Init
        new_path = ""
        st = []
        
        # Check the raw path
        i = 0
        while (i < len(path)):
            temp = ""
            print(st)
            while (i<len(path) and path[i]!="/"):
                temp += path[i]
                i += 1
            
            if temp == "..":
                if st: st.pop()
            elif (temp and temp != "."):
                st.append(temp)
            
            # Step
            i += 1
        
        # Recombination
        while st:
            new_path = '/' + st.pop() + new_path
            
        if not new_path: return "/"
        else: return new_path

print(Solution().simplifyPath("/a/../../b/../c//.//"))