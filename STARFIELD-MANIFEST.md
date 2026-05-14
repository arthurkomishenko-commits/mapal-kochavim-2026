# Starfield Manifest v2 — 35,000 звёзд, Canvas 2D

## Масштаб

Реальное небо Bortle 2 — ~4500 звёзд видимых глазом + миллионы
неразрешённых (Млечный Путь). На экране для реализма нужно ~35,000
точек. CSS/DOM не способен на это. Canvas 2D — единственный путь.

## Ключевой инсайт

При 35K звёздах **Млечный Путь не нужно рисовать отдельно**.
Он ВОЗНИКНЕТ САМ из повышенной плотности звёзд вдоль полосы.
Именно так он и выглядит — это не облако, а неразрешённый свет
миллионов далёких звёзд. Плотность = яркость.

## Архитектура

```
<canvas id="sky">  ← ОДИН элемент в DOM

  Rendering pipeline:

  1. Sky gradient (fillRect)
  2. Static stars → ImageData buffer (35K pixel writes, один раз)
  3. Milky Way = emerges from density (не отдельный слой)
  4. Named stars glow (radialGradient, ~72 шт)
  5. Diffraction spikes (lineTo, только mag < 1)
  6. Twinkling loop (rAF, модулирует ~200 звёзд)
```

## Рендеринг 35K звёзд — техника ImageData

Самый быстрый способ: прямая запись пикселей.

```js
const imageData = ctx.createImageData(w, h);
const data = imageData.data; // Uint8ClampedArray

for (const star of stars) {
  const idx = (star.y * w + star.x) * 4;
  data[idx]     = star.r;   // red
  data[idx + 1] = star.g;   // green
  data[idx + 2] = star.b;   // blue
  data[idx + 3] = star.a;   // alpha
}

ctx.putImageData(imageData, 0, 0);
```

35,000 записей в массив = <5ms на iPhone SE.
Один putImageData = <2ms.
Итого: <10ms для всех фоновых звёзд.

## Распределение 35K звёзд

| Зона | % от 35K | Кол-во | Описание |
|---|---|---|---|
| MW ядро (Стрелец) | 20% | 7000 | Самая плотная зона |
| MW полоса (остальная) | 35% | 12250 | Вдоль всей полосы |
| Общий фон | 40% | 14000 | Равномерно по небу |
| Star clouds (Scutum, etc) | 5% | 1750 | Локальные сгущения |

## Размеры и яркость

| Категория | Кол-во | Размер px | Alpha |
|---|---|---|---|
| Еле видимые | 25000 | 1×1 | 0.05-0.20 |
| Тусклые | 7000 | 1×1 | 0.20-0.45 |
| Заметные | 2500 | 1-2×1-2 | 0.40-0.70 |
| Яркие фоновые | 500 | 2×2 | 0.60-0.90 |
| Именованные (каталог) | 72 | glow 3-15px | 0.75-1.0 |

## MW glow — дополнительный эффект

Даже при 35K звёздах может понадобиться лёгкий glow:
- Offscreen canvas, размер 1/4 от основного
- Рисуем ту же звёздную карту но с толстыми (3-5px) кругами
- Blur через CSS filter на offscreen canvas
- drawImage на основной с globalAlpha 0.15
- Это создаёт мягкое свечение вокруг плотных зон

## Мерцание

Не все 35K мерцают. Это невозможно и не нужно.

- **Статичный слой:** 35K звёзд = ImageData, рисуется один раз
- **Мерцающий слой:** ~150-200 звёзд (mag < 4) = отдельный проход
- Каждый кадр: clearRect мерцающей зоны, перерисовать с новой alpha
- Или: overlay canvas (position: absolute, same size)

## 6 шагов реализации

### Шаг 1: Canvas setup + sky gradient
- canvas размером с viewport
- Gradient: #060A1A (зенит) → #0E1230 (горизонт)
- resize handler

### Шаг 2: Star distribution engine
- Функция `generateStarPositions(count, milkyWayPath)` → массив
- Probability map: вероятность звезды в каждой точке неба
  зависит от proximity к MW, altitude, star clouds
- Gaussian scatter вокруг MW центральной линии

### Шаг 3: Static render (ImageData)
- 35K звёзд за один putImageData
- Цвета: 70% white, 15% warm, 15% cool (subpixel level)
- MW звёзды чуть теплее (Галактический центр)

### Шаг 4: MW glow overlay (offscreen canvas)
- 1/4 resolution
- Толстые точки вдоль MW
- Blur
- Composite

### Шаг 5: Named stars + glow
- 72 звезды из каталога
- radialGradient для ярких
- Спектральные цвета
- Diffraction spikes для mag < 1

### Шаг 6: Twinkling rAF loop
- 150-200 звёзд с animated alpha
- Overlay canvas или partial redraw

## Данные необходимые от Gemini

1. MW path — 15-20 точек с шириной и яркостью
2. Star clouds — координаты и размеры 4-5 облаков
3. Dark lanes — координаты Great Rift, Pipe Nebula
4. Sky brightness по altitude (atmospheric glow)

## Код необходимый от GPT

1. `SkyRenderer` класс с Canvas 2D pipeline
2. Эффективная генерация 35K звёзд с MW probability map
3. ImageData rendering technique
4. MW glow через offscreen canvas + blur
5. Twinkling через overlay canvas

## Performance targets

- Initial render: < 50ms (35K ImageData writes + 72 arc draws)
- Twinkling frame: < 2ms
- Memory: < 30MB
- Canvas: 1x resolution (не retina)
- iPhone SE: 60fps twinkling
