import React from "react"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"
import { styled } from "@mui/material/styles"

const CustomizedButton = styled(Button)`
    font-size: 1rem;
    font-weight: bold;

    min-width: 3rem;
    border-radius: 14px;
    padding: 16px;

    color: white;
    background-color: #bf5700;

    &:hover {
        background-color: #8f4000;
    }
`

interface QuickActionButtonProps {
    tooltip?: any
    onClick?: () => void
    children?: any
}

const QuickActionButton = ({ tooltip, onClick, children }: QuickActionButtonProps) => {
    return (
        <>
            {tooltip ? (
                <Tooltip title={tooltip} placement="top">
                    <CustomizedButton onClick={onClick}>
                        {children}
                    </CustomizedButton>
                </Tooltip>
            ) : (
                <CustomizedButton onClick={onClick}>
                    {children}
                </CustomizedButton>
            )}
        </>
    )
}

export default QuickActionButton
