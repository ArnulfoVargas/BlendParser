from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
 def __init__(self,path):
  super().__init__();self.ids=set();self.links=[];self.path=path;self.feed(path.read_text(encoding='utf-8'))
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if 'id' in attrs:
   assert attrs['id'] not in self.ids,f'Duplicate id in {self.path.name}: {attrs["id"]}'
   self.ids.add(attrs['id'])
  for key in ('href','src'):
   if attrs.get(key):self.links.append(attrs[key])
pages={path.name:Page(path) for path in ROOT.glob('*.html')}
for page in pages.values():
 for link in page.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  filename=unquote(u.path) or page.path.name
  if filename=='./':filename='index.html'
  assert (ROOT/filename).exists(),f'Missing local link: {page.path.name} -> {link}'
  if u.fragment and filename in pages:assert unquote(u.fragment) in pages[filename].ids,f'Missing anchor: {link}'
print(f'Local links, assets, anchors and unique IDs passed for {len(pages)} pages.')
