import React from "react"

import FloatingActionButton from "./FloatingActionButton"
import QuickActionButton from "./QuickActionButton"

import SearchIcon from "@mui/icons-material/Search"
// RIS Icon?
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered"
import SchoolIcon from "@mui/icons-material/School"
import EventNoteIcon from "@mui/icons-material/EventNote"

import styles from "./QuickActionsBar.module.scss"

type Props = {}

const QuickActionsBar = (props: Props) => {
    const openNewTab = (url: string): void => {
        chrome.tabs.create({
            url: url,
        })
    }

    const openOptionsPage = () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage()
        } else {
            window.open(chrome.runtime.getURL("options.html"))
        }
    }

    return (
        <div className={styles.container}>
            <div className="fab">
                <FloatingActionButton
                    tooltip="Search"
                    onClick={() =>
                        openNewTab(
                            "https://utdirect.utexas.edu/apps/registrar/course_schedule/20239"
                        )
                    }
                >
                    <SearchIcon />
                </FloatingActionButton>
            </div>
            <div className="iconButtons">
                <QuickActionButton
                    tooltip="Registration Information Sheet"
                    onClick={() =>
                        openNewTab(
                            "https://utdirect.utexas.edu/registrar/ris.WBX"
                        )
                    }
                >
                    RIS
                </QuickActionButton>

                <QuickActionButton
                    tooltip="Waitlist"
                    onClick={() =>
                        openNewTab(
                            "https://utdirect.utexas.edu/registrar/waitlist/wl_see_my_waitlists.WBX"
                        )
                    }
                >
                    <FormatListNumberedIcon />
                </QuickActionButton>

                <QuickActionButton
                    tooltip="Degree Audit"
                    onClick={() =>
                        openNewTab(
                            "https://utdirect.utexas.edu/apps/degree/audits/"
                        )
                    }
                >
                    <SchoolIcon />
                </QuickActionButton>

                <QuickActionButton
                    tooltip="Course List Calendar"
                    onClick={openOptionsPage}
                >
                    <EventNoteIcon />
                </QuickActionButton>
            </div>
        </div>
    )
}

export default QuickActionsBar
