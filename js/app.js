const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG = '<img src="img/glue.png" />';

var gBoard;
var gGamerPos;
var gBallInterval;
var gGlueInterval;
var gBallsOnBoard = 5;
var gBallsCollected;
var gBallsAppearTime = 3000;
var gIsGlued;
var gEmptyCells = [];

function initGame() {
	gBallsCollected = 0;
	gIsGlued = false;
	if (gBallInterval) clearInterval(gBallInterval);
	if (gGlueInterval) clearInterval(gGlueInterval);
	document.querySelector('.collected span').innerText = 0;
	gGamerPos = { i: getRandomInt(1, 8), j: getRandomInt(1, 10) };
	gBoard = buildBoard();
	renderBoard(gBoard);
	createStartingBalls(gBallsOnBoard);
	gBallInterval = setInterval(createBall, gBallsAppearTime);
	gGlueInterval = setInterval(createGlue, 3000);
}

function checkVictory() {
	if (gBallsOnBoard === 0) {
		clearInterval(gBallInterval);
		clearInterval(gGlueInterval);
		alert(`Congratulations! You WON!!!`);
	}
}

function createGlue() {
	// creates a glue on an empty cell on the board
	gEmptyCells = getEmptyVals(gBoard);
	var gluePos = gEmptyCells.splice(getRandomInt(0, gEmptyCells.length - 1))[0];
	gBoard[gluePos.i][gluePos.j].gameElement = GLUE;
	renderCell({ i: gluePos.i, j: gluePos.j }, GLUE_IMG);
	// removes the glue after a certain amount of time
	setTimeout(function () {
		gBoard[gluePos.i][gluePos.j].gameElement = null;
		renderCell({ i: gluePos.i, j: gluePos.j }, '');
	}, 10000)
}

function createBall() {
	// creates a ball on a random empty cell on the board
	gEmptyCells = getEmptyVals(gBoard);
	var gluePos = gEmptyCells.splice(getRandomInt(0, gEmptyCells.length - 1));
	gBoard[gluePos[0].i][gluePos[0].j].gameElement = BALL;
	renderCell({ i: gluePos[0].i, j: gluePos[0].j }, BALL_IMG);
	gBallsOnBoard++;
}

function createStartingBalls(amount) {
	// creates the starting balls on random empty cells on the board
	for (var k = 0; k < amount; k++) {
		gEmptyCells = getEmptyVals(gBoard);
		var gluePos = gEmptyCells.splice(getRandomInt(0, gEmptyCells.length - 1));
		gBoard[gluePos[0].i][gluePos[0].j].gameElement = BALL;
		renderCell({ i: gluePos[0].i, j: gluePos[0].j }, BALL_IMG);
	}
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)
	// var board = new Array(10);
	// for (var i = 0; i < board.length; i++) {
	// 	board[i] = new Array(12);
	// }
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };
			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	// sets up the secret passes
	board[0][5].type = FLOOR
	board[9][5].type = FLOOR
	board[5][0].type = FLOOR
	board[5][11].type = FLOOR
	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var cellClass = getClassName({ i: i, j: j })
			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';
			strHTML += `<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`;
			switch (currCell.gameElement) {
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
				case GLUE:
					strHTML += GLUE_IMG;
			}
			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGlued) return;
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;
	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(jAbsDiff === gBoard[0].length - 1 && iAbsDiff === 0) ||
		(jAbsDiff === 0 && iAbsDiff === gBoard.length - 1)) {
		if (targetCell.gameElement === BALL) {
			console.log('Collecting!');
			gBallsCollected++;
			gBallsOnBoard--;
			document.querySelector('.collected span').innerText = gBallsCollected;
			playSound();
		} else if (targetCell.gameElement === GLUE) {
			gIsGlued = true;
			setTimeout(function () { gIsGlued = false }, 3000);
		}
		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');
		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
	} 
	checkVictory();
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) moveTo(i, gBoard[0].length - 1);
			else moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (j === gBoard[0].length - 1) moveTo(i, 0);
			else moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0) moveTo(gBoard.length - 1, j);
			else moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === gBoard.length - 1) moveTo(0, j);
			else moveTo(i + 1, j);
			break;
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

// set a mode accoring to the button pressed
function setMode(elBtn, ballsAmount, timeInterval) {
	gBallsAppearTime = timeInterval;
	gBallsOnBoard = ballsAmount;
	var elEasyBtn = document.querySelector('.easy');
	var elMedBtn = document.querySelector('.medium');
	var elHardBtn = document.querySelector('.hard');
	var elImpBtn = document.querySelector('.impossible');

	console.log(elBtn.className);
	switch (elBtn.className) {
		case 'easy':
			switchBtnClasses(elEasyBtn, elHardBtn, elMedBtn, elImpBtn);
			break;
		case 'medium':
			switchBtnClasses(elMedBtn, elEasyBtn, elHardBtn, elImpBtn);
			break;
		case 'hard':
			switchBtnClasses(elHardBtn, elEasyBtn, elMedBtn, elImpBtn);
			break;
		case 'impossible':
			switchBtnClasses(elImpBtn, elHardBtn, elEasyBtn, elMedBtn);
	}
	initGame();
}


function switchBtnClasses(btnToAdd, btnToRemove1, btnToRemove2, btnToRemove3) {
	btnToAdd.classList.add('mode');
	btnToRemove1.classList.remove('mode');
	btnToRemove2.classList.remove('mode');
	btnToRemove3.classList.remove('mode');
}

// gets an array and return an array with it's empty cells
function getEmptyVals(board) {
	var empties = [];
	for (var i = 1; i < board.length - 1; i++) {
		for (var j = 1; j < board[0].length - 1; j++) {
			if (board[i][j].gameElement === null) empties.push({ i: i, j: j });
		}
	}
	empties.push({ i: 0, j: 5 }, { i: 9, j: 5 }, { i: 5, j: 0 }, { i: 5, j: 11 })
	return empties;
}


// function wait(ms) {
// 	var start = new Date().getTime();
// 	var end = start;
// 	while (end < start + ms) {
// 		end = new Date().getTime();
// 	}
// }