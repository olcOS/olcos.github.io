# Ассеты сайта

Откуда взяты файлы в `assets/` и как их пересобрать.

| Файл | Источник |
|---|---|
| `img/screens/*.webp` | Скриншоты приложения из артефакта CI olcos-ios (iPhone, тёмная тема), прогон [42168080542](https://github.com/olcOS/olcos-ios/actions/runs/42168080542). Исходники 804×1748, ужаты до 660×1435 WebP. |
| `img/live-activity.webp` | Тот же прогон CI, снимок Live Activity на экране блокировки. |
| `icon*.png`, `img/icon-512.webp`, `favicon*`, `../favicon.ico`, `../apple-touch-icon.png` | AppIcon из olcos-ios (`App/Assets.xcassets/AppIcon.appiconset`). |
| `js/scene.js` | Сцена «стена, трещины, сигнал» перенесена из olcos-ios `docs/assets/src/hero-scene.js` и переписана под canvas. |
| `fonts/onest-*.woff2` | [Onest](https://fontsource.org/fonts/onest), SIL OFL 1.1. Подмножества cyrillic и latin. В приложении SF Pro, на сайте его заменяет Onest. |
| `fonts/jbmono-*.woff2` | [JetBrains Mono](https://fontsource.org/fonts/jetbrains-mono), SIL OFL 1.1. |
| `og-ru.png`, `og-en.png` | Превью для соцсетей 1200×630, собраны из скриншота `whole-server-hero-connected`, иконки и `scene.js`. |

Цифры скорости на главной взяты из документации olcrtc:
[settings.ru.md](https://github.com/ghostlane-project/olcrtc/blob/0955ba7f2041d1480524292c4af4135a192fe267/docs/settings.ru.md),
[gate.ru.md](https://github.com/ghostlane-project/olcrtc/blob/0955ba7f2041d1480524292c4af4135a192fe267/docs/gate.ru.md).
Если поменяется версия ядра, их стоит перепроверить.

`f1a473ff9b9ce8d89278d20abd602f42.txt` в корне сайта — ключ IndexNow, удалять не нужно.
