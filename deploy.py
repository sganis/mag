# deploy to vercel with git
# using cli: vercel --prod
import os
import json
import subprocess

DIR = os.path.dirname(os.path.abspath(__file__))

def run(cmd):
    subprocess.run(cmd, shell=True, check=True)

# with open('./client/package.json') as r:
#     js = json.loads(r.read())
# version = js['version']

# with open('./api/version.txt') as r:
#     version = r.read().strip()
    
with open(f'{DIR}/client/.env.production') as r:
    for line in r:
        if 'VERSION' in line:
            version = line.split('=')[1].strip().strip('"')

assert version

print(f'deploying v{version}...')
run('call npm --prefix ./client run build')
run('git add .')
run(f'git commit -am "v{version}"')
run(f'git tag -a v{version} -m v{version}')
run('git push --follow-tags')
print('done.')

