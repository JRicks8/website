const PRIMARY = '--primary-color';
const SECONDARY = '--secondary-color';
const SECONDARY_LIGHT = '--secondary-light-color';
const BORDERS = '--border-color';
const TEXT = '--text-color';

const whiteTheme = {};
Object.defineProperty(whiteTheme, PRIMARY, { value: '#ffffff', enumerable: true });
Object.defineProperty(whiteTheme, SECONDARY, { value: '#9c9c9c', enumerable: true });
Object.defineProperty(whiteTheme, SECONDARY_LIGHT, { value: '#d4d4d4', enumerable: true });
Object.defineProperty(whiteTheme, BORDERS, { value: '#000000', enumerable: true });
Object.defineProperty(whiteTheme, TEXT, { value: '#000000', enumerable: true });

const solarTheme = {};
Object.defineProperty(solarTheme, PRIMARY, { value: '#fdf6e3', enumerable: true });
Object.defineProperty(solarTheme, SECONDARY, { value: '#ccc7b8', enumerable: true });
Object.defineProperty(solarTheme, SECONDARY_LIGHT, { value: '#eee8d5', enumerable: true });
Object.defineProperty(solarTheme, BORDERS, { value: '#584c27', enumerable: true });
Object.defineProperty(solarTheme, TEXT, { value: '#985552', enumerable: true });

const themes = {
  white: whiteTheme,
  solar: solarTheme
};

export default {
  setTheme: (themeName) => {
    const theme = themes[themeName];
    for (const entry of Object.entries(theme)) {
      document.documentElement.style.setProperty(entry[0], theme[entry[0]]);
    }
  }
};