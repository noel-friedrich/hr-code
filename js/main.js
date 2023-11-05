const OUTPUT_CONTAINER = document.getElementById("output-container")
const OUTPUT_CANVAS = document.getElementById("output-canvas")
const OUTPUT_CONTEXT = OUTPUT_CANVAS.getContext("2d")
const URL_INPUT = document.getElementById("url-input")
const TYPE_SWITCH = document.getElementById("type-switch")

const alignmentDotColor1 = "rgb(255, 0, 0)"
const alignmentDotColor2 = "rgb(0, 255, 0)"
const alignmentDotColor3 = "rgb(0, 0, 255)"

const TYPE_MODES = {
    URL: 0,
    TEL: 1,
    MAIL: 2
}

let typeMode = TYPE_MODES.URL

const DEFAULT_VALUES = {
    [TYPE_MODES.URL]: "noel-friedrich.de",
    [TYPE_MODES.TEL]: "+353-123-4567",
    [TYPE_MODES.MAIL]: "max@example.com"
}

function drawPixelDataToOutput(data) {
    OUTPUT_CANVAS.style.display = "block"
    OUTPUT_CANVAS.width = OUTPUT_CANVAS.clientWidth
    OUTPUT_CANVAS.height = OUTPUT_CANVAS.clientHeight

    const xStep = OUTPUT_CANVAS.width / data[0].length
    const yStep = OUTPUT_CANVAS.height / data.length

    OUTPUT_CONTEXT.fillStyle = "white"
    OUTPUT_CONTEXT.fillRect(0, 0, OUTPUT_CANVAS.width, OUTPUT_CANVAS.height)
    
    OUTPUT_CONTEXT.fillStyle = "black"
    for (let x = 0; x < data[0].length; x++) {
        for (let y = 0; y < data.length; y++) {
            if (data[y][x]) {
                OUTPUT_CONTEXT.fillRect(
                    x * xStep, y * yStep,
                    xStep + 1, yStep + 1
                )
            }
        }
    }

    OUTPUT_CONTEXT.fillStyle = alignmentDotColor1
    OUTPUT_CONTEXT.fillRect(xStep * 2, yStep * 2, xStep * 3 + 1, yStep * 3 + 1)

    OUTPUT_CONTEXT.fillStyle = alignmentDotColor2
    OUTPUT_CONTEXT.fillRect(xStep * (data.length - 5), yStep * 2, xStep * 3 + 1, yStep * 3 + 1)

    OUTPUT_CONTEXT.fillStyle = alignmentDotColor3
    OUTPUT_CONTEXT.fillRect(xStep * (data.length - 5), yStep * 8, xStep * 3 + 1, yStep * 3 + 1)
}

function isValidUrl(string) {
    let url;
    try {
        url = new URL(string)
    } catch (_) {
        return false
    }
    return url
}

function isValidHttpUrl(string) {
    if (isValidUrl(string)) {
        let url = new URL(string)
        return (url.protocol === "http:" || url.protocol === "https:")
    } else {
        return false
    }
}

function generateCode() {
    let inputString = URL_INPUT.value

    if (typeMode == TYPE_MODES.URL) {
        if (!isValidUrl(inputString) && isValidUrl("HTTPS://" + inputString)) {
            inputString = "HTTPS://" + inputString
        }
    
        if (isValidHttpUrl(inputString)) {
            let url = new URL(inputString)
            let origin = url.origin.toUpperCase()
            inputString = origin + inputString.slice(origin.length)
        }    
    } else if (typeMode == TYPE_MODES.MAIL) {
        if (!inputString.toUpperCase().startsWith("MAILTO:")) {
            inputString = "MAILTO:" + inputString
        }
    } else if (typeMode == TYPE_MODES.TEL) {
        if (!inputString.toUpperCase().startsWith("TEL:")) {
            inputString = "TEL:" + inputString
        }
    }


    const pixelData = generateHRPixelData(inputString, {
        fontmode: "5x5",
        randomFill: true,
        fillSidesRandom: true,
    })
    drawPixelDataToOutput(pixelData)
}

TYPE_SWITCH.onclick = () => {
    typeMode = (typeMode + 1) % Object.values(TYPE_MODES).length

    switch (typeMode) {
        case TYPE_MODES.URL:
            TYPE_SWITCH.dataset.type = "url"
            break
        case TYPE_MODES.MAIL:
            TYPE_SWITCH.dataset.type = "mail"
            break
        case TYPE_MODES.TEL:
            TYPE_SWITCH.dataset.type = "tel"
            break
    }

    URL_INPUT.value = DEFAULT_VALUES[typeMode]

    generateCode()
}

URL_INPUT.value = DEFAULT_VALUES[typeMode]
URL_INPUT.oninput = generateCode

generateCode()