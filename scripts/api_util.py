import requests

# BASE_URL = 'http://localhost:3000'


def read_token(file_path='./token.txt'):
    try:
        with open(file_path, 'r') as file:
            return file.read().strip()
    except IOError as err:
        print(f'Error reading token from file: {err}')
        return None
    

def get_headers(token):
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

def send_request(method, endpoint, params=None, json_data=None, quiet=False):
    """
    統一的 HTTP 請求處理核心
    :param method: "GET", "POST", "PUT", "DELETE" 等
    :param endpoint: API 路徑
    :param params: GET 請求的 Query Parameters
    :param json_data: POST/PUT 請求的 Body 資料
    """
    # 確保 URL 拼接邏輯一致 (處理可能多餘或缺少的斜線)
    url = f"{BASE_URL.rstrip('/')}/{endpoint.lstrip('/')}"
    
    try:
        token = read_token()
        # 使用 requests.request 動態決定方法
        response = requests.request(
            method=method,
            url=url,
            headers=get_headers(token),
            params=params,
            json=json_data
        )
        
        # 建議一併檢查狀態碼
        response.raise_for_status()
        result = response.json()
        
        if not quiet:
            print(f"[{method}] {endpoint} Success: {result}")
            
        return result

    except requests.exceptions.RequestException as err:
        print(f"Request failed ({method} {endpoint}): {err}")
        return None