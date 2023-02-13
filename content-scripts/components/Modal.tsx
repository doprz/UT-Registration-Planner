import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Modal from "@mui/material/Modal"
import Typography from "@mui/material/Typography"
import axios from "axios"
import cheerio from "cheerio"
import * as React from "react"

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

const styleElement = document.createElement("style")

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4
}

const BasicModal = () => {
    const [open, setOpen] = React.useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const [course, setCourse] = React.useState<Course | null>(null)
    const [courseName, setCourseName] = React.useState<string>("")
    const [courseDescription, setCourseDescription] = React.useState<string[]>([])

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
    
            console.log(courseUID)
            console.log(name)
            console.log(info)

            setCourseName(name)
            setCourseDescription(info)
            handleOpen()
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
                    handleModal(request.modalCourse)
                } catch (error) {
                    console.warn(error)
                }
            }
        )
    }, [])
    

    return (
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
                            fontWeight={"bold"}>
                            {`${courseName} (${course.uid})`}
                        </Typography>
                        <Typography variant="h6" component="h3">{`${course.instructor} | ${course.status} | ${course.mode}`}</Typography>
                        <Typography variant="h6" component="h3">{`${course.time.regular.days} | ${course.time.regular.hour} | ${course.time.regular.room}`}</Typography>
                        {course?.time?.additional && (<Typography variant="h6" component="h3">{`${course.time.additional.days} | ${course.time.additional.hour} | ${course.time.additional.room}`}</Typography>)}
                        {courseDescription.map((value, index) => {
                            return (
                                <Typography id={`modal-modal-description-${index}`} key={index} sx={{ mt: 2 }} variant="body1" gutterBottom>
                                    {value}
                                </Typography>
                            )
                        })}
                    </>
                )}
            </Box>
        </Modal>
    )
}

export default BasicModal
