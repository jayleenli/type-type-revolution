//Put the whole text in the textAreaField into a giant array
var words;
populateWords();

function populateWords()
{
	var wordsString = document.getElementById("generated-text").innerHTML;
	//console.log(wordsString);
	words = wordsString.split(" ");
	words = words.slice(8,words.length); //weird 8 blanks in beginning
	word_index = 0;
	//console.log(words);

	var innerHTMLString = "";
	for (var i = 1; i < words.length; i++)
	{
		innerHTMLString += "<span id =\"word-" + i + "\">" + words[i-1] + " </span><span></span>";
	}
	//console.log(innerHTMLString);
	document.getElementById("generated-text").innerHTML = innerHTMLString;
}


//Check the typing text field for typing
document.getElementById("user-text").addEventListener('keypress', function checkKeyPress(e) {

	if (e.keyCode == 32 || e.keyCode == 13) //space
	{
		//console.log(word_index);
		e.preventDefault();
		currentWord = words[word_index];
		var id = "word-" + (word_index+1); 
		//console.log(id);
		//console.log(currentWord);

		if (document.getElementById("user-text").value === currentWord) 
		{
			//make the word red
			document.getElementById(id).className = "highlight-green";
			//console.log("match");
		}
		else if (document.getElementById("user-text").value !== currentWord)
		{
			//make the word green
			document.getElementById(id).className = "highlight-red";
			//console.log("no");
		}

		//reset the field
		word_index++;
		document.getElementById("user-text").value = "";
	}
});