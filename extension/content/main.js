// Reads all data out of storage.sync and exposes it via a promise.
//
// Note: Once the Storage API gains promise support, this function
// can be greatly simplified.
const getStorage = async (key) => {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
        // Asynchronously fetch all data from storage.sync.
        chrome.storage.sync.get([key], (data) => {
            // Pass any observed errors down the promise chain.
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError)
            }
            // Pass the data retrieved from storage down the promise chain.
            resolve(data[key])
        })
    })
}

// kv = {key: value}
const setStorage = async (kv) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(kv, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError)
            }

            resolve(kv)
        })
    })
}


// Example courseListArray
// let courseListArray = [
//     {
//         uid: 52365,
//         name: "C S 105C",
//         fullName: "C S 105C COMPUTER PROGRAMMING: C++",
//         time: {
//             regular: {
//                 days: 'W', 
//                 hour: '10:00 a.m.-11:00 a.m.', 
//                 room: 'WAG 214'
//             }
//         },
//         mode: "Face-to-Face",
//         instructor: ["PALACIOS, JOAQUIN M"],
//         status: "open; reserved",
//     }
// ]

let courseListArray = []

const objInArray = (obj, arr, property) => {
    const result = arr.some((element) => {
        if (element[property] === obj[property]) {
            return true
        }

        return false
    })

    return result
}

const courseDateTimeConflictArr = (course, arr) => {
    let c1 = course
    let c1_timeObj = c1.time
    for (let c2 of arr) {
        let c2_timeObj = c2.time

        if (courseDateTimeConflict(c1_timeObj, c2_timeObj)) {
            // Add error message of a course date/time conflict
            console.warn(`[Date/Time Course Conflict Error]: Couldn't add course with uid: ${c1.uid}.`)
            return true
        } else {
            continue
        }
    }

    // If no course conflicts found between the course and course list (arr), return false
    return false
}

const addCourseToStorage = async (course) => {
    if (objInArray(course, courseListArray, "uid")) {
        // console.log(`[${course.uid}]${course.name} already in your course list.`)
        console.warn(`[Course List Error]: The course with uid: ${course.uid} (${course.name}) is already in your course list.`)
        return
    }

    if (courseDateTimeConflictArr(course, courseListArray)) {
        return
    }

    courseListArray.push(course)
    try {
        await setStorage({ userCourseList: courseListArray })
    } catch (error) {
        console.error(error)
    }

}

const getCourseText = (row, className) => {
    let element = $(row).find(className).text()
    let info = $.trim(element)

    if (info === "") {
        return "n/a"
    } else {
        return info
    }
}

const separateCourseFullText = (text) => {
    let courseFullName = text
    let courseSubject = text.match(/.+?\d{3}[^ ]?/)
    let courseName = text - courseSubject
    let courseCreditHours = Number(courseSubject[0].match(/[0-9]/))

    return {
        name: courseSubject[0],
        fullName: courseFullName,
        creditHours: courseCreditHours
    }
}

// Convert Date Time to 0-48 interval value
const convertDTTo48HI = (dt_obj) => {

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
const parseDT = (text) => {
    if (!text || (text == "n/a")) {
        return null
    }

    let l_text = text.toString()
    const t1 = l_text.split(/-/)[0]
    const t2 = l_text.split(/-/)[1]

    const t1_attr = {
        timeOfDay: t1.match(/([AaPp].[Mm].)/)[0],
        time: t1.replace(/\s([AaPp].[Mm].)/, "")
    }

    const t2_attr = {
        timeOfDay: t2.match(/([AaPp].[Mm].)/)[0],
        time: t2.replace(/\s([AaPp].[Mm].)/, "")
    }

    let start = convertDTTo48HI(t1_attr)
    let end = convertDTTo48HI(t2_attr)

    return [start, end]
}

const courseDateTimeConflict = (obj1, obj2) => {
    let dt_obj1 = {
        days_regular: obj1?.regular?.days.match(/M|T(?!H)|W|(TH)|F/g) ?? null,
        time_regular: parseDT(obj1?.regular?.hour) ?? null,
        days_additional: obj1?.additional?.days.match(/M|T(?!H)|W|(TH)|F/g) ?? null,
        time_additional: parseDT(obj1?.additional?.hour) ?? null
    }

    let dt_obj2 = {
        days_regular: obj2?.regular?.days.match(/M|T(?!H)|W|(TH)|F/g) ?? null,
        time_regular: parseDT(obj2?.regular?.hour) ?? null,
        days_additional: obj2?.additional?.days.match(/M|T(?!H)|W|(TH)|F/g) ?? null,
        time_additional: parseDT(obj2?.additional?.hour) ?? null
    }

    // Check for conflicts 
    // dt_obj1 regular vs dt_obj2 regular
    if (dt_obj1?.days_regular && dt_obj2?.days_regular) {
        for (let d1 of dt_obj1.days_regular) {
            for (let d2 of dt_obj2.days_regular) {
                if (d1 !== d2) {
                    continue
                } else {
                    let a = dt_obj1.time_regular[0]
                    let b = dt_obj1.time_regular[1]
                    let c = dt_obj2.time_regular[0]
                    let d = dt_obj2.time_regular[1]
                    // console.log(`d1[${a},${b}] d2[${c},${d}]`)

                    if ((b > c) && (d > a)) {
                        return true
                    }

                }
            }
        }
    }

    // dt_obj1 additional vs dt_obj2 additional
    if (dt_obj1?.days_additional && dt_obj2?.days_additional) {
        for (let d1 of dt_obj1.days_additional) {
            for (let d2 of dt_obj2.days_additional) {
                if (d1 !== d2) {
                    continue
                } else {
                    let a = dt_obj1.time_additional[0]
                    let b = dt_obj1.time_additional[1]
                    let c = dt_obj2.time_additional[0]
                    let d = dt_obj2.time_additional[1]
                    // console.log(`d1[${a},${b}] d2[${c},${d}]`)

                    if ((b > c) && (d > a)) {
                        return true
                    }

                }
            }
        }
    }

    // dt_obj1 regular vs dt_obj2 additional
    if (dt_obj1?.days_regular && dt_obj2?.days_additional) {
        for (let d1 of dt_obj1.days_regular) {
            for (let d2 of dt_obj2.days_additional) {
                if (d1 !== d2) {
                    continue
                } else {
                    let a = dt_obj1.time_regular[0]
                    let b = dt_obj1.time_regular[1]
                    let c = dt_obj2.time_additional[0]
                    let d = dt_obj2.time_additional[1]
                    // console.log(`d1[${a},${b}] d2[${c},${d}]`)

                    if ((b > c) && (d > a)) {
                        return true
                    }

                }
            }
        }
    }

    // dt_obj1 additional vs dt_obj2 regular
    if (dt_obj1?.days_additional && dt_obj2?.days_regular) {
        for (let d1 of dt_obj1.days_additional) {
            for (let d2 of dt_obj2.days_regular) {
                if (d1 !== d2) {
                    continue
                } else {
                    let a = dt_obj1.time_additional[0]
                    let b = dt_obj1.time_additional[1]
                    let c = dt_obj2.time_regular[0]
                    let d = dt_obj2.time_regular[1]
                    // console.log(`d1[${a},${b}] d2[${c},${d}]`)

                    if ((b > c) && (d > a)) {
                        return true
                    }

                }
            }
        }
    }

    // If no course conflicts were found, return false
    return false
}

const buildCourseTimeObject = (row) => {

    let time_obj = {}
    const multipleDates = $(row).find("td[data-th='Days']").children().length > 2

    if (multipleDates) {
        time_obj = {
            regular: {
                days: getCourseText(row, "td[data-th='Days'] span:first-child"),
                hour: getCourseText(row, "td[data-th='Hour'] span:first-child"),
                room: getCourseText(row, "td[data-th='Room'] span:first-child")
            },
            additional: {
                days: getCourseText(row, "td[data-th='Days'] span.second-row"),
                hour: getCourseText(row, "td[data-th='Hour'] span.second-row"),
                room: getCourseText(row, "td[data-th='Room'] span.second-row")
            }
        }
    } else {
        time_obj = {
            regular: {
                days: getCourseText(row, "td[data-th='Days'] span:first-child"),
                hour: getCourseText(row, "td[data-th='Hour'] span:first-child"),
                room: getCourseText(row, "td[data-th='Room'] span:first-child")
            }
        }
    }

    return time_obj
}

const buildCourseInstructorsArray = (row) => {
    let instructors = []

    const multipleInstructors = $(row).find("td[data-th='Instructor']").children().length > 2

    instructors.push(getCourseText(row, "td[data-th='Instructor'] span:first-child"))
    if (multipleInstructors) {
        instructors.push(getCourseText(row, "td[data-th='Instructor'] span.second-row"))
    }

    return instructors
}

const parseCourseInfo = (row) => {

    courseNameRow = $(row).prevAll().find(".course_header h2").last()

    // Replace double space in name bug with single space
    courseFullName = courseNameRow.text().replace(/\s\s/, " ")
    // console.log(courseFullName)

    let {
        name,
        fullName,
        creditHours
    } = separateCourseFullText(courseFullName)

    let course = {
        uid: getCourseText(row, "td[data-th='Unique']"),
        name: name,
        fullName: fullName,
        creditHours: creditHours,
        time: buildCourseTimeObject(row),
        mode: getCourseText(row, "td[data-th='Instruction Mode']"),
        instructor: buildCourseInstructorsArray(row),
        status: getCourseText(row, "td[data-th='Status']"),
    }

    // addCourseToStorage(course)
    // console.log(course)
    return course
}

const buildCourseObject = (row) => {
    courseNameRow = $(row).prevAll().find(".course_header h2").last()

    // Replace double space in name bug with single space
    courseFullName = courseNameRow.text().replace(/\s\s/, " ")
    // console.log(courseFullName)

    let {
        name,
        fullName,
        creditHours
    } = separateCourseFullText(courseFullName)

    let course = {
        uid: Number(getCourseText(row, "td[data-th='Unique']")),
        name: name,
        fullName: fullName,
        creditHours: creditHours,
        time: buildCourseTimeObject(row),
        mode: getCourseText(row, "td[data-th='Instruction Mode']"),
        instructor: buildCourseInstructorsArray(row),
        status: getCourseText(row, "td[data-th='Status']"),
    }

    return course
}

const clearHighlightCourseConflicts = (row) => {
    row.find("td[data-th='Days']").css("color", "#333")
    row.find("td[data-th='Hour']").css("color", "#333")
    row.find("td[data-th='Room']").css("color", "#333")
    row.find("td[data-th='Instruction Mode']").css("color", "#333")
    row.find("td[data-th='Instructor']").css("color", "#333")
    row.find("td[data-th='Status']").css("color", "#333")
    row.find("td[data-th='Core']").css("color", "#333")
}

const highlightCourseConflicts = (row) => {
    let c1 = buildCourseObject(row)
    let c1_timeObj = c1.time

    for (let course of courseListArray) {
        let c2 = course
        let c2_timeObj = c2.time

        if (c2.uid == c1.uid) {
            row.find("td[data-th='Days']").css("cssText", "color: green !important")
            row.find("td[data-th='Hour']").css("cssText", "color: green !important")
            row.find("td[data-th='Room']").css("cssText", "color: green !important")
            row.find("td[data-th='Instruction Mode']").css("cssText", "color: green !important")
            row.find("td[data-th='Instructor']").css("cssText", "color: green !important")
            row.find("td[data-th='Status']").css("cssText", "color: green !important")
            row.find("td[data-th='Core']").css("cssText", "color: green !important")
            continue
        }

        // Get every course on the screen
        if (courseDateTimeConflict(c1_timeObj, c2_timeObj)) {
            row.find("td[data-th='Days']").css("cssText", "color: red !important")
            row.find("td[data-th='Hour']").css("cssText", "color: red !important")
            row.find("td[data-th='Room']").css("cssText", "color: red !important")
            row.find("td[data-th='Instruction Mode']").css("cssText", "color: red !important")
            row.find("td[data-th='Instructor']").css("cssText", "color: red !important")
            row.find("td[data-th='Status']").css("cssText", "color: red !important")
            row.find("td[data-th='Core']").css("cssText", "color: red !important")
            // console.warn(`Course Conflict between: \n[${c1.uid}] ${c1_timeObj.regular.hour} and \n[${c2.uid}] ${c2_timeObj.regular.hour}`)
        } else {
            // console.log(`[${c1.uid}] ${c1_timeObj.regular.hour}`)
            // console.log(`[${c2.uid}] ${c2_timeObj.regular.hour}`)
            // console.log(`No Course Conflict between: \n[${c1.uid}] ${c1_timeObj.regular.hour} and \n[${c2.uid}] ${c2_timeObj.regular.hour}`)
        }

    }
}

const updateHighlightCourseConflicts = () => {
    $(".rwd-table").find("tr").each(function () {
        if (!($(this).find("td").hasClass(("course_header")))) {
            if (!($(this).parent("thead").length)) {
                clearHighlightCourseConflicts($(this))
                highlightCourseConflicts($(this))
            }
        }
    })
}

// Color course uid text to a "burnt orange" color
$("td[data-th='Unique']").children("a").css("color", "#bf5700")

// Append "UTRP" at the end of every course row
$(".rwd-table").find("tr").each(function () {
    if (!($(this).find("td").hasClass(("course_header")))) {
        if (!($(this).parent("thead").length)) {
            $(this).append(`<td class="UTRP_button" style="color: #bf5700; cursor: pointer">UTRP</td>`)
            // highlightCourseConflicts($(this))
        } else {
            // Add table header for UTRP button
            $(this).append(`<th scope="col">UTRP</th>`)
        }
    }
})

const initUserCourseList = async () => {
    try {
        courseListArray = await getStorage("userCourseList")
        updateHighlightCourseConflicts()
        // console.log("Init storage successful.")
    } catch (error) {
        console.error(error)
    }
}
initUserCourseList()

$(".UTRP_button").click(function () {
    let courseRow = $(this).closest("tr")
    // parseCourseInfo(courseRow)

    let port = chrome.runtime.connect({name: "modalCourse"})
    port.postMessage({modalCourse: parseCourseInfo(courseRow)})
})

chrome.storage.onChanged.addListener((changes) => {
    // console.log(changes)

    const getUserCourseList = async () => {
        try {
            courseListArray = await getStorage("userCourseList")
            updateHighlightCourseConflicts()
            // console.log("courseListArray was updated.")
        } catch (error) {
            console.error(error)
        }
    }
    getUserCourseList()

})