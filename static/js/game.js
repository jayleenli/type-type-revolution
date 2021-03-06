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
      }
      else if (user_text.value !== currentWord) {
        date = new Date();
        lastMillis = date.getTime();

        //Word is not correct, make the word red
        document.getElementById(id).className = "highlight-red";
        incorrectWords++;
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
  words = wordsString.split(" ");
  words = words.slice(10,words.length); //weird 8 blanks in beginning
  word_index = 0;

  var innerHTMLString = "";
  for (var i = 1; i < words.length; i++)
  {
    innerHTMLString += "<span id =\"word-" + i + "\">" + words[i-1] + " </span><span></span>";
  }
  document.getElementById("generated-text").innerHTML = innerHTMLString;
};

function startCountDown(timee) //duration in seconds
{
  var timer_bar = document.getElementById("timer-bar");
  var startTime = timee;
  timer_bar.style.width = "0px";
  var countdown = setInterval(function(){ 
    var timeLeft = 30 - ( (Math.floor(Date.now() / 1000) - (timee+(rounds*30))) );
    document.getElementById("timer-num").innerHTML = timeLeft;
    if (timeLeft <= 0) {
      //clearInterval(countdown);
      timeLeft = 0;
      rounds++;
      TTR.kickLastScoreUser();
      timeLeft = 31;

      timer_bar.classList.add("notransition");
      timer_bar.style.width = "calc(100% - 300px)";
      timer_bar.offsetHeight;
      timer_bar.classList.remove('notransition');
      timer_bar.style.width = "0px";
    }
   }, 1000);  

};

function passTime()
{
  setInterval(function(){ 
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


function updateScoreAndAccuracy() {
  if (document.getElementById("score"))
  {
    document.getElementById("score").innerHTML = "Score: " + typedWords;
  }

  if (document.getElementById("accuracy"))
  {
    document.getElementById("accuracy").innerHTML = "Accuracy: " + Math.floor((typedWords/word_index)*100) +"%";
  }
  if (document.getElementById("points"))
  {
    document.getElementById("points").innerHTML = "Points: " + points;
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

  var userNames = document.getElementById("user-list");
  while( userNames.firstChild ){
    userNames.removeChild(userNames.firstChild);
  }

  var sorted = Object.keys(userList)
  .sort(function(a, b) {
    return userList[b].totalWords - userList[a].totalWords; // Organize the category array
  })
  .map(function(category) {
    return userList[category]; // Convert array of categories to array of objects
  });  
  for (var i in sorted) {
    var listElement = document.createElement("li"); 
    listElement.setAttribute("id", "li-" + sorted[i].name); 
    var text = document.createTextNode(sorted[i].name + "      --- WPM: " + sorted[i].wpm + " | Score: " + sorted[i].totalWords);  
    listElement.appendChild(text);
    userNames.appendChild(listElement);
    if (sorted[i].isDead) {
      var deadName = sorted[i].name;
      var deadPlayer = document.getElementById("li-" + deadName);
      deadPlayer.style.backgroundColor = "rgba(255, 0, 0, .3";
    }
  }  
}


function endGame() {
  gameEnded = true;
  document.getElementById("inputsForGame").innerHTML = '<div style="font-size: 40px;">Game Over!</div>';
  document.getElementById("reset-link").removeAttribute("hidden");
  document.getElementById("timer").style.display = "none";
}

TTR.prototype.checkforLastUser = function() {
  if (this.playerId == window.host)
  {
    this.database.ref(this.roomPin+"/players").on('value', (snapshot) => {
      var peoplechecked2 = 0;
        if (snapshot.val()) {
        players = snapshot.val();
        
        for (var key in players) {
          if (players[key].isDead == false)
          {
            peoplechecked2++;
          }
        }

        if(peoplechecked2 == 1){
          var ref = this.database.ref(this.roomPin + "/game/isGameFinished").set(true);
        }

      }
    });
}
};

TTR.prototype.kickLastScoreUser = function() {
  if (window.host == this.playerId){
  this.database.ref(this.roomPin+"/players").once('value').then((snapshot) => {
    if (snapshot.val()) {
      this.players = snapshot.val();
      var minScore = 1000;
      var minKey;
      var peoplechecked = 0;
      for (var key in players) {
        if (players[key].isDead == false)
        {
          peoplechecked++;
        }
        if (players[key].isDead == false && players[key].totalWords < minScore)
        {
            minKey = key;
            minScore = players[key].totalWords;
        }

      }

      if(peoplechecked >= 2){
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
      else
      {
        endGame();
      }
    }

  })
}
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
      this.player = this.allPlayers[this.playerId];

      //re-rendering user list
      renderUserlist(this.allPlayers);

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
      this.recentAbility = this.abilities[Object.keys(this.abilities).sort().pop()];
      if (this.recentAbility.user !== this.playerId) {
        this.database.ref(this.roomPin + "/players/" + this.recentAbility.user + "/name").once('value', (snapshot) => {
          castAbility(this.recentAbility.effect, snapshot.val());
        });
      }
      else {
        var active = document.getElementById(this.recentAbility.effect);
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
  if (this.playerId === window.host) {
      this.database.ref(this.roomPin).once('value').then((snapshot) => {
        var status = snapshot.child("game").child("isGameStarted").val();

        if (status == false) {
          var updates = {};
          time = Math.floor(Date.now() / 1000);
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
      startCountDown(snapshot.child("timestamp").val());
      this.listenUsers();
      this.listenEndGame();
      this.listenAbilities();
      this.checkforLastUser();
      window.addEventListener('keypress', function checkKeyPress(e) {
        if (points >= 10){
          if (e.keyCode === 49 || e.keyCode === 50 || e.keyCode === 51)
          {
            this.sendAbility(getAbility(e.keyCode));
            points = points - 10;
          }
        }
      }.bind(this));
      setInterval(function(){ 
        timePassed = timePassed + .25; 
        this.updateWpm(getWordPerMinute());
        updateScoreAndAccuracy();
        
       }.bind(this), 250);
    }
    if (snapshot.child("isGameFinished").val() == true) {
      this.database.ref(this.roomPin).off('value');
    }
  });
}

//get host name
TTR.prototype.getHostName = function() {
  return this.database.ref(this.roomPin).once('value').then((snapshot) => {
    if (!snapshot.child("game").child("host").val()) {
      return null;
    }
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
  }.bind(this));
};

//listen to see if all users have entered the game
TTR.prototype.listenEndGame = function() {
  this.database.ref(this.roomPin).on('value', (snapshot) => {
    if (snapshot.child("game").child("isGameFinished").val() === true)
    {
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
    this.hostDisconnect();
    this.startTimer();
    this.listenerGameStart();
  }
};

//Other clients chec kto see if host disconnected
TTR.prototype.hostDisconnect = function() {
  this.database.ref(this.roomPin).on('value', (snapshot) => {
    if (this.playerId == snapshot.child("game").child("host").val())
    {
        var ref = this.database.ref(this.roomPin + "/game/isGameFinished").onDisconnect().set(true);
    }
  });
};

//updating client-side death
function isDead(){
  document.getElementById("inputsForGame").innerHTML = '<div style="font-size: 40px;">Game Over!</div>';
  document.getElementById("timer").style.display = "none";
};

//cast abilities
function castAbility(skill, name){

  var skillName = "";
  if(skill == "skill-textcolor") {
    skillName = "Color Change";
  }
  else if(skill == "skill-fontsize") {
    skillName = "Shrink Font";
  }
  else if (skill = "skill-tilt") {
    skillName = "Tiltation";
  }

  var abilityDisplay = document.getElementById("ability-display");
  abilityDisplay.innerHTML = name + " used " + skillName + "!";

  var aoe = document.getElementById("generated-text");
  aoe.classList.add(skill);
  setTimeout(function() {revert(skill);}, 10000);
};

//revert client back to normal
function revert(skill){
  var aoe = document.getElementById("generated-text");
  aoe.classList.remove(skill);
};

