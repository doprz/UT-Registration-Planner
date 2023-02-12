import axios from "axios"
import cheerio from "cheerio"

const handleModal = (courseUID: string) => {
    const url = `https://utdirect.utexas.edu/apps/registrar/course_schedule/20232/${courseUID}/`

    axios.get(url).then(({ data }) => {
        const $ = cheerio.load(data)

        const name = $("#details h2").text()
        const info = $("#details p")
            .map((_, child) => {
                return $(child).text()
            })
            .toArray()
            .join()

        console.log(courseUID)
        console.log(name)
        console.log(info)
    })
}

// Content script
// var port = chrome.runtime.connect({name: "modalCourseUID"})
// port.postMessage({value: "Hello World"})
// port.onMessage.addListener(function(msg) {
//     console.log(msg)
// })

// Background service_worker
// chrome.runtime.onConnect.addListener(function (port) {
//     console.assert(port.name === "modalCourseUID")
//     port.onMessage.addListener(function (msg) {
//         if (msg.value === "Hello World") {
//             port.postMessage({res: "Hello World from background"})
//             console.log(msg)
//         }
//     })
// })