import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import Box from "@mui/material/Box"
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import Typography from "@mui/material/Typography"
import {
    StyledEngineProvider,
    ThemeProvider,
    createTheme
} from "@mui/material/styles"
import type { PlasmoGetRootContainer } from "plasmo"
import React from "react"
import ReactDOM from "react-dom/client"

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

ReactDOM.createRoot(shadowRootElement).render(
    <React.StrictMode>
        <ScopedCssBaseline />
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CSUI />
                {/* <Box sx={{ width: "100%", maxWidth: 500 }}>
                    <Typography variant="h1" gutterBottom>
                        h1. Heading
                    </Typography>
                    <Typography variant="h2" gutterBottom>
                        h2. Heading
                    </Typography>
                    <Typography variant="h3" gutterBottom>
                        h3. Heading
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        h4. Heading
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                        h5. Heading
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        h6. Heading
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        subtitle1. Lorem ipsum dolor sit amet, consectetur
                        adipisicing elit. Quos blanditiis tenetur
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                        subtitle2. Lorem ipsum dolor sit amet, consectetur
                        adipisicing elit. Quos blanditiis tenetur
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        body1. Lorem ipsum dolor sit amet, consectetur
                        adipisicing elit. Quos blanditiis tenetur unde suscipit,
                        quam beatae rerum inventore consectetur, neque
                        doloribus, cupiditate numquam dignissimos laborum fugiat
                        deleniti? Eum quasi quidem quibusdam.
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        body2. Lorem ipsum dolor sit amet, consectetur
                        adipisicing elit. Quos blanditiis tenetur unde suscipit,
                        quam beatae rerum inventore consectetur, neque
                        doloribus, cupiditate numquam dignissimos laborum fugiat
                        deleniti? Eum quasi quidem quibusdam.
                    </Typography>
                    <Typography variant="button" display="block" gutterBottom>
                        button text
                    </Typography>
                    <Typography variant="caption" display="block" gutterBottom>
                        caption text
                    </Typography>
                    <Typography variant="overline" display="block" gutterBottom>
                        overline text
                    </Typography>
                </Box> */}
            </ThemeProvider>
        </CacheProvider>
    </React.StrictMode>
)
