// Handles all parsing of the input file, builds Theme objects that contain
// quotes for their particular Theme.
class InputFileParser {
	constructor() {
		this.themes = [];
	}

	file(fileContents) {
		var themes = new ThemeArray()
		// parse into individual entries
		if(fileContents[0] === "\n") {
			fileContents = fileContents.substring(1) // get rid of first 
		}
		var sliced = fileContents.trim().split("\n\n")

		for(var i = 0; i < sliced.length; i++) {
			var quotes = this.quote(sliced[i].trim())
			if(quotes === undefined) {
				console.log("I had some trouble understanding this one:\n", sliced[i])
				console.log("Moving on")
			} 
			else {
				for(var j = 0; j < quotes.length; j++) {
					themes.addQuote(quotes[j])
				}
			}
		}

		themes.sortEachTheme()
		themes.sortThemeArray()

		return themes
	}

	// parses an entire quote (may have multiple references)
	quote(quote) {
		var firstLineBreak = quote.indexOf("\n")
		var references = quote.substring(0, firstLineBreak)
		var quoteContent = quote.substring(firstLineBreak).trim()

		// proxy for determining if there wasn't a proper line break 
		// between two quotes
		if(quoteContent.includes("{") || quoteContent.includes("}")) {
			return undefined
		}

		var parsedQuotes = this.referenceLine(references)
		if(parsedQuotes === undefined) {
			return undefined
		}

		for(var i = 0; i < parsedQuotes.length; i++) {
			parsedQuotes[i].setContent(quoteContent)
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
			var abbr = bibleBooks.books[i].abbreviation

			if(ref.indexOf(abbr) === 0) {
				var len = bibleBooks.books[i].abbreviation.length

				var chapterVerse = ref.substring(len).trim() // cut off abbreviation

				var numColons = chapterVerse.split(":").length - 1
				
				if(numColons === 0) {
					// no colons. this means we're dealing with a one chapter book
					var vInfo = this.verse(chapterVerse)
					return new Quote(
						bibleBooks.books[i].abbreviation,
						bibleBooks.books[i].name,
						1,
						vInfo.verseNumber,
						vInfo.verseText)
				} 
				else if (numColons > 1) {
					// invalid; we don't know how to deal with two or more colons
					return undefined
				} 
				else {
					chapterVerse = chapterVerse.split(":")
			
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
				return -1
			}
			else if(a.chapter > b.chapter) {
				return 1
			}
			else { // chapters equal
				if(a.verseNumber < b.verseNumber) {
					return -1
				}
				else if(a.verseNumber > b.verseNumber) {
					return 1
				}
				else {
					// chapters AND verses are equal.
					// sort by author
					var authorA = a.findAuthor()
					var authorB = b.findAuthor()
					return anf.compare(authorA, authorB)
				}
			}
		})
	}

	// generates markdown text used to write Theme file
	generateOutputText() {
		var docDefinition = {
			content: [],
			styles: {
				reference: {
					fontSize: 12,
					bold: true
				},
				body: { 
					fontSize: 11
				}
			}
		}

		for(var i = 0; i < this.quotes.length; i++) {
			var quoteOutput = this.quotes[i].generateOutputText()
			docDefinition.content = docDefinition.content.concat(quoteOutput)
		}

		return docDefinition
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
		var index = this.indexOfTheme(quote.abbreviation)

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

	sortThemeArray() {
		// see MDN documentation on array.sort
		this.array.sort(function(a, b) {
			var aBibIndex = bibleBooks.indexOfAbbrevation(a.abbreviation)
			var bBibIndex = bibleBooks.indexOfAbbrevation(b.abbreviation)

			if(aBibIndex === -1) { // a is a topic
				return 1
			}
			else if(bBibIndex === -1) { // b is a topic and a is not 
				return -1
			} 
			else if(aBibIndex <= bBibIndex){
				return -1
			} 
			else {
				return 1
			}
		})
	}

	generateOutputText() {
		var results = []

		for(var i = 0; i < this.array.length; i++) {
			var themeOutput = this.array[i].generateOutputText()
			results.push(themeOutput)
		}

		return results
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
		var referenceText = this.getReferenceText()
		if(this.findAuthor() !== undefined) {
			referenceText = referenceText + " (" + this.findAuthor() + ")"
		}
		
		var bodyText = this.content + "\n\n"

		var reference = {
			text: referenceText,
			style: "reference"
		}

		var body = {
			text: bodyText,
			style: "body"
		}

		return [reference, body]
	}

	findAuthor() {
		var author = undefined
		var authorIndex = -1

		for(var i = 0; i < anf.fathers.length; i++) {
			var index = this.content.indexOf(anf.fathers[i])
			if(index > authorIndex) {
				authorIndex = index
				author = anf.fathers[i]
			}
		}

		return author
	}

	getReferenceText() {
		var referenceText = ""
		
		if(this.chapter === null || this.verseText === null) {
			// quote is regarding a topic (e.g. "Nicene Creed")
			referenceText = this.name
		}
		else {
			// quote is regarding a book of the Bible
			referenceText = this.name + " " + this.chapter + ":" + this.verseText
		}

		return referenceText
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

	indexOfAbbrevation(abbr) {
		for(var i = 0; i < this.books.length; i++) {
			if(this.books[i].abbreviation === abbr) {
				return i
			}
		}
		return -1
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

class AnteNiceneFathers {
	constructor() {
		this.fathers = [
			"Didache",
			"Clement of Rome",
			"Ignatius of Antioch",
			"Epistle of Barnabas",
			"2 Clement",
			"Fragments of Papias",
			"Quadratus of Athens",
			"Aristides",
			"The Shepherd of Hermas",
			"Polycarp",
			"The Martyrdom of Polycarp",
			"Epistle to Diognetus",
			"Justin Martyr",
			"Claudius Apollinaris",
			"Melito of Sardis",
			"Hegesippus",
			"Athenagoras of Athens",
			"Irenaeus of Lyons",
			"Theophilus of Antioch",
			"Polycrates of Ephesus",
			"Clement of Alexandria",
			"Tertullian",
			"Minucius Felix",
			"Serapion of Antioch",
			"Apollonius",
			"Caius",
			"Hippolytus of Rome",
			"Origen",
			"Cyprian"
		]
	}

	// returns -1 if author a comes before b, 0 if equal, and 1 if b comes before a
	// if only a does not exist but b does, then return 1.
	// if only b does not exist but a does, then return -1
	compare(a, b) {
		var indexA = this.fathers.indexOf(a)
		var indexB = this.fathers.indexOf(b)

		if(indexA === -1 && indexB !== -1) {
			return 1
		} 
		else if(indexA !== -1 && indexB === -1) {
			return -1
		}
		else if(indexA < indexB) {
			return -1
		} 
		else if(indexA === indexB) {
			return 0
		} 
		else {
			return 1
		}
	}
}

const bibleBooks = new BibleBooks()
const anf = new AnteNiceneFathers()

function handleFileUpload() {
	var fileReader = new FileReader()
	var parse = new InputFileParser()

	fileReader.onload = function(file) {
		var text = file.target.result
		var themes = parse.file(text)
		console.log(themes)
		var pdfs = []

		// generate pdfs
		for(var i = 0; i < themes.array.length; i++) {
			var docDefinition = themes.array[i].generateOutputText()
			var pdf = pdfMake.createPdf(docDefinition)

			pdfs.push({name: themes.array[i].name, content: Promise.promisifyAll(pdf)})
		}

		var zip = new JSZip()

		console.log(pdfs[0])

		zipPdfs(0, themes.array.length, zip, pdfs)

		/*// save PDFs... in loop? Dunno how to do this asynchronously
    	pdfs[0].content.getBuffer(function(buffer) {
	    	zip.file(pdfs[0].anme, buffer)

	    	zip.generateAsync({type: "blob"}).then(function(blob) {
	    		saveAs(blob, "hello.zip") // from FileSaver.js
	    	})
    	})*/

	}

	var files = document.getElementById("files").files
	for(var i = 0; i < files.length; i++) {
		// calls fileReader.onload() when done
		fileReader.readAsText(files[i])
	}
}

// iterates over async calls
function zipPdfs(i, max, zip, pdfs) {
	if(i < max) {
		pdfs[i].content.getBuffer(function(buffer) {
			zip.file(pdfs[i].name+".pdf", buffer)
			zipPdfs(i + 1, max, zip, pdfs)
		})
	} else {
		zip.generateAsync({type: "blob"}).then(function(blob) {
			saveAs(blob, "study-bible-help.zip")
		})
	}
}

module.exports = {
	InputFileParser   : InputFileParser,
	Theme             : Theme,
	ThemeArray        : ThemeArray,
	bibleBooks        : bibleBooks,
	AnteNiceneFathers : AnteNiceneFathers,
	Quote             : Quote,
}