import React from "react"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"

import styles from "./FloatingActionButton.module.scss"

interface Props {
    tooltip: any
    onClick?: () => void
    children?: any
}

const FloatingActionButton = ({ tooltip, onClick, children }: Props) => {
    return (
        <Tooltip title={tooltip}>
            <Button className={styles.button} onClick={onClick}>
                {children}
            </Button>
        </Tooltip>
    )
}

export default FloatingActionButton
