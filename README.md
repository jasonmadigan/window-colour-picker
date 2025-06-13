# Window Colour Picker

Manually set custom colours for individual Firefox windows to help organise your workspace.

Based on the original [Colorful Window Theme](https://github.com/DaveDuck321/Colorful-window-theme) by DaveDuck321.

## Features

- **Manual Colour Selection**: Click the extension icon to pick specific colours for each window
- **No Automatic Colours**: Windows stay with Firefox's default theme unless you explicitly set a colour
- **Current Window Auto-Selection**: The window you're using is automatically selected when opening the picker
- **Preset Colours**: Quick access to 7 carefully chosen pastel colours
- **Custom HEX Colours**: Enter any HEX colour code for complete customisation
- **Visual Window Identification**: See all open windows with titles and tab counts, with "This window" indicator
- **Persistent Preferences**: Your colour choices are saved and restored when you restart Firefox
- **Individual Window Control**: Remove colour from specific windows or reset all at once

## How to Use

1. Click the extension icon in any window
2. The current window is automatically selected (or click another window from the list)
3. Choose a colour:
   - Click a preset colour button for quick selection
   - Enter a HEX code (e.g., `#ff6b6b`) and press Enter or click Apply
4. To remove a colour from the selected window, click "Remove Colour"
5. To reset all windows to default, click "Reset All Windows"

## Interface

- **Window List**: Shows all open Firefox windows with their active tab title and tab count
- **This Window Indicator**: The window where you opened the popup is clearly marked
- **Selection Highlight**: Selected window is highlighted in blue
- **Colour Preview**: See your custom colour before applying it

## Example Use Cases

- Colour code windows by project or task
- Distinguish between work and personal browsing
- Organise research windows by topic
- Create visual separation for different contexts

![Screenshot of window colour picker](/screenshots/screenshot.png)

## Permissions

- `tabs`: To identify and manage different windows
- `theme`: To apply colours to windows
- `storage`: To save your colour preferences

## Technical Details

- Uses Firefox's Theme API to apply colours to window frames
- Colours persist across browser sessions
- No automatic colour assignment - full manual control
- Lightweight and efficient

## Original Project

This extension builds upon the brilliant work of the original [Colorful Window Theme](https://github.com/DaveDuck321/Colorful-window-theme).
