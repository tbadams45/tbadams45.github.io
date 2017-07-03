var main = require("../js/main.js")
var chai = require('chai')
var shouldArrays = require('chai-arrays')
chai.use(shouldArrays)
var expect = chai.expect //actually call the function;

describe("InputFileParser Class", function() {
	var parse = new main.InputFileParser()

	describe("referenceLine() basics", function() {
		it("should be of type arrray", function() {
			var result = parse.referenceLine("{2 Cor 7:1; Lk 11:39; Mt 15:16-20; Mt 5:8}")
			expect(result).to.be.array()
		})
		it("should handle hyphens", function() {
			var result = parse.referenceLine("{2 Cor 7:1; Lk 11:39; Mt 15:16-20; Mt 5:8}")
			expect(result[2].chapter).to.equal(15)
			expect(result[2].verseNumber).to.equal(16)
			expect(result[2].verseText).to.equal("16-20")
		})
		it("should handle commas in verse", function() {
			var commas = "{Rom 4:3, 9, 22, 23; Gen 15:6; Gal 3:6; Jas 2:23}"
			commas = parse.referenceLine(commas)

			expect(commas.length).to.equal(4)
			expect(commas[0]).to.deep.equal(
				new main.Quote("Rom", "Romans", 4, 3, "3, 9, 22, 23"))
		})
		it("should handle commas AND hyphens in same list", function() {
			var both = "{Gen 18:2, 23-33; Gen 19:1}"
			both = parse.referenceLine(both)

			expect(both.length).to.equal(2)
			expect(both[0]).to.deep.equal(
				new main.Quote("Gen", "Genesis", 18, 2, "2, 23-33"))
		})
		it("should remove junk outside of curly braces", function() {
			var king = " hi }{2 Kings 17:4}}}{ ???"
			king = parse.referenceLine(king)

			expect(king.length).to.equal(1)
			expect(king[0]).to.deep.equal(
				new main.Quote("2 Kings", "2 Kings", 17, 4, "4"))
		})
		it("should handle topics", function() {
			var creed1 = "{Apostles Creed}"
			creed1 = parse.referenceLine(creed1)

			expect(creed1[0]).to.deep.equal(
				new main.Quote("Apostles Creed", "Apostles Creed", null, null, null))

			var creed2 = "{Nicene Creed; 1 Tim 6:16; Ps 45:6; Heb 1:8}"
			creed2 = parse.referenceLine(creed2)


			expect(creed2[0]).to.deep.equal(
			new main.Quote("Nicene Creed", "Nicene Creed", null, null, null))
		})
		it("should handle unexpected spaces in curly braces", function() {
			var space = "{   Acts 7: 44  ;   Heb   8: 5 ; Heb   9: 23-24; Num 9:15; Num 17:7  }"
			space = parse.referenceLine(space)

			expect(space.length).to.equal(5)
			expect(space[0]).to.deep.equal(
				new main.Quote("Acts", "Acts of the Apostles", 7, 44, "44"))

			expect(space[1]).to.deep.equal(
				new main.Quote("Heb", "Hebrews", 8, 5, "5"))

			expect(space[2]).to.deep.equal(
				new main.Quote("Heb", "Hebrews", 9, 23, "23-24"))

			expect(space[3]).to.deep.equal(
				new main.Quote("Num", "Numbers", 9, 15, "15"))

			expect(space[4]).to.deep.equal(
				new main.Quote("Num", "Numbers", 17, 7, "7"))

		})
		it("should handle one chapter books", function() {
			var john = "{3 Jn 4}"
			john = parse.referenceLine(john)

			expect(john.length).to.equal(1)
			expect(john[0]).to.deep.equal(
				new main.Quote("3 Jn", "3 John", 0, 4, "4"))
		})
	})

	describe("referenceLine() error handling", function() {
		it("should return undefined when two colons are in the same reference", function() {
			var mismatch = "{Rom 9:28: Rom 13:10; Isa 10:22-23}"
			mismatch = parse.referenceLine(mismatch)

			expect(mismatch).to.equal(undefined)
		})
		it("should return undefined when curly braces are in our curly braces", function() {
			var king = "{{2 Kings 17:4}"
			king = parse.referenceLine(king)

			expect(king).to.equal(undefined)
		})
	})

	describe("quote() basics", function() {
		it("should populate the quote.content property", function() {
			var qt = "{1 Tim 1:3-15; 2 Tim 2:4}\nintense quote!"
			var result = parse.quote(qt)
			expect(result[0]).to.deep.equal(
				new main.Quote("1 Tim", "1 Timothy", 1, 3, "3-15"))

			expect(result[1]).to.deep.equal(
				new main.Quote("2 Tim", "2 Timothy", 2, 4, "4"))
		})

		it("should return an array", function() {
			var qt = "{1 Tim 1:3; 2 Tim 2:4}\nintense quote!"
			var result = parse.quote(qt)
			expect(result).to.be.array()
			expect(result).to.be.ofSize(2)
		})
	})

	// quote will handle the entire quote, including references
	// return a Quote with content set.
	// or tells the user that it doesn't work (if referencelist is undefined) for some reason and moves on
	// maybe also helpful to test i it's a bad quote (e.g. if maybe the user didn't put two new lines between quotes)
	describe("quote() error handling", function() {
		it("should return undefined if curly braces are in quote body", function() {
			var qt1 = "{2 Cor 7:4}\nThis is content{"
			var qt2 = "{Gen 7:4}\nThis is content}"

			var result1 = parse.quote(qt1)
			expect(result1).to.equal(undefined)

			var result2 = parse.quote(qt2)
			expect(result2).to.equal(undefined)
		})
		it("should return undefined if referenceLine returns undefined", function() {
			var bad = "{2 Cor 7:4: Rom 15:3}"
			var result = parse.quote(bad)
			expect(result).to.equal(undefined)
		})
	})

/*	describe("file()", function() {

	})*/
})


describe("Theme Class", function() {
	describe("pushQuote()", function() {
		var theme = new main.Theme("2 Cor", "2 Corinthians")
		var quote = new main.Quote("2 Cor", "2 Corinthians", 1, 13, "13-16")
		quote.setContent("this is example content\non two lines")
		theme.pushQuote(quote)

		it("should have length one", function() {
			expect(theme.quotes.length).to.equal(1)
		})
		it("should leave the quote unchanged", function() {
			expect(theme.quotes[0]).to.deep.equal(quote)
		})
	})

	describe("sortQuotes()", function() {
		it("should leave topic themes unchanged", function () {
			var theme = new main.Theme("Nicene Creed", "Nicene Creed")

			var quote1 = new main.Quote("Nicene Creed", "Nicene Creed", null, null, null)
			quote1.setContent("Content for quote 1")
			var quote2 = new main.Quote("Nicene Creed", "Nicene Creed", null, null, null)
			quote2.setContent("Content for quote 2")

			theme.pushQuote(quote1)
			theme.pushQuote(quote2)
			theme.sortQuotes()

			expect(theme.quotes[0]).to.deep.equal(quote1)
			expect(theme.quotes[1]).to.deep.equal(quote2)

			var themeReversed = new main.Theme("Nicene Creed", "Nicene Creed")
			themeReversed.pushQuote(quote2)
			themeReversed.pushQuote(quote1)
			themeReversed.sortQuotes()

			expect(themeReversed.quotes[0]).to.deep.equal(quote2)
			expect(themeReversed.quotes[1]).to.deep.equal(quote1)
		})
		it("should sort by chapter first", function() {
			var theme = new main.Theme("Gen", "Genesis")
			var quote1 = new main.Quote("Gen", "Genesis", 4, 2, "2-3")
			var quote2 = new main.Quote("Gen", "Genesis", 2, 5, "5")

			theme.pushQuote(quote1)
			theme.pushQuote(quote2)
			theme.sortQuotes()

			expect(theme.quotes[0]).to.deep.equal(quote2)
			expect(theme.quotes[1]).to.deep.equal(quote1)
		})
		it("should sort by verse if chapters are equal", function() {
			var theme = new main.Theme("Ex", "Exodus")
			var quote1 = new main.Quote("Ex", "Exodus", 2, 5, "2-3")
			var quote2 = new main.Quote("Ex", "Exodus", 2, 2, "5")

			theme.pushQuote(quote1)
			theme.pushQuote(quote2)
			theme.sortQuotes()

			expect(theme.quotes[0]).to.deep.equal(quote2)
			expect(theme.quotes[1]).to.deep.equal(quote1)
		})
	})
})

describe("ThemeArray Class", function() {
	describe("indexOfTheme()", function() {
		it("should return -1 if theme doesn't exist", function() {
			var arr = new main.ThemeArray()
			var result = arr.indexOfTheme("Gen")

			expect(result).to.equal(-1)
		})
		it("should return index if theme exists", function() {
			var arr = new main.ThemeArray()
			arr.array[0] = new main.Theme("2 Cor", "2 Corinthians")
			arr.array[1] = new main.Theme("Gal", "Galatians")
			var result = arr.indexOfTheme("2 Cor")
			expect(result).to.equal(0)

			var result = arr.indexOfTheme("Gal")
			expect(result).to.equal(1)
		})
	})
})