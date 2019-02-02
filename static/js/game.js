//Initialize TTR function on startup
window.onload = function() {
  window.TTR = new TTR();
};

//Firebase Initialization
function TTR() {
  this.checkSetup();

  //Shortcuts to DOM elements
  /*
  this.playerNameInput = document.getElementById('playerName');
  this.roomPinInput = document.getElementById('roomPin');
  this.joinGameButton = document.getElementById('join-game-button');
  this.warningDiv = document.getElementById('warning-div');
  this.warningMessage = document.getElementById('warning-message');
  */

  //this.joinGameButton.addEventListener('click', this.joinGame.bind(this));
  this.initFirebase();
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

// Checks that the Firebase SDK has been correctly setup and configured.
TTR.prototype.checkSetup = function(){
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
  window.alert('You have not configured and imported the Firebase SDK. ' +
    'Make sure you go through the codelab setup instructions and make ' +
    'sure you are running the codelab using `firebase serve`');
  }
};

TTR.prototype.listenUsers = function() {
  this.database.ref(this.roomCode + "/players").on('value', (snapshot) => {
    if (snapshot.val()) {
      this.allPlayers = snapshot.val();
      console.log(this.allPlayers[this.playerId]);
      this.player = this.allPlayers[this.playerId];
      if (this.player.isDead) {
        isDead();
      }
    }
  }).bind(this);
};

TTR.prototype.listenAbilities = function() {
  this.database.ref(this.roomCode + "/abilities").on('value', (snapshot) => {
    if (snapshot.val()) {
      this.abilities = snapshot.val();
      var recentAbility = abilities[Object.keys(abilities).sort().pop()];
      if (recentAbility.user !== this.playerId)
      {
        this.castAbility(skill);
      }
    }
  }).bind(this);
};

TTR.prototype.initFirebase = function() {
  //Shortcuts to Firebase SDK features
  this.database = firebase.database();
  
  this.playerId = getParameterByName('id');
  this.roomCode = getParameterByName('room');
  console.log(this.playerId + " and " + this.roomCode);

  // this.listenAbilities();
  this.listenUsers();
};

/*
//updating ur own wpm -- writing
TTR.prototype.updateWpm = () => {
  console.log("updating wpm");
};

//updating client-side death
function isDead(){
  console.log("ur dead xp !");
};

//cast abilities
function castAbility(skill){
  console.log('casting ability to u');
  setTimeout(revert(skill), 5000)
};

//revert client back to normal
function revert(skill){
  console.log("reverting!");
};
*/
