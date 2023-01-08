import React from "react"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"

import styles from "./QuickActionButton.module.scss"

interface QuickActionButtonProps {
    tooltip?: any
    onClick?: () => void
    children?: any
}

const QuickActionButton = ({ tooltip, onClick, children }: QuickActionButtonProps) => {
    return (
        <>
            {tooltip ? (
                <Tooltip title={tooltip}>
                    <Button className={styles.button} onClick={onClick}>
                        {children}
                    </Button>
                </Tooltip>
            ) : (
                <Button className={styles.button} onClick={onClick}>
                    {children}
                </Button>
            )}
        </>
    )
}

export default QuickActionButton
