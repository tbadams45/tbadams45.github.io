
// key is abbreviationeviation, if applicable
// value is 
var books = [
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
	{abbreviation: "Ezek", name: "Ezekial"},
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
];

function handleFileUpload() {
	var fileReader = new FileReader();

	fileReader.onload = function(file) {
		var text = file.target.result;
		parseFile(text);

	};

	var files = document.getElementById("files").files;

	for(var i = 0; i < files.length; i++) {

		// calls fileReader.onload() when done
		fileReader.readAsText(files[i]); 
	}

	console.log(files.length);

	console.log("hello");
}

function containsAbbreviation(arr, abbr) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i].abbreviation === abbr) {
			return true;
		}
	}
	return false;
}

function parseFile(fileContents) {

	// parse into individual entries
	if(fileContents[0] === "\n") {
		fileContents = fileContents.substring(1); // get rid of first 
	}
	var sliced = fileContents.split("\n\n");
}

// Where a "reference" is, e.g. "1 Cor 14:5"
// Also possible:
//	"Jude 19"
// 	"Nicene Creed"
//  "Gen 2:3,5,9"
//  "Gen 2:3, 5, 9"
//  "Mt 15:13-19"
//
function parseReference(reference) {
	var abbreviation = "";
	var chapter = "";
	var verse = "";

	for(var i = 0; i < books.length; i++) {
		if(reference.includes(books[i].abbreviation)) {
			var len = books[i].abbreviation.length;
			abbreviation = reference.substring(0, len).trim();
			chapterVerse = reference.substring(reference.length-len+1);
			chapterVerse = chapterVerse.split(":");
			chapter = Number(chapterVerse[0].trim());
			verse = Number(chapterVerse[1].trim()); // can't handle verse ranges - need to think about how we handle those, and multiple chapters
			break;
		}
	}

	return {
		abbreviation: abbreviation, 
		chapter: chapter, 
		verse: verse
	};
}

// Need to be able to handle errors, and return that information back to 
// the user so they know what to do about it and where to go. 


// Where a reference list is, e.g., "{2 Cor 7:1; Lk 11:39; Mt 15:16-20; Mt 5:8}"
// Could also have stray "}" or "{", or have random stuff after the "}" (such as "???")
function parseReferenceLine(referenceList) {
	var references = [];

	// trim "{" and "}" off
	referenceList = referenceList.slice(1);
	referenceList = referenceList.slice(0, -1);

	referenceList = referenceList.split("; ");

	for(var i = 0; i < referenceList.length; i++) {
		references.push(parseReference(referenceList[i]));
	}

	return references;
}