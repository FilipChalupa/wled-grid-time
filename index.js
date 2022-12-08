const run = async (isDarkMode) => {
	const colors = {
		blank: {
			primary: { light: [0, 0, 0], dark: [0, 0, 0] },
			secondary: { light: [0, 0, 0], dark: [0, 0, 0] },
		},
		red: {
			primary: { light: [255, 0, 0], dark: [43, 12, 12] },
			secondary: { light: [180, 0, 0], dark: [28, 0, 0] },
		},
		pink: {
			primary: { light: [230, 0, 126], dark: [46, 0, 25] },
			secondary: { light: [180, 0, 98], dark: [40, 0, 22] },
		},
		green: {
			primary: { light: [73, 254, 0], dark: [11, 43, 0] },
			secondary: { light: [55, 190, 0], dark: [0, 28, 0] },
		},
		yellow: {
			primary: { light: [255, 255, 64], dark: [51, 51, 13] },
			secondary: { light: [224, 224, 64], dark: [42, 42, 11] },
		},
		cyan: {
			primary: { light: [0, 255, 255], dark: [0, 56, 56] },
			secondary: { light: [0, 200, 200], dark: [0, 41, 41] },
		},
	}

	const extractColor = (colorName, isPrimary = true) => {
		return colors[colorName][isPrimary ? 'primary' : 'secondary'][
			isDarkMode ? 'dark' : 'light'
		]
	}

	const size = 10

	const now = new Date()
	const years = now.getFullYear()
	const months = now.getMonth() + 1
	const days = now.getDate()
	const hours = now.getHours()
	const minutes = now.getMinutes()
	const seconds = now.getSeconds()

	const rgbColors = new Array(size * size).fill(extractColor('blank'))

	const paintPixel = (color, x, y) => {
		if (x >= 0 && y >= 0 && x < size && y < size) {
			const indexTarget = x + y * size
			rgbColors[indexTarget] = color
		}
	}

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

	const paintColumn = (x, count, color) => {
		for (let i = 0; i < count; i++) {
			paintPixel(color, x, i)
		}
	}
	const paintDoubleDigitColumn = (xStart, number, colorName) => {
		const firstDigit = Math.floor(number / 10)
		const secondDigit = number % 10
		paintColumn(xStart, firstDigit, extractColor(colorName))
		paintColumn(xStart + 1, secondDigit, extractColor(colorName, false))
	}

	paintDoubleDigitColumn(0, months, 'yellow')
	paintDoubleDigitColumn(2, days, 'cyan')
	paintDoubleDigitColumn(4, hours, 'pink')
	paintDoubleDigitColumn(6, minutes, 'green')
	paintDoubleDigitColumn(8, seconds, 'red')

	// const paintYears = () => {
	// const y = size - 1
	// const color = changeIntensity(orange, 0.5)
	// Variant A
	// paintPixel(color, 2, size - 2)
	// paintPixel(color, 2, size - 1)
	// paintPixel(color, 6, size - 2)
	// paintPixel(color, 6, size - 1)
	// if (years > 2023) {
	// 	paintPixel(color, 8, size - 4)
	// }
	// if (years > 2022) {
	// 	paintPixel(color, 8, size - 3)
	// }
	// paintPixel(color, 8, size - 2)
	// paintPixel(color, 8, size - 1)

	// Variant B
	// paintPixel(color, 0, y)
	// paintPixel(color, 1, y)
	// paintPixel(color, 4, y)
	// paintPixel(color, 5, y)
	// paintPixel(color, 7, y)
	// paintPixel(color, 8, y)
	// if (years === 2023) {
	// 	paintPixel(color, 9, y)
	// }
	// }

	const payload = JSON.stringify({
		seg: {
			i: flip(rgbColors),
		},
	})

	if (location.hostname === 'localhost') {
		await fetch('http://192.168.0.53/json', {
			method: 'POST',
			body: payload,
		})
	}

	const visualise = (payload) => {
		const seg = JSON.parse(payload).seg
		const pixels = seg.i
		const canvas = document.getElementById('canvas')
		const ctx = canvas.getContext('2d')
		const width = canvas.width
		const height = canvas.height
		const pixelWidth = width / size
		const pixelHeight = height / size
		pixels.forEach((pixel, i) => {
			const x = (i % size) * pixelWidth
			const y = Math.floor(i / size) * pixelHeight
			ctx.fillStyle = `rgb(${pixel.join(',')})`
			ctx.fillRect(x, y, pixelWidth, pixelHeight)
			if (pixel.some((c) => c > 0)) {
				ctx.strokeStyle = 'black'
				ctx.lineWidth = 5
				ctx.strokeRect(x, y, pixelWidth, pixelHeight)
			}
		})
	}

	const untransformedPayload = JSON.stringify({
		seg: {
			i: flip(JSON.parse(payload).seg.i),
		},
	})
	visualise(untransformedPayload)
}

const loop = async () => {
	await run(matchMedia('(prefers-color-scheme: dark)').matches)
	setTimeout(() => {
		loop()
	}, 1000)
}
loop()
