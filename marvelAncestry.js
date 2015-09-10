// %%%%%%%%%%%%%%%%%%%%%%%%%% begin JS notes
// 1) get birthdate from user (that's a range, ideally)
// 2) use birthday to access marvel API for comics sold on that day
// 3) return the first 4 or something like that character names
// 4) link those names to description URLS
// 5) 
// %%%%%%%%%%%%%%%%%%%%%%%%%% end JS notes

var latveria = {};

//primary API
latveria.myApi 					= '3bfdbc625fb1b18126abd87d3894d2d4'; 
// backup api
// latveria.myApi					= 'aba7a41eec8c1077392a4631681a7b73'; 
//end backup api
latveria.comicUrl 				= 'http://gateway.marvel.com/v1/public/comics';
latveria.comicCharactersUrl		= 'http://gateway.marvel.com/v1/public/characters';
// %%%%%%%%%%%%%%%%%%%%%%%%%% CV stuff
latveria.cvApi					= 'fcbfe62dae6df2e5cbe7cd002a7e5fd4df1a961e';
latveria.cvURLCharacters		= 'www.comicvine.com/api/characters';
latveria.realName				= "";

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% listeners

latveria.takeDate = function(){//takes user input and shoves it into function that outputs a singular date for comic searching 
	$('#submitDate').on('click', function(e){
		e.preventDefault();
		$('.type-wrap').slideDown(400);
		console.log('KEEEP GOING');
		$('.resultsArea').empty();
		latveria.selectedMonth 	= $('#getMonths').val();
		latveria.selectedDay	= $('#getDay').val();
		latveria.selectedYear	= $('#getYear').val();
		console.log(latveria.selectedMonth, latveria.selectedDay, latveria.selectedYear);
		console.log("entering date");
		latveria.dateConverter(latveria.selectedMonth, latveria.selectedDay, latveria.selectedYear);
		latveria.typer();
	});
};

latveria.outputUpdate = function(){
	$('#getDay').on('change', function(e){
		e.preventDefault;
		$('#monthSliderOutput').text($('#getDay').val())
	});

	$('#getYear').on('change', function(e){
		e.preventDefault;
		$('#yearSliderOutput').text($('#getYear').val())
	});	
};

latveria.socialListener = function(){

	$('a.tweet').click(function(e){

	  //We tell our browser not to follow that link
	  e.preventDefault();

	  //We get the URL of the link
	  var loc = $(this).attr('href');

	  //We get the title of the link
	  var title  = encodeURIComponent($(this).attr('title'));

	  //We trigger a new window with the Twitter dialog, in the middle of the page
	  window.open('http://twitter.com/share?url=' + loc + '&text=' + title + '&', 'twitterwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');

	});
};

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% listeners

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Functionality

latveria.widerSearch = function(){
	var year = latveria.selectedYear;
	var month = latveria.selectedMonth;
	var convertedDate = year + "-" + month + "-" + "01" + "," + year + "-" + month + "-" + "28";
	latveria.getComicInfo(convertedDate);
	console.log("casting a wider net!")
};

latveria.dateConverter = function (month, day, year){//accepts takeDate input, shoots comic date for comicinfo	
	var convertedDay = parseInt(day, 10); // converts day into an integer for further computations
	if (convertedDay === 31){
		console.log("recalculating");
		var convertedDate = year + "-" + month + "-" + "30" + "," + year + "-" + month + "-" + (convertedDay);
		latveria.getComicInfo(convertedDate);
		console.log("all good, normal!");
	} else {
		var convertedDate = year + "-" + month + "-" + day + "," + year + "-" + month + "-" + (convertedDay+1);
		latveria.getComicInfo(convertedDate);
		console.log("all good, normal!");
	};
	
};

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% end functionality

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% page interactivity

latveria.getComicInfo = function(processedDate){
	// takes the info from marvel APi
	// also takes info from date function
	// creates the initial array for manipulation
	// returns the array for future consumption of other functions
   $.ajax({
    url: latveria.comicUrl,
    type: 'GET',
    dataType: 'json',
    data: {
      apikey: latveria.myApi,
      dateRange: processedDate
    },
    success: function(rawComicData){//throws bunch of arrays (based off the Marvel API)
    	// interdiction
    	// if data.count = 0
    	console.log(rawComicData);
    	if (rawComicData.data.count === 0) {
    		latveria.widerSearch();
    	} else {
    		console.log('grabbing results!');
    		latveria.comicInfoSplitter(rawComicData.data.results); // accesses the arrays 
    	};

    }

  });
};

latveria.comicInfoSplitter = function(comicInfo){// takes an array and then grabs characters names
	latveria.characterholder		= [];
	console.log(comicInfo);
	$.each(comicInfo, function(index, item){
			var contentChecker = item.characters.available;
			if (contentChecker != 0){
				console.log("something inside!");
				latveria.characterholder.push(item.characters.items[0].name);
			} else {
				console.log("nothing inside");
			};
	});

	console.log(latveria.characterholder);//unfiltered
	var sortedCharacters = _.uniq(latveria.characterholder);
	var characterTotal 	 = sortedCharacters.length;
	console.log(sortedCharacters, characterTotal); //filtered, hopefully...

	latveria.tweetBuilder(sortedCharacters);
	latveria.getCharacterInfo(sortedCharacters, characterTotal);

};

//function to take THREE names pass them into a second api call to get their images (if available)
// http://i.annihil.us/u/prod/marvel/i/mg/5/c0/528d340442cca/standard_fantastic.jpg <-- sample format

latveria.getCharacterInfo = function(characterNames, length){//finds thumbnails corresponding to specific names, appends the marvel image standards
	
	//variables to control image size etc
	console.log("You're in the INFO Getter")
	// display none the spinner here
	var imgSize = "portrait_xlarge";
	var imgType =".jpg";
	if (length < 10){
		console.log('im less than 10!');
		for (var i = 0; i < length || i <= 9; i++){
			// console.log(characterNames[i]);
			$.ajax({
				url: latveria.comicCharactersUrl,
				type: 'GET',
				dataType: 'json',
				data:{
					apikey: latveria.myApi,
					name: characterNames[i]
				},
				success: function(rawCharacterNames){
					var charImagePath 	= (rawCharacterNames.data.results[0].thumbnail.path + "/" + imgSize + imgType);
					var charName  	  	= (rawCharacterNames.data.results[0].name);
					var charDesc		= (rawCharacterNames.data.results[0].description);
					console.log(rawCharacterNames);
					console.log(charDesc.length);
					if (charDesc === "") {
							charDesc = "Marvel.com does not have a description for this character. A description may be hosted at the marvel Wikia. ";

					};
					latveria.realName = charName;
					latveria.builder(charName, charImagePath, charDesc);
				}
			});
		}
	} else {
		console.log('im more than 10!');
		for (var i = 0; i <= 9; i++){
			// console.log(characterNames[i]);
			$.ajax({
				url: latveria.comicCharactersUrl,
				type: 'GET',
				dataType: 'json',
				data:{
					apikey: latveria.myApi,
					name: characterNames[i]
				},
				success: function(rawCharacterNames){
					var charImagePath 	= (rawCharacterNames.data.results[0].thumbnail.path + "/" + imgSize + imgType);
					var charName  	  	= (rawCharacterNames.data.results[0].name);
					var charDesc		= (rawCharacterNames.data.results[0].description);
					console.log(rawCharacterNames);
					console.log(charDesc.length);
					if (charDesc === "") {
							charDesc = "Marvel.com does not have a description for this character. A description may be hosted at the marvel Wikia. ";
					};
					latveria.realName = charName;
					latveria.builder(charName, charImagePath, charDesc);
					
				}
			});
		}
	};

};




latveria.builder = function(name, image, description){
		//create all the divs.
		$resultsHolder		= $('<div>'); 
		$resultsHolder.addClass('resultsHolder clearfix');
		var cleanName = name.replace(/\s+/g,'');
		$resultsHolder.addClass(cleanName);
		$('.resultsArea').append($resultsHolder);
		latveria.displayInfo(cleanName, image, description);
};

latveria.displayInfo = function(characterName, imagePath,  description){ //accepts the array of URLS and builds the result gallery into the HTML
		//safetyspace for .addClass function
		$title 				= $('<h3>').text(latveria.realName);
		$characterImage 	= $('<img>').attr('src', imagePath);
		$characterDesc 		= $('<p>').text(description);
		$nameAndDesc		= $('<div>');
		$resultsHolder		= $('<div>');

		$("."+characterName+"").append($characterImage, $title,  $characterDesc);

		//cosmetics
		$('.type-wrap').slideUp(700);
		$('.congratulations').slideDown(700)
		$('a.tweet').slideDown(1000);
};


latveria.tweetBuilder = function (nameList){
	var name1 		= nameList[0];
	var name2 		= nameList[1];
	var name3 		= nameList[2];
	// var tweetNames = nameList.toString();
	var finalTweet = "I'm related to " + name1 +", "+ name2 + ", and "+ name3 + " !" + " Who are your superbrothers and sisters?";
	latveria.tweetMaker(finalTweet);
};

latveria.tweetMaker = function (tweetWords){
	$('a.tweet').attr('title', tweetWords);
	// forces title text using tweetwords
	// prepares title attibute in link for tweet jquery
};

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% end interactivity

latveria.typer = function(){
	$("#typed").typed({
	    strings: [
	    ".....accessing the marvel database....", 
	    ".....interfacing with Stark mainframe....", 
	    ".....magnetizing Magneto....", 
	    ".....chill-ing with Iceman....",
	    ".....booking a flight to Genosha....",
	    ".....suing Matt Murdock.....",
	    ".....HULK SMASH!!!.....",
	    ".....gathering the infinity gems.....",
	    ".....staring contest with Cyclops.....",
	    ".....holding hands with Rogue.....",
	    ".....fist bumping Wolverine.....",
	    ],
	    typeSpeed: 20,
	    backDelay: 500,
	    loop: true,
	    contentType: 'html', // or text
	    // defaults to false for infinite loop
	    loopCount: false,
	    // callback: function(){ foo(); },
	    resetCallback: function() { newTyped(); }
	});
};

latveria.init = function (){
	this.takeDate();
	this.outputUpdate();
	this.socialListener();
};


$(document).ready(function(){
  latveria.init();
}); 