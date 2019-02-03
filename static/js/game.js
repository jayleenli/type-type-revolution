//Initialize TTR function on startup

var words;
populateWords();
var started = 0;
var timePassed = 0; //time passed in seconds
var typedWords = 0.0;
var incorrectWords = 0;
var word_index = 0;
var gameEnded = false;
var points = 0;
var host = "";
var date = new Date();
var rounds = 0;

var lastMillis = 0;
var timeArrayIndex = 0;
var timeArray = [];

window.onload = function() {
  window.host = "";
  window.TTR = new TTR();
  var user_text = document.getElementById("user-text");

  user_text.addEventListener('keypress', function checkKeyPress(e) {
    if (started === 0) {
      passTime();
      started = 1;

      date = new Date();
      lastMillis = date.getTime();
    }
    if (e.keyCode >= 49 && e.keyCode <= 51) {
        e.preventDefault();
    }
    if (e.keyCode == 32 || e.keyCode == 13) { //space
      e.preventDefault();
      currentWord = words[word_index];
      var id = "word-" + (word_index+1); 

      if (user_text.value === currentWord) {
        date = new Date();
        var timeDiff = (date.getTime() - lastMillis) / currentWord.length * 4.5;
        timeArray[timeArrayIndex % 50] = timeDiff;

        lastMillis = date.getTime();
        timeArrayIndex++;

        //updateWPM takes care of the rest

        //Word is correct, make the word green
        document.getElementById(id).className = "highlight-green";
        typedWords++;
        points++;
        //console.log("match");
      }
      else if (user_text.value !== currentWord) {
        date = new Date();
        lastMillis = date.getTime();

        //Word is not correct, make the word red
        document.getElementById(id).className = "highlight-red";
        incorrectWords++;
        //console.log("no");
      }

      //reset the field
      word_index++;
      user_text.value = "";
    }
  });
};

function getAbility(id) {
  var user_text = document.getElementById("user-text");
  var skill_name = ""
  if (id === 49)
  {
    skill_name = "skill-textcolor";
  }
  else if (id === 50)
  {
    skill_name = "skill-fontsize";
  }
  else if (id === 51) 
  {
    skill_name = "skill-tilt";
  }
  return document.getElementById(skill_name).getAttribute('data-id');
}

//Firebase Initialization
function TTR() {
  this.checkSetup();
  this.database = firebase.database();
  this.playerId = getParameterByName('id');
  this.roomPin = getParameterByName('room');
  this.getHostName().then((host) => {
    window.host = host;
    console.log('updated window.host to ', window.host);
    this.initFirebase();
  });
};

function populateWords()
{
  var wordsString = document.getElementById("generated-text").innerHTML;
  //console.log(wordsString);
  words = wordsString.split(" ");
  words = words.slice(10,words.length); //weird 8 blanks in beginning
  word_index = 0;
  //console.log(words);

  var innerHTMLString = "";
  for (var i = 1; i < words.length; i++)
  {
    innerHTMLString += "<span id =\"word-" + i + "\">" + words[i-1] + " </span><span></span>";
  }
  //console.log(innerHTMLString);
  document.getElementById("generated-text").innerHTML = innerHTMLString;
};

function startCountDown(timee) //duration in seconds
{
  console.log('in countdown');
  var startTime = timee;
  document.getElementById("timer-bar").style.width = "0px";
  var countdown = setInterval(function(){ 
    //console.log(timer);
    console.log(( "hello" + Math.floor(Date.now() / 1000)));
    console.log("time " + timee);
    var timeLeft = 30 - ( (Math.floor(Date.now() / 1000) - (timee+(rounds*30))) );
    console.log(timeLeft);
    document.getElementById("timer-num").innerHTML = timeLeft;
    if (timeLeft <= 0) {
      //clearInterval(countdown);
      timeLeft = 0;
      console.log('time up');
      console.log('resetting');
      rounds++;
      console.log("round" + rounds);
      TTR.kickLastWPMUser();
      timeLeft = 31;
      //TTR.kickLastWPMUser();
    }
   }, 1000);  
  /*
  document.getElementById("timer-bar").style.width = "0px";
  var timer = duration;
  var countdown = setInterval(function(){ 
    //console.log(timer);
    document.getElementById("timer-num").innerHTML = timer;
    if (--timer < 0) {
      //hit zero do something
            clearInterval(countdown)

        }
   }, 1000);
   */
};

function passTime()
{
  setInterval(function(){ 
    //console.log(timePassed);
    timePassed = timePassed + .25; 
    getWordPerMinute();
   }, 250);
};

function getWordPerMinute() {
  //Start counting after the first ten words
  if(timeArray.length > 10) {
    var totalTime = 0;

    for(var i = 0; i < timeArray.length; i++) {
      totalTime += timeArray[i];
    }
    var wpm = (60 * timeArray.length / (totalTime /= 1000)).toFixed(0);

    //Set WPM on page
    if (document.getElementById("WPM") && (gameEnded == false)) {
      document.getElementById("WPM").innerHTML = "WPM: " + wpm;
    }
    return wpm;
  }
  return 0;
}

// function getWordPerMinute() {
//   var wpm = Math.floor((typedWords/timePassed)*60);
//   if (document.getElementById("WPM") && (gameEnded == false))
//   {
//     document.getElementById("WPM").innerHTML = "WPM: " + wpm;
//   }
//   return wpm;
// };

function updateScoreAndAccuracy() {
  if (document.getElementById("score"))
  {
    document.getElementById("score").innerHTML = "Score: " + typedWords;
  }

  if (document.getElementById("accuracy"))
  {
    document.getElementById("accuracy").innerHTML = "Accuracy: " + Math.floor((typedWords/word_index)*100) +"%";
  }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

function renderUserlist(userList) {
  console.log("re-rendering user list");
  /*
  var userNames = userList.map((user) => {
    return user.name;
  });
  */
  var userNames = document.getElementById("user-list");
  while( userNames.firstChild ){
    userNames.removeChild(userNames.firstChild);
  }

  var sorted = Object.keys(userList)
  .sort(function(a, b) {
    return userList[b].wpm - userList[a].wpm; // Organize the category array
  })
  .map(function(category) {
    return userList[category]; // Convert array of categories to array of objects
  });  
  for (var i in sorted) {
    var listElement = document.createElement("li");  
    var text = document.createTextNode(sorted[i].name + "      --- WPM: " + sorted[i].wpm + " | Score: " + sorted[i].totalWords);  
    listElement.appendChild(text);
    userNames.appendChild(listElement);
  }
  //console.log(userNames);
  
}

function endGame() {
  gameEnded = true;
  document.getElementById("inputsForGame").innerHTML = '<div style="font-size: 40px;">Game Over!</div>';
}

//this.kickLastWPMUser();

TTR.prototype.kickLastWPMUser = function() {
  this.database.ref(this.roomPin + "/players").on('value', (snapshot) => {
    console.log("kickLastWPMUser");
    if (snapshot.val()) {
      players = snapshot.val();
      console.log("----------", snapshot.val());
      var minWPM = 1000;
      var minKey;
      for (var key in players) {
        if (players[key].isDead === false && players[key].wpm < minWPM)
        {
            minKey = key;
            minWPM = players[key].wpm;
            console.log("new min" + minWPM + "key" + minKey);
        }
      }

        var updates = {};
        updates[this.roomPin + '/players/' + minKey + "/isDead"] = true;
        this.database.ref().update(updates, function(error) {
          if(error) {
            console.log(error);
          }
          else {
            console.log("updated isDead");
          }
        }.bind(this));
    }

  }).bind(this);
};

// Checks that the Firebase SDK has been correctly setup and configured.
TTR.prototype.checkSetup = function(){
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
  window.alert('You have not configured and imported the Firebase SDK. ' +
    'Make sure you go through the codelab setup instructions and make ' +
    'sure you are running the codelab using `firebase serve`');
  }
};

TTR.prototype.listenUsers = function() {
  this.database.ref(this.roomPin + "/players").on('value', (snapshot) => {
    if (snapshot.val()) {
      this.allPlayers = snapshot.val();
      //console.log(this.allPlayers[this.playerId]);
      this.player = this.allPlayers[this.playerId];

      //re-rendering user list
      renderUserlist(this.allPlayers);

      //console.log(this.allPlayers);
      if (this.player.isDead) {
        isDead();
      }
    }
  }).bind(this);
};

TTR.prototype.listenAbilities = function() {
  this.database.ref(this.roomPin + "/abilities").on('value', (snapshot) => {
    if (snapshot.val()) {
      this.abilities = snapshot.val();
      var recentAbility = this.abilities[Object.keys(this.abilities).sort().pop()];
      if (recentAbility.user !== this.playerId)
      {
        castAbility(recentAbility.effect);
      }
      else {
        console.log(recentAbility.effect);
        var active = document.getElementById(recentAbility.effect);
        active.classList.add("skill-active");
        setTimeout(function() {active.classList.remove("skill-active");}, 10000);
      }
    }
  }).bind(this);
};

TTR.prototype.initFirebase = function() {
  //Shortcuts to Firebase SDK features

  console.log(this.playerId + " and " + this.roomPin);

  console.log('window host: ', window.host);

  var updates = {};
  updates[this.roomPin + '/players/' + this.playerId + "/isInGame"] = true;
  this.database.ref().update(updates, function(error) {
    if(error) {
      console.log(error);
    }
    else {
      console.log("user isInGame");
    }
  }.bind(this));

  //this.hostListenerTimer();
  this.listenAllInGame();
};

//start countdown
TTR.prototype.startTimer = function() {
  console.log(window.host);
  if (this.playerId === window.host) {
      this.database.ref(this.roomPin).once('value').then((snapshot) => {
        console.log(snapshot.child("game").child("isGameStarted").val());
        var status = snapshot.child("game").child("isGameStarted").val();

        if (status == false) {
          console.log('went into IF');
          var updates = {};
          time = Math.floor(Date.now() / 1000);
          console.log(time);
          updates[this.roomPin + "/game/timestamp"] = time;
          updates[this.roomPin + "/game/isGameStarted"] = true;

          this.database.ref().update(updates, function(error) {
            if(error) {
              console.log(error);
            }
            else {
              console.log("updated start timestamp and started game");
            }
          }.bind(this));
        }
      });
  }
};

TTR.prototype.listenerGameStart = function() {
   this.database.ref(this.roomPin + "/game").on('value', (snapshot) => {
    if (snapshot.child("isGameStarted").val() == true) {
      console.log("in game start, turning on listeners");
      startCountDown(snapshot.child("timestamp").val());
      this.listenUsers();
      this.listenEndGame();
      this.listenAbilities();
      window.addEventListener('keypress', function checkKeyPress(e) {
        if (points >= 10){
          if (e.keyCode === 49 || e.keyCode === 50 || e.keyCode === 51)
          {
            console.log("clicked " + e.keyCode);
            this.sendAbility(getAbility(e.keyCode));
            points = points - 10;
          }
        }
      }.bind(this));
      setInterval(function(){ 
      //console.log(timePassed);
        timePassed = timePassed + .25; 
        this.updateWpm(getWordPerMinute());
        updateScoreAndAccuracy();
        
       }.bind(this), 250);
    }
  });
}

//get host name
TTR.prototype.getHostName = function() {
  return this.database.ref(this.roomPin).once('value').then((snapshot) => {
    if (!snapshot.child("game").child("host").val()) {
      return null;
    }
    console.log(snapshot.child("game").child("host").val());
    return snapshot.child("game").child("host").val();
  });
};

TTR.prototype.sendAbility = function(ability) {
  this.abilityDb= this.database.ref(this.roomPin + "/abilities").push().key;

  var updates = {};
  updates[this.roomPin + "/abilities/" + this.abilityDb] = { 
    "effect": ability,
    "user": this.playerId
  };

  this.database.ref().update(updates, function(error) {
    if(error) {
      console.log(error);
    }
    else {
      console.log("wrote ability to db");
    }
  }.bind(this));
};

//updating ur own wpm -- writing
TTR.prototype.updateWpm = function(updatedWpm) {
  var updates = {};
  updates[this.roomPin + '/players/' + this.playerId + "/wpm"] = updatedWpm;
  updates[this.roomPin + '/players/' + this.playerId + "/totalWords"] = typedWords;
  updates[this.roomPin + '/players/' + this.playerId + "/numIncorrect"] = incorrectWords;
  this.database.ref().update(updates, function(error) {
    if(error) {
      console.log(error);
    }
    else {
      console.log("updating wpm");
    }
  }.bind(this));
};

//listen to see if all users have entered the game
TTR.prototype.listenEndGame = function() {
  this.database.ref(this.roomPin).on('value', (snapshot) => {
    if (snapshot.child("game").child("isGameFinished").val() === true)
    {
        console.log("game is over");
        endGame();
    }
  });
};

//If the current user who is the host has disconnected 
TTR.prototype.listenAllInGame = function() {
  var allIn = true;
  this.database.ref(this.roomPin).on('value', (snapshot) => {
        var allPlayers = snapshot.val().players;
        if (this.playerId === window.host) {
          for (var key in allPlayers) {
            if(allPlayers[key].isInGame === false) {
              allIn = false;
              break;
            }
          }
        }
  });
  if (allIn === true) {
    console.log("All in let's start!");
    //this.database.ref(this.roomPin).off('value');
    this.hostDisconnect();
    this.startTimer();
    this.listenerGameStart();
  }
};

//Other clients chec kto see if host disconnected
TTR.prototype.hostDisconnect = function() {
  this.database.ref(this.roomPin).on('value', (snapshot) => {
    //this.hostName = snapshot.child("game").child("host").val();
    if (this.playerId == snapshot.child("game").child("host").val())
    {
        console.log("i am the host");
        var ref = this.database.ref(this.roomPin + "/game/isGameFinished").onDisconnect().set(true);
    }
  });
};

//updating client-side death
function isDead(){
  console.log("ur dead xp !");
};

//cast abilities
function castAbility(skill){
  console.log('casting ability to u - skill: ' + skill);
  var aoe = document.getElementById("generated-text");
  aoe.classList.add(skill);
  setTimeout(function() {revert(skill);}, 10000);
};

//revert client back to normal
function revert(skill){
  var aoe = document.getElementById("generated-text");
  aoe.classList.remove(skill);
  console.log("reverting, skill: " + skill);
};

