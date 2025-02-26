import os
import requests

# Create credentials dir
if not os.path.exists('credentials'):
    os.makedirs('credentials')

# URL credentials file
url = 'https://www.inf.ufpr.br/fns21/credentials/credentials.json'

response = requests.get(url)

if response.status_code == 200:
    with open('credentials/credentials.json', 'wb') as arquivo:
        arquivo.write(response.content)
