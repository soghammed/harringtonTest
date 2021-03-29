//game params
const HEIGHT = 550;
const WIDTH = HEIGHT * 0.9;	
const GRID_SIZE = 5; //num of rows and cols
const FPS = 30; //frames per sec
const CELL = WIDTH / (GRID_SIZE + 2); //size of cells + left & right margin
const STROKE = CELL / 12; //stroke width
const DOT = STROKE; //radius of dot
const MARGIN = HEIGHT - (GRID_SIZE + 1) * CELL; //top margin for score
const DELAY_END = 3; //between games;
const DELAY_COMP = 0.5; //secs for comp to play turn;

//text
const TEXT_COMP = "AI";
const TEXT_PLAYER = "YOU";
const TEXT_SIZE_CELL = CELL / 4;
const TEXT_SIZE_SCORE = MARGIN / 6;
const TEXT_TIE = "DRAW!";
const TEXT_WIN = "WINS!";

//definitions
const Side = {
	BOT: 0,
	LEFT: 1,
	RIGHT: 2,
	TOP: 3
}


//colors
const COLOR_GAME_RESULT = "red";
const COLOR_BOARD = 'black';
const COLOR_BORDER = 'wheat';
const COLOR_DOT = "white";
const COLOR_COMP = "rgb(255, 0, 0)";
const COLOR_COMP_LIT = 'rgb(255, 0, 0, 0.3)';
const COLOR_PLAYER = 'rgb(255, 240, 20)';
const COLOR_PLAYER_LIT = 'rgb(255, 240, 20, 0.3)';

//init canv and append to dom
var canv = document.createElement('canvas');
canv.height = HEIGHT;
canv.width = WIDTH;
document.getElementById('content').appendChild(canv);

//relative coords
var canvRect = canv.getBoundingClientRect();
var ctx = canv.getContext('2d');

//game variables
var squares, 
playersTurn, 
currentCells, 
scoreComp, 
scorePlayer, 
timeEnd, 
timeComp;

//start game on load
newGame();

//event handler
canv.addEventListener("mousemove", highlightGrid)
canv.addEventListener("click", gridClick)

ctx.lineWidth = STROKE;
ctx.textAlign = "center"
ctx.textBaseline = "middle"

//run game loop
setInterval(loop, 1000/FPS);

function loop(){
	drawBoard();
	drawSquares();
	drawGrid();
	drawScores();
	computersTurn();
}

function gridClick(/** @type  {MouseEvent} */ event){
	if(!playersTurn || timeEnd > 0){
		return;
	}
	selectSide();
}

function drawBoard(){
	ctx.fillStyle = COLOR_BOARD;
	ctx.strokeStyle = COLOR_BORDER;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.strokeRect(STROKE/2, STROKE/2,  WIDTH - STROKE, HEIGHT - STROKE);
}


function drawGrid(){
	for(let i = 0; i < (GRID_SIZE + 1); i++){
		//cols
		for(let j = 0; j < (GRID_SIZE+1); j++){
			drawDot(getGridX(j), getGridY(i));
		}
	}
}

function drawSquares(){
	for(let row of squares){
		for(let square of row){
			square.drawSides();
			square.drawFill();
		}
	}
}

function drawScores(){
	let colComp = playersTurn ? COLOR_COMP_LIT : COLOR_COMP;
	let colPlayer = playersTurn ? COLOR_PLAYER : COLOR_PLAYER_LIT;
	drawText(
		TEXT_PLAYER,
		WIDTH * 0.25,
		MARGIN * 0.25,
		colPlayer,
		TEXT_SIZE_SCORE
	) 
	drawText(
		TEXT_COMP,
		WIDTH * 0.75,
		MARGIN * 0.25,
		colComp,
		TEXT_SIZE_SCORE
	) 
	drawText(
		scorePlayer,
		WIDTH * 0.25,
		MARGIN * 0.55,
		colPlayer,
		TEXT_SIZE_SCORE * 2
	)
	drawText(
		scoreComp,
		WIDTH * 0.75,
		MARGIN * 0.55,
		colComp,
		TEXT_SIZE_SCORE * 2
	)
	//gameover text
	if(timeEnd > 0){
		timeEnd--;
		//handle a tie;
		if(scoreComp == scorePlayer){
			//tie text
			drawText(TEXT_TIE, WIDTH * 0.5, MARGIN * 0.6, COLOR_GAME_RESULT, TEXT_SIZE_SCORE);
		}else{
			let playerWins = scorePlayer > scoreComp;
			let winsText = playerWins ? "Win!" : TEXT_WIN;
			let color = playerWins ? COLOR_PLAYER : COLOR_COMP;
			let text = playerWins ? TEXT_PLAYER : TEXT_COMP;
			drawText(text, WIDTH * 0.5, MARGIN * 0.5, color, TEXT_SIZE_SCORE);
			drawText(winsText, WIDTH * 0.5, MARGIN * 0.7, color, TEXT_SIZE_SCORE);
		}

		if(timeEnd == 0){
			newGame();
		}
	}
}

function drawLine(x0, y0, x1, y1, color){
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(x0,y0);
	ctx.lineTo(x1,y1);
	ctx.stroke();
}

function drawDot(x, y){
	ctx.fillStyle = COLOR_DOT;
	ctx.beginPath();
	ctx.arc(x, y, DOT, 0, Math.PI * 2) //360 degrees
	ctx.fill();
}

function getValidNeighbourSides(row, col){
	let sides = [];
	let square = squares[row][col];
	//check left side
	if(!square.sideLeft.selected){ 
		if(col == 0 || squares[row][col - 1].numSelected < 2){
			sides.push(Side.LEFT);
		}
	}
	//check right side
	if(!square.sideRight.selected){
		if(col == squares[0].length - 1 || squares[row][col+1].numSelected < 2){
			sides.push(Side.RIGHT);
		}
	}
	//check top side
	if(!square.sideTop.selected){
		if(row == 0 || squares[row-1][col].numSelected < 2){
			sides.push(Side.TOP);
		}
	}
	//check bottom side
	if(!square.sideBot.selected){
		if(row == squares.length - 1 || squares[row + 1][col].numSelected < 2){
			sides.push(Side.BOT);
		}
	}
	return sides;
}

function computersTurn(){
	if(playersTurn || timeEnd > 0){
		return;
	}

	//count down till comp makes a selection
	if(timeComp > 0){
		timeComp--;
		if(timeComp == 0){
			selectSide();
			// playersTurn = !playersTurn;
		}
		return;
	}

	//set up the options array
	options = [];
	options[0] = [];
	options[1] = [];
	options[2] = [];

	//first priority - select a sqaure that has 3 sides completed;
	//second priority - select a square that has 0 or 1 sides completed;
	//final priority - select a square that has 2 sides completed;

	for(let i = 0; i < squares.length; i++){
		for(let j = 0; j < squares[0].length; j++){
			switch(squares[i][j].numSelected){
				case 3:
					options[0].push({
						square: squares[i][j],
						sides: []
					});
					break;
				case 0:
				case 1:
					let sides = getValidNeighbourSides(i, j);
					let priority = sides.length > 0 ? 1 : 2;
					options[priority].push({
						square: squares[i][j], 
						sides: sides
					});
					break;
				case 2:
					options[2].push({
						square: squares[i][j],
						sides:[]
					});
					break;
			}
		}
	}
	let option;
	if(options[0].length > 0){
		option = options[0][Math.floor(Math.random() * options[0].length)];
	} else if(options[1].length > 0){
		option = options[1][Math.floor(Math.random() * options[1].length)];
	} else if(options[2].length > 0){
		option = options[2][Math.floor(Math.random() * options[2].length)];
	}

	//randomly choose a valid side
	let side = null;
	if(option.sides.length > 0){
		side = option.sides[Math.floor(Math.random() * option.sides.length)];
	}
	//get square coords;
	let coords = option.square.getFreeSideCoords(side);
	highlightSide(coords.x, coords.y);

	//randomly choose a square in priority order;
	//delay
	timeComp = Math.ceil(DELAY_COMP * FPS);
}

function getColor(player, light){
	if(player){
		return light ? COLOR_PLAYER_LIT : COLOR_PLAYER 
	}else{
		return light ? COLOR_COMP_LIT : COLOR_COMP 
	}
}

function getText(player){
	return player ? TEXT_PLAYER : TEXT_COMP
}

function getGridX(col){
	return CELL * (col + 1); //left margin equal to cell coll
}

function getGridY(row){
	return MARGIN + CELL * row;
}

function highlightGrid(/** @type  {MouseEvent} */ event){
	if(!playersTurn || timeEnd > 0){
		return;
	}

	//get mouse position relative to canvas
	let x = event.clientX - canvRect.left;
	let y = event.clientY - canvRect.top;

	//higlight the square's side
	highlightSide(x, y);
}

function highlightSide(x, y){
	//clear previous highlighting
	for(let row of squares){
		for(let square of row){
			square.highlight = null;
		}
	}

	//check each cell
	let rows = squares.length;
	let cols = squares[0].length;
	currentCells = [];

	OUTER: for(let i = 0; i < rows; i++){
		for(let j = 0; j < cols; j++){
			if(squares[i][j].contains(x, y)){
				let side = squares[i][j].highlightSide(x,y);
					if(side != null){
					currentCells.push({row: i, col: j});
				}

				//determine neighbour
				let row = i, col = j, highlight, neighbour = true;
				if(side == Side.LEFT && j > 0){
					col = j - 1;
					highlight = Side.RIGHT;
				} else if(side == Side.RIGHT && j < cols - 1){
					col = j + 1;
					highlight = Side.LEFT;
				} else if(side == Side.TOP && i > 0){
					row = i - 1;
					highlight = Side.BOT;
				} else if(side == Side.BOT && i < rows - 1){
					row = i + 1;
					highlight = Side.TOP;
				}else{
					neighbour = false;
				}
				//highlight neighbour
				if(neighbour){
					squares[row][col].highlight = highlight;
					currentCells.push({row: row, col: col});
				}
				break OUTER;
			}
		}
	}
}

function newGame(){
	timeEnd = 0;
	scoreComp = 0;
	scorePlayer = 0;
	currentCells = [];
	playersTurn = Math.random() >= 0.5;
	//set up the squares
	squares = [];
	for(let i = 0; i < GRID_SIZE; i++){
		squares[i] = [];
		for(let j = 0; j < GRID_SIZE; j++){
			squares[i][j] = new Square(getGridX(j), getGridY(i), CELL, CELL);
		}
	}
}

function selectSide(){
	if(currentCells == null || currentCells.length == 0){
		return;
	}
	//select the side(s)
	let filledSquare = false;
	for(let cell of currentCells){
		if(squares[cell.row][cell.col].selectSide()){
			filledSquare = true;
		}
	}
	currentCells = [];


	//check for winner
	if(filledSquare){
		//TODO check winner;
		if(scorePlayer + scoreComp == GRID_SIZE * GRID_SIZE){
			//gameover
			timeEnd = Math.ceil(DELAY_END * FPS);
		}

	}else{
		//next player's turn
		playersTurn = !playersTurn;
	}
}

function drawText(text, x, y, color, size){
	ctx.fillStyle = color;
	ctx.font = size + "px dejavu sans mono";
	ctx.fillText(text, x, y);
}
//create square object
function Square(x, y, w, h){
	this.w = w;
	this.h = h;
	this.left = x;
	this.right = x + w
	this.top = y;
	this.bot = y+h;
	this.numSelected = 0;
	this.owner = null;
	this.highlight = null;
	this.sideBot = {
		owner: null,
		selected:false 
	}
	this.sideLeft = {
		owner: null,
		selected:false 
	}
	this.sideRight = {
		owner: null,
		selected:false 
	}
	this.sideTop = {
		owner: null,
		selected:false 
	}

	this.selectSide = function(){
		if(this.highlight == null){
			return;
		}
		//select the highlighted side
		switch(this.highlight){
			case Side.BOT:
				this.sideBot.owner = playersTurn;
				this.sideBot.selected = true;
				break;
			case Side.LEFT:
				this.sideLeft.owner = playersTurn;
				this.sideLeft.selected = true;
				break;
			case Side.RIGHT:
				this.sideRight.owner = playersTurn;
				this.sideRight.selected = true;
				break;
			case Side.TOP:
				this.sideTop.owner = playersTurn;
				this.sideTop.selected = true;
				break;
		}
		this.highlight = null;

		//increase numSelected
		this.numSelected++;
		if(this.numSelected == 4){
			this.owner = playersTurn;

			//TODO score
			if(playersTurn){
				scorePlayer++;
			}else{
				scoreComp++;
			}
			//filled
			return true; 
		}
		//not filled
		return false;
	}

	this.contains = function(x, y){
		return x >= this.left && x < this.right && y >= this.top && y < this.bot;
	}
	this.drawFill = () => {
		if(this.owner == null){
			return; 
		}

		//light background
		ctx.fillStyle = getColor(this.owner, true);
		ctx.fillRect(
			this.left + STROKE, this.top + STROKE, 
			this.w - STROKE * 2, this.h - STROKE * 2
		);

		//owner text
		drawText(
			getText(this.owner),
			this.left + this.w/2,
			this.top + this.h/2,
			getColor(this.owner, false),
			TEXT_SIZE_CELL
		)

	}
	this.drawSide = function(side, color){
		switch(side){
			case Side.BOT:
				drawLine(this.left, this.bot, this.right, this.bot, color);
				break;
			case Side.LEFT:
				drawLine(this.left, this.top, this.left, this.bot, color);
				break;
			case Side.RIGHT:
				drawLine(this.right, this.top, this.right, this.bot, color);
				break;
			case Side.TOP:
				drawLine(this.left, this.top, this.right, this.top, color);
				break;
		}
	}
	this.drawSides = function(){
		//highlighting
		if(this.highlight != null){
			this.drawSide(this.highlight, getColor(playersTurn, true));
		}

		//selected sides;
		if(this.sideBot.selected){
			this.drawSide(Side.BOT, getColor(this.sideBot.owner, false))
		}
		if(this.sideLeft.selected){
			this.drawSide(Side.LEFT, getColor(this.sideLeft.owner, false))
		}
		if(this.sideRight.selected){
			this.drawSide(Side.RIGHT, getColor(this.sideRight.owner, false))
		}
		if(this.sideTop.selected){
			this.drawSide(Side.TOP, getColor(this.sideTop.owner, false))
		}
	}
	//return random free side coords
	this.getFreeSideCoords = function(side) {
		//valid coords of each side;
		let coordsBot = {x: this.left + this.w/2,  y: this.bot - 1};
		let coordsLeft = {x: this.left,  y: this.top + this.h / 2};
		let coordsRight = {x: this.right - 1,  y: this.top + this.h / 2};
		let coordsTop = {x: this.left + this.w/2,  y: this.top};
		let freeCoords = [];

		//get coords of given side
		let coords = null;
		switch(side){
			case Side.BOT:
				coords = coordsBot;
				break;
			case Side.LEFT:
				coords = coordsLeft;
				break;				
			case Side.RIGHT:
				coords = coordsRight;
				break;
			case Side.TOP:
				coords = coordsTop;
				break;		
		}

		//return requested side's coordinates;
		if(coords != null){
			return coords;
		}

		if(!this.sideBot.selected){
			freeCoords.push(coordsBot)
		}
		if(!this.sideLeft.selected){
			freeCoords.push(coordsLeft)
		}
		if(!this.sideRight.selected){
			freeCoords.push(coordsRight)
		}
		if(!this.sideTop.selected){
			freeCoords.push(coordsTop)
		}
		return freeCoords[Math.floor(Math.random() * freeCoords.length)];
	}
	this.highlightSide = function(x,y){
		//calc distance to each side
		let dBot = this.bot - y;
		let dLeft = x - this.left;
		let dRight = this.right - x;
		let dTop = y - this.top;
		//determine closest value
		let dClosest = Math.min(dBot, dLeft, dRight, dTop);

		//higlight the closest if not selected;
		if(dClosest == dBot && !this.sideBot.selected){
			//higlight
			this.highlight = Side.BOT;
		}else if(dClosest == dLeft && !this.sideLeft.selected){
			//higlight
			this.highlight = Side.LEFT;
		}else if(dClosest == dRight && !this.sideRight.selected){
			//higlight
			this.highlight = Side.RIGHT;
		}else if(dClosest == dTop && !this.sideTop.selected){
			//higlight
			this.highlight = Side.TOP;
		}

		//return highlighted side
		return this.highlight; 
	}
}