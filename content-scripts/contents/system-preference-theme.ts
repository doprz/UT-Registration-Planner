export {}

console.log("system-preference-theme.js loaded")
const darkModeCSS = document.createElement("link")
darkModeCSS.rel = "stylesheet"
darkModeCSS.type = "text/css"
darkModeCSS.href = chrome.runtime.getURL("content/assets/dark-mode.css")
document.head.appendChild(darkModeCSS)