# Eddy
A flow field made of light: thousands of particles drifting through an evolving vector field, drawn on a 2D canvas. No build step, no dependencies.

## Controls
- Drag: stirs the particles
- Click / tap: drops a vortex that slowly fades
- Reseed: new flow field
- Palette: cycles three colour schemes
- Save PNG: exports the canvas

## Tweak it
- `angle()` in `main.js` defines the flow. Change the `.0026` scale for tighter or looser swirls.
- Edit the `PALS` array to add your own palettes.
- Raise the `3200` particle cap for denser trails (costs performance).
