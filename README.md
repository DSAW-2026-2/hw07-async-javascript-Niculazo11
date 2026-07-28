# HW07 — Async JavaScript

**Week 7 · DSAW · Universidad de La Sabana**

## Objective

Build a mini-app that consumes a public API, handles all three states of an async request, and has an offline fallback using `localStorage`.

## Deliverables

### `index.html` (+ JS)

Choose a public API relevant to your project or one you find interesting:
- [OpenWeatherMap](https://openweathermap.org/api), [PokeAPI](https://pokeapi.co/), [Rick and Morty API](https://rickandmortyapi.com/), [NewsAPI](https://newsapi.org/), or any other.

**The app must show 3 clearly distinct UI states:**

1. **Loading:** while the request is in flight (spinner, skeleton, or message)
2. **Success:** data rendered in a useful way
3. **Error:** a clear message when the request fails — `console.log` is not an error state

**Technical requirements:**
- `async/await` — no chained `.then()`
- `try/catch` for error handling
- No libraries (no axios, no jQuery)

### Offline cache

- On every successful fetch, save the data to `localStorage`
- If the fetch fails (no network, API down), show the cached data with a visible label: "Showing saved data"
- If there is no cache and the fetch fails, show the error state normally

## Layer 2

Add network status detection with `navigator.onLine` and `window.addEventListener('online'/'offline')` to update the UI when connectivity changes.

## AI Log (`AI-LOG.md`)

- Did you ask AI to write the state handling? How many distinct states did it generate by default?
- Did you have to add the offline cache behavior yourself?

## Deployment

GitHub Pages.

## Autograding

The pipeline will check:
- ✅ `index.html` has content
- ✅ ESLint passes with no errors
- ✅ GitHub Pages responds
- ✅ async/await, 3 UI states, localStorage cache, offline fallback (reviewed by Claude)

> **Submission rule:** If it is not deployed and public, it cannot be graded.
