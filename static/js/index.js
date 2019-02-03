//Initialize TTR function on startup
window.onload = function() {
  window.TTR = new TTR();
};

//Firebase Initialization
function TTR() {
  this.checkSetup();

  //Shortcuts to DOM elements
  this.joinGameNameInput = document.getElementById('playerName');
  this.roomPinInput = document.getElementById('roomPIN');
  this.joinGameButton = document.getElementById('join-game-button');

  this.createGameNameInput = document.getElementById('createPlayerName');
  this.createGameButton = document.getElementById('create-game-button');

  this.warningDiv = document.getElementById('warning-div');
  this.warningMessage = document.getElementById('warning-message');

  this.joinGameButton.addEventListener('click', this.joinGame.bind(this));
  this.createGameButton.addEventListener('click', this.createGame.bind(this));
  
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
};

TTR.prototype.joinGame = function() {
	this.playerName = this.joinGameNameInput.value;
	this.roomPin = this.roomPinInput.value;

	if(this.playerName && this.roomPin) {
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

					this.playerId = this.database.ref(this.roomPin + "/players").push().key;
					console.log(this.playerId);

					var updates = {};
					updates[this.roomPin + "/players/" + this.playerId] = player;

					this.database.ref().update(updates, function(error) {
						if(error) {
							console.log(error);
							this.warningMessage.innerHTML = "Oops! There was an error adding you to the game. Error: " + error;
							this.warningDiv.removeAttribute("hidden");
						}
						else {
							window.location.replace("ready.html?id=" + this.playerId + "&room=" + this.roomPin);
							console.log("Redirecting to game page");
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
	else {
		//One or more input fields is missing
		this.warningMessage.innerHTML = "Please enter a Room PIN and a name.";
		this.warningDiv.removeAttribute("hidden");
	}
}

TTR.prototype.createGame = function() {
	this.playerName = this.createGameNameInput.value;
	this.roomPin = randomString(4, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

	if(this.playerName && this.roomPin) {
		this.database.ref(this.roomPin).once('value', function(snapshot) {
			//Check if this game code exists
			if(!snapshot.val()) {
				//This game does not exist, create the game
				var gameObject = {
					game: {
						host: "",
						isGameFinished: false,
						isGameStarted: false,
						timestamp: 0
					}
				}

				this.database.ref(this.roomPin).set(gameObject, function(error) {
					if(error) {
						console.log(error);
					}
					else {
						//Game object was successfully created, now add yourself
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

						this.playerId = this.database.ref(this.roomPin + "/players").push().key;
						console.log(this.playerId);

						var updates = {};
						updates[this.roomPin + "/players/" + this.playerId] = player;
						updates[this.roomPin + "/game/host/"] = this.playerId;

						this.database.ref().update(updates, function(error) {
							if(error) {
								console.log(error);
								this.warningMessage.innerHTML = "Oops! There was an error adding you to the game. Error: " + error;
								this.warningDiv.removeAttribute("hidden");
							}
							else {
								window.location.replace("ready.html?id=" + this.playerId + "&room=" + this.roomPin);
								console.log("Redirecting to game page");
							}
						}.bind(this));
					}
				}.bind(this));
			}
			else {
				//Gane already exists, display warning
				this.warningMessage.innerHTML = "Oops! An error occurred. Please try creating your game again.";
				this.warningDiv.removeAttribute("hidden");
			}
		}.bind(this));
	}
	else {
		//One or more input fields is missing
		this.warningMessage.innerHTML = "Please enter a name.";
		this.warningDiv.removeAttribute("hidden");
	}
}

//Generate random string function
function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}