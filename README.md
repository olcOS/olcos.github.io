# olcos.github.io

Исходники сайта [olcos.github.io](https://olcos.github.io): русская версия в `index.html`, английская в
`en/index.html`. Сборки нет, это обычные HTML, CSS и JavaScript, GitHub Pages отдаёт их как есть из ветки `main`.

- `assets/css/site.css` — стили, `assets/js/site.js` — поведение страницы, `assets/js/scene.js` — анимация
  «стена и сигнал».
- `assets/img/` — скриншоты приложения и иконка, `assets/fonts/` — шрифты Onest и JetBrains Mono.
- Откуда взяты картинки и цифры, записано в [assets/asset-manifest.md](assets/asset-manifest.md).

Проверить локально:

```bash
python3 -m http.server 8080
```

и открыть http://localhost:8080.

Website source for olcOS. Plain HTML, CSS and JavaScript served by GitHub Pages from `main`.
