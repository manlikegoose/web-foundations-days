const input = document.querySelector('#note-text')
const charCount = document.querySelector('#char-count')
const wordCount = document.querySelector('#word-count')
const clearButton = document.querySelector('#clear-btn')
const themeToggle = document.querySelector('#theme-toggle')

function updateCounts() {
    const text = input.value
    const characters = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0

    charCount.textContent = `${characters} / 200 characters`
    wordCount.textContent = `${words} words`

    charCount.classList.remove('warning', 'over')

    if (characters > 200) {
        charCount.classList.add('over')
    } else if (characters > 180) {
        charCount.classList.add('warning')
    }
}

input.addEventListener('input', () => {
    updateCounts()

    localStorage.setItem('draft', JSON.stringify({
        text: input.value
    }))
})

const savedDraft = localStorage.getItem('draft')

if (savedDraft) {
    const draft = JSON.parse(savedDraft)
    input.value = draft.text
}

const savedTheme = localStorage.getItem('theme')

if (savedTheme === 'dark') {
    document.body.classList.add('dark')
    themeToggle.textContent = 'Light mode'
} else {
    themeToggle.textContent = 'Dark mode'
}

updateCounts()

function clearEverything() {
    input.value = ''
    localStorage.removeItem('draft')
    updateCounts()
}

clearButton.addEventListener('click', clearEverything)

input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        clearEverything()
    }
})

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark')

    if (document.body.classList.contains('dark')) {
        themeToggle.textContent = 'Light mode'
        localStorage.setItem('theme', 'dark')
    } else {
        themeToggle.textContent = 'Dark mode'
        localStorage.setItem('theme', 'light')
    }
})