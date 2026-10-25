# BlendParser

Landing oficial de BlendParser. La aplicación y sus releases viven en [ArnulfoVargas/blend-parser-app](https://github.com/ArnulfoVargas/blend-parser-app).

Sitio estático sin dependencias de producción. HTML, CSS, JavaScript y fuentes locales. Las capturas son reales, tomadas en Blender y BlendParser con el mismo modelo.

## Desarrollo

```sh
python scripts/sync_releases.py
python scripts/build.py
python -m http.server 8766 --directory dist
node --test tests/*.test.mjs
```

## GitHub Pages

El workflow `.github/workflows/pages.yml` publica `dist/` al subir cambios a `main`, al ejecutarlo manualmente o cada seis horas. En Settings → Pages, el origen debe ser GitHub Actions. No requiere dominio propio ni claves privadas adicionales.

Los assets y enlaces internos son relativos, compatibles con el prefijo `/BlendParser/`. Solo se publica HTML y `assets/`; los scripts de mantenimiento y la configuración del repositorio no forman parte del sitio.

## Descargas

El navegador consulta la API pública del repositorio de la aplicación y elige el release publicado más reciente que tenga instaladores, incluidas versiones preliminares. Ignora borradores, firmas `.sig` y archivos del actualizador. Windows prefiere `.exe`, Linux `.AppImage`; las demás opciones se muestran debajo.

El workflow genera una copia local de los enlaces cada seis horas. Si GitHub limita la API, esa copia mantiene las descargas disponibles. Si tampoco está disponible la copia, los botones llevan a GitHub Releases. Sin JavaScript, los enlaces a Releases siguen funcionando. No hay tokens de GitHub en el código publicado.

Los botones descargan la app; no actualizan una instalación existente. Blender 3.6 o posterior debe estar instalado. Los binarios actuales no están firmados y Windows puede mostrar SmartScreen.

## Interacción y acceso

El visor admite ratón y teclado. Las preguntas tienen una sola respuesta activa, apertura y cierre animados y controles accesibles. Las animaciones respetan movimiento reducido; el contenido sigue disponible sin JavaScript.
