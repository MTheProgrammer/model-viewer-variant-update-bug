# Bug in GLTF2.0 model-viewer variant update

## Use case: update model variant and material with dynamic textures.
Example model on [variants in model-viewer page](https://modelviewer.dev/examples/scenegraph/#variants) has textures embedded in gltf.

In `main.js` after variant is changed the active material matching the name pattern (`body_*`) receives update for textures.

Find the following code and compare behavior by commenting and uncommenting mentioned lines:
```js
/** Bug:
 * this line executes asynchronously, active material is not updated on time in findActiveMaterial
 */
modelViewer.variantName = variant;
/** Correct behavior:
 * Promise correctly updates active material assigned to the variant and resolved in the findActiveMaterial.
 */
// await Promise.resolve(() => modelViewer.variantName = variant);
```
