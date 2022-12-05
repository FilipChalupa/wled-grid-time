const run = () => {
	const black = [0, 0, 0]
	const red = [255, 0, 0]
	const pink = [230, 0, 126]
	const green = [73, 254, 0]
	const yellow = [255, 255, 64]
	const cyan = [0, 255, 255]
	const orange = [255, 127, 0]

	const size = 10

	const now = new Date()
	const years = now.getFullYear()
	const months = now.getMonth() + 1
	const days = now.getDate()
	const hours = now.getHours()
	const minutes = now.getMinutes()
	const seconds = now.getSeconds()

	const rgbColors = new Array(size * size).fill(black)

	const changeIntensity = (color, factor) => {
		return color.map((c) => Math.floor(c * factor))
	}

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
	const paintDoubleDigitColumn = (xStart, number, color) => {
		const firstDigit = Math.floor(number / 10)
		const secondDigit = number % 10
		paintColumn(xStart, firstDigit, color)
		paintColumn(xStart + 1, secondDigit, changeIntensity(color, 0.5))
	}

	paintDoubleDigitColumn(0, months, yellow)
	paintDoubleDigitColumn(2, days, cyan)
	paintDoubleDigitColumn(4, hours, pink)
	paintDoubleDigitColumn(6, minutes, green)
	paintDoubleDigitColumn(8, seconds, red)

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
			i: rotateCounterClockwise(flip(rgbColors)),
		},
	})

	// fetch('http://192.168.0.53/json', {
	// 	method: 'POST',
	// 	body: payload,
	// }).then(() => {
	// 	setTimeout(() => {
	// 		location.reload()
	// 	}, 500)
	// })

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
			i: rotateCounterClockwise(flip(JSON.parse(payload).seg.i)),
		},
	})
	visualise(untransformedPayload)
}

const loop = () => {
	run()
	setTimeout(() => {
		loop()
	}, 1000)
}
loop()
