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
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Checks that the Firebase SDK has been correctly setup and configured.
TTR.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
  window.alert('You have not configured and imported the Firebase SDK. ' +
    'Make sure you go through the codelab setup instructions and make ' +
    'sure you are running the codelab using `firebase serve`');
  }
};

TTR.prototype.initFirebase = function() {
  //Shortcuts to Firebase SDK features
  this.database = firebase.database();
  
  this.playerId = getParameterByName('id');
  this.roomCode = getParameterByName('room');
};

TTR.prototype.updateUser = function() {
  this.database.ref(this.roomCode + "/players").on('value', (snapshot) => {
    if (snapshot.val()) {
      this.allPlayers = snapshot.val();
      console.log(allPlayers.[this.playerId]);
      this.player = allPlayers.[this.playerId];
    }
  }.bind(this));
}

//calculate word count
TTR.prototype.updateWordCount = function() {

};

//send skill
TTR.prototype.sendAbility = function() {

}

