const OUTPUT_CONTAINER = document.getElementById("output-container")
const OUTPUT_CANVAS = document.getElementById("output-canvas")
const OUTPUT_CONTEXT = OUTPUT_CANVAS.getContext("2d")
const URL_INPUT = document.getElementById("url-input")

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
}

function generateCode() {
    const inputString = URL_INPUT.value
    const pixelData = generateHRPixelData(inputString, {
        fontmode: "5x5",
        randomFill: true,
        fillSidesRandom: true,
    })
    drawPixelDataToOutput(pixelData)
}

URL_INPUT.oninput = generateCode

generateCode()