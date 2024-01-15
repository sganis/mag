#!/usr/bin/env python3
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
    with open(f'{DIR}/client/public/sw.js') as f:
        lines = f.readlines()
    lines[0] = f"// version = {version} // modified by deploy.py.\n"
    with open(f'{DIR}/client/public/sw.js', "w") as f:
        f.writelines(lines)

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

message = f"v{version}"
if len(sys.argv) > 1:
    message = sys.argv[1]
print(f'deploying v{version}...')
if os.name == 'nt':
    run('call npm --prefix ./client run build')
else:
    run('npm --prefix ./client run build')
run('git add .')
run(f'git commit -am "{message}"')
run(f'git tag -a v{version} -m v{version}')
run('git push --follow-tags')
print('done.')

