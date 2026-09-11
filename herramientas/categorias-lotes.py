# -*- coding: utf-8 -*-
"""
INMOL · Panel interactivo
categorias-lotes.py — Lee la categoría de cada lote desde el color del plano
-------------------------------------------------------------------------------
La ficha comercial de INMOL pinta el plano por CATEGORÍA de lote (A: avenida
esquina, B: avenida, C: calle principal esquina…), pero el sistema de
disponibilidad no entrega ese dato: sólo manzana, número, estado y posición.

Este script toma la posición de cada lote, mira de qué color está pintado en
el plano oficial (assets/planos/<proyecto>.jpg) y le asigna la categoría del
color más parecido. Escribe el resultado en js/disponibilidad-<proyecto>.js,
en el campo «categoria».

    python herramientas/categorias-lotes.py

Hay que volver a correrlo cada vez que se baje una disponibilidad nueva del
sistema de INMOL (la descarga pisa el archivo y se pierde la categoría).

Los colores están calibrados sobre el JPG del plano, que es más saturado que
los cuadros de la tabla del PDF. El nombre de cada letra vive en js/datos.js
(plano.categorias), tomado tal cual de la ficha.

SÓLO PARA DESARROLLO. El panel de feria no usa este archivo.
"""
import io, json, os, re
import numpy as np
from PIL import Image

RAIZ = os.path.join(os.path.dirname(__file__), '..')

PALETA = {
    'el-encanto': [('A', '#9000A8'), ('B', '#0090D8'), ('C', '#F00048'), ('D', '#F09030'),
                   ('E', '#005000'), ('F', '#007800'), ('J', '#D8D800'), ('K', '#00A800')],
    'el-encanto-2': [('A', '#EF586C'), ('B', '#F87D43'), ('C', '#22B367'), ('D', '#FFDE41')],
}
ESCALA = 0.5          # el JPG del plano está a la mitad del plano original


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)


def color_del_lote(im, x, y):
    """Mediana del color pintado alrededor del punto, ignorando el número
    del lote (negro) y los bordes (blanco): sólo cuentan los píxeles con
    saturación."""
    H, W = im.shape[:2]
    for r in (5, 9, 14):
        parche = im[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1].reshape(-1, 3)
        con_color = parche[(parche.max(1) - parche.min(1)) > 40]
        if len(con_color) >= 8:
            return np.median(con_color, axis=0)
    return None


for proy, cats in PALETA.items():
    ruta = os.path.join(RAIZ, 'js', f'disponibilidad-{proy}.js')
    src = io.open(ruta, encoding='utf-8', newline='').read()
    a, b = src.index('['), src.rindex(']') + 1
    lotes = json.loads(src[a:b])
    im = np.asarray(Image.open(os.path.join(RAIZ, 'assets', 'planos', f'{proy}.jpg')).convert('RGB'), float)
    paleta = np.array([rgb(c[1]) for c in cats])

    cuenta, sin = {}, 0
    for l in lotes:
        col = color_del_lote(im, int(l['x'] * ESCALA), int(l['y'] * ESCALA))
        if col is None:
            l.pop('categoria', None); sin += 1; continue
        k = int(np.linalg.norm(paleta - col, axis=1).argmin())
        l['categoria'] = cats[k][0]
        cuenta[cats[k][0]] = cuenta.get(cats[k][0], 0) + 1

    cuerpo = json.dumps(lotes, ensure_ascii=False, separators=(',', ':'))
    nuevo = src[:a] + cuerpo + src[b:]
    io.open(ruta, 'w', encoding='utf-8', newline='').write(nuevo)
    print(f'{proy}: {dict(sorted(cuenta.items()))}  sin categoría: {sin}  de {len(lotes)}')
