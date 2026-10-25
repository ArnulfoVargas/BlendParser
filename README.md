# BlendParser

**Sitio público:** https://arnulfovargas.github.io/BlendParser/

Landing oficial de BlendParser. La aplicación y sus releases viven en [ArnulfoVargas/blend-parser-app](https://github.com/ArnulfoVargas/blend-parser-app).

Sitio estático sin dependencias de producción. HTML, CSS, JavaScript y fuentes locales. Las capturas son reales, tomadas en Blender y BlendParser con el mismo modelo.

## Desarrollo

```sh
python scripts/sync_releases.py
python scripts/build.py
python -m http.server 8766 --directory dist
node --test tests/*.test.mjs
python scripts/check_links.py
python scripts/check_seo.py
python tests/i18n_test.py
```

## Idiomas

La landing y la guía están disponibles en español (`/` y `/docs.html`) e inglés (`/en/` y `/en/docs.html`). El dropdown antes de Inicio conserva la sección actual y funciona sin JavaScript. La navegación entre inicio y documentación mantiene la misma distribución.

Al entrar por una URL sin prefijo, `assets/locale.js` detecta el idioma antes de pintar la página: primero una elección explícita `?lang=es` o `?lang=en`, después la elección manual guardada en `localStorage` y por último la primera preferencia compatible de `navigator.languages` (o `navigator.language`). Reconoce variantes como `es-MX` y `en-GB`; si no hay un idioma compatible, usa inglés. Las URLs `/en/` y `/en/docs.html` son explícitas y se respetan salvo que lleven un parámetro `lang` diferente. Se conservan query y ancla al redirigir, incluido el prefijo `/BlendParser/`.

El dropdown recuerda tu elección y añade `lang` al enlace para funcionar incluso con almacenamiento bloqueado. Esa elección se transmite a los enlaces de inicio y guía. Sin JavaScript se respeta la URL y ambos idiomas siguen accesibles desde el menú.

El HTML español es la fuente compartida: `index.html` y la guía generada por `scripts/docs.py`. `scripts/i18n.py` genera las páginas inglesas con el catálogo `locales/en.json`; no edites `en/*.html` directamente. Al cambiar texto español, actualiza también el catálogo. El build falla si falta una traducción de contenido, etiquetas de accesibilidad, pies de captura o placeholders. Los mensajes dinámicos se traducen en `assets/releases.js`, `assets/docs.js` y `assets/friendly-motion.js`. Las capturas reales se comparten entre idiomas y conservan el texto de la aplicación original.

El build genera canónicos y metadatos propios, enlaces `hreflang` recíprocos y un sitemap con las cuatro páginas. Para agregar otro idioma, amplía el generador, el catálogo, los mensajes dinámicos y la configuración SEO, junto con las verificaciones.

Las PR a `main` ejecutan el build, las pruebas de descargas, traducciones, enlaces y SEO. La verificación opcional de navegador está en `tests/browser-i18n.mjs`: requiere `puppeteer-core` y Chrome, acepta `BP_BROWSER_TOOLS` para reutilizar una instalación local de Puppeteer, `BP_CHROME` para el ejecutable y `BP_SITE_URL` para el servidor de `dist/` (por defecto `http://127.0.0.1:8768/`).

## GitHub Pages

El workflow `.github/workflows/pages.yml` publica `dist/` al subir cambios a `main`, al ejecutarlo manualmente o cada seis horas. En Settings → Pages, el origen debe ser GitHub Actions. No requiere dominio propio ni claves privadas adicionales.

Los assets y enlaces internos son relativos, compatibles con el prefijo `/BlendParser/`. Solo se publica HTML y `assets/`; los scripts de mantenimiento y la configuración del repositorio no forman parte del sitio.

## Descargas

El navegador consulta la API pública del repositorio de la aplicación y elige el release publicado más reciente que tenga instaladores, incluidas versiones preliminares. Ignora borradores, firmas `.sig` y archivos del actualizador. Windows prefiere `.exe`, Linux `.AppImage`; las demás opciones se muestran debajo.

El workflow genera una copia local de los enlaces cada seis horas. Si GitHub limita la API, esa copia mantiene las descargas disponibles. Si tampoco está disponible la copia, los botones llevan a GitHub Releases. Sin JavaScript, los enlaces a Releases siguen funcionando. No hay tokens de GitHub en el código publicado.

Los botones descargan la app; no actualizan una instalación existente. Blender 3.6 o posterior debe estar instalado. Los binarios actuales no están firmados y Windows puede mostrar SmartScreen.

## Interacción y acceso

El visor admite ratón y teclado. Las preguntas tienen una sola respuesta activa, apertura y cierre animados y controles accesibles. Las animaciones respetan movimiento reducido; el contenido sigue disponible sin JavaScript.

El recorrido del inicio se reproduce automáticamente cuando el visor entra en pantalla. Se puede pausar; también se detiene fuera de pantalla o al cambiar de pestaña, y pausa al interactuar con ratón o teclado. Con movimiento reducido no arranca automáticamente.

Las pausas por visibilidad son temporales: el recorrido continúa al volver a la pestaña o al visor. La pausa manual se conserva. El cursor que ya estaba situado encima al cargar no bloquea el inicio.

## Documentación de uso

`docs.html` se genera con `scripts/docs.py` durante el build. Sus dieciséis secciones cubren la versión publicada 0.0.6 y las funciones próximas revisadas en `main` (`ced391d1ba014078fe777e6df3c4dd894d873770`). Importación BLEND/OBJ/FBX/glTF/GLB/PLY y recuperación de texturas, diagnóstico FDM con correcciones reversibles, y movimiento, rotación y corte se identifican como próximas: aún no están en el instalador 0.0.6. También se documentan impresoras, tamaño, medición, placa, colores, pintura, desperdicio, exportación, atajos y límites. La exportación ZIP por color sigue oculta y no se anuncia como disponible. La guía funciona sin JavaScript.

## SEO

`scripts/seo.py` genera títulos y descripciones propios para ambas páginas, canónicos absolutos, Open Graph, Twitter Cards y datos estructurados WebSite, WebPage, SoftwareApplication, TechArticle y BreadcrumbList. No incluye valoraciones inventadas ni promesas de resultados enriquecidos.

El sitemap público está en `https://arnulfovargas.github.io/BlendParser/sitemap.xml`. Puede enviarse a Search Console al verificar la propiedad. Esta web es un sitio de proyecto bajo `/BlendParser/`; no controla el `robots.txt` raíz de `arnulfovargas.github.io`, por lo que usa meta robots y un sitemap propio en lugar de un robots de subcarpeta ineficaz.

Las imágenes incluyen dimensiones intrínsecas y carga diferida salvo el producto inicial. CSS y JavaScript reciben una versión de contenido para que un navegador no conserve una implementación anterior después del despliegue. La imagen social, `assets/social-preview.png`, tiene 1200 × 630 px y se creó con una captura real; su composición está en `scripts/social-preview.html`.

## Capturas HD de la próxima versión

`assets/captures.json` registra el commit de origen, la procedencia y los ajustes de las capturas. Se compiló `main` en modo release y se capturó su WebView real, incluido el modelo WebGL: 1600 × 1000 píxeles CSS con factor de escala 2, que produce imágenes de 3200 × 2000 píxeles. Original y Resultado son recortes nativos del visor con idéntica cámara y dimensiones; no se ampliaron capturas antiguas ni se reconstruyó la interfaz.

La compilación conserva la versión interna que declara el código (`v0.0.2`); las imágenes son una vista previa de desarrollo, no capturas del instalador publicado 0.0.6. La landing y las dos guías explican esta diferencia. El ejemplo usa una altura de 75 mm, Bambu Lab A1 y boquilla de 0,4 mm. Las cifras visibles corresponden al ejemplo. Las capturas auténticas de Blender se conservan en su resolución original.

El script también captura WebP al 95 % desde la misma vista y con las mismas dimensiones, para las vistas previas de la web. Los enlaces de ampliación conservan los PNG originales. El generador SEO añade `srcset` cuando existe la vista WebP; el catálogo inglés ajusta su ruta bajo `/en/`.

Para repetirlas, compila el commit revisado, abre el ejecutable con el modelo y `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9223 --remote-debugging-address=127.0.0.1` y ejecuta `node scripts/capture-app.mjs`. Requiere `puppeteer-core`; `BP_BROWSER_TOOLS` permite reutilizar una instalación existente y `BP_APP_CDP` cambia el puerto. `BP_CAPTURE_VERSION` valida opcionalmente la versión visible. `BP_CAPTURE_SOURCE_REF` debe indicar el commit realmente compilado.

La captura del diálogo Archivos del modelo usa un OBJ exportado del mismo BLEND mediante Blender 5.0.1: los materiales sin sus texturas empaquetadas activan el flujo real de asignación. Para repetirla, abre ese OBJ en otra sesión con depuración en el puerto 9224 (y un `WEBVIEW2_USER_DATA_FOLDER` separado), elige español y ejecuta `node scripts/capture-import.mjs`; `BP_IMPORT_CDP` permite cambiar la dirección. El sitio no anuncia estos formatos como disponibles en 0.0.6. La copia local de descargas y los datos estructurados siguen apuntando a la última versión publicada con instaladores.
