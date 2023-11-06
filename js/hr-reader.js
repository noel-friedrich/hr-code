let canvas1 = null
let context1 = null

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

let letters = {
    "A": 0b1111110001111111000110001, "B": 0b1111010001111111000111110,
    "C": 0b1111110000100001000011111, "D": 0b1111010001100011000111110,
    "E": 0b1111110000111101000011111, "F": 0b1111110000111101000010000,
    "G": 0b1111110000101111000111111, "H": 0b1000110001111111000110001,
    "I": 0b1111100100001000010011111, "J": 0b1111000100001001010011100,
    "K": 0b1001010100110001010010010, "L": 0b1000010000100001000011111,
    "M": 0b1000111011101011000110001, "N": 0b1000111001101011001110001,
    "O": 0b1111110001100011000111111, "P": 0b1111110001111111000010000,
    "Q": 0b1111110001100011001111111, "R": 0b1111110001111111001010001,
    "S": 0b1111110000111110000111111, "T": 0b1111100100001000010000100,
    "U": 0b1000110001100011000111111, "V": 0b1000110001010100101000100,
    "W": 0b1000110001101011101110001, "X": 0b1000101010001000101010001,
    "Y": 0b1000101010001000010000100, "Z": 0b1111100010001000100011111,
    "0": 0b0111010001100011000101110, "1": 0b0110000100001000010000100,
    "2": 0b0110010010001000100011110, "3": 0b1111000010011100001011110,
    "4": 0b1000110001111110000100001, "5": 0b1111010000111000001011100,
    "6": 0b1111010000111101001011110, "7": 0b1111000010001000100010000,
    "8": 0b1111010010011001001011110, "9": 0b1111010010111100001011110,
    " ": 0b0000000000000000000000000, "/": 0b0001100110011001100010000,
    "\\": 0b1100001100001100001100001, "#": 0b0101011111010101111101010,
    "?": 0b1111100001001110000000100, ":": 0b0110001100000000110001100,
    "-": 0b0000000000011100000000000, ".": 0b0000000000000000110001100,
    ",": 0b0000000000001000110001000, "}": 0b0110000100001100010001100,
    "!": 0b0010000100001000000000100, "{": 0b0011000100011000010000110,
    "%": 0b1100111010001000101110011, "^": 0b0010001010000000000000000,
    "<": 0b0001000100010000010000010, "~": 0b0000001000101010001000000,
    ">": 0b0100000100000100010001000, "`": 0b0100000100000000000000000,
    "+": 0b0000000100011100010000000, "(": 0b0010001000010000100000100,
    "*": 0b1010101110111110111010101, ")": 0b0010000010000100001000100,
    ";": 0b0000000100000000010001000, "@": 0b1111110001101111011111110,
    "|": 0b0010000100001000010000100, "]": 0b0110000100001000010001100,
    "=": 0b0000011111000001111100000, "[": 0b0011000100001000010000110,
    "_": 0b0000000000000000000011111, "&": 0b0100010100010101010001010,
    "$": 0b0010001110011000011001110,
    "a": 0b0000001110100101001001111, "b": 0b1000010000111001001011100,
    "c": 0b0000001110100001000001110, "d": 0b0001000010011101001001110,
    "e": 0b0110010010111101000001110, "f": 0b0001000100011100010000100,
    "g": 0b0110010010011100001011100, "h": 0b1000010000111001001010010,
    "i": 0b0010000000011100010001110, "j": 0b0010000000001000010011000,
    "k": 0b0100001000010100110001010, "l": 0b0100001000010000101000100,
    "m": 0b0000000000010101010110001, "n": 0b0000000000111001001010010,
    "o": 0b0000001100100101001001100, "p": 0b0000001110010100111001000,
    "q": 0b0000001110010100111000010, "r": 0b0000000000001100100001000,
    "s": 0b0000000110010000011001100, "t": 0b0010001110001000010000110,
    "u": 0b0000000000010100101000110, "v": 0b0000000000010100101000100,
    "w": 0b0000000000100011010101011, "x": 0b0000000000010100010001010,
    "y": 0b0101001010001100001000100, "z": 0b0000001110000100010001110,
    "terminator": 0b0000001110010100111000000,
}

let foundCodeSize = null
let pressed = false

function canvasToBlackWhite() {
    const imageData = context1.getImageData(0, 0, canvas1.width, canvas1.height)

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i + 0]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        const average = (r + g + b) / 3
        const luminance = average > 160 ? 255 : 0
        imageData.data[i + 0] = luminance
        imageData.data[i + 1] = luminance
        imageData.data[i + 2] = luminance
    }

    context1.putImageData(imageData, 0, 0)
}

function findEyePositions(y, vertical=false) {
    let imageData = undefined

    if (vertical) {
        imageData = context1.getImageData(y, 0, 1, canvas1.height)
    } else {
        imageData = context1.getImageData(0, y, canvas1.width, 1)
    }

    let currentValue = true
    let tempStreak = 0
    let valueHistory = []
    let foundBeginning = false

    for (let i = 0; i < imageData.data.length; i += 4) {
        const isOn = imageData.data[i] == 255

        if (isOn && !foundBeginning) {
            foundBeginning = true
        } else if (currentValue == isOn) {
            tempStreak++
        } else {
            valueHistory.push(tempStreak)
            tempStreak = 0
            currentValue = isOn
        }
    }

    if (tempStreak) {
        valueHistory.push(tempStreak)
    }

    if (valueHistory.length < 5) {
        return []
    }

    let foundXPositions = []
    let sum = 0
    
    for (let i = 0; i < valueHistory.length; i++) {
        const first6Values = valueHistory.slice(i, i + 6)
        if (first6Values.length != 6)
            continue
        const first6ValuesSum = first6Values.reduce((p, c) => p + c)
        const average = first6ValuesSum / first6Values.length
        const consistencyErrors = first6Values.map(v => Math.abs(average - v))
        const consistencyError = consistencyErrors.reduce((p, c) => p + c)

        if (consistencyError < 5) {
            const possibleX = sum + first6ValuesSum / 2
            foundXPositions.push([possibleX - average, first6ValuesSum])
        }

        sum += valueHistory[i]
    }

    if (foundXPositions.length == 0) {
        return []
    }

    return foundXPositions
}

function drawEyePositions() {
    context1.fillStyle = "rgba(0, 255, 0, 0.5)"

    for (let y = 0; y < canvas1.height; y++) {
        let xPositions = findEyePositions(y, false)
        for (let [xPosition, width] of xPositions) {
            context1.fillRect(xPosition, y, width, 1)
        }
    }

    context1.fillStyle = "rgba(0, 0, 255, 0.5)"

    for (let x = 0; x < canvas1.width; x++) {
        let yPositions = findEyePositions(x, true)
        for (let [yPosition, height] of yPositions) {
            context1.fillRect(x, yPosition, 1, height)
        }
    }
}

function averageFromData(pixelData) {
    let sum = 0
    for (let i = 0; i < pixelData.data.length; i += 4) {
        sum += pixelData.data[i]
    }
    const average = sum / (pixelData.data.length / 4)
    const isOn = average > 100
    const error = isOn ? Math.abs(255 - average) : average
    return [isOn, error]
}

function extractData(codeSize, {
    drawRecognitionBoxes=false
}={}) {
    const sizePx = codeSize * 6 - 1 + 2 // TODO: +2 because bounding box is larger than code
    const blockStepX = canvas1.width / sizePx
    const blockStepY = canvas1.height / sizePx

    let bitmap = []
    let cumulativeError = 0

    context1.fillStyle = "rgba(0, 255, 0, 0.5)"
    for (let i = 0; i < sizePx; i++) {
        let row = []

        for (let j = 0; j < sizePx; j++) {
            const imageData = context1.getImageData(
                Math.floor(blockStepX * i),
                Math.floor(blockStepY * j),
                Math.floor(blockStepX),
                Math.floor(blockStepY)
            )
            const [isOn, error] = averageFromData(imageData)
            cumulativeError += error
            if (isOn) {
                row.push(true)
            } else {
                if (drawRecognitionBoxes) {
                    context1.fillRect(
                        Math.floor(blockStepX * i),
                        Math.floor(blockStepY * j),
                        Math.floor(blockStepX),
                        Math.floor(blockStepY)
                    )
                }
                row.push(false)
            }
        }
        bitmap.push(row)
    }

    return [bitmap, cumulativeError / (codeSize ** 2)]
}

function getOptimalSize() {
    let bestError = -Infinity
    let bestData = null

    let previousError = null
    for (let i = 15; i > 1; i--) {
        const [bitmap, error] = extractData(i)

        if (previousError !== null) {
            let errorToPrevious = previousError - error
            if (errorToPrevious > bestError) {
                bestError = errorToPrevious
                bestData = bitmap
            }
        }

        previousError = error
    }

    // console.log(`best error = ${bestError}, best size = ${bestSize}`)
    return [bestData, bestError]
}

function getOptimalBitmap() {
    let bestBitmap = null
    let bestError = Infinity
    for (let i = 15; i > 1; i--) {
        const [bitmap, _] = extractData(i)

        let error = verifyBitmap(bitmap)
        if (error < bestError) {
            bestError = error
            bestBitmap = bitmap
        }
    }

    return [bestBitmap, bestError]
}

function transformCanvasToSquare() {
    let regionSize = Math.round(canvas1.width * 0.2)

    const getNearestPos = (desireAblePos, regionStart) => {
        let imageData = context1.getImageData(regionStart.x, regionStart.y, regionSize, regionSize)
        let bestPos = {x: 0, y: 0}
        let bestDistance = Infinity

        // checks if the point is good based if the sorrounding pixels match the color
        const isGoodPoint = (x, y) => {
            const directions = [
                [0, 1], [1, 1], [-1, 1],
                [0,-1], [1,-1], [-1,-1],
                [-1, 0], [1, 0]
            ]

            let goodCount = 0
            for (let dir of directions) {
                let i = ((x + dir[0]) * regionSize + (y + dir[0])) * 4
                if (imageData.data[i] == 0) {
                    goodCount++
                }
            }

            return goodCount > 1
        }

        for (let x = 0; x < regionSize; x++) {
            for (let y = 0; y < regionSize; y++) {
                let i = (y * regionSize + x) * 4
                if (imageData.data[i] == 0) {
                    let dx = Math.abs(x - desireAblePos.x)
                    let dy = Math.abs(y - desireAblePos.y)
                    let dist = Math.sqrt(dx*dx + dy*dy)
                    if (dist < bestDistance && isGoodPoint(x, y)) {
                        bestDistance = dist
                        bestPos = {x, y}
                    }
                }
            }
        }

        let resultX = regionStart.x + bestPos.x
        let resultY = regionStart.y + bestPos.y

        context1.fillStyle = "rgba(0, 255, 0, 0.5)"
        context1.fillRect(resultX - 5, resultY - 5, 10, 10)

        return {x: resultX, y: resultY}
    }

    let topleft = getNearestPos({x: 0, y: 0}, {x: 0, y: 0})
    // let topRight = getNearestPos({x: canvas1.width, y: 0}, {x: canvas1.width - regionSize - 2, y: 0})
    // let bottomLeft = getNearestPos({x: 0, y: canvas1.height}, {x: 0, y: canvas1.height - regionSize - 2})
    let bottomRight = getNearestPos({x: canvas1.width, y: canvas1.height}, {x: canvas1.width - regionSize - 2, y: canvas1.height - regionSize - 2})

    topleft.x -= 2
    topleft.y -= 2

    bottomRight.x += 2
    bottomRight.y += 2

    // interpolate data

    let deltaX = bottomRight.x - topleft.x
    let deltaY = bottomRight.y - topleft.y

    let oldImageData = context1.getImageData(0, 0, canvas1.width, canvas1.height)
    let newImageData = context2.createImageData(canvas1.width, canvas1.height)
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

    context2.putImageData(oldImageData, 0, 0)
    context1.putImageData(newImageData, 0, 0)
}

function drawBitmap(bitmap, opacity=1, context=context1) {
    let canvas = context.canvas
    const sizePx = bitmap.length
    const blockStepX = canvas.width / sizePx
    const blockStepY = canvas.height / sizePx

    context.fillStyle = `rgba(0, 0, 0, ${opacity})`
    context.fillRect(0, 0, canvas.width, canvas.height)
    if (opacity < 1) {
        context.fillStyle = `rgba(0, 255, 0, ${opacity})`
    } else {
        context.fillStyle = `rgba(255, 255, 255, ${opacity})`
    }
    for (let i = 0; i < sizePx; i++) {
        for (let j = 0; j < sizePx; j++) {
            if (bitmap[i][j]) {
                context.fillRect(
                    Math.floor(blockStepX * i),
                    Math.floor(blockStepY * j),
                    Math.round(blockStepX) + 1,
                    Math.round(blockStepY) + 1
                )
            }
        }
    }
}

function generateEyeBitmap(sizePx, mirror=false) {
    let bitmap = Array.from({length: sizePx}, () => Array.from({length: sizePx}, () => undefined))

    const eyePattern = [
        [false, false, false, false, false],
        [false, true, true, true, false],
        [false, true, false, true, false],
        [false, true, true, true, false],
        [false, false, false, false, false],
    ]

    const drawPattern = (x, y, pattern) => {
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                let px = x + j
                let py = y + i
                if (py >= bitmap.length || px >= bitmap[0].length) {
                    continue
                }

                bitmap[py][px] = pattern[i][j]
            }
        }
    }

    drawPattern(0, 0, eyePattern)
    drawPattern(0, sizePx - 5, eyePattern)
    drawPattern(sizePx - 5, sizePx - 5, eyePattern)

    if (mirror) {
        let newBitmap = Array.from({length: sizePx}, () => Array.from({length: sizePx}, () => undefined))
        for (let i = 0; i < bitmap.length; i++) {
            for (let j = 0; j < bitmap[i].length; j++) {
                newBitmap[bitmap.length - i - 1][j] = bitmap[i][j]
            }
        }
        return newBitmap
    }

    return bitmap
}

function verifyBitmap(bitmap) {
    const errorFromPattern = (pattern) => {
        let error = 0
        let mask = pattern
        for (let i = 0; i < bitmap.length; i++) {
            for (let j = 0; j < bitmap[i].length; j++) {
                if (mask[i][j] !== undefined) {
                    if (mask[i][j] !== bitmap[i][j]) {
                        error++
                    }
                }
            }
        }
        return error
    }

    return Math.min(
        errorFromPattern(generateEyeBitmap(bitmap.length)),
        errorFromPattern(generateEyeBitmap(bitmap.length, true))
    )
}

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
                            }
                        }
        
                        if (cumulativeLetterError < bestError) {
                            bestError = cumulativeLetterError
                            bestLetter = letter
                        }
                    }
                }
            }

            context1.putImageData(
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

    if (!alignRotation()) {
        return
    }

    foundCodeSize = cropToCode()
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

    canvas1.onclick = () => {
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
            await processImage()
            if (pressed) {
                let result = await extractText(foundCodeSize)
                if (pressed) {
                    return result
                }
            }
        } catch (e) {
            console.error(e)
        }

        await sleep(100)
    }
}

async function scanImage() {
    canvas1 = document.createElement("canvas")
    document.body.appendChild(canvas1)
    context1 = canvas1.getContext("2d", {
        willReadFrequently: true
    })
    canvas1.style.border = "1px solid red"

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