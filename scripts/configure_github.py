"""Provision the explicitly requested public landing repository and Pages.

Uses the user's gh session in memory. Never writes credentials to disk.
Run with --create first, then push main, then run with --pages.
"""
import argparse,json,subprocess,urllib.request,urllib.error
OWNER='ArnulfoVargas'
NAME='BlendParser'
REPO=f'{OWNER}/{NAME}'
parser=argparse.ArgumentParser()
parser.add_argument('--create',action='store_true')
parser.add_argument('--pages',action='store_true')
args=parser.parse_args()
token=subprocess.run(['gh','auth','token','--hostname','github.com'],check=True,capture_output=True,text=True).stdout.strip()
def api(path,method='GET',body=None):
 request=urllib.request.Request('https://api.github.com/'+path,method=method,data=json.dumps(body).encode() if body is not None else None,headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','Content-Type':'application/json','User-Agent':'BlendParser-Pages-Setup'})
 try:
  with urllib.request.urlopen(request,timeout=25) as response:
   data=response.read()
   return json.loads(data) if data else {}
 except urllib.error.HTTPError as error:
  if error.code==404:return None
  message=json.loads(error.read()).get('message','GitHub request failed')
  raise SystemExit(f'GitHub {error.code}: {message}')
 except urllib.error.URLError:
  raise SystemExit('GitHub HTTPS connection failed. No credentials were written; retry when the connection returns.')
if args.create:
 repo=api('repos/'+REPO)
 if repo is None:repo=api('user/repos','POST',{'name':NAME,'private':False,'description':'De Blender a impresión multicolor. Landing y descargas de BlendParser.'})
 if not repo or repo['full_name'].lower()!=REPO.lower():raise SystemExit('Unexpected repository; no further changes made.')
 print(json.dumps({k:repo[k] for k in ['full_name','html_url','default_branch','visibility']}))
if args.pages:
 existing=api(f'repos/{REPO}/pages')
 pages=api(f'repos/{REPO}/pages','POST' if existing is None else 'PUT',{'build_type':'workflow'})
 if not pages:pages=api(f'repos/{REPO}/pages')
 url=(pages or {}).get('html_url')
 if url:
  api(f'repos/{REPO}','PATCH',{'homepage':url})
  print('GitHub Pages: '+url)
 api(f'repos/{REPO}/actions/workflows/pages.yml/dispatches','POST',{'ref':'main'})
 print('Pages workflow started on main.')
