# thehumans-web
Web corporativa de The Humans. Producción musical, servicios de DJ y eventos

## Favicon

Los iconos viven en `public/`, más un `favicon.ico` en la raíz. Son compartidos por
todo el sitio: no dupliques copias dentro de cada subcarpeta.

`public/favicon.svg` cambia de color solo según el tema del navegador (logo negro en
tema claro, crema en tema oscuro) mediante `prefers-color-scheme` dentro del propio SVG.
Los PNG no pueden adaptarse, así que llevan el fondo crema incrustado y el logo en negro
para que se lean bien en cualquier caso.

Cualquier página nueva debe incluir este bloque en el `<head>`:

```html
<link rel="icon" href="/public/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/public/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/public/favicon-16.png">
<link rel="apple-touch-icon" href="/public/apple-touch-icon.png">
```

Si se olvida, el `favicon.ico` de la raíz sigue apareciendo: los navegadores lo piden
solos cuando una página no declara ningún icono. El bloque solo hace falta para obtener
la versión vectorial que se adapta al tema.

Para regenerar los PNG y el `.ico` tras cambiar el logo, ver `scripts/`.
