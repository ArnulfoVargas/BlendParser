"""Fetch public app releases; never put a GitHub token in the published site."""
from pathlib import Path
from datetime import datetime, timezone
import os,json,urllib.request,sys
ROOT=Path(__file__).resolve().parent.parent
output=ROOT/'assets/releases.json'
headers={'Accept':'application/vnd.github+json','User-Agent':'BlendParser-Pages'}
if os.environ.get('GH_TOKEN'):headers['Authorization']='Bearer '+os.environ['GH_TOKEN']
try:
 request=urllib.request.Request('https://api.github.com/repos/ArnulfoVargas/blend-parser-app/releases?per_page=30',headers=headers)
 with urllib.request.urlopen(request,timeout=25) as response:releases=json.load(response)
 releases=[r for r in releases if not r['draft'] and r.get('published_at') and any(a['name'].lower().endswith(('.exe','.msi','.appimage','.deb','.rpm')) for a in r.get('assets',[]))]
 releases.sort(key=lambda r:r['published_at'],reverse=True)
 if not releases:raise ValueError('No published release with installers')
 release=releases[0]
 safe={k:release[k] for k in ('tag_name','published_at','prerelease','html_url')}
 safe['assets']=[{k:a[k] for k in ('name','browser_download_url','size')} for a in release['assets'] if a['name'].lower().endswith(('.exe','.msi','.appimage','.deb','.rpm'))]
 output.write_text(json.dumps({'checked_at':datetime.now(timezone.utc).isoformat(),'release':safe},indent=2)+'\n',encoding='utf-8')
 print('Release snapshot updated: '+safe['tag_name'])
except Exception as error:
 if output.exists():print('Using committed release snapshot; GitHub is temporarily unavailable.',file=sys.stderr)
 else:raise SystemExit('Cannot create initial release snapshot: '+str(error))
