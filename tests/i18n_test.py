"""Translation coverage, shared anchors and repeatable builds."""
from pathlib import Path
import importlib.util
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('i18n', ROOT / 'scripts/i18n.py')
i18n = importlib.util.module_from_spec(spec)
spec.loader.exec_module(i18n)


class TranslationTests(unittest.TestCase):
    def test_missing_translation_fails_instead_of_publishing_spanish(self):
        translator = i18n.Translator({})
        with self.assertRaisesRegex(ValueError, 'Missing English translation'):
            translator.feed('<p>Un texto nuevo</p>')

    def test_markup_entities_and_asset_prefix(self):
        translator = i18n.Translator({'Texto': 'Text', 'Captura': 'Screenshot'})
        translator.feed('<html lang="es"><a href="assets/image.png"><img alt="Captura"></a><p> Texto &amp; </p></html>')
        self.assertEqual(''.join(translator.output), '<html lang="en"><a href="../assets/image.png"><img alt="Screenshot"></a><p> Text &amp; </p></html>')

    def test_matching_anchors_and_language_links(self):
        import re
        for filename in ('index.html', 'docs.html'):
            es = (ROOT / filename).read_text(encoding='utf-8')
            en = (ROOT / 'en' / filename).read_text(encoding='utf-8')
            self.assertEqual(re.findall(r'\bid="([^"]+)"', es), re.findall(r'\bid="([^"]+)"', en))
            for source in (es, en):
                self.assertEqual(source.count('data-language='), 2)
                self.assertEqual(source.count('assets/language.js'), 1)

    def test_build_is_repeatable(self):
        files = ['index.html', 'docs.html', 'en/index.html', 'en/docs.html', 'sitemap.xml']
        before = {name: (ROOT / name).read_bytes() for name in files}
        subprocess.run([sys.executable, str(ROOT / 'scripts/build.py')], check=True)
        self.assertEqual(before, {name: (ROOT / name).read_bytes() for name in files})


if __name__ == '__main__':
    unittest.main()
