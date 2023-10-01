# Colorpad

**Simple color picker Chrome Extension**
<!-- <img src="docs/chrome_48x48.png"> -->

Colors are stored in Local storage.

<img src="docs/blank.png">

## Installation

1. In Chrome browser enable "Developer mode" in "More tools" > "Extensions" by toggling the switch on the top right corner of the page. 
2. Click on "Load unpacked" button.
3. Select the folder containing this extension and click on "Select Folder".

## Color picker
EyeDropper API is used to pick a color.

<img src="docs/pick_1.png">

## Copy to clipboard
Individual color code or batch export as Array or Object to clipboard.

<img src="docs/dropdown.png">


```javascript
[
  "#ffffff",
  "#1f2328",
  "#56adfd",
  "#563d7b",
  "#f1e062",
  ...
]
```
```javascript
{
  "1f2328": "#1f2328",
  "56adfd": "#56adfd",
  "563d7b": "#563d7b",
  "f1e062": "#f1e062",
  ...
}
```
## Clear all
Remove all colors colors

<img src="docs/remove.png">
