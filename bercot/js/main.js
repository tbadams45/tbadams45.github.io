// Handles all parsing of the input file, builds Theme objects that contain
// quotes for their particular Theme.
class InputFileParser {
	constructor() {
		this.themes = [];
	}

	file(fileContents) {
		// parse into individual entries
		if(fileContents[0] === "\n") {
			fileContents = fileContents.substring(1) // get rid of first 
		}
		var sliced = fileContents.trim().split("\n\n")

		for(var i = 0; i < sliced.length; i++) {
			var quotes = quote(sliced[i])
			for(var j = 0; j < quotes.length; j++) {
				pushQuote
			}
		}
	}

	// parses an entire quote
	quote(quote) {
		var firstLineBreak = quote.indexOf("\n")
		var references = quote.substring(0, firstLineBreak)
		quote = quote.substring(firstLineBreak)

		// proxy for determining if there wasn't a proper line break 
		// between two quotes
		if(quote.includes("{") || quote.includes("}")) {
			return undefined
		}

		var parsedQuotes = this.referenceLine(references)
		if(parsedQuotes === undefined) {
			return undefined
		}

		for(var i = 0; i < parsedQuotes.length; i++) {
			parsedQuotes.content = quote
		}

		return parsedQuotes
	}

	// the line that holds the references.
	// e.g. "{Rom 9:28: Rom 13:10; Isa 10:22-23}"
	referenceLine(str) {
		var references = []


		// Get content inside of curly braces. 
		// See https://stackoverflow.com/questions/5520880/getting-content-between-curly-braces-in-javascript-regex
		// for regex
		var match = /{(.*?)}/.exec(str)
		str = match[1] // actual result, without curly braces

		if(str.includes("{") || str.includes("}")) { 
			// curly braces may still exist in curly braces
			return undefined
		}

		str = str.trim(); // get rid of white space

		var referenceList = str.split(";")

		for(var i = 0; i < referenceList.length; i++) {
			var ref = this.reference(referenceList[i].trim())
			if(ref === undefined) {
				return undefined
			}
			references.push(ref)
		}

		return references
	}

	// Where a "reference" is, e.g. "1 Cor 14:5" or "Nicene Creed"
	reference(ref) {
		ref = ref.trim()

		var name = ""
		var chapter = ""
		var verseNumber = ""
		var verseText = ""

		for(var i = 0; i < bibleBooks.books.length; i++) {
			if(ref.includes(bibleBooks.books[i].abbreviation)) {
				var len = bibleBooks.books[i].abbreviation.length

				var chapterVerse = ref.substring(len).trim()
				chapterVerse = chapterVerse.split(":")
				if(chapterVerse.length > 2) { // two or more colons in reference
					return undefined
				}
			
				var chapter = Number(chapterVerse[0].trim())
				var verseText = chapterVerse[1].trim()
			
				// find verseNumber
				var vInfo = this.verse(verseText)

				return new Quote(
					bibleBooks.books[i].abbreviation, 
					bibleBooks.books[i].name, 
					chapter, 
					vInfo.verseNumber, 
					verseText)
			}
		}

		// it's not a book, but the name of a topic.
		// So just create a Quote with that name.
		return new Quote(ref.trim(), ref.trim(), null, null, null)
	}

	// a "verse" might be, for instance "15-16", "3", "3-5, 9-20, 15"
	verse(verseText) {
		var verseNumber;

		var onComma = verseText.indexOf(",")
		var onHyphen = verseText.indexOf("-")
		
		var higher = onComma > onHyphen ? onComma : onHyphen
		var lower  = onComma < onHyphen ? onComma : onHyphen

		if(higher === -1) { // neither "-"" nor ","" is present 
			verseNumber = Number(verseText.trim())
		}
		else if (lower !== -1) { // both exist
			verseNumber = Number(verseText.substring(0, lower).trim())
		} 
		else { // only one exists
			verseNumber = Number(verseText.substring(0, higher).trim())
		}

		return {
			verseNumber : verseNumber,
			verseText : verseText
		}
	}
}

// theme might be a book (e.g. Genesis) or a topic (e.g. Nonresistance)
class Theme {
	constructor(abbreviation, name) {
		this.abbreviation = abbreviation
		this.name = name
		this.quotes = []
	}

	pushQuote(quote) {
		this.quotes.push(quote)
	}

	// sort quotes array in order of chapter and then verseNumber
	sortQuotes() {
		if(!bibleBooks.containsAbbreviation(this.abbreviation)) {
			// it's a topic, and we can't sort topics on chapters/verses 
			// because they don't have any.
			return
		}
		// see MDN documentation on array.sort()
		this.quotes.sort(function(a, b) {
			if(a.chapter < b.chapter) {
				return -1;
			}
			else if(a.chapter > b.chapter) {
				return 1;
			}
			else { // chapters equal
				if(a.verseNumber <= b.verseNumber) {
					return -1;
				}
				else {
					return 1;
				}
			}
		})
	}

	// generates markdown text used to write Theme file
	generateOutputText() {

	}
}

class ThemeArray {
	constructor() {
		this.array = []
	}

	indexOfTheme(abbreviation) {
		for(var i = 0; i < this.array.length; i++) {
			if(this.array[i].abbreviation === abbreviation) {
				return i
			}
		}
		return -1
	}

	// automatically adds theme if needed
	addQuote(quote) {
		var index = this.indexOfTheme(abbreviation)

		if(index === -1) {
			// theme doesn't currently exist
			var theme = new Theme(quote.abbreviation, quote.name)
			theme.pushQuote(quote)
			this.array.push(theme)
		}
		else {
			// theme exists
			this.array[index].pushQuote(quote)
		}
	}

	sortEachTheme() {
		for(var i = 0; i < this.array.length; i++) {
			this.array[i].sortQuotes()
		}
	}
}


class Quote {
	constructor(abbreviation, name, chapter, verseNumber, verseText) {
		this.name = name
		this.abbreviation = abbreviation
		this.chapter = chapter
		this.verseNumber = verseNumber
		this.verseText = verseText
		this.content = null
	}

	setContent(content) {
		this.content = content
	}

	// generates markdown text used to write Quote to file
	generateOutputText() {

	}
}

class BibleBooks {
	constructor() {
		this.books = [
			{abbreviation: "Gen", name: "Genesis"},
			{abbreviation: "Ex", name: "Exodus"},
			{abbreviation: "Lev", name: "Leviticus"},
			{abbreviation: "Num", name: "Numbers"},
			{abbreviation: "Deut", name: "Deuteronomy"},
			{abbreviation: "Josh", name: "Joshua"},
			{abbreviation: "Judg", name: "Judges"},
			{abbreviation: "Ruth", name: "Ruth"},
			{abbreviation: "1 Sam", name: "1 Samuel"},
			{abbreviation: "2 Sam", name: "2 Samuel"},
			{abbreviation: "1 Kings", name: "1 Kings"},
			{abbreviation: "2 Kings", name: "2 Kings"},
			{abbreviation: "1 Chr", name: "1 Chronicles"},
			{abbreviation: "2 Chr", name: "2 Chronicles"},
			{abbreviation: "Ezra", name: "Ezra"},
			{abbreviation: "Neh", name: "Nehemiah"},
			{abbreviation: "Tob", name: "Tobit"},
			{abbreviation: "Jdt", name: "Judith"},
			{abbreviation: "Esth 1", name: "Esther"},
			{abbreviation: "1 Macc", name: "Maccabees"},
			{abbreviation: "2 Macc", name: "2 Maccabees"},
			{abbreviation: "Job", name: "Job"},
			{abbreviation: "Ps", name: "Psalms"},
			{abbreviation: "Prov", name: "Proverbs"},
			{abbreviation: "Eccl", name: "Ecclesiates"},
			{abbreviation: "Song", name: "Song of Solomon"},
			{abbreviation: "Cant", name: "Canticles"},
			{abbreviation: "Wis", name: "Wisdom"},
			{abbreviation: "Sir", name: "Sirach"},
			{abbreviation: "Isa", name: "Isaiah"},
			{abbreviation: "Jer", name: "Jeremiah"},
			{abbreviation: "Lam", name: "Lamentations"},
			{abbreviation: "Bar", name: "Baruch"},
			{abbreviation: "Ezek", name: "Ezekiel"},
			{abbreviation: "Dan", name: "Daniel"},
			{abbreviation: "Hos", name: "Hosea"},
			{abbreviation: "Joel", name: "Joel"},
			{abbreviation: "Am", name: "Amos"},
			{abbreviation: "Jon", name: "Jonah"},
			{abbreviation: "Mic", name: "Micah"},
			{abbreviation: "Nah", name: "Nahum"},
			{abbreviation: "Hab", name: "Habakkuk"},
			{abbreviation: "Zeph", name: "Zephaniah"},
			{abbreviation: "Hag", name: "Haggai"},
			{abbreviation: "Zech", name: "Zechariah"},
			{abbreviation: "Mal", name: "Malachi"},
			{abbreviation: "Mt", name: "Matthew"},
			{abbreviation: "Mk", name: "Mark"},
			{abbreviation: "Lk", name: "Luke"},
			{abbreviation: "Jn", name: "John"},
			{abbreviation: "Acts", name: "Acts of the Apostles"},
			{abbreviation: "Rom", name: "Romans"},
			{abbreviation: "1 Cor", name: "1 Corinthians"},
			{abbreviation: "2 Cor", name: "2 Corinthians"},
			{abbreviation: "Gal", name: "Galatians"},
			{abbreviation: "Eph", name: "Ephesians"},
			{abbreviation: "Phil", name: "Philippians"},
			{abbreviation: "Col", name: "Colossians"},
			{abbreviation: "1 Thess", name: "1 Thessalonians"},
			{abbreviation: "2 Thess", name: "2 Thessalonians"},
			{abbreviation: "1 Tim", name: "1 Timothy"},
			{abbreviation: "2 Tim", name: "2 Timothy"},
			{abbreviation: "Tit", name: "Titus"},
			{abbreviation: "Philemon", name: "Philemon"},
			{abbreviation: "Heb", name: "Hebrews"},
			{abbreviation: "Jas", name: "James"},
			{abbreviation: "1 Pet", name: "1 Peter"},
			{abbreviation: "2 Pet", name: "2 Peter"},
			{abbreviation: "1 Jn", name: "1 John"},
			{abbreviation: "2 Jn", name: "2 John"},
			{abbreviation: "3 Jn", name: "3 John"},
			{abbreviation: "Jude", name: "Jude"},
			{abbreviation: "Rev", name: "Revelation"}
		]
	}

	containsAbbreviation(abbr) {
		for(var i = 0; i < this.books.length; i++) {
			if(this.books[i].abbreviation === abbr) {
				return true
			}
		}
		return false
	}

	containsName(name) {
		for(var i = 0; i < this.books.length; i++) {
			if(this.books[i].name === name) {
				return true
			}
		}
		return false
	}
}

const bibleBooks = new BibleBooks()

function handleFileUpload() {
	var fileReader = new FileReader()
	var parse = new InputFileParser()

	fileReader.onload = function(file) {
		var text = file.target.result
		parse.file(text)

	}

	var files = document.getElementById("files").files

	for(var i = 0; i < files.length; i++) {

		// calls fileReader.onload() when done
		fileReader.readAsText(files[i])
	}

	console.log(files)
}

module.exports = {
	InputFileParser : InputFileParser,
	Theme           : Theme,
	ThemeArray      : ThemeArray,
	bibleBooks      : bibleBooks,
	Quote           : Quote,
}