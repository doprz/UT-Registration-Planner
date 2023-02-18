import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline"
import {
    StyledEngineProvider,
    ThemeProvider,
    createTheme
} from "@mui/material/styles"
import type { PlasmoRender } from "plasmo"
import * as React from "react"
import * as ReactDOM from "react-dom/client"

import CSUI from "../components/CSUI"

export const getRootContainer = () =>
    document.getElementById("utrp-content-root")

const container = document.createElement("div")
container.id = "utrp-content-root"
const shadowContainer = container.attachShadow({ mode: "open" })
const emotionRoot = document.createElement("style")
const shadowRootElement = document.createElement("div")
shadowRootElement.id = "root"
document.body.append(container)
shadowContainer.appendChild(emotionRoot)
shadowContainer.appendChild(shadowRootElement)

const cache = createCache({
    key: "css",
    prepend: true,
    container: emotionRoot
})

const theme = createTheme({
    components: {
        MuiPopover: {
            defaultProps: {
                container: shadowRootElement
            }
        },
        MuiPopper: {
            defaultProps: {
                container: shadowRootElement
            }
        },
        MuiModal: {
            defaultProps: {
                container: shadowRootElement
            }
        }
    }
})

export const render: PlasmoRender = () => {
    const root = ReactDOM.createRoot(shadowRootElement)
    root.render(
        <React.StrictMode>
            <ScopedCssBaseline />
            <CacheProvider value={cache}>
                <ThemeProvider theme={theme}>
                    <CSUI />
                </ThemeProvider>
            </CacheProvider>
        </React.StrictMode>
    )
}
