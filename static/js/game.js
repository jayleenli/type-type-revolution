//Initialize TTR function on startup

var words;
populateWords();
var started = 0;
var timePassed = 0; //time passed in seconds
var typedWords = 0.0;

window.onload = function() {
  window.TTR = new TTR();
  var user_text = document.getElementById("user-text");
  user_text.addEventListener('keypress', function checkKeyPress(e) {
    if (started === 0)
    {
      startCountDown(30);
      passTime();
      started = 1;
    }
    
    if (e.keyCode >= 49 && e.keyCode <=51)
    {
        e.preventDefault();
    }

    if (e.keyCode == 32 || e.keyCode == 13) //space
    {
      //console.log(word_index);
      e.preventDefault();
      currentWord = words[word_index];
      var id = "word-" + (word_index+1); 
      //console.log(id);
      //console.log(currentWord);

      if (user_text.value === currentWord) 
      {
        //make the word red
        document.getElementById(id).className = "highlight-green";
        typedWords++;
        //console.log("match");
      }
      else if (user_text.value !== currentWord)
      {
        //make the word green
        document.getElementById(id).className = "highlight-red";
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
  return document.getElementById(id).getAttribute('data-id');
}

//Firebase Initialization
function TTR() {
  this.checkSetup();
  this.initFirebase();
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

function startCountDown(duration) //duration in seconds
{
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
};

function passTime()
{
  setInterval(function(){ 
    //console.log(timePassed);
    timePassed = timePassed + .25; 
    getWordPerMinute();
   }, 250);
};

function getWordPerMinute()
{
  var wpm = Math.floor((typedWords/timePassed)*60);
  document.getElementById("WPM").innerHTML = "WPM: " + wpm;
  return wpm;
};

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
    var text = document.createTextNode(sorted[i].name + "      --- WPM: " + sorted[i].wpm);  
    listElement.appendChild(text);
    userNames.appendChild(listElement);
  }
  //console.log(userNames);
  
}

//this.kickLastWPMUser();

TTR.prototype.kickLastWPMUser = function() {
  this.database.ref(this.roomPin + "/players").on('value', (snapshot) => {
    if (snapshot.val()) {
      players = snapshot.val();
      //console.log(players);
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
    }
  }).bind(this);
};

TTR.prototype.initFirebase = function() {
  //Shortcuts to Firebase SDK features
  this.database = firebase.database();
  
  this.playerId = getParameterByName('id');
  this.roomPin = getParameterByName('room');
  console.log(this.playerId + " and " + this.roomPin);

  this.listenAbilities();
  this.listenUsers();
  //var user_text = document.getElementById("user-text");
  window.addEventListener('keypress', function checkKeyPress(e) {
    if (e.keyCode === 49 || e.keyCode === 50 || e.keyCode === 51)
    {
      console.log("clicked " + e.keyCode);
      this.sendAbility(getAbility(e.keyCode));
    }
  }.bind(this));
  setInterval(function(){ 
  //console.log(timePassed);
    timePassed = timePassed + .25; 
    this.updateWpm(getWordPerMinute());
   }.bind(this), 250);

  
  setInterval(function(){ 
    setTimeout(this.updateTimer(), 1000);
  }.bind(this), 1000);
};


TTR.prototype.sendAbility = function(ability) {
  this.abilityDb= this.database.ref(this.roomPin + "/abilities").push().key;

  var updates = {};
  updates[this.roomPin + "/abilities/" + this.abilityDb] = { 
    "effect": "skill-"+ability,
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
  this.database.ref().update(updates, function(error) {
    if(error) {
      console.log(error);
    }
    else {
      console.log("updating wpm");
    }
  }.bind(this));
};


TTR.prototype.setHost = function() {
  this.database.ref(this.roomPin).on('value', (snapshot) => {
    if (snapshot.numChildren() === 1) {
      console.log(snapshot.numChildren()===1);
        //begin timer if the number of children is 1 
        //(one player joined, that means that person is the host)
        //set the current guy to be the host
        var updates = {};
                updates[this.roomPin + '/game/host'] = this.playerId;
                this.database.ref().update(updates, function(error) {
                  if(error) {
                    console.log(error);
                  }
                  else {
                    console.log("updated host to " + this.playerId);
                  }
                }.bind(this));
      }
  }).bind(this);
};

TTR.prototype.updateTimer = function() {
  this.database.ref(this.roomPin).on('value', (snapshot) => {
        var time = snapshot.child("game").child("timer").val();
        console.log("time " + time);
        if (time >= 1 && (this.playerId == snapshot.child("game").child("host").val()))
        {
            time--;
            console.log('updated');
            var updates = {};
                updates[this.roomPin + '/game/timer'] = time;
                this.database.ref().update(updates, function(error) {
                  if(error) {
                    console.log(error);
                  }
                  else {
                    console.log("updated timer");
                  }
                }.bind(this));
        }
    })
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

