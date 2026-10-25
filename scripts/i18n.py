"""Build English pages from shared Spanish markup and a checked translation catalog."""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
import json
import re

ROOT = Path(__file__).resolve().parent.parent
ATTRIBUTES = {'alt', 'aria-label', 'placeholder', 'data-caption'}


class Translator(HTMLParser):
    def __init__(self, catalog):
        super().__init__(convert_charrefs=False)
        self.catalog = catalog
        self.output = []
        self.skip = False

    def translate(self, value):
        key = value.strip()
        if not key:
            return value
        if key not in self.catalog:
            raise ValueError(f'Missing English translation: {key}')
        return value.replace(key, escape(self.catalog[key], quote=False), 1)

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip = True
        translated = []
        for key, value in attrs:
            if value and key in ATTRIBUTES:
                value = self.catalog[value]
            if tag == 'html' and key == 'lang':
                value = 'en'
            if value and key in ('href', 'src') and value.startswith('assets/'):
                value = '../' + value
            translated.append(key if value is None else f'{key}="{escape(value, quote=True)}"')
        self.output.append('<' + tag + (' ' if translated else '') + ' '.join(translated) + '>')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        self.output.append(f'</{tag}>')
        if tag in ('script', 'style'):
            self.skip = False

    def handle_data(self, data):
        self.output.append(data if self.skip else self.translate(data))

    def handle_entityref(self, name):
        self.output.append(f'&{name};')

    def handle_charref(self, name):
        self.output.append(f'&#{name};')

    def handle_decl(self, decl):
        self.output.append(f'<!{decl}>')

    def handle_comment(self, data):
        self.output.append(f'<!--{data}-->')


def switcher(filename, language):
    is_docs = filename == 'docs.html'
    spanish = '../' + ('docs.html' if is_docs else '') if language == 'en' else ('docs.html' if is_docs else './')
    english = ('docs.html' if is_docs else './') if language == 'en' else 'en/' + ('docs.html' if is_docs else '')
    label = 'Language' if language == 'en' else 'Idioma'
    return (f'<!-- language:start --><div class="language-switch" role="group" aria-label="{label}">'
            f'<a href="{spanish}" lang="es" hreflang="es" data-language="es"'
            + (' aria-current="true"' if language == 'es' else '') + '>Español</a>'
            f'<a href="{english}" lang="en" hreflang="en" data-language="en"'
            + (' aria-current="true"' if language == 'en' else '') + '>English</a></div><!-- language:end -->')


def build():
    catalog = json.loads((ROOT / 'locales/en.json').read_text(encoding='utf-8'))
    (ROOT / 'en').mkdir(exist_ok=True)
    for filename in ('index.html', 'docs.html'):
        path = ROOT / filename
        source = path.read_text(encoding='utf-8')
        source = re.sub(r'<!-- language:start -->.*?<!-- language:end -->', '', source, flags=re.S)
        source = re.sub(r'<script[^>]*src="assets/language.js[^\"]*"[^>]*></script>', '', source)
        source = re.sub(r'<!-- seo:start -->.*?<!-- seo:end -->', '', source, flags=re.S)
        translator = Translator(catalog)
        translator.feed(source)
        english = ''.join(translator.output)
        for language, content, target, prefix in (
            ('es', source, path, ''), ('en', english, ROOT / 'en' / filename, '../')
        ):
            content = content.replace('</nav>', switcher(filename, language) + '</nav>', 1)
            content = content.replace('</body>', f'<script src="{prefix}assets/language.js" defer></script></body>')
            target.write_text(content, encoding='utf-8')
    print('Spanish and English pages generated; all English strings checked against the catalog.')


if __name__ == '__main__':
    build()
