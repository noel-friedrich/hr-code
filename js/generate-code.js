const randomCharData = size => {
    let out = ""
    for (let i = 0; i < size*size; i++) {
        out += (Math.random() < 0.5) ? "0" : "1"
    }
    return parseInt(out, 2)
}

const maxCodeSize = 100

function generateHRPixelData(data, {
    fontmode="5x5",
    randomFill=false,
    fillSidesRandom=false,
}={}) {
    const fontData = letterData[fontmode]
    if (fontData === undefined) {
        throw new Error(`Unknown fontmode "${fontmode}"`)
    }

    const symbols = Array.from(data).map(letter => fontData.letters[letter])

    if (symbols.some(s => s === undefined)) {
        symbols.some((s, i) => s === undefined ? console.log(i, data[i]) : undefined)
        throw new Error("Message contains unsupported characters!")
    }

    let codeSize = 1
    for (; (codeSize ** 2) < symbols.length; codeSize++) {
        if (codeSize >= maxCodeSize) {
            throw new Error("Maximum Code Size exeeded.")
        }
    }

    let isFirstRandom = true
    while (randomFill && symbols.length < (codeSize * codeSize)) {
        // let randomIndex = Math.floor(Math.random() * pixelData.length)
        // symbols.splice(randomIndex, 0, randomCharData(fontData.size))
        if (isFirstRandom) {
            symbols.push(fontData.letters.terminator)
        } else {
            symbols.push(randomCharData(fontData.size))
        }
        isFirstRandom = false
    }

    codeSize++

    let sizePx = (fontData.size + 1) * codeSize - 1
    let pixelData = Array.from({length: sizePx + 2},
        () => Array.from({length: sizePx + 2}, () => false))

    const drawLetter = (letter, posX, posY) => {
        const px = posX * (fontData.size + 1) + 1
        const py = posY * (fontData.size + 1) + 1
        for (let j = 0; j < fontData.size ** 2; j++) {
            let bitMask = (1 << (fontData.size ** 2 - j - 1))
            let bitActive = (letter & bitMask) != 0
            if (bitActive) {
                let x = j % fontData.size
                let y = Math.floor(j / fontData.size)
                pixelData[py + y][px + x] = true
            }
        }
    }

    for (let i = 0; i < symbols.length; i++) {
        let px = (i % (codeSize - 1))
        let py = Math.floor(i / (codeSize - 1)) + 1
        drawLetter(symbols[i], px, py)
    }

    if (fillSidesRandom) {
        for (let i = 1; i < codeSize; i++) {
            drawLetter(randomCharData(fontData.size), i, 0)
            drawLetter(randomCharData(fontData.size), codeSize - 1, i)
        }
    }

    drawLetter(fontData.eye, 0, 0)
    drawLetter(fontData.eye, codeSize - 1, 0)
    drawLetter(fontData.eye, codeSize - 1, 1)

    return pixelData
}