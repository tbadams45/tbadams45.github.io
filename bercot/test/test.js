var main = require("../js/main.js")
var chai = require('chai')
var shouldArrays = require('chai-arrays')
chai.use(shouldArrays)
var expect = chai.expect //actually call the function;

describe("InputFileParser", function() {
	var parse = new main.InputFileParser()

	describe("referenceLine()", function() {
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
				new main.Quote("Romans", "Rom", 4, 3, "3, 9, 22, 23"))
		})
		it("should handle commas AND hyphens", function() {
			var both = "{Gen 18:2, 23-33; Gen 19:1}"
			both = parse.referenceLine(both)

			expect(both.length).to.equal(2)
			expect(both[0]).to.deep.equal(
				new main.Quote("Genesis", "Gen", 18, 2, "2, 23-33"))
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
				new main.Quote("Acts of the Apostles", "Acts", 7, 44, "44"))

			expect(space[1]).to.deep.equal(
				new main.Quote("Hebrews", "Heb", 8, 5, "5"))

			expect(space[2]).to.deep.equal(
				new main.Quote("Hebrews", "Heb", 9, 23, "23-24"))

			expect(space[3]).to.deep.equal(
				new main.Quote("Numbers", "Num", 9, 15, "15"))

			expect(space[4]).to.deep.equal(
				new main.Quote("Numbers", "Num", 17, 7, "7"))

		})
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

	// quote will handle the entire quote, including references
	// return a Quote with content set.
	// or tells the user that it doesn't work (if referencelist is undefined) for some reason and moves on
	// maybe also helpful to test i it's a bad quote (e.g. if maybe the user didn't put two new lines between quotes)
	describe("quote", function() {

	})
})