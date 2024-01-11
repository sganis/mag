# deploy to vercel with git
# using cli: vercel --prod
import sys
import os
import json
import subprocess
import semver

DIR = os.path.dirname(os.path.abspath(__file__))

def run(cmd):

    subprocess.run(cmd, shell=True, check=True)

def update_version(version):
    with open(f'{DIR}/client/.env.production') as r:
        prod = r.readlines()
    with open(f'{DIR}/client/.env.production', 'wt') as w:
        for line in prod:
            if 'VITE_PUBLIC_VERSION=' in line:
                w.write(f'VITE_PUBLIC_VERSION="{version}"\n')
            else:
                w.write(line)

    with open(f'{DIR}/client/.env.development') as r:
        prod = r.readlines()
    with open(f'{DIR}/client/.env.development', 'wt') as w:
        for line in prod:
            if 'VITE_PUBLIC_VERSION=' in line:
                w.write(f'VITE_PUBLIC_VERSION="{version}"\n')
            else:
                w.write(line)
                
def get_version():
    with open(f'{DIR}/client/.env.production') as r:
        for line in r:
            if 'VERSION' in line:
                return line.split('=')[1].strip().strip('"')
    return ''

version = get_version()
assert version

version = semver.Version.parse(version)
version = version.bump_patch()
update_version(version)

print(f'deploying v{version}...')
run('call npm --prefix ./client run build')
run('git add .')
run(f'git commit -am "v{version}"')
run(f'git tag -a v{version} -m v{version}')
run('git push --follow-tags')
print('done.')

