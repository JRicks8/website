import themeManager from "../theme-manager.js";

let openMenu = document.getElementById('sidebarMenuMain');
let pickerOpen = true;
export function onSidebarPickerClick() {
  const pickerIcon = document.getElementById('sidebarPickerIcon');
  pickerIcon.classList.toggle('picker-icon-closed');

  openMenu.classList.toggle('open');
  openMenu = document.getElementById('sidebarMenuMain');

  pickerOpen = !pickerOpen;
}

export function onSidebarMenuOptionClick(option) {
  const newMenu = document.getElementById(option);
  if (newMenu) {
    openMenu.classList.toggle('open');
    openMenu = newMenu;
    openMenu.classList.toggle('open');
  }
}

export function onSelectTheme(theme) {
  themeManager.setTheme(theme);
}