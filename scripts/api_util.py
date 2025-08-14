BASE_URL = 'http://localhost:1234'

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