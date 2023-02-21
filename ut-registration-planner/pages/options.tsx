import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"

import React, { useState, useEffect } from "react"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles"
import NavigationRail from "../components/NavigationRail"

import styles from "../styles/options.module.scss"
import { styled } from '@mui/material/styles'

import { getStorage, setStorage } from "../utils/chromeStorage"

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

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const timeRange_old = [
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
    "10:30 PM",
]

const timeRange = [
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
    "10 PM",
]

const courseColors = [
    ["#f8971f80", "#f8971f"],
    ["#ffd60080", "#ffd600"],
    ["#a6cd5780", "#a6cd57"],
    ["#00a9b780", "#00a9b7"],
    ["#005f8680", "#005f86"],
    ["#579d4280", "#579d42"],

    ["#9cadb780", "#9cadb7"],
    ["#d6d2c480", "#d6d2c4"],
    ["#333f4880", "#333f48"],
]
const courseColors_dark = [
    ["#f8971f40", "#f8971fbf"],
    ["#ffd60040", "#ffd600bf"],
    ["#a6cd5740", "#a6cd57bf"],
    ["#00a9b740", "#00a9b7bf"],
    ["#005f8640", "#005f86bf"],
    ["#579d4240", "#579d42bf"],

    ["#9cadb740", "#9cadb7bf"],
    ["#d6d2c440", "#d6d2c4bf"],
    ["#333f4840", "#333f48bf"],
]

const CourseCardEvent = styled("div", {
    shouldForwardProp: (prop) => prop !== "gridArea" && prop !== "colorIndex",
})<{ gridArea: string; colorIndex: number }>(({ gridArea, colorIndex, theme }) => ({
    gridArea: gridArea,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    zIndex: 2,
    overflowY: "hidden",
    padding: "0.25rem",
    marginBottom: "2px",
    marginRight: "2px",
    // backgroundColor: courseColors[colorIndex % courseColors.length][0],
    // borderLeft: `5px solid ${courseColors[colorIndex % courseColors.length][1]}`,
    backgroundColor: theme.palette.mode === "light" ? courseColors[colorIndex % courseColors.length][0] : courseColors_dark[colorIndex % courseColors.length][0],
    borderLeft: `5px solid ${theme.palette.mode === "light" ? courseColors[colorIndex % courseColors.length][1] : courseColors_dark[colorIndex % courseColors.length][1]}`,
    // backgroundColor: "hsla(195, 53%, 79%, 75%)",
    // borderLeft: "5px solid hsl(195, 53%, 39%)",
    borderRadius: "5px",
    p: {
        "&:first-child": {
            fontWeight: "bold",
        },
        margin: "0",
    },
}))

// Convert Date Time to 0-48 interval value
const convertDTTo48HI = (dt_obj: {timeOfDay: string, time: string}): number => {

    let hour = dt_obj.time.split(/:/)[0]
    let minute = dt_obj.time.split(/:/)[1]

    let val = 0

    if (dt_obj.timeOfDay === "a.m.") {
        // 12 am edge-case
        if (hour === "12") {
            val = 0
            val += (Number(minute) == 30) ? 1 : 0
        } else {
            val = Number(hour) * 2
            val += (Number(minute) == 30) ? 1 : 0
        }
    } else if (dt_obj.timeOfDay === "p.m.") {
        val = ((Number(hour) % 12) + 12) * 2
        val += (Number(minute) == 30) ? 1 : 0
    } else {
        // Catch errors
        console.error("Error in converting DT to 48 hour inverval.")
    }

    return val
}

// Parse Date Time
const parseDT = (text: string): number[] | null => {
    if (!text || (text == "n/a")) {
        return null
    }

    let l_text = text.toString()
    const t1 = l_text.split(/-/)[0]
    const t2 = l_text.split(/-/)[1]

    const t1_attr = {
        timeOfDay: t1.match(/([AaPp].[Mm].)/)![0],
        time: t1.replace(/\s([AaPp].[Mm].)/, "")
    }

    const t2_attr = {
        timeOfDay: t2.match(/([AaPp].[Mm].)/)![0],
        time: t2.replace(/\s([AaPp].[Mm].)/, "")
    }

    let start = convertDTTo48HI(t1_attr)
    let end = convertDTTo48HI(t2_attr)

    return [start, end]
}

const getCourseBuilding = (text: string): string => {
    return (text && (text !== "n/a")) ? (text.match(/[^\s]+/)![0] ?? "n/a") : "n/a"
}

const buildCourseLocationLink = (building: string): string => {
    return `https://utdirect.utexas.edu/apps/campus/buildings/nlogon/maps/UTM/${building}/`
}

const openNewTab = (url: string): void => {
    chrome.tabs.create({
        url: url,
    })
}

const renderCourseCardEvent = (course: Course, colorIndex: number) => {
    let courseDateTimeObj: CourseDateTimeObj = course.time
    let courseCardEvents: any = []

    let dt_obj1 = {
        days_regular: courseDateTimeObj?.regular?.days.match(/M|T(?!H)|W|(TH)|F/g) ?? null,
        time_regular: parseDT(courseDateTimeObj?.regular?.hour ?? 'n/a') ?? null,
        days_additional: courseDateTimeObj?.additional?.days.match(/M|T(?!H)|W|(TH)|F/g) ?? null,
        time_additional: parseDT(courseDateTimeObj?.additional?.hour ?? 'n/a') ?? null
    }
    
    if (dt_obj1?.days_regular) {
        dt_obj1.days_regular.map((day, index) => {
            let rowStart = dt_obj1.time_regular![0] - 12
            let rowEnd = dt_obj1.time_regular![1] - 12
            let dayIndex = ["M", "T", "W", "TH", "F"].indexOf(day) + 2

            let courseBuilding = getCourseBuilding(course.time.regular.room)
            let courseLocationLink = (courseBuilding && (courseBuilding !== "n/a")) ? buildCourseLocationLink(courseBuilding) : "n/a"

            courseCardEvents.push(
                <CourseCardEvent gridArea={`${rowStart} / ${dayIndex} / ${rowEnd} / ${dayIndex}`} key={`CourseCardEvent-${course.uid}-${index}`} colorIndex={colorIndex}>
                    <p>{course.time.regular.hour}</p>
                    <p>{`${course.name} - ${course.uid}${(courseLocationLink && (courseLocationLink !== "n/a")) ? " - " : ""}`}
                        {(courseLocationLink && (courseLocationLink !== "n/a")) && <a className={styles.courseLocationLink} onClick={() => openNewTab(courseLocationLink)}>{`${course.time.regular.room}`}</a>}
                    </p>
                    <p>{course.instructor}</p>
                </CourseCardEvent>
            )
        })
    }

    if (dt_obj1?.days_additional) {
        dt_obj1.days_additional.map((day, index) => {
            let rowStart = dt_obj1.time_additional![0] - 12
            let rowEnd = dt_obj1.time_additional![1] - 12
            let dayIndex = ["M", "T", "W", "TH", "F"].indexOf(day) + 2

            let courseBuilding = getCourseBuilding(course.time.additional?.room!)
            let courseLocationLink = (courseBuilding && (courseBuilding !== "n/a")) ? buildCourseLocationLink(courseBuilding) : "n/a"

            courseCardEvents.push(
                <CourseCardEvent gridArea={`${rowStart} / ${dayIndex} / ${rowEnd} / ${dayIndex}`} key={`CourseCardEvent-${course.uid}-${index}`} colorIndex={colorIndex}>
                    <p>{course.time.additional?.hour}</p>
                    <p>{`${course.name} - ${course.uid}${(courseLocationLink && (courseLocationLink !== "n/a")) ? " - " : ""}`}
                        {(courseLocationLink && (courseLocationLink !== "n/a")) && <a className={styles.courseLocationLink} onClick={() => openNewTab(courseLocationLink)}>{`${course.time.additional?.room}`}</a>}
                    </p>
                    <p>{course.instructor}</p>
                </CourseCardEvent>
            )
        })
    }

    return courseCardEvents
}

const Options: NextPage = () => {
    const [userCourseList, setUserCourseList] = useState<Course[]>([])

    useEffect(() => {
        const getUserCourseList = async () => {
            try {
                const l_userCourseList: Course[] = await getStorage(
                    "userCourseList"
                )
                setUserCourseList(l_userCourseList)
                // console.log(userCourseList)
            } catch (error) {
                console.error(error)
            }
        }
        getUserCourseList()

        chrome.storage.onChanged.addListener((changes) => {
            // console.log(changes)
            getUserCourseList()
        })

        // When userCourseList is put in the [], it causes this component to re-render infinitely
        // console.log("useEffect, []")
    }, [])

    return (
        <div className={styles.container}>
            <NavigationRail />
            <div className={styles.calendarContainer}>
                <div data-row={1} data-col={1}></div>
                {weekDays.map((weekday, index) => {
                    return <div key={weekday} data-type="weekdays" data-row={1} data-col={index+2}>{weekday}</div>
                })}


                {[...Array(32)].map((_, i) => {
                    return (
                        <React.Fragment key={i}>
                            {[...Array(6)].map((_, j) => {
                                // Grid "array" starts at (1, 1)
                                let dataRow = i+2
                                let dataCol = j+1

                                if (dataCol == 1) {
                                    return <div key={`${i}_${j}`} data-row={dataRow} data-col={dataCol} data-30min={(i%2 == 0) ? "false" : "true"}>{(i%2 == 0) ? timeRange[Number(i/2)] : ""}</div>
                                    // return <div key={`${i}_${j}`} data-row={dataRow} data-col={dataCol}>{(i%2 == 0) ? timeRange[i] : ""}</div>
                                } else {
                                    return <div key={`${i}_${j}`} data-row={dataRow} data-col={dataCol} data-30min={(i%2 == 0) ? "false" : "true"}></div>
                                    // return <div key={`${i}_${j}`} data-row={dataRow} data-col={dataCol}>{`${dataRow}_${dataCol}`}</div>
                                }

                            })}
                        </React.Fragment>
                    )
                })}

                <>
                    {userCourseList.map((course, index) => {
                        return (
                            renderCourseCardEvent(course, index)
                        )
                    })}
                </>
            </div>
        </div>
    )
}

export default Options