import React from "react"
import Head from "next/head"

import "../styles/globals.css"
import type { AppProps } from "next/app"
// import { ThemeProvider } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { CacheProvider, EmotionCache } from "@emotion/react"
// import theme from '../src/theme';
import createEmotionCache from "../utils/createEmotionCache"

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache
}

function MyApp({ Component, emotionCache = clientSideEmotionCache, pageProps }: MyAppProps) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                },
            }),
        [prefersDarkMode]
    )

    // return <Component {...pageProps} />
    return (
        <ThemeProvider theme={theme}>
            <CacheProvider value={emotionCache}>
                <Head>
                    <title>UT Registration Planner</title>
                    <meta
                        name="viewport"
                        content="initial-scale=1, width=device-width"
                    />
                </Head>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Component {...pageProps} />
            </CacheProvider>
        </ThemeProvider>
    )
}

export default MyApp
