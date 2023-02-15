import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Skeleton from "@mui/material/Skeleton"
import Typography from "@mui/material/Typography"
import Snackbar from '@mui/material/Snackbar'
import Chip from '@mui/material/Chip'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { styled } from "@mui/material/styles"
import axios from "axios"
import cheerio from "cheerio"
import * as React from "react"

import AddIcon from '@mui/icons-material/Add'
import DoneIcon from '@mui/icons-material/Done'
import BlockIcon from '@mui/icons-material/Block'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import QuickActionButton from "./QuickActionButton"

import { getStorage, setStorage, addCourseToStorage, objInArray, courseDateTimeConflictArr, removeCourseFromStorage } from "../utils/chromeStorage"

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
    mode?: string
}

interface SnackbarMessage {
    message: string
    key: number
}

interface State {
    open: boolean
    snackPack: readonly SnackbarMessage[]
    messageInfo?: SnackbarMessage
}

const styleElement = document.createElement("style")

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    outline: "none",
    boxShadow: 24,
    p: 4
}

const CustomizedButtonDiv = styled("div")`
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;

    margin-top: auto;
    padding: 12px 0;
`

const CustomizedChipFlag = styled(Chip)`
    background-color: #fac35b;
    color: black;
    aspect-ratio: 1;
    border-radius: 8px;
    & .MuiChip-label {
        font-size: 1rem;
        font-weight: bold;
        padding: 0;
    }
`
const CustomizedChipCore = styled(Chip)`
    background-color: #005f86;
    color: white;
    aspect-ratio: 1;
    border-radius: 8px;
    & .MuiChip-label {
        font-size: 1rem;
        font-weight: bold;
        padding: 0;
    }
`

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

const CSUI = () => {
    const [open, setOpen] = React.useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const [snackPack, setSnackPack] = React.useState<readonly SnackbarMessage[]>([])
    const [openSnackbar, setOpenSnackbar] = React.useState(false)
    const [messageInfoSnackbar, setMessageInfoSnackbar] = React.useState<SnackbarMessage | undefined>(undefined)
    const [snackbarSeverity_tmp, setSnackbarSeverity_tmp] = React.useState<"error" | "warning" | "info" | "success">(undefined)
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<"error" | "warning" | "info" | "success">(undefined)
    const snackbarSeverityColorMap = new Map<string, string>([
        ["error", "#d32f2f"],
        ["warning", "#f8971f"],
        ["info", "#005f86"],
        ["success", "#579d42"],
    ])

    const [userCourseList, setUserCourseList] = React.useState<Course[]>([])
    const [course, setCourse] = React.useState<Course | null>(null)
    const [courseName, setCourseName] = React.useState<string>("")
    const [courseDescription, setCourseDescription] = React.useState<string[]>([])
    const [courseFlags, setCourseFlags] = React.useState<string[]>([])
    const [courseCore, setCourseCore] = React.useState<string[]>([])

    const handleModal = (course: Course) => {
        setCourse(course)
        console.log(course)
        const courseUID = course.uid
        const url = `https://utdirect.utexas.edu/apps/registrar/course_schedule/20232/${courseUID}/`
    
        axios.get(url).then(({ data }) => {
            const $ = cheerio.load(data)
    
            const name = $("#details h2").text()
            const info = $("#details p")
                .map((_, child) => {
                    return $(child).text()
                })
                .toArray()
                // .join()
    
            // console.log(courseUID)
            // console.log(name)
            // console.log(info)

            setCourseName(name)
            setCourseDescription(info)
            handleOpen()

            const flags = $(".flag").children().map((_, e) => {
                return e.attribs.class
            }).toArray()
            setCourseFlags(flags)

            const core = $(".core").children().map((_, e) => {
                return e.attribs.class
            }).toArray()
            setCourseCore(core)

        })
    }

    React.useEffect(() => {
        console.log("Modal.js loaded")
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                console.log(sender.tab ?
                            "from a content script:" + sender.tab.url :
                            "from the extension")
                console.log(`[cs] ${JSON.stringify(request)}`)

                try {
                    if (request.modalCourse) {
                        handleModal(request.modalCourse)
                    }
                } catch (error) {
                    console.warn(error)
                }
            }
        )

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
    }, [])

    const handleClickSnackbar = (message: string) => {
        setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }])
    }

    const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return
        }
        setOpenSnackbar(false)
    }

    const handleExitedSnackbar = () => {
        setMessageInfoSnackbar(undefined)
    }

    React.useEffect(() => {
        if (snackPack.length && !messageInfoSnackbar) {
            // Set a new snack when we don't have an active one
            setMessageInfoSnackbar({ ...snackPack[0] })
            setSnackPack((prev) => prev.slice(1))
            setSnackbarSeverity(snackbarSeverity_tmp)
            setOpenSnackbar(true)
        } else if (snackPack.length && messageInfoSnackbar && openSnackbar) {
            // Close an active snack when a new one is added
            setOpenSnackbar(false)
        }
    }, [snackPack, messageInfoSnackbar, openSnackbar])

    return (
        <React.Fragment>
            <Snackbar
                key={messageInfoSnackbar ? messageInfoSnackbar.key : undefined}
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                TransitionProps={{ onExited: handleExitedSnackbar }}
                // message={messageInfoSnackbar ? messageInfoSnackbar.message : undefined}
                action={
                    <React.Fragment>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            sx={{ p: 0.5 }}
                            onClick={handleCloseSnackbar}
                        >
                        <CloseIcon />
                        </IconButton>
                    </React.Fragment>
                }
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity || "info"} sx={{ width: '100%', backgroundColor: `${snackbarSeverityColorMap.get(snackbarSeverity || "info")}` }}>
                    <Typography variant="body1">
                        {messageInfoSnackbar ? messageInfoSnackbar.message : undefined}
                    </Typography>
                </Alert>
            </Snackbar>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">
                <Box sx={style}>
                    {course && (
                        <>
                            <Typography
                                id="modal-modal-title"
                                variant="h5"
                                component="h2"
                                fontWeight={"bold"}
                                gutterBottom>
                                {`${courseName} (${course.uid})`}
                            </Typography>
                            <div className="course-info" style={{display: "flex", gap: "1rem"}}>
                                <div className="course-details">
                                    <Typography variant="h6" component="h3">{`${course.instructor} | ${course.status} | ${course.mode}`}</Typography>
                                    <Typography variant="h6" component="h3">{`${course.time.regular.days} | ${course.time.regular.hour} | ${course.time.regular.room}`}</Typography>
                                    {course?.time?.additional && (<Typography variant="h6" component="h3">{`${course.time.additional.days} | ${course.time.additional.hour} | ${course.time.additional.room}`}</Typography>)}
                                </div>
                                <div className="course-flags-core" style={{display: "flex", gap: "1rem"}}>
                                    <div className="course-flags" style={{display: "flex", gap: "0.5rem"}}>
                                        {courseFlags.map((f) => {
                                            return (
                                                <CustomizedChipFlag label={f}/>
                                            )
                                        })}
                                    </div>
                                    <div className="course-core" style={{display: "flex", gap: "0.5rem"}}>
                                        {courseCore.map((c) => {
                                            return (
                                                <CustomizedChipCore label={c}/>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                            <CustomizedButtonDiv>
                                {objInArray(course, userCourseList, "uid") ? (
                                    <QuickActionButton tooltip="Course Added" onClick={() => {
                                        removeCourseFromStorage(course.uid, userCourseList)

                                        handleClickSnackbar("Course Removed")
                                        setSnackbarSeverity_tmp("error")
                                    }}>
                                        <DoneIcon sx={{paddingRight: "16px"}}/>Course Added
                                    </QuickActionButton>
                                ) : (
                                    <>
                                        {courseDateTimeConflictArr(course, userCourseList) ? (
                                            <QuickActionButton tooltip="Course Conflict" onClick={() => {
                                                handleClickSnackbar("Course Conflict")
                                                setSnackbarSeverity_tmp("warning")
                                            }}>
                                                <BlockIcon sx={{paddingRight: "16px"}}/>Course Conflict
                                            </QuickActionButton>
                                            ) : (
                                                <QuickActionButton tooltip="Add Course" onClick={() => {
                                                    addCourseToStorage(course, userCourseList)

                                                    handleClickSnackbar("Course Added")
                                                    setSnackbarSeverity_tmp("success")
                                                }}>
                                                    <AddIcon sx={{paddingRight: "16px"}}/>Add Course
                                                </QuickActionButton>
                                        )}
                                    </>
                                )}
                                <QuickActionButton tooltip="Rate My Professor" onClick={() => {
                                    console.log(`RMP button pressed`)
                                    course.instructor.map((instructor) => {
                                        const instructorString = instructor.replace(/\s/g, '%20')
                                        const url = `https://www.ratemyprofessors.com/search/teachers?query=${instructorString}&sid=U2Nob29sLTEyNTU=`
                                        
                                        let port = chrome.runtime.connect({name: "openURL"})
                                        port.postMessage({url: url})
                                    })
                                }}>RMP</QuickActionButton>
                            </CustomizedButtonDiv>
                            {courseDescription.map((value, index) => {
                                return (
                                    <Typography id={`modal-modal-description-${index}`} key={index} sx={{ mt: 2 }} variant="body1" gutterBottom>
                                        {value}
                                    </Typography>
                                )
                            })}
                            <Skeleton variant="rounded" animation="wave" height={256}/>
                        </>
                    )}
                </Box>
            </Modal>
        </React.Fragment>
    )
}

export default CSUI
