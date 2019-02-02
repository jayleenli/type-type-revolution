//Initialize TTR function on startup
window.onload = function() {
  window.TTR = new TTR();
};

//Firebase Initialization
function TTR() {
  this.checkSetup();

  //Shortcuts to DOM elements
  this.playerNameInput = document.getElementById('playerName');
  this.roomPinInput = document.getElementById('roomPin');
  this.joinGameButton = document.getElementById('join-game-button');
  this.warningDiv = document.getElementById('warning-div');
  this.warningMessage = document.getElementById('warning-message');

  this.joinGameButton.addEventListener('click', this.joinGame.bind(this));
  
  this.initFirebase();
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
	
	this.testDisconnect();
};

TTR.prototype.testDisconnect = function() {
	var ref = this.database.ref("test").onDisconnect().set(true);
}

TTR.prototype.joinGame = function() {
	this.playerName = this.playerNameInput.value;
	this.roomPin = this.roomPinInput.value;

	this.database.ref(this.roomPin).once('value', function(snapshot) {
		//Check if this game code exists
		if(snapshot.val()) {
			//This game exists, check if the game is active
			var game = snapshot.val();

			if(game.game.isGameStarted) {
				//Game has already started
				this.warningMessage.innerHTML = "This game has already started. Sorry!";
				this.warningDiv.removeAttribute("hidden");
			}
			else {
				//Game has not started, join game
				var player = {
					abilities: [],
					accuracy: 100,
					isDead: false,
					isReady: false,
					name: this.playerName,
					numIncorrect: 0,
					points: 0,
					totalWords: 0,
					wpm: 0
				}

				var playerId = this.database.ref(this.roomPin + "/players").push().key;

				var updates = {};
				updates[this.roomPin + "/players/" + playerId] = player;

				this.database.ref().update(updates, function(error) {
					if(error) {
						console.log(error);
						this.warningMessage.innerHTML = "Oops! There was an error adding you to the game. Error: " + error;
						this.warningDiv.removeAttribute("hidden");
					}
					else {
						console.log("wow it worked");
					}
				}.bind(this));
			}
		}
		else {
			//Gane does not exist, display warning
			this.warningMessage.innerHTML = "This game does not exist!";
			this.warningDiv.removeAttribute("hidden");
		}
	}.bind(this));
}