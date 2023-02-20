import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
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

const RenderWrapper = () => {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                    ...(prefersDarkMode && {
                        background: {
                            default: "#222A30",
                            paper: "#222A30"
                        },
                        text: {
                            primary: "#F7F6F3",
                            secondary: "#D6D2C4"
                        }
                    })
                },
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
            }),
        [prefersDarkMode]
    )

    return (
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

export const render: PlasmoRender = () => {
    const root = ReactDOM.createRoot(shadowRootElement)
    root.render(<RenderWrapper />)
}
