const black = [0, 0, 0]
const red = [255, 0, 0]
const pink = [230, 0, 126]
const green = [73, 254, 0]
const yellow = [255, 255, 0]

const size = 10

const numbers = [
	/* 0 */ [1, 1, 1, 0, 1, 1, 1],
	/* 1 */ [0, 0, 1, 0, 0, 1, 0],
	/* 2 */ [1, 0, 1, 1, 1, 0, 1],
	/* 3 */ [1, 0, 1, 1, 0, 1, 1],
	/* 4 */ [0, 1, 1, 1, 0, 1, 0],
	/* 5 */ [1, 1, 0, 1, 0, 1, 1],
	/* 6 */ [1, 1, 0, 1, 1, 1, 1],
	/* 7 */ [1, 0, 1, 0, 0, 1, 0],
	/* 8 */ [1, 1, 1, 1, 1, 1, 1],
	/* 9 */ [1, 1, 1, 1, 0, 1, 1],
]

const now = new Date()
const hours = now.getHours()
const minutes = now.getMinutes()
const seconds = now.getSeconds()

const timeWidth = 17 - 1 // -1 to make it loop faster
const xOffset =
	-timeWidth + (Math.round(now.getTime() / 1000) % (size + timeWidth))
const yOffset = 2

const rgbColors = new Array(size * size).fill(black)

const paintPixel = (color, x, y) => {
	if (x >= 0 && y >= 0 && x < size && y < size) {
		const indexTarget = x + y * size
		rgbColors[indexTarget] = color
	}
}

const paintNumber = (number, x, y) => {
	const numberMask = numbers[number]

	const allPositions = [
		/* 0 */ [
			[x + 0, y + 0],
			[x + 1, y + 0],
			[x + 2, y + 0],
		],
		/* 1 */ [
			[x + 0, y + 0],
			[x + 0, y + 1],
			[x + 0, y + 2],
		],
		/* 2 */ [
			[x + 2, y + 0],
			[x + 2, y + 1],
			[x + 2, y + 2],
		],
		/* 3 */ [
			[x + 0, y + 2],
			[x + 1, y + 2],
			[x + 2, y + 2],
		],
		/* 4 */ [
			[x + 0, y + 2],
			[x + 0, y + 3],
			[x + 0, y + 4],
		],
		/* 5 */ [
			[x + 2, y + 2],
			[x + 2, y + 3],
			[x + 2, y + 4],
		],
		/* 6 */ [
			[x + 0, y + 4],
			[x + 1, y + 4],
			[x + 2, y + 4],
		],
	]
	const fillPositions = allPositions.filter((_, index) => numberMask[index] > 0)

	fillPositions.flat().forEach(([x, y]) => {
		paintPixel(red, x, y)
	})
}

const paintDoubleDigit = (number, x, y) => {
	const firstDigit = Math.floor(number / 10)
	const secondDigit = number % 10
	paintNumber(firstDigit, x, y)
	paintNumber(secondDigit, x + 4, y)
}

const paintColon = (x, y) => {
	paintPixel(red, x, y + 1)
	paintPixel(red, x, y + 3)
}

// paintDoubleDigit(hours, xOffset, yOffset)
// paintColon(xOffset + 8, yOffset)
// paintDoubleDigit(minutes, xOffset + 10, yOffset)

const mirror = (items) => {
	const newItems = items.map(
		(_, i) => items[Math.floor(i / size) * size + 9 - (i % size)],
	)
	return newItems
}

const flip = (items) => {
	const newItems = items.map((_, i) => {
		const x = i % size
		const y = Math.floor(i / size)
		return items[size - x - 1 + y * size]
	})
	return newItems
}

const rotateCounterClockwise = (items) => {
	const newItems = items.map((_, i) => {
		const x = i % size
		const y = Math.floor(i / size)
		return items[y + (size - x - 1) * size]
	})
	return newItems
}

for (let i = 0; i < Math.floor(seconds / 3); i++) {
	const y = i % size
	const x = 6 + Math.floor(i / size)
	paintPixel(red, x, y)
}
for (let i = 0; i < (minutes % 3) + 1; i++) {
	const x = 9
	const y = i
	paintPixel(yellow, x, y)
}

for (let i = 0; i < Math.floor(minutes / 3); i++) {
	const y = i % size
	const x = 3 + Math.floor(i / size)
	paintPixel(green, x, y)
}

for (let i = 0; i < hours; i++) {
	const y = i % size
	const x = 0 + Math.floor(i / size)
	paintPixel(pink, x, y)
}

const payload = JSON.stringify({
	seg: {
		i: rotateCounterClockwise(flip(rgbColors)),
	},
})

fetch('http://192.168.0.53/json', {
	method: 'POST',
	body: payload,
}).then(() => {
	setTimeout(() => {
		location.reload()
	}, 500)
})
