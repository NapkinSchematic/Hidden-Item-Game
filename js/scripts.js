//hitBoxes();
var hiddenObjList = ["frog", "rose", "ankh", "key-ring", "pocket-watch", "cigarettes", "flor-de-liz", "dog", "ruler", "whistle", "fish", "electric-razor", "key", "syringe", "glasses", "revolver", "brush", "dice", "padlock", "kettlebell", "handcuffs", "beer-mug", "coffee-cup", "bone", "horse", "magnet", "wristwatch", "matchbox", "playing-card", "ladies-glove", "gear", "journal", "money", "walkie-talkie", "tobacco-pipe", "headlamp", "bottle", "boots", "domino", "spring", "doily", "fan", "clover", "horseshoe", "pencil", "butterfly", "skull", "adhesive-tape", "notepaper", "cockroach", "harmonica", "heart", "hair-pick", "angel", "flower"];

var objList = [];
var objCount = undefined;
var difficultyEnum = {
	easy: 12,
	medium: 20,
	hard: 28
};
var scoringObj = {
	itemFind: 100,
	fault: 150,
	orderedFindBonus: 25,
	fastBonus: 50,
	perfectBonus: 100,
	timerEndBonus: 100,
	noErrorBonus: 1000,
	perfectOrderBunus: 1000,
	perfectChainBonus: 2000
}
var scoreTallyObj = {
	totalScore: 0,
	totalOrderedFinds: 0,
	totalPerfectChains: 0,
	totalFastChains: 0,
	totalEasyChains: 0,
	totalChains: 0,
	totalCombos: 0,
	totalFaults: 0,
	combinedChains: 0,
	highestChainCombo: 0
}
var chainElCount = 0;
var chainLvlNameEnum = {
	1: "Good!",
	2: "Great!",
	3: "Perfect!"
}
var comboCount = 1;
var comboHistory = [0]; // default value of zero to deal with - infinity bug.
var health = 2;
var timerActive = false;
var gameTimer;
var timerMin = 0;
var timerSec = 59;
var gameScore = 0;
var chainLvl = 0;
var chainMultiplier = 0;
var chainTimer;

// start game 
var titleScreenEl = document.querySelector('.title-screen');
titleScreenEl.addEventListener('click', function() {
	playSound("perfectChainSound");
	titleScreenEl.style.display = "none";
})

// Set game difficulty
function selectDifficulty() {
	var difficultyMenuEl = document.querySelector('.difficulty-wrap');
	var easyDifficultyEL = document.querySelector('.easy-difficulty');
	var medDifficultyEL = document.querySelector('.medium-difficulty');
	var hardDifficultyEL = document.querySelector('.hard-difficulty');
	var playFieldBG = document.querySelector('.bg');
	var muteButtonEl = document.querySelector('.mute');
	var soundMuted = false;
  
	muteButtonEl.addEventListener('click', function() {
		soundMuted = !soundMuted;
		playSound("menuSound");
		
		if (soundMuted) {
			muteButtonEl.innerHTML = "♫ Sound Off";
		} else {
			muteButtonEl.innerHTML = "♫ Sound On";
		}
	});
  
	easyDifficultyEL.addEventListener('click', function() {
		hiddenObjRandomizer("easy");
		playFieldBG.classList.remove("standby");
		playSound("menuSound");
		playMusic(soundMuted);
		difficultyMenuEl.style.display = "none";
	});
  
	medDifficultyEL.addEventListener('click', function() {
		hiddenObjRandomizer("medium");
		playFieldBG.classList.remove("standby");
		playSound("menuSound");
		playMusic(soundMuted);
		difficultyMenuEl.style.display =  "none";
	});
  
	hardDifficultyEL.addEventListener('click', function() {
		hiddenObjRandomizer("hard");
		playFieldBG.classList.remove("standby");
		playSound("menuSound");
		playMusic(soundMuted);
		difficultyMenuEl.style.display =  "none";
	});
}

//Debug function (turn on all hitboxes for testing)
function hitBoxes() {
	var objWrapperEl = document.querySelector('.object-wrap');
  
	objWrapperEl.classList.toggle("full-debug");
}

// The Hidden Object Bag Generator
function hiddenObjRandomizer(difficulty) {
	var tempHiddenObjList = JSON.parse(JSON.stringify(hiddenObjList));
	var objBag = difficultyEnum[difficulty];
	var objListEl = document.querySelector('.item-col');
  
	objListEl.classList.add(difficulty);
  
	for (var i = 0; i < objBag; i ++) {
		var randomNum = Math.floor(Math.random()*objBag);

		objList.push(tempHiddenObjList.splice(randomNum,1)[0]);
	}
	
	spawnHiddenObjects(objList);
	objCount = difficultyEnum[difficulty];
}

// Add hidden object to the playfield
function setItem(item) {
	var playField = document.querySelector('.object-wrap');
	var itemEl = document.createElement("div");

	itemEl.classList.add("item");
	itemEl.classList.add(item);
	playField.appendChild(itemEl);
	addToItemList(item);
	addItemClickEvent(item);
}

//Add or remove hidden object from item list 
function addToItemList(item) {
	var itemString = item.charAt(0).toUpperCase(0) + item.slice(1);
	var itemListEl = document.querySelector('.item-col');
	var listEl = document.createElement('li');
	
	listEl.classList.add("list-"+ item);
	listEl.innerHTML = itemString;
	itemListEl.appendChild(listEl);
}

// Spawn all hidden objects
function spawnHiddenObjects(objList) {
	for (var i = 0; i < objList.length; i++) {
		setItem(objList[i]);
	}
  
	var bgImageEl = document.querySelector('.object-wrap');
	var scoreEl = document.querySelector('.score');
	var comboEl = document.querySelector('.combo');
	var healthBarEl = document.querySelector('.life-meter');
	var gameTimerEl = document.querySelector('.timer');
  
	scoreEl.classList.toggle("visible");
	comboEl.classList.toggle("visible");
	healthBarEl.classList.toggle("visible");
	gameTimerEl.classList.toggle("visible");
  
	bgImageEl.addEventListener('mousedown', function() {
		event.stopPropagation();
		chainMultiplier = 0;
		clearTimeout(chainTimer);
		updateHealthMeter();
		updateChainPop();
	});
  
	startTimer();
}

// Add event listener to a hidden object on the playfield
function addItemClickEvent(item) {
	var itemEl = document.querySelector("." + item);
	var itemListEl = document.querySelector(".list-" + item);
  
	itemEl.addEventListener('mousedown', function itemClick(event) {
		itemEl.removeEventListener('mousedown', itemClick);
		chainScoring(event);
		//cursorPop(event);
		//gameScore += scoringObj.itemFind; //chainScoring function taking care of this?
		objCount --;
		//updateScore(); // chainScoring funciton taking care of this too?!
		itemListEl.classList.toggle("found");
		playSound("findSound");
		event.stopPropagation();
		
		if (objCount <= 0) {
			clearTimeout(gameTimer);
			gameOver("You Win");
		}
	});
}

// Cursor Pop Message
function cursorPop(event, chainLvl) {
	var bgEl = document.querySelector('.object-wrap');
	var wrap = document.querySelector('.wrapper');
	var e = event;
	chainElCount ++;
	var popClass = "pop-" + chainElCount;
	var X = e.pageX - wrap.offsetLeft; 
	var Y = e.pageY - wrap.offsetTop;
	var popItemTemplateEl = document.querySelector('#chain-pop-item');
	var popItemEl = popItemTemplateEl.content.querySelector('.pop-item')
	var popItemVal = popItemEl.querySelector('.chain-val');
	var popItemName = popItemEl.querySelector('.chain-type');
	
	popItemName.innerHTML = chainLvlNameEnum[chainLvl];
	//popItemVal.innerHTML = chainMultiplier;
	popItemVal.innerHTML = comboCount;
	popItemEl.classList.add(popClass);
	popItemEl.style.left = (X-60) + "px";
	popItemEl.style.top = (Y-15) + "px";
	bgEl.appendChild(popItemEl.cloneNode(true));
	killPop(popClass);
};

// Remove pop item element from dom
function killPop(popClass) {
	var popItem = document.querySelectorAll("." + popClass);
	setTimeout(function() {
		for (var i = 0; i < popItem.length; i++) {
			popItem[i].parentNode.removeChild(popItem[i]);
		}
	},1000);
}

// Chain scoring system
function chainScoring(event) {
	var tmpScoreVal = 0;
	var chainSound;
	
	if (chainLvl == 3) {
		chainSound = 3;
		chainMultiplier += 2;
		scoreTallyObj.totalPerfectChains ++;
    	scoreTallyObj.totalChains ++;
		comboCount ++;
		cursorPop(event, chainLvl);
		tmpScoreVal += scoringObj.perfectBonus; //perfect click bonus
		clearTimeout(chainTimer);
	} else if (chainLvl == 2) {
		chainSound = 2;
		scoreTallyObj.totalFastChains ++;
		scoreTallyObj.totalChains ++;
		chainMultiplier ++;
		comboCount ++;
		cursorPop(event, chainLvl);
		tmpScoreVal += scoringObj.fastBonus; //fast click bonus
		clearTimeout(chainTimer);
	} else if (chainLvl == 1) {
		chainSound = 1;
		scoreTallyObj.totalEasyChains ++;
		scoreTallyObj.totalChains ++;
		comboCount ++;
		cursorPop(event, chainLvl);
		if (chainMultiplier >= 1) {
			chainMultiplier --;
		} else {
			comboHistory.push(comboCount); // store this combo string
			comboCount = 1; // reset combo string
			chainMultiplier = 0;
		}
		
		clearTimeout(chainTimer);
	} else if (chainLvl <= 0) {
		chainMultiplier = 0;
	}
	
	chainLvl = 3;
	tmpScoreVal += scoringObj.itemFind; //base click pts
	
	if (chainMultiplier > 0) {
		tmpScoreVal = tmpScoreVal * chainMultiplier;
		gameScore = gameScore + tmpScoreVal;
	} else {
		gameScore = gameScore + tmpScoreVal;
	}
	
	updateScore();
	updateChainPop(chainSound);
	startChainTimer();
}

// Chaining Timer
function startChainTimer() {
	chainTimer = setTimeout(function() {
     	chainLvl --;
		console.log(chainLvl);
	  	
		if (chainLvl > 0) {
			startChainTimer();
	  	} else if (chainLvl == 0) {
			clearTimeout(chainTimer);
			chainMultiplier = 0;
			comboHistory.push(comboCount); // store this combo string
			comboCount = 1; // reset combo string
			updateChainPop();
		} 
	},1000);
}

// Update the chain count element
function updateChainPop(chainSound) {
	var chainPopEl = document.querySelector('.combo');
	
	chainPopEl.innerHTML = "Chain X " + chainMultiplier;
	
	if (chainSound == 3) {
		playSound("perfectChainSound");
	} else if (chainSound == 2) {
		playSound("fastChainSound");
	} else if (chainSound == 1) {
		playSound("easyChainSound");
	}
}

// Play sound effect (pass sfx audio ID)
function playSound(sfxID) {
	var soundEffect = document.querySelector("#" + sfxID);

	if (!soundEffect.ended) {
		soundEffect.load();
	}
	
	soundEffect.play();
}

// Play background music
function playMusic(bool) {
	var soundMusic = document.querySelector('#themeSong');
	
	if (bool === true) {
		//soundMusic.play();
		soundMusic.volume = 0;
	} else if (bool === false) {
		soundMusic.play();
		soundMusic.volume = 0.08;
	}
}

// Update the health element when you miss/take damage
function updateHealthMeter() {
	var healthEl = document.querySelector('.life-meter');
	var healthBlocks = healthEl.querySelectorAll('.heart-piece');
	
	scoreTallyObj.totalFaults += 1;
	console.log(scoreTallyObj.totalFaults);
	comboHistory.push(comboCount); // store this combo string
	chainLvl = 0; // reset chain lvl on fault
	comboCount = 1; // reset combo string on fault
	
	if (health <= 0) {
		healthBlocks[health].classList.add("empty");
		playSound("faultSound");
		clearTimeout(gameTimer);
		timerMin = 0;
		timerSec = 0;
		gameOver("Game Over");
	} else {
		healthBlocks[health].classList.add("empty");
		playSound("faultSound");
		health --;
		gameScore -= scoringObj.fault;
		updateScore();
	}
}

// Full Game Over routine TODO Replace this with a proper Destroy Teardown Clean Up process
function gameOver(message) {
	var gameBG = document.querySelector('.bg');
	var gameOverEl = document.querySelector('.game-over-wrap');
	var gameOverMessageEl = gameOverEl.querySelector('.game-over-message');
	var gameOverRetryButton = gameOverEl.querySelector('.retry');
	var gameScoreEl = document.querySelector('.score');
	var gameChainEl = document.querySelector('.combo');
	var healthBarEl = document.querySelector('.life-meter');
	var gameTimerEl = document.querySelector('.timer');
	var scoreWithTimeBonus = scoreTallyObj.totalScore + ((timerMin * 60000) + (timerSec * 1000));
	var perfectChainsEl = document.querySelector('.perfect-chains');
	var fastChainsEl = document.querySelector('.fast-chains');
	var easyChainsEl = document.querySelector('.easy-chains');
	var longesstChainEl = document.querySelector('.longest-chain');
	var totalChainsEl = document.querySelector('.total-chains');
	var totalFaultsEl = document.querySelector('.total-faults');
	var gameTimeBonusEl = document.querySelector('.time-bonus');
	var totalScoreEl = document.querySelector('.total-score');
    
	comboHistory.push(comboCount); // push in case of perfect game. (clean this up)
	perfectChainsEl.innerHTML = scoreTallyObj.totalPerfectChains;
	fastChainsEl.innerHTML = scoreTallyObj.totalFastChains;
	easyChainsEl.innerHTML = scoreTallyObj.totalEasyChains;
	longesstChainEl.innerHTML = getLargestNum(comboHistory);
	totalChainsEl.innerHTML = scoreTallyObj.totalChains;
	totalFaultsEl.innerHTML = scoreTallyObj.totalFaults;
	gameTimeBonusEl.innerHTML = (timerMin * 15000) + (timerSec * 250);
	totalScoreEl.innerHTML = scoreWithTimeBonus;
	gameScoreEl.classList.toggle("visible");
	gameChainEl.classList.toggle("visible");
	healthBarEl.classList.toggle("visible");
	gameTimerEl.classList.toggle("visible");
	gameBG.classList.add("game-over");
	gameOverMessageEl.innerHTML = message;
	gameOverEl.style.display = "block";
  
	gameOverRetryButton.addEventListener('click', function() {
		//location.reload(); // this would normally work, Codepen disables it...
		location.href = location.href;
	});
};

// Helper function to get largest number in an array
function getLargestNum(numArray) {
  return Math.max.apply(null, numArray);
}

// Start the game timer
function startTimer() {
	var gameTimerEl = document.querySelector('.timer');
	
	gameTimerEl.innerHTML = timerMin +":"+ timerSec;
	
	gameTimer = setTimeout(function() {
    	timerSec --;
    
		if (timerSec < 0) {
			timerMin --;
			timerSec = 59
			gameTimerEl.innerHTML = timerMin +":"+ timerSec;
			startTimer();
		} else if (timerMin == 0 && timerSec == 0) {
			gameOver("Time's Up");
			clearTimeout(gameTimer);
			return;
		} else {
			if(timerSec < 10) {
				timerSec = "0" + timerSec;
			}
			gameTimerEl.innerHTML = timerMin +":"+ timerSec;
			startTimer();
		}
	},1000);
}

// Update the scoring element with score current value
function updateScore() {
	var scoreEl = document.querySelector('.score');
	
	scoreTallyObj.totalScore = gameScore;
	scoreEl.innerHTML = gameScore;
}

//Call the select difficulty to start the game... TEMP
selectDifficulty();