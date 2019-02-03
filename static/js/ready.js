
window.onload = function() {
	window.TTR = new TTR();
};


function TTR() {
	this.checkSetup();

	this.initFirebase();
}


TTR.prototype.checkSetup = function(){
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
  this.roomPin = getParameterByName('room');
  console.log(this.playerId + " and " + this.roomPin);

  displayInfo(this.roomPin);

  this.listenUsers();
  this.listenReady();
  this.checkReady();
 };


 TTR.prototype.listenUsers = function() {
  this.database.ref(this.roomPin + "/players").on('value', (snapshot) => {
    if (snapshot.val()) {
      console.log(snapshot.val());
      this.allPlayers = snapshot.val();
      //console.log(this.allPlayers[this.playerId]);
      this.player = this.allPlayers[this.playerId];

      //re-rendering user list
      renderUserlist(this.allPlayers, this.player);

      this.listenReady();

      //console.log(this.allPlayers);
      if (this.player.isDead) {
        isDead();
      }
    }
  }).bind(this);
};

TTR.prototype.listenReady = function() {
	this.readyButton = document.getElementById("ready-button");
	this.readyButton.addEventListener('click', this.updateReady.bind(this))
}

TTR.prototype.updateReady = function(){
	var updateReady = {};
	updateReady[this.roomPin + "/players/" + this.playerId + "/isReady"] = true;
	this.database.ref().update(updateReady, (error) => {
		if (error) {
			console.log(error);
		}
		else {
			console.log(this.playerId);
		}
	})
}


// var x = () => {

// };

// var x = function() {

// }

TTR.prototype.checkReady = function() {
	this.database.ref(this.roomPin + "/players").on('value', (snapshot) => {
		var inGamePlayers = (snapshot.val())
		var allReady = true;
		for (var key in inGamePlayers) {
			if (!inGamePlayers[key].isReady) {
				allReady = false;
			}
		}
		if (allReady) {
			var updateStart = {};
			updateStart[this.roomPin + "/game/isGameStarted"] = allReady;
			this.database.ref().update(updateStart, (error) => {
				if (error) {
					console.log(error);
				}
				else{
					window.location.replace("game.html?id=" + this.playerId + "&room=" + this.roomPin);
					console.log("Redirecting to game.html");
				}
			})
		}
	})
}


function renderUserlist(userList, user) {
  console.log("re-rendering user list");

  var userNames = document.getElementById("user-list");
  while( userNames.firstChild ){
    userNames.removeChild(userNames.firstChild);
  }

  var playerName = document.createElement("li");
  playerName.appendChild(document.createTextNode(user.name));
  userNames.appendChild(playerName);

  for (var key in userList) {
  	if (userList[key].name != user.name){
		var listElement = document.createElement("li");
		var text = document.createTextNode(userList[key].name);
		listElement.appendChild(text);
		userNames.appendChild(listElement);
	  	console.log(userList[key].name);
  	}

  }

  // var joinedUsers = userList;

  // var sorted = Object.keys(userList)
  // .sort(function(a, b) {
  //   return userList[b].wpm - userList[a].wpm; // Organize the category array
  // })
  // .map(function(category) {
  //   return userList[category]; // Convert array of categories to array of objects
  // });  
  // for (var i in sorted) {
  //   var listElement = document.createElement("li");  
  //   var text = document.createTextNode(sorted[i].name + "      --- WPM: " + sorted[i].wpm);  
  //   listElement.appendChild(text);
  //   userNames.appendChild(listElement);
  // }
  //console.log(userNames);
  
}


function displayInfo(roomPIN){
	var displayRoom = document.getElementById("PIN-num");
	displayRoom.insertAdjacentHTML('beforeend', roomPIN);
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