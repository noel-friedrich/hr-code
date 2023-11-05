let canvas1 = null
let context1 = null

let visibleCanvas = null
let visibleContext = null

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

let letters = letterData["5x5"].letters

function getAlignmentPoints({
    drawDebug=false
}={}) {
    const imageData = context1.getImageData(0, 0, canvas1.width, canvas1.height)
    const alignmentColors = [
        [255, 0, 0], [0, 255, 0], [0, 0, 255]
    ]
    const minColorDistance = 150

    let alignmentPoints = [[], [], []]

    for (let y = 0; y < canvas1.height; y++) {
        for (let x = 0; x < canvas1.width; x++) {
            let i = (y * canvas1.width + x) * 4
            let r = imageData.data[i + 0]
            let g = imageData.data[i + 1]
            let b = imageData.data[i + 2]

            for (let i = 0; i < 3; i++) {
                let colorDist = Math.sqrt(
                    (r - alignmentColors[i][0]) ** 2 +
                    (g - alignmentColors[i][1]) ** 2 +
                    (b - alignmentColors[i][2]) ** 2
                )
                
                if (colorDist < minColorDistance && (alignmentPoints[i].length == 0 || colorDist < alignmentPoints[i][0].distance)) {
                    alignmentPoints[i].push({distance: colorDist, x, y})
                    alignmentPoints[i].sort((a, b) => b.distance - a.distance)
                    if (alignmentPoints[i].length > 500) {
                        alignmentPoints[i].shift()
                    }
                }
            }
        }
    }

    const averagePoint = points => {
        let avgX = points.map(p => p.x).reduce((p, c) => p + c) / points.length
        let avgY = points.map(p => p.y).reduce((p, c) => p + c) / points.length
        return {x: avgX, y: avgY}
    }

    let averagePoints = alignmentPoints.map(pts => pts.length > 0 ? averagePoint(pts) : null)

    for (let i = 0; i < 3; i++) {
        if (averagePoints[i] == null)
            return null
        if (drawDebug) {
            context1.fillStyle = "rgba(0, 255, 0, 0.5)"
            context1.fillRect(averagePoints[i].x - 5, averagePoints[i].y - 5, 10, 10)
        }
    }

    return averagePoints
}

function cropCanvas(topleft, bottomRight) {
    let deltaX = bottomRight.x - topleft.x
    let deltaY = bottomRight.y - topleft.y

    let oldImageData = context1.getImageData(0, 0, canvas1.width, canvas1.height)
    let newImageData = context1.createImageData(canvas1.width, canvas1.height)
    for (let x = 0; x < canvas1.width; x++) {
        for (let y = 0; y < canvas1.height; y++) {
            let transformedX = Math.round(deltaX * (x / canvas1.width) + topleft.x)
            let transformedY = Math.round(deltaY * (y / canvas1.height) + topleft.y)

            let newI = (y * canvas1.width + x) * 4
            let oldI = (transformedY * canvas1.width + transformedX) * 4

            const luminance = oldImageData.data[oldI]
            newImageData.data[newI + 0] = luminance
            newImageData.data[newI + 1] = luminance
            newImageData.data[newI + 2] = luminance
            newImageData.data[newI + 3] = 255
        }
    }

    context1.putImageData(newImageData, 0, 0)
}

function _distTwoPoints(p1, p2) {
    return Math.sqrt(
        (p1.x - p2.x) ** 2 +
        (p1.y - p2.y) ** 2
    )
}

function cropToCode() {
    let averagePoints = getAlignmentPoints()
    if (averagePoints == null) return
    let topleft = averagePoints[0]

    let dist12 = _distTwoPoints(averagePoints[0], averagePoints[1])
    let dist23 = _distTwoPoints(averagePoints[1], averagePoints[2])
    let codeSize = (Math.round(dist12 / dist23) + 1)

    // draw points (debugging)
    // for (let averagePoint of averagePoints) {
    //     context1.fillStyle = "lightgreen"
    //     context1.fillRect(averagePoint.x, averagePoint.y, 10, 10)
    // }

    let bottomright = {x: averagePoints[1].x, y: averagePoints[1].y + (averagePoints[1].x - averagePoints[0].x)}

    const adjustment = (dist12 / codeSize) * 0.55
    topleft.x -= adjustment
    topleft.y -= adjustment
    bottomright.x += adjustment
    bottomright.y += adjustment
    
    cropCanvas(topleft, bottomright)

    return codeSize
}

function alignRotation() {
    let averagePoints = getAlignmentPoints()
    if (averagePoints == null) return

    const angle = Math.atan2(
        averagePoints[1].y - averagePoints[0].y,
        averagePoints[1].x - averagePoints[0].x,
    )

    context1.save()
    context1.translate(canvas1.width / 2, canvas1.height / 2)
    context1.rotate(-angle)

    context1.drawImage(canvas1, -canvas1.width / 2, -canvas1.height / 2)

    context1.restore()

    return true
}

function getLetterBitArray(letterBitmap, size) {
    let bitStr = letterBitmap.toString(2).padStart(size**2, "0")
    let out = []
    for (let y = 0; y < size; y++) {
        let row = []
        for (let x = 0; x < size; x++) {
            let i = y * size + x
            row.push(bitStr[i] == "1")
        }
        out.push(row)
    }
    return out
}

async function extractText(codeSize) {
    let text = ""
    let segmentSize = canvas1.width / codeSize
    let segmentSizeInt = Math.floor(segmentSize)
    for (let y = 0; y < codeSize; y++) {
        for (let x = 0; x < codeSize; x++) {
            // disregard ECC and finder-patterns
            if (y == 0 || x == codeSize - 1) {
                continue
            }

            /*
            y = 2
            x = 3
            */

            const pixelData = context1.getImageData(
                Math.round(segmentSize * x),
                Math.round(segmentSize * y),
                segmentSizeInt,
                segmentSizeInt
            )

            let bestLetter = undefined
            let bestError = Infinity

            /*
            context1.fillStyle = "white"
            context1.fillRect(0, 0, canvas1.width, canvas1.height)

            context1.putImageData(pixelData, 0, 0)
            */

            const makePixelDataFromLetter = (letter) => {
                let pixelData = context1.createImageData(
                    segmentSizeInt,
                    segmentSizeInt
                )
                
                let letterBitArray = getLetterBitArray(letters[letter], 5)

                for (let py = 0; py < segmentSizeInt; py++) {
                    for (let px = 0; px < segmentSizeInt; px++) {
                        const i = (py * segmentSizeInt + px) * 4

                        const letterMapX = Math.floor(px / segmentSize * 6)
                        const letterMapY = Math.floor(py / segmentSize * 6)
                        let letterBitValue = letterBitArray[letterMapY]

                        if (letterBitValue) {
                            // when defined, it's inside the letter box
                            letterBitValue = letterBitValue[letterMapX]
                        } else {
                            // when undefined, then it's outside of range and thus white (true)
                            letterBitValue = false
                        }

                        const desiredLuminance = letterBitValue ? 0 : 255

                        pixelData.data[i + 0] = desiredLuminance
                        pixelData.data[i + 1] = desiredLuminance
                        pixelData.data[i + 2] = desiredLuminance
                        pixelData.data[i + 3] = 255
                    }
                }

                return pixelData
            }

            for (let [letter, letterBitmap] of Object.entries(letters)) {
                const letterBitArray = getLetterBitArray(letterBitmap, 5)
                for (let offsetY of [0, -0.5, -1]) {
                    for (let offsetX of [-1, -0.5, 0]) {
                        let cumulativeLetterError = 0
        
                        // if (letter != "N") continue
        
                        for (let py = 0; py < segmentSizeInt; py++) {
                            for (let px = 0; px < segmentSizeInt; px++) {
                                const i = (py * segmentSizeInt + px) * 4
                                const luminance = (
                                    pixelData.data[i + 0] + // r
                                    pixelData.data[i + 1] + // g
                                    pixelData.data[i + 2]   // b
                                ) / 3
        
                                const letterMapX = Math.floor(px / segmentSize * 6 + (offsetX))
                                const letterMapY = Math.floor(py / segmentSize * 6 + (offsetY))
                                let letterBitValue = letterBitArray[letterMapY]
        
                                if (letterBitValue) {
                                    // when defined, it's inside the letter box
                                    letterBitValue = letterBitValue[letterMapX]
                                } else {
                                    // when undefined, then it's outside of range and thus white (true)
                                    letterBitValue = false
                                }
        
                                const desiredLuminance = letterBitValue ? 0 : 255
        
                                let error = Math.abs(desiredLuminance - luminance) 
                                cumulativeLetterError += error

                                if (cumulativeLetterError > bestError)
                                    break
                            }
                        }
        
                        if (cumulativeLetterError < bestError) {
                            bestError = cumulativeLetterError
                            bestLetter = letter
                        }
                    }
                }
            }

            visibleContext.putImageData(
                makePixelDataFromLetter(bestLetter), 
                Math.round(segmentSize * x),
                Math.round(segmentSize * y)
            )

            await sleep(10)

            if (bestLetter == "terminator" || !pressed) {
                return text
            }

            text += bestLetter
        }
    }

    return text
}

async function processImage() {
    visibleCanvas.width = canvas1.width
    visibleCanvas.height = canvas1.height
    visibleContext.drawImage(canvas1, 0, 0)

    if (!alignRotation()) {
        return false
    }

    foundCodeSize = cropToCode()
    return true
}

async function drawCameraImage() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        throw new Error("Device does not support MediaDevices API")

    let stream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment"
        }
    })

    let video = document.createElement("video")
    document.body.appendChild(video)
    video.srcObject = stream
    video.play()

    video.style.display = "none"

    await sleep(500)

    pressed = false

    visibleCanvas.onclick = () => {
        pressed = !pressed
    }

    while (true) {
        let cropLevel = 0.5

        let displaySize = Math.min(video.videoWidth, video.videoHeight) 
        displaySize = Math.round(cropLevel * displaySize)

        canvas1.width = displaySize
        canvas1.height = displaySize
    
        if (Math.max(canvas1.width, canvas1.height) == 0) {
            throw new Error("Invalid image source")
        }
    
        context1.fillRect(0, 0, canvas1.width, canvas1.height)

        let xOffset = -Math.floor(video.videoWidth / 2)
        let yOffset = -Math.floor(video.videoHeight / 2)
        
        context1.save()
        context1.translate(canvas1.width / 2, canvas1.height / 2)

        context1.drawImage(video, xOffset, yOffset, video.videoWidth, video.videoHeight)

        context1.restore()

        try {
            let zoomedIn = await processImage()

            if (zoomedIn) {
                visibleCanvas.style.outline = "4px solid rgb(0, 255, 0)"

                if (pressed) {
                    let result = await extractText(foundCodeSize)
                    await sleep(200)
                    if (pressed) {
                        return result
                    }
                }
            } else {
                visibleCanvas.style.outline = "none"
            }
        } catch (e) {
            console.error(e)
        }

        await sleep(100)
    }
}

async function scanImage() {
    canvas1 = document.createElement("canvas")
    context1 = canvas1.getContext("2d", {willReadFrequently: true})
    canvas1.style.display = "none"

    visibleCanvas = document.createElement("canvas")
    visibleContext = visibleCanvas.getContext("2d")

    document.getElementById("canvas-container").appendChild(canvas1)
    document.getElementById("canvas-container").appendChild(visibleCanvas)

    return await drawCameraImage()
}

function isValidUrl(string) {
    // from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
    let url;
    try {
        url = new URL(string)
    } catch (_) {
        return false
    }
    return true
}

async function main() {
    let result = await scanImage()

    if (isValidUrl(result)) {
        if (confirm(`Open \"${result}\"?`)) {
            console.log(`redirecting to \"${result}\"`)
            window.location.href = result
            return
        }
    } else {
        alert(result)
    }

    window.location.reload()
}

main()