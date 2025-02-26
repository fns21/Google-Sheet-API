import os

# Create credentials dir
if not os.path.exists('credentials'):
    os.makedirs('credentials')

url = 'https://www.inf.ufpr.br/fns21/credentials/credentials.json'

os.system(f'curl -o credentials/credentials.json {url}')

# Verify if success
if os.path.exists('credentials/credentials.json'):
    print("File downloaded and saved in 'credentials/credentials.json'")
else:
    print("Error while downloading the file.")