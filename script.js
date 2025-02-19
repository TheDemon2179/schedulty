const allSubjects = Array.from(
	new Set(
		Object.values(baseSchedule)
			.flat()
			.map(lesson =>
				lesson
					.split(/\d+-[БСЛ]/)[0]
					.replace(/[0-9.\/]/g, '')
					.trim()
			)
			.filter(x => x && !x.includes('Нет урока'))
	)
)

function showSuggestions(input) {
	const suggestions = document.getElementById('suggestions')
	suggestions.innerHTML = ''
	if (!input) return

	const matches = allSubjects.filter(subj =>
		subj.toLowerCase().startsWith(input.toLowerCase())
	)

	matches.slice(0, 5).forEach(subj => {
		const div = document.createElement('div')
		div.className = 'suggestion-item'
		div.textContent = subj
		div.onclick = () => {
			document.getElementById('newSubject').value = subj
			suggestions.innerHTML = ''
			// Добавляем строку, чтобы вернуть фокус полю ввода
			document.getElementById('newSubject').focus()
		}
		suggestions.appendChild(div)
	})
}

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

	document.getElementById('suggestions').innerHTML = ''

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
