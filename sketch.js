/* =====================================================
   原始角色 / 動畫 / 音樂（完全保留，不改數值）
===================================================== */
let spriteSheet1, spriteSheet2, spriteSheet3, bgm;
let frame1 = 0, frame2 = 0, frame3 = 0;
let animCounter1 = 0, animCounter2 = 0, animCounter3 = 0;

const frameCount1 = 7, frameW1 = 268 / 7, frameH1 = 87;
const frameCount2 = 7, frameW2 = 268 / 7, frameH2 = 87;
const frameCount3 = 20, frameW3 = 1155 / 20, frameH3 = 63;

let playerIdle, playerUp, playerDown, playerLeft, playerRight;
let playerX, playerY, playerFrame = 0, playerAnimCounter = 0;
let playerState = "idle";

let fairySheet;
let fairyFrame = 0, fairyCounter = 0;
const fairyFrameCount = 4, fairyFrameW = 140 / 5, fairyFrameH = 43; 

let bgmStarted = false;

/* =====================================================
   問題系統
===================================================== */
let rawQuestions = [];
let questions = [];
let gameState = "free"; // free / question
let activeAsker = -1;
let activeQuestion = null;

/* 🔹 統一漫畫風格文字框 */
let dialogText = "";
let dialogTimer = 0;
let showDialogBoxFlag = false; // 是否顯示對話框（漫畫框）

const askers = [
  { start: 0, answered: 0, done: false },
  { start: 2, answered: 0, done: false },
  { start: 4, answered: 0, done: false }
];

/* ================= preload ================= */
function preload() {
  spriteSheet1 = loadImage("picture/Questioner 1.png");
  spriteSheet2 = loadImage("picture/Questioner 2.png");
  spriteSheet3 = loadImage("picture/Questioner 3.png");

  playerIdle = loadImage("picture/Players/idle.png");
  playerUp = loadImage("picture/Players/up.png");
  playerDown = loadImage("picture/Players/down.png");
  playerLeft = loadImage("picture/Players/lift.png");
  playerRight = loadImage("picture/Players/right.png");

  fairySheet = loadImage("picture/Little Elf.png");
  bgm = loadSound("picture/BGM.mp3");

  rawQuestions = loadStrings("question.csv");
}

/* ================= setup ================= */
function setup() {
  createCanvas(windowWidth, windowHeight);
  playerX = width / 2;
  playerY = height * 0.75;
  parseQuestions();
  textFont("sans-serif");
}

/* ================= draw ================= */
function draw() {
  clear();

  drawAsker1();
  drawAsker2();
  drawAsker3();
  drawPlayer();
  drawFairy();
  drawInteractionHint();

  // 玩家靠近提問者才顯示題目
  if (gameState === "question" && activeQuestion && activeAsker !== -1) {
    drawQuestionPanel();
  } else {
    activeQuestion = null; // 玩家離開則題目消失
  }

  drawDialogBox(); // 漫畫框對話
}

/* =====================================================
   提問者（原樣）
===================================================== */
function drawAsker1() {
  let x = width - frameW1 * 2 - 90;
  let y = height / 2 - frameH1 - 60;
  animCounter1++; if (animCounter1 % 10 === 0) frame1 = (frame1 + 1) % frameCount1;
  image(spriteSheet1, x, y, frameW1 * 2.5, frameH1 * 2.5,
    frame1 * frameW1, 0, frameW1, frameH1);
}
function drawAsker2() {
  let x = 15;
  let y = height / 2 - frameH2 - 60;
  animCounter2++; if (animCounter2 % 10 === 0) frame2 = (frame2 + 1) % frameCount2;
  image(spriteSheet2, x, y, frameW2 * 2.5, frameH2 * 2.5,
    frame2 * frameW2, 0, frameW2, frameH2);
}
function drawAsker3() {
  let x = width / 2 - frameW3;
  let y = height * 0.03;
  animCounter3++; if (animCounter3 % 6 === 0) frame3 = (frame3 + 1) % frameCount3;
  image(spriteSheet3, x, y, frameW3 * 2.2, frameH3 * 2.2,
    frame3 * frameW3, 0, frameW3, frameH3);
}

/* =====================================================
   玩家（原樣）
===================================================== */
function drawPlayer() {
  let sheet;
  if (playerState === "idle") {
    sheet = playerIdle;
    image(sheet, playerX - sheet.width, playerY - sheet.height,
      sheet.width * 2, sheet.height * 2);
  } else {
    sheet =
      playerState === "up" ? playerUp :
      playerState === "down" ? playerDown :
      playerState === "left" ? playerLeft :
      playerState === "right" ? playerRight :
      playerIdle;

    let fw = sheet.width / 4;
    if (++playerAnimCounter % 10 === 0) playerFrame = (playerFrame + 1) % 4;
    image(sheet, playerX - fw, playerY - sheet.height,
      fw * 2, sheet.height * 2,
      playerFrame * fw, 0, fw, sheet.height);
  }
  updatePlayerMovement();
}

/* =====================================================
   小精靈
===================================================== */
function drawFairy() {
  if (++fairyCounter % 12 === 0)
    fairyFrame = (fairyFrame + 1) % fairyFrameCount;

  image(
    fairySheet,
    playerX - 80,
    playerY - 120 + sin(frameCount * 0.05) * 8,
    fairyFrameW * 2,
    fairyFrameH * 2,
    fairyFrame * fairyFrameW,
    0,
    fairyFrameW,
    fairyFrameH
  );
}

/* =====================================================
   E 提示
===================================================== */
function drawInteractionHint() {
  if (gameState !== "free") return;
  if (getNearestAsker() === -1) return;

  fill(0,180);
  rect(width/2-120, height-60, 240, 34, 8);
  fill(255);
  textAlign(CENTER,CENTER);
  textSize(18);
  text("按 E 進行互動", width/2, height-43);
}

/* =====================================================
   題目面板（漫畫風格）
===================================================== */
function drawQuestionPanel() {
  fill(255,240);
  stroke(0);
  strokeWeight(3);
  rect(width*0.125, 40, width*0.75, 200, 20);

  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(26);
  text(activeQuestion.q, width/2, 60);

  textSize(22);
  text(
    "1. " + activeQuestion.a +
    "\n2. " + activeQuestion.b +
    "\n3. " + activeQuestion.c,
    width/2, 120
  );
}

/* =====================================================
   🔹 通用漫畫框對話
===================================================== */
function drawDialogBox() {
  if(dialogTimer<=0) return;
  dialogTimer--;

  fill(255, 230);
  stroke(0);
  strokeWeight(3);
  rect(width*0.2, height*0.75, width*0.6, 80, 16);

  fill(0);
  noStroke();
  textAlign(CENTER,CENTER);
  textSize(22);
  text(dialogText, width/2, height*0.75 + 40);
}

/* =====================================================
   CSV 解析
===================================================== */
function parseQuestions() {
  rawQuestions.slice(1).forEach(r=>{
    let c=r.split(",");
    questions.push({
      q:c[1], a:c[2], b:c[3], c:c[4],
      correct:c[5],
      correctMsg:c[6],
      wrongMsg:c[7],
      hint:c[8]
    });
  });
}

/* =====================================================
   操作
===================================================== */
function keyPressed() {
  if (!bgmStarted) { userStartAudio(); bgm.loop(); bgmStarted=true; }

  if (keyCode===69 && gameState==="free") {
    activeAsker=getNearestAsker();
    if(activeAsker===-1) return;

    let a=askers[activeAsker];
    if(a.done){
      showDialog("您已完成我的問題", 120);
      return;
    }
    activeQuestion=questions[a.start+a.answered];
    gameState="question";
  }

  if(gameState==="question" && keyCode>=49 && keyCode<=51){
    let choice="ABC"[keyCode-49];
    let a=askers[activeAsker];

    if(choice===activeQuestion.correct){
      showDialog(activeQuestion.correctMsg, 180);
      a.answered++;
      if(a.answered>=2){
        a.done=true;
        gameState="free";
      }else{
        activeQuestion=questions[a.start+a.answered];
      }
    }else{
      showDialog(activeQuestion.wrongMsg, 180);
    }
  }
}

/* =====================================================
   小精靈點擊
===================================================== */
function mousePressed() {
  let fx=playerX-80+fairyFrameW;
  let fy=playerY-120+fairyFrameH;

  if(dist(mouseX,mouseY,fx,fy)<40){
    showDialog(
      gameState==="question"
        ? activeQuestion.hint
        : "有事說事，別沒事找事",
      150
    );
  }
}

/* =====================================================
   工具
===================================================== */
function showDialog(text,time){
  dialogText=text;
  dialogTimer=time;
}

function getNearestAsker() {
  if (dist(playerX, playerY, width - 200, height / 2) < 120) return 0;
  if (dist(playerX, playerY, 80, height / 2) < 120) return 1;
  if (dist(playerX, playerY, width / 2, height * 0.03) < 120) return 2;
  return -1;
}

function updatePlayerMovement() {
  let speed = 3;
  let moving = false;
  if (keyIsDown(LEFT_ARROW)) { playerX -= speed; playerState = "left"; moving = true; }
  if (keyIsDown(RIGHT_ARROW)) { playerX += speed; playerState = "right"; moving = true; }
  if (keyIsDown(UP_ARROW)) { playerY -= speed; playerState = "up"; moving = true; }
  if (keyIsDown(DOWN_ARROW)) { playerY += speed; playerState = "down"; moving = true; }
  if (!moving) playerState = "idle";
}
