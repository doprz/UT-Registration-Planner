import React, { useState, useEffect } from "react"
import Paper from "@mui/material/Paper"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DoneIcon from "@mui/icons-material/Done"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DeleteIcon from "@mui/icons-material/Delete"
import Collapse from "@mui/material/Collapse"

import { getStorage, setStorage } from "../utils/chromeStorage"

import styles from "./CourseCard.module.scss"

interface CourseDateTimeObj {
    regular: {
        days: string
        hour: string
        room: string
    }
    additional?: {
        days: string
        hour: string
        room: string
    }
}

interface Course {
    name: string
    fullName: string
    creditHours: number
    instructor: string[]
    uid: number
    status: string
    time: CourseDateTimeObj
}

interface CourseCardProps {
    course: Course
    removeCourse: (c_uid: Number) => void
}

const truncate = (str: string, n: number): string => {
    return str.length > n ? str.substring(0, n - 1) + "..." : str
}

const CourseCard = ({ course, removeCourse }: CourseCardProps) => {
    const [instructorsText, setInstructorsText] = useState<string>("")
    const [courseCardExpanded, setCourseCardExpanded] = useState<boolean>(false)

    const [contentCopyIconActive, setContentCopyIconActive] = useState<boolean>(true)

    useEffect(() => {
        if (course.instructor.length > 1) {
            setInstructorsText(
                `${course.instructor[0]} and ${course.instructor[1]}`
            )
        } else if (course.instructor.length == 1) {
            setInstructorsText(course.instructor[0])
        }
    }, [course])

    const handleCourseCardOnClick = () => {
        setCourseCardExpanded(!courseCardExpanded)
    }

    const deleteCourse = async () => {
        removeCourse(course.uid)
        try {
            let l_userCourseList = await getStorage("userCourseList")
            let n_userCourseList = l_userCourseList.filter((c: Course) => {
                return c.uid !== course.uid
            })

            try {
                await setStorage({ userCourseList: n_userCourseList })
                // console.log("ran deleteCourse()")
                // setCourseCardExpanded(false)
            } catch (error) {
                console.error(error)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleContentCopyIconClick = () => {
        setContentCopyIconActive(false)

        if (!navigator.clipboard) {
            console.error("Could not copy text to clipboard.")
            return
        }

        navigator.clipboard.writeText(String(course.uid)).then(
            function () {
                // console.log("Async: Copying to clipboard was successful!")
            },
            function (err) {
                console.error("Async: Could not copy text: ", err)
            }
        )

        setTimeout(() => {
            setContentCopyIconActive(true)
        }, 1000)
    }

    return (
        <Paper elevation={4} className={styles.container}>
            <div className={styles.summaryViewContainer}>
                {contentCopyIconActive ? (
                    <ContentCopyIcon className={styles.contentCopyIcon} onClick={handleContentCopyIconClick}/>
                ) : (
                    <DoneIcon className={styles.contentCopyIcon} />
                )}
                <div className={styles.textContainer}>
                    <h2 className={styles.h2}>
                        {truncate(course.name + " - " + instructorsText, 25)}
                    </h2>
                    <p className={styles.p}>{course.uid}</p>
                </div>
                <ExpandMoreIcon
                    className={
                        courseCardExpanded
                            ? styles.expandMoreIconExpanded
                            : styles.expandMoreIconCollapsed
                    }
                    onClick={handleCourseCardOnClick}
                />
            </div>

            <Collapse in={courseCardExpanded}>
                <div className={styles.expandedViewContainer}>
                    <DeleteIcon
                        className={styles.deleteIcon}
                        onClick={deleteCourse}
                    />
                    <div className={styles.textContainer}>
                        <p className={styles.p}>{course.status}</p>
                        <p
                            className={styles.p}
                        >{`${course.time.regular.days} | ${course.time.regular.hour} | ${course.time.regular.room}`}</p>
                        {course?.time?.additional && (<p className={styles.p}>{`${course.time.additional.days} | ${course.time.additional.hour} | ${course.time.additional.room}`}</p>)}
                        {/* <p className={styles.p}>{`${course.time.regular.days} | ${course.time.regular.hour} | ${course.time.regular.room}`}</p> */}
                    </div>
                </div>
            </Collapse>
        </Paper>
    )
}

export default CourseCard
