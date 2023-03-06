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

const initEmptyCourseList = async () => {
    try {
        await setStorage({ userCourseList: [] })
    } catch (error) {
        console.error(error)
    }
}

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        console.log("UT Registration Planner Installed")
        initEmptyCourseList()
    }
})


// console.log("background.js is working")

// Synchronous response to storage updates
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//         console.log(
//             `Storage key "${key}" in namespace "${namespace}" changed.`,
//             `Old value was "${oldValue}", new value is "${newValue}".`
//         )
//     }
// })

const openNewTab = (url) => {
    chrome.tabs.create({
        url: url,
    })
}

// console.log("background.js loaded")
chrome.runtime.onConnect.addListener(function (port) {
    // console.log(`Connected on port: ${port}`)
    // console.assert(port.name === "modalCourse")
    port.onMessage.addListener(function (msg) {
        // console.log(`[bg] ${JSON.stringify(msg)}`)

        if (port.name === "openURL") {
            openNewTab(msg.url)
        } else {
            // port.postMessage(msg)
            // console.log(`Relayed ${JSON.stringify(msg)} from bg`)
            chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, msg)
            })
        }
    })
})

const getUserCourseList = async () => {
    try {
        return userCourseList = await getStorage("userCourseList")
    } catch (error) {
        console.error(error)
    }
}

chrome.storage.onChanged.addListener(async (changes) => {
    // console.log(changes)
    userCourseList = await getUserCourseList()
    courses = userCourseList.length ? `${userCourseList.length}` : undefined

    if (userCourseList && courses) {
        chrome.action.setBadgeBackgroundColor({ color: "#bf5700" })
        chrome.action.setBadgeText({ text: courses })
    } else {
        chrome.action.setBadgeText({ text: "" })
    }
})