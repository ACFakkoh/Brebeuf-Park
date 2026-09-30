# Brébeuf Park

[Live app](https://acfakkoh.github.io/Brebeuf-Park/)

Choose a street and side to see the next cleaning window. **Add to calendar** downloads one event with a 2-hour alert; open the file and save it in your calendar. The app remembers your selection and works offline after the first visit.

All dates use Montreal time, including when your device is in another timezone. Schedules are the existing project's signage snapshot, not a live city feed. Check the signs where you park; street-specific exceptions are shown below the schedule.

No dependencies or build step:

```sh
python serve.py
node test.js
```

GitHub Pages serves the app from the root of `main`. Keep `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js` and the three icons together. When changing cached assets, bump the version in `sw.js` and the matching asset URLs in `index.html`.

`python package_app.py` refreshes `gh-pages-export/` and the ZIP from the current source files. The optional `deploy_to_github.py` uploader reads the source directly and targets `Brebeuf-Park`.
