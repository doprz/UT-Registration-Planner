import React from "react"

import QuickActionButton from "./QuickActionButton"
import EventNoteIcon from "@mui/icons-material/EventNote"

import styles from "./NavigationRail.module.scss"

type Props = {}

const NavigationRail = (props: Props) => {
    return (
        <div className={styles.container}>
            <QuickActionButton>
                <EventNoteIcon />
            </QuickActionButton>
        </div>
    )
}

export default NavigationRail
