# Poetry Prototype (Wireframe)

Single-page HTML wireframe with a black-and-white “sketchy” look.

## Run

- **Recommended**: serve the folder (required for header/footer includes):

```bash
cd /Users/pete/Code/poetry-book-prototype
python3 serve.py
```

Then open `http://localhost:8000`.

`serve.py` sends no-cache headers so CSS and JS changes appear on a normal reload (unlike `python3 -m http.server`, which often returns 304s).

Note: opening via `file://` won’t load the shared header/footer partials in most browsers.

