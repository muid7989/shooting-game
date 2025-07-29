let time;
let frameCountBuffer = 0;
let fps = 0;

const CANVAS_W = 960;
const CANVAS_H = 1280;

const BUTTON_W = CANVAS_W/4;
const BUTTON_H = BUTTON_W/2;
const BUTTON_Y = CANVAS_H*2/3;
const BUTTON_M = 24;

const GRID_SIZE = 64;
const GRID_W = 64;
const GRID_BASE_X = GRID_SIZE*2;
const GRID_BASE_Y = GRID_SIZE*4;
const PLAYER_H = 32;
const PLAYER_W = PLAYER_H*5;
const PLAYER_ANGLE_MAX = 45;
const PLAYER_X = CANVAS_W/2;
const PLAYER_Y = GRID_SIZE*15;
const ITEM_H = GRID_SIZE*1.5;
const ITEM_W = GRID_SIZE;
const ITEM_BASE_X = GRID_BASE_X+GRID_SIZE*2.4;
const ITEM_BASE_Y = GRID_BASE_Y;
const ITEM_ROW = 8;
const ITEM_NUM = 7;
const ITEM_COLOR = 160;
const BALL_SIZE = 10;
const BALL_SPEED = 20;
const JOYSTICK_Y = PLAYER_Y;

let gui;
let startButton, shootButton;
let startFlag = false;
let startTime;
let endTime = 0;
let player;
let items;
let joystick;
let ball;
let ballCount = 0;
const BALL_COUNT_START = 14;
let getCount;

let timeCount;
const TEXT_VIEW_SIZE = 32;

const DEBUG = true;
const DEBUG_VIEW_X = 40;
const DEBUG_VIEW_Y = 20;
const DEBUG_VIEW_H = 20;

function preload() {
}

function startFn() {
	startFlag = true;
	startTime = millis();
	itemInit(ITEM_W, ITEM_H);
	startButton.visible = false;
	getCount = 0;
	ballCount = BALL_COUNT_START;
}
function shootFn() {
	if (ballCount>0){
		ball.pos.x = player.pos.x;
		ball.pos.y = player.pos.y;
		ball.speed.x = cos(player.angle)*BALL_SPEED;
		ball.speed.y = sin(player.angle)*BALL_SPEED;
		ball.enable = true;
		ballCount--;
	}
}
function setup() {
	createCanvas(CANVAS_W, CANVAS_H);
	time = millis();
	player = {};
	player.pos = {};
	player.pos.x = PLAYER_X;
	player.pos.y = PLAYER_Y;
	player.angle = PI*3/2;
	items = [];
	ball = {};
	ball.pos = {};
	ball.speed = {};
	ball.enable = false;
	rectMode(CENTER);

	gui = createGui();
	gui.loadStyle("Seafoam");
	gui.setTextSize(48);
	startButton = buttonInit('START', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, BUTTON_Y-BUTTON_H*1.5);
	shootButton = buttonInit('SHOOT', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, JOYSTICK_Y+GRID_SIZE*2);
	joystick = createJoystick("joystick", GRID_SIZE, JOYSTICK_Y, GRID_SIZE*13, GRID_SIZE*1.5);
	joystick.setStyle({
		handleRadius: GRID_SIZE
	});
	textAlign(CENTER,CENTER);
}
function buttonInit(text, w, h, x, y) {
	let button = createButton(text, x, y, w, h);
	return button;
}
function itemInit(w, h) {
	items = [];
	for (let i=0; i<ITEM_NUM; i++){
		items[i] = {};
		items[i].pos = {};
		items[i].pos.x = GRID_SIZE*(2*i+1.5);
		items[i].pos.y = GRID_SIZE*1;
		items[i].w = w;
		items[i].h = h;
		items[i].enable = true;
	}
}
function hitDetect(tx, ty, tw, th, bx, by) {
	if (bx<tx-tw/2 || bx>tx+tw/2){
		return false;
	}
	if (by<ty-th/2 || by>ty+tw/2){
		return false;
	}
	return true;
}
function draw() {
	background(48);
	let current = millis();
	if ( (current-time)>=1000 ){
		time += 1000;
		fps = frameCount - frameCountBuffer;
		frameCountBuffer = frameCount;
	}
	if (startButton.isPressed) startFn();
	if (shootButton.isPressed) shootFn();
	if (DEBUG){
		stroke(128);
		strokeWeight(1);
		for (let i=0; i<CANVAS_H/GRID_SIZE; i++){
			line(0, i*GRID_SIZE, CANVAS_W, i*GRID_SIZE);
		}
		for (let i=0; i<CANVAS_W/GRID_SIZE; i++){
			line(i*GRID_SIZE, 0, i*GRID_SIZE, CANVAS_H);
		}
	}
	if (ball.enable){
		ball.pos.x += ball.speed.x;
		ball.pos.y += ball.speed.y;
		if (ball.pos.y<0){
			ball.enable = false;
		}
		circle(ball.pos.x, ball.pos.y, BALL_SIZE);
		let itemNum = 0;
		for (let i=0; i<items.length; i++){
			if (items[i].enable){
				if (hitDetect(items[i].pos.x, items[i].pos.y, ITEM_W, ITEM_H, ball.pos.x, ball.pos.y)){
					items[i].enable = false;
					ball.enable = false;
					getCount++;
				}else{
					itemNum++;
				}
			}
		}
		if (itemNum==0){
			itemInit(ITEM_W/2, ITEM_H/2);
		}
		if (!ball.enable && ballCount==0){
			startFlag = false;
		}
	}
	for (let i=0; i<items.length; i++){
		if (items[i].enable){
			rect(items[i].pos.x, items[i].pos.y, items[i].w, items[i].h);
		}
	}
	player.angle += joystick.valX/10;
	if (player.angle>((270+PLAYER_ANGLE_MAX)*PI/180)){
		player.angle = (270+PLAYER_ANGLE_MAX)*PI/180;
	}else if (player.angle<((270-PLAYER_ANGLE_MAX)*PI/180)){
		player.angle = (270-PLAYER_ANGLE_MAX)*PI/180;
	}
	push();
	translate(player.pos.x, player.pos.y);
	rotate(player.angle);
	rect(0, 0, PLAYER_W, PLAYER_H);
	pop();
	strokeWeight(1);
	stroke(255);
	fill(255);
	textSize(64);
	if (startFlag==false){
		textAlign(CENTER);
		text(getCount, CANVAS_W/2, GRID_SIZE*2);
	}
	text(ballCount, GRID_SIZE*13, JOYSTICK_Y+GRID_SIZE*3);
	drawGui();
	fill(255);
	stroke(255);
	textSize(16);
	strokeWeight(1);
	let debugY = DEBUG_VIEW_Y;
	text('fps:'+fps, DEBUG_VIEW_X, debugY);
	debugY += DEBUG_VIEW_H;
}
