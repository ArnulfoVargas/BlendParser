from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parent.parent
dist=ROOT/'dist'
dist.mkdir(exist_ok=True)
shutil.copy2(ROOT/'index.html',dist/'index.html')
shutil.copytree(ROOT/'assets',dist/'assets',dirs_exist_ok=True)
(dist/'.nojekyll').touch()
assert (dist/'assets/releases.json').exists(), 'Run scripts/sync_releases.py first'
print('Built static site in dist/. Relative assets support /BlendParser/.')
