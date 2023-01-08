import React, { useState, useEffect } from "react"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import DeleteIcon from "@mui/icons-material/Delete"

import { getStorage, setStorage } from "../utils/chromeStorage"

import styles from "./Header.module.scss"

const ITEM_HEIGHT = 48

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

interface Props {
    courseList: Course[]
    deleteCourseList: () => void
}

const Header = ({ courseList, deleteCourseList }: Props) => {
    const [userCourseList, setUserCourseList] = useState([])
    const [totalCourses, setTotalCourses] = useState(0)
    const [totalHours, setTotalHours] = useState(0)

    const getTotalCreditHours = (arr: Course[]): number => {
        let total = 0
        arr.forEach((c) => {
            total += c.creditHours
        })

        return total
    }

    const deleteUserCourseList = async () => {
        try {
            await setStorage({ userCourseList: [] })
            setUserCourseList([])
            // Update CourseCard transition group
            deleteCourseList()
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        // Set user course list total number of courses and hours on component mount and when userCourseList updates
        const getUserCourseList = async () => {
            try {
                const l_userCourseList = await getStorage("userCourseList")
                setUserCourseList(l_userCourseList)
                // console.log(userCourseList)
            } catch (error) {
                console.error(error)
            }
        }
        getUserCourseList()
        setTotalCourses(userCourseList.length)
        setTotalHours(getTotalCreditHours(userCourseList))
    }, [userCourseList])

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const handleDeleteCourseListClick = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        deleteUserCourseList()
        setAnchorEl(null)
    }

    return (
        <Paper elevation={4} className={styles.container}>
            <div className={styles.textContainer}>
                <h2
                    className={styles.h2}
                >{`Semester Courses: ${totalCourses}`}</h2>
                <h2 className={styles.h2}>{`Hours: ${totalHours}`}</h2>
            </div>
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="long-menu"
                MenuListProps={{
                    "aria-labelledby": "long-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 2,
                        width: "20ch",
                    },
                }}
            >
                <MenuItem
                    onClick={handleDeleteCourseListClick}
                    className={styles.menuItem}
                >
                    <DeleteIcon className={styles.menuItemIcon} />
                    <p>Delete Course List</p>
                </MenuItem>
            </Menu>
        </Paper>
    )
}

export default Header
