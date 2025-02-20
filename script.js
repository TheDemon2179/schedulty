let shortMode = false
const abbreviations = {
	'Прикладное программное обеспечение': 'ППО',
	'Офисное программирование': 'ОфП',
	'Базы данных и системы управления базами данных': 'БД и СУБД',
	'Анализ хозяйственной деятельности': 'АХД',
	'Компьютерные сети': 'КС',
	'Физическая культура и здоровье': 'Физ-ра',
	'Белорусский язык (профессиональная лексика)': 'Бел. язык',
	'Информационный час': 'Инф. час',
	'КУРАТОРСКИЙ ЧАС': 'Кураторский',
}

let selectedLessonDay = null
let selectedLessonNumber = null
let darkThemeActive = false // Переменная для отслеживания темы

function toggleTheme() {
	darkThemeActive = !darkThemeActive
	document.body.classList.toggle('dark-theme', darkThemeActive) // Добавляем/удаляем класс dark-theme
	document.getElementById('themeToggleBtn').textContent = darkThemeActive
		? 'Светлая тема'
		: 'Тёмная тема' // Меняем текст кнопки

	// Сохранение состояния темы в localStorage (опционально)
	localStorage.setItem('darkTheme', darkThemeActive)
}

function deselectLesson() {
	// Снимаем выделение с урока
	document
		.querySelectorAll('.lesson.selected')
		.forEach(el => el.classList.remove('selected'))
	// Скрываем кнопки действий с анимацией
	document.querySelector('.lesson-actions').classList.remove('visible')
	selectedLessonDay = null
	selectedLessonNumber = null
}

document.addEventListener('DOMContentLoaded', () => {
	const storedTheme = localStorage.getItem('darkTheme')
	if (storedTheme === 'true') {
		darkThemeActive = true
		document.body.classList.add('dark-theme')
		document.getElementById('themeToggleBtn').textContent = 'Светлая тема'
	}
})

document.addEventListener('click', function (event) {
	const isLessonClicked = event.target.closest('.lesson')
	const isActionsClicked = event.target.closest('.lesson-actions')

	if (!isLessonClicked && !isActionsClicked) {
		// Клик был не по уроку и не по кнопкам действий
		deselectLesson()
	}
})

function selectLesson(day, lessonNumber, element) {
	// Снимаем выделение с ранее выделенных элементов (теперь через функцию deselectLesson)
	deselectLesson()

	// Выделяем текущий элемент
	element.classList.add('selected')

	selectedLessonDay = day
	selectedLessonNumber = lessonNumber

	// Показываем кнопки действий
	document.querySelector('.lesson-actions').style.display = 'flex'
	document.querySelector('.lesson-actions').classList.add('visible')
}

function editSelectedLesson() {
	if (selectedLessonDay && selectedLessonNumber) {
		// Заполняем поля ввода номером урока и текущим предметом (если есть)
		document.getElementById('daySelect').value = selectedLessonDay
		document.getElementById('lessonNumber').value = selectedLessonNumber

		let currentSubject =
			baseSchedule[selectedLessonDay][selectedLessonNumber - 1] || 'Нет урока'
		if (
			changes[selectedLessonDay] &&
			changes[selectedLessonDay][selectedLessonNumber]
		) {
			currentSubject = changes[selectedLessonDay][selectedLessonNumber]
		}
		document.getElementById('newSubject').value = currentSubject

		// Скрываем кнопки действий после начала редактирования (опционально)
		document.querySelector('.lesson-actions').style.display = 'none'

		// Снимаем выделение с урока (опционально)
		document
			.querySelectorAll('.lesson.selected')
			.forEach(el => el.classList.remove('selected'))
		selectedLessonDay = null
		selectedLessonNumber = null
	}
}

function clearSelectedLesson() {
	if (selectedLessonDay && selectedLessonNumber) {
		if (
			changes[selectedLessonDay] &&
			changes[selectedLessonDay][selectedLessonNumber]
		) {
			delete changes[selectedLessonDay][selectedLessonNumber]
			if (Object.keys(changes[selectedLessonDay]).length === 0) {
				delete changes[selectedLessonDay] // Удаляем день, если нет изменений
			}
			updateDisplay()
		}
		// Скрываем кнопки действий после очистки
		document.querySelector('.lesson-actions').style.display = 'none'
		// Снимаем выделение с урока
		document
			.querySelectorAll('.lesson.selected')
			.forEach(el => el.classList.remove('selected'))
		selectedLessonDay = null
		selectedLessonNumber = null
	}
}

function toggleShortMode() {
	shortMode = !shortMode
	document.getElementById('shortModeBtn').classList.toggle('active-mode')
	updateDisplay()
}

function abbreviateSubject(text) {
	if (!shortMode) return text

	for (const [full, short] of Object.entries(abbreviations)) {
		text = text.replace(full, short)
	}
	return text
}

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

	const matches = allSubjects.filter(subj => {
		const cleanSubj = subj.replace(/[^а-яё]/gi, '').toLowerCase()
		return cleanSubj.startsWith(input.replace(/[^а-яё]/gi, '').toLowerCase())
	})

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

	// Находим максимальное количество уроков (базовое + изменения)
	let maxLessons = baseSchedule[day].length
	if (changes[day]) {
		maxLessons = Math.max(maxLessons, ...Object.keys(changes[day]).map(Number))
	}

	for (let i = 1; i <= maxLessons; i++) {
		const lessonNumber = i
		const lessonDiv = document.createElement('div')
		lessonDiv.className = 'lesson'

		let lessonText = baseSchedule[day][lessonNumber - 1] || 'Нет урока' // Если урока нет в базе - ставим "Нет урока"

		// Проверяем наличие изменений
		if (changes[day] && changes[day][lessonNumber]) {
			lessonDiv.classList.add('changed')
			lessonText = changes[day][lessonNumber]
		}

		lessonDiv.textContent = `${lessonNumber}. ${abbreviateSubject(lessonText)}`

		// Добавляем обработчик клика для выбора урока
		lessonDiv.onclick = function () {
			selectLesson(day, lessonNumber, this)
		}

		scheduleDiv.appendChild(lessonDiv)
	}
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
			output.push(
				`${lessonNumber}. ${abbreviateSubject(changes[day][lessonNumber])}`
			)
		} else {
			output.push(abbreviateSubject(lesson))
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
