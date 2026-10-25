from pathlib import Path
import shutil,subprocess,sys
ROOT=Path(__file__).resolve().parent.parent
subprocess.run([sys.executable,str(ROOT/'scripts/docs.py')],check=True)
subprocess.run([sys.executable,str(ROOT/'scripts/i18n.py')],check=True)
subprocess.run([sys.executable,str(ROOT/'scripts/seo.py')],check=True)
dist=ROOT/'dist'
dist.mkdir(exist_ok=True)
shutil.copy2(ROOT/'index.html',dist/'index.html')
shutil.copy2(ROOT/'docs.html',dist/'docs.html')
shutil.copytree(ROOT/'en',dist/'en',dirs_exist_ok=True)
shutil.copy2(ROOT/'sitemap.xml',dist/'sitemap.xml')
shutil.copytree(ROOT/'assets',dist/'assets',dirs_exist_ok=True)
(dist/'.nojekyll').touch()
assert (dist/'assets/releases.json').exists(), 'Run scripts/sync_releases.py first'
print('Built static site in dist/. Relative assets support /BlendParser/.')
