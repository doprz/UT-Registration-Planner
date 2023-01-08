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