from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,parse_qs
import json,hashlib,struct,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
BASE='https://arnulfovargas.github.io/BlendParser/'
class SEO(HTMLParser):
 def __init__(self,path):
  super().__init__();self.tags=[];self.schemas=[];self.buffer='';self.ld=False;self.title=False;self.title_text='';self.feed(path.read_text(encoding='utf-8'))
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if tag=='script' and a.get('type')=='application/ld+json':self.ld=True;self.buffer=''
  if tag=='title':self.title=True
 def handle_endtag(self,tag):
  if tag=='script' and self.ld:self.schemas.append(json.loads(self.buffer));self.ld=False
  if tag=='title':self.title=False
 def handle_data(self,data):
  if self.ld:self.buffer+=data
  if self.title:self.title_text+=data
titles=[];descriptions=[]
for name,url in [('index.html',BASE),('docs.html',BASE+'docs.html'),('en/index.html',BASE+'en/'),('en/docs.html',BASE+'en/docs.html')]:
 page=SEO(ROOT/name);titles.append(page.title_text)
 metas={a.get('name',a.get('property')):a.get('content') for t,a in page.tags if t=='meta'}
 assert 20<len(page.title_text)<75 and 'BlendParser' in page.title_text
 descriptions.append(metas['description']);assert 80<len(metas['description'])<180
 canonical=[a['href'] for t,a in page.tags if t=='link' and a.get('rel')=='canonical'];assert canonical==[url]
 assert metas['og:url']==url and metas['og:image']==BASE+'assets/social-preview.png'
 assert metas['twitter:card']=='summary_large_image' and 'noindex' not in metas['robots']
 assert len(page.schemas)==1 and page.schemas[0]['@context']=='https://schema.org'
 assert 'aggregateRating' not in json.dumps(page.schemas)
 for tag,a in page.tags:
  asset=a.get('src') if tag=='script' else a.get('href') if tag=='link' and a.get('rel')=='stylesheet' else None
  if asset and asset.startswith(('assets/','../assets/')):
   parsed=urlsplit(asset);assert parse_qs(parsed.query)['v']==[hashlib.sha256((ROOT/name).parent.joinpath(parsed.path).read_bytes()).hexdigest()[:12]]
  if tag=='img':
   assert int(a['width'])>0 and int(a['height'])>0
   if a.get('fetchpriority')=='high':assert a.get('loading')!='lazy'
 assert {(a['hreflang'],a['href']) for t,a in page.tags if t=='link' and a.get('rel')=='alternate'}=={('es',BASE+('docs.html' if name.endswith('docs.html') else '')),('en',BASE+'en/'+('docs.html' if name.endswith('docs.html') else '')),('x-default',BASE+('docs.html' if name.endswith('docs.html') else ''))}
 language='en' if name.startswith('en/') else 'es'
 assert next(a['lang'] for t,a in page.tags if t=='html')==language
 assert metas['og:locale']==('en_US' if language=='en' else 'es_MX')
 schema=page.schemas[0]['@graph']
 assert schema[1]['inLanguage']==language and schema[2]['inLanguage']==language
 assert schema[2]['@type']==('TechArticle' if name.endswith('docs.html') else 'WebPage')
 assert len(schema[2].get('articleSection',[]))==(12 if name.endswith('docs.html') else 0)
assert len(set(titles))==4 and len(set(descriptions))==4
sitemap=ET.parse(ROOT/'sitemap.xml');assert [node.text for node in sitemap.findall('.//{*}loc')]==[BASE,BASE+'docs.html',BASE+'en/',BASE+'en/docs.html']
with (ROOT/'assets/social-preview.png').open('rb') as file:header=file.read(24)
assert struct.unpack('>II',header[16:24])==(1200,630)
print('SEO checks passed: canonical, metadata, social image, structured data, image dimensions, cache versions and sitemap.')
