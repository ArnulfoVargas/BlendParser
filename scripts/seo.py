"""Deterministic metadata, image dimensions, crawl discovery and cache versions."""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlsplit
import hashlib,json,re,struct
ROOT=Path(__file__).resolve().parent.parent
BASE='https://arnulfovargas.github.io/BlendParser/'
APP_REPO='https://github.com/ArnulfoVargas/blend-parser-app'
snapshot=json.loads((ROOT/'assets/releases.json').read_text(encoding='utf-8')).get('release',{})
class Headings(HTMLParser):
 def __init__(self):super().__init__();self.active=False;self.items=[];self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag=='h2':self.active=True;self.parts=[]
 def handle_endtag(self,tag):
  if tag=='h2' and self.active:self.items.append(' '.join(self.parts));self.active=False
 def handle_data(self,data):
  if self.active:self.parts.append(data.strip())
pages={
 'index.html':('BlendParser: convierte Blender a 3MF multicolor','Convierte modelos de Blender en 3MF multicolor para Bambu Studio. Ajusta colores, pinta en 3D y descarga BlendParser para Windows o Linux.',''),
 'docs.html':('Guía de BlendParser: colores, pincel y exportación 3MF','Aprende a usar BlendParser: importar modelos de Blender, preparar colores y malla, pintar, exportar a Bambu Studio y resolver problemas.','docs.html'),
 'en/index.html':('BlendParser: convert Blender to multicolor 3MF','Convert Blender models to multicolor 3MF for Bambu Studio. Adjust colors, paint in 3D and download BlendParser for Windows or Linux.','en/'),
 'en/docs.html':('BlendParser guide: colors, brush and 3MF export','Learn to use BlendParser: import Blender models, prepare colors and meshes, paint, export to Bambu Studio and troubleshoot common issues.','en/docs.html')
}
for filename,(title,description,route) in pages.items():
 path=ROOT/filename;s=path.read_text(encoding='utf-8');url=BASE+route
 language='en' if filename.startswith('en/') else 'es'
 home=BASE+('en/' if language=='en' else '')
 is_docs=filename.endswith('docs.html')
 if not route:
  # Serve the same first frame the automatic tour starts with, avoiding an extra hero image download.
  def initial_controls(match):
   controls=match[0]
   return re.sub(r'<button\b[^>]*data-shot="([^"]+)"[^>]*>',lambda b:re.sub(r'aria-pressed="(?:true|false)"','aria-pressed="'+str(b[1]=='blender-materiales').lower()+'"',b[0]),controls)
  s=re.sub(r'<div class="capture-controls"[^>]*>.*?</div>',initial_controls,s,count=1,flags=re.S)
  s=re.sub(r'<img\b[^>]*data-capture-image[^>]*>',lambda m:re.sub(r'alt="[^"]*"','alt="Modelo original abierto en Blender"',re.sub(r'src="[^"]*"','src="assets/blender-materiales.png"',m[0])),s,count=1)
  s=s.replace('href="assets/resultado.png" data-lightbox aria-label="Ampliar el resultado"','href="assets/blender-materiales.png" data-lightbox aria-label="Ampliar captura de Blender"')
  s=re.sub(r'(<figcaption[^>]*data-capture-caption[^>]*>).*?(</figcaption>)',r'\1El modelo original, abierto en Blender.\2',s,count=1,flags=re.S)
 s=re.sub(r'<!-- seo:start -->.*?<!-- seo:end -->','',s,flags=re.S)
 s=re.sub(r'<title>.*?</title>',f'<title>{escape(title)}</title>',s,count=1,flags=re.S)
 s=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{escape(description,quote=True)}">',s,count=1)
 graph=[{'@type':'WebSite','@id':BASE+'#website','url':BASE,'name':'BlendParser','inLanguage':['es','en']}]
 app={'@type':'SoftwareApplication','@id':home+'#application','name':'BlendParser','url':home,'description':pages['en/index.html' if language=='en' else 'index.html'][1],'applicationCategory':'MultimediaApplication','operatingSystem':'Windows, Linux','isAccessibleForFree':True,'license':APP_REPO+'/blob/main/LICENSE','downloadUrl':APP_REPO+'/releases','softwareHelp':{'@id':home+'docs.html#guia'},'image':BASE+'assets/social-preview.png','screenshot':BASE+'assets/blendparser-app.png','sameAs':APP_REPO,'inLanguage':language}
 if snapshot.get('tag_name'):app['softwareVersion']=snapshot['tag_name']
 graph.append(app)
 if is_docs:
  headings=Headings();headings.feed(s)
  graph.extend([{'@type':'TechArticle','@id':url+'#guia','url':url,'headline':title,'description':description,'inLanguage':language,'isPartOf':{'@id':BASE+'#website'},'about':{'@id':home+'#application'},'articleSection':headings.items},
  {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'BlendParser','item':home},{'@type':'ListItem','position':2,'name':'Documentation' if language=='en' else 'Documentación','item':url}]}])
 else:graph.append({'@type':'WebPage','@id':url+'#webpage','url':url,'name':title,'description':description,'inLanguage':language,'isPartOf':{'@id':BASE+'#website'},'about':{'@id':home+'#application'}})
 metadata=f'''<!-- seo:start --><link rel="canonical" href="{url}"><meta name="robots" content="index, follow, max-image-preview:large"><meta name="theme-color" content="#11603f"><link rel="apple-touch-icon" href="{BASE}assets/icon.png"><meta property="og:site_name" content="BlendParser"><meta property="og:type" content="{'article' if route else 'website'}"><meta property="og:locale" content="es_MX"><meta property="og:url" content="{url}"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:image" content="{BASE}assets/social-preview.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="BlendParser convierte modelos de Blender a impresión 3D multicolor"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{escape(title,quote=True)}"><meta name="twitter:description" content="{escape(description,quote=True)}"><meta name="twitter:image" content="{BASE}assets/social-preview.png"><meta name="twitter:image:alt" content="Modelo de ejemplo en BlendParser"><script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False,separators=(',',':'))}</script><!-- seo:end -->'''
 if language=='en':
  metadata=metadata.replace('content="es_MX"','content="en_US"').replace('BlendParser convierte modelos de Blender a impresión 3D multicolor','BlendParser converts Blender models to multicolor 3D printing').replace('Modelo de ejemplo en BlendParser','Example model in BlendParser')
 if not is_docs:metadata=metadata.replace('content="article"','content="website"')
 counterpart='docs.html' if is_docs else ''
 metadata+=f'<link rel="alternate" hreflang="es" href="{BASE+counterpart}"><link rel="alternate" hreflang="en" href="{BASE+"en/"+counterpart}"><link rel="alternate" hreflang="x-default" href="{BASE+counterpart}">'
 # Alternate links are regenerated along with the SEO block.
 s=re.sub(r'<link rel="alternate"[^>]*>','',s)
 s=s.replace('</head>',metadata+'</head>')
 # Known intrinsic sizes prevent layout shifts; only the hero is eager.
 def size_image(match):
  tag=match[0];src=re.search(r'src="([^"]+)"',tag)
  if not src:return tag
  image=path.parent/urlsplit(src[1]).path
  if image.suffix.lower()=='.png' and image.exists():
   with image.open('rb') as file:header=file.read(24)
   if header[:8]==b'\x89PNG\r\n\x1a\n':
    width,height=struct.unpack('>II',header[16:24]);tag=re.sub(r'\s(?:width|height)="[^"]*"','',tag)
    tag=tag[:-1]+f' width="{width}" height="{height}">'
  if 'decoding=' not in tag:tag=tag[:-1]+' decoding="async">'
  if 'loading=' not in tag and 'fetchpriority=' not in tag and 'assets/icon' not in tag:tag=tag[:-1]+' loading="lazy">'
  return tag
 s=re.sub(r'<img\b[^>]*>',size_image,s)
 def version(match):
  prefix,asset=match[1],match[2]
  file=path.parent/asset
  digest=hashlib.sha256(file.read_bytes()).hexdigest()[:12]
  return prefix+asset+'?v='+digest+'"'
 s=re.sub(r'((?:src|href)=")((?:\.\./)?assets/[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"',version,s)
 path.write_text(s,encoding='utf-8')
sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{BASE+route}</loc></url>\n' for _,_,route in pages.values())+'</urlset>\n'
(ROOT/'sitemap.xml').write_text(sitemap,encoding='utf-8')
print('SEO metadata, structured data, sitemap, image sizes and asset versions generated.')
