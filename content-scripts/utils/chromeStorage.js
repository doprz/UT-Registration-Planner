// Reads all data out of storage.sync and exposes it via a promise.
//
// Note: Once the Storage API gains promise support, this function
// can be greatly simplified.
export const getStorage = async (key) => {
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
export const setStorage = async (kv) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(kv, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError)
            }

            resolve(kv)
        })
    })
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

export const objInArray = (obj, arr, property) => {
    const result = arr.some((element) => {
        if (element[property] === obj[property]) {
            return true
        }

        return false
    })

    return result
}

export const courseDateTimeConflictArr = (course, arr) => {
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

export const addCourseToStorage = async (course, courseListArray) => {
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

export const removeCourseFromStorage = async (c_uid, courseListArray) => {
    const _courseListArray = courseListArray.filter((c) => c.uid !== c_uid)

    try {
        await setStorage({ userCourseList: _courseListArray })
    } catch (error) {
        console.error(error)
    }
}