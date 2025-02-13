function updateDisplay() {
	const day = document.getElementById('daySelect').value
	const scheduleDiv = document.getElementById('scheduleDisplay')
	scheduleDiv.innerHTML = ''

	baseSchedule[day].forEach((lesson, index) => {
		const lessonNumber = index + 1
		const lessonDiv = document.createElement('div')
		lessonDiv.className = 'lesson'

		// Проверяем наличие изменений
		if (changes[day] && changes[day][lessonNumber]) {
			lessonDiv.classList.add('changed')
			lessonDiv.textContent = `${lessonNumber}. ${changes[day][lessonNumber]}`
		} else {
			lessonDiv.textContent = lesson
		}

		scheduleDiv.appendChild(lessonDiv)
	})
}

function addChange() {
	const day = document.getElementById('daySelect').value
	const lessonNumber = parseInt(document.getElementById('lessonNumber').value)
	const newSubject = document.getElementById('newSubject').value

	if (!lessonNumber || !newSubject) {
		alert('Заполните все поля')
		return
	}

	if (!changes[day]) changes[day] = {}
	changes[day][lessonNumber] = newSubject

	updateDisplay()
	document.getElementById('lessonNumber').value = ''
	document.getElementById('newSubject').value = ''
}

function copySchedule() {
	const day = document.getElementById('daySelect').value
	const output = []

	baseSchedule[day].forEach((lesson, index) => {
		const lessonNumber = index + 1
		if (changes[day] && changes[day][lessonNumber]) {
			output.push(`${lessonNumber}. ${changes[day][lessonNumber]}`)
		} else {
			output.push(lesson)
		}
	})

	const text = `${day}:\n${output.join('\n')}`

	navigator.clipboard
		.writeText(text)
		.then(() => alert('Расписание скопировано!'))
		.catch(err => console.error('Ошибка копирования:', err))
}

// Инициализация
document.getElementById('daySelect').addEventListener('change', updateDisplay)
updateDisplay()
