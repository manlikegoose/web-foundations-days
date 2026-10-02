let notes = [
{ id: 1, text: "Buy milk and bread", category: "personal" },
{ id: 2, text: "Finish the Day 3 assignment", category: "study" },
{ id: 3, text: "Email the project report to Grace", category: "work" },
{ id: 4, text: "Revise JavaScript arrays", category: "study" },
{ id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
return notes.filter(note =>
note.text.toLowerCase().includes(word.toLowerCase())
);
}

console.log(searchNotes("day")); // Expected: [{ id: 2, text: "Finish the Day 3 assignment", category: "study" }]
console.log(searchNotes("pizza")); // Expected: []

function longestNote() {
if (notes.length === 0) {
return null;
}


let longest = notes[0];

for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
        longest = notes[i];
    }
}

return longest;


}

console.log(longestNote()); // Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
console.log((() => {
let originalNotes = notes;
notes = [];
let result = longestNote();
notes = originalNotes;
return result;
})()); // Expected: null

function countByCategory() {
let counts = {};


for (let note of notes) {
    if (counts[note.category]) {
        counts[note.category]++;
    } else {
        counts[note.category] = 1;
    }
}

return counts;


}

console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }
console.log((() => {
let originalNotes = notes;
notes = [];
let result = countByCategory();
notes = originalNotes;
return result;
})()); // Expected: {}

function getSummary() {
let counts = countByCategory();
let total = notes.length;
let noteWord = total === 1 ? "note" : "notes";


return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;

}

console.log(getSummary()); // Expected: 5 notes: 2 personal, 1 work, 2 study.
console.log((() => {
let originalNotes = notes;
notes = [];
let result = getSummary();
notes = originalNotes;
return result;
})()); // Expected: 0 notes: 0 personal, 0 work, 0 study.

function isDuplicate(text) {
let searchText = text.trim().toLowerCase();


return notes.some(note =>
    note.text.trim().toLowerCase() === searchText
);


}

console.log(isDuplicate("  Call mum  ")); // Expected: true
console.log(isDuplicate("Buy eggs")); // Expected: false

function addNote(text, category) {
let trimmedText = text.trim();
let validCategories = ["personal", "work", "study"];


if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log("Note was not added: text must be between 1 and 200 characters.");
    return false;
}

if (isDuplicate(trimmedText)) {
    console.log("Note was not added: duplicate note.");
    return false;
}

if (!validCategories.includes(category)) {
    console.log("Note was not added: invalid category.");
    return false;
}

let newId = notes.length > 0
    ? Math.max(...notes.map(note => note.id)) + 1
    : 1;

notes.push({
    id: newId,
    text: trimmedText,
    category: category
});

console.log("Note added successfully.");
return true;


}

console.log(addNote("Complete JavaScript practice", "study")); // Expected: true
console.log(addNote("Call mum", "personal")); // Expected: false (duplicate note)
