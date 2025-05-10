
let layers = [];
let imageSize = 60;
let globalScale = 1;
let phase = 1;
let phaseStart;
let expandDuration = 3000;
let zoomDuration = 3000;
let totalImages = 100;
let loadedImages = [];

function preload() {
  for (let i = 0; i < totalImages; i++) {
    loadedImages[i] = loadImage(`images/img${i + 1}.jpg`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  phaseStart = millis();

  layers.push(new Ring(12, 40, 0.015));
  layers.push(new Ring(16, 70, 0.015));
  layers.push(new Ring(20, 100, 0.012));
  layers.push(new Ring(24, 150, 0.010));
  layers.push(new Ring(28, 200, 0.008));
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  let elapsed = millis() - phaseStart;

  if (phase === 1 && elapsed > expandDuration) {
    phase = 2;
    phaseStart = millis();
  }

  if (phase === 2) {
    let t = constrain((millis() - phaseStart) / zoomDuration, 0, 1);
    globalScale = 1 + easeOutExpo(t) * 2;
    scale(globalScale);
  }

  for (let ring of layers) {
    if (phase === 1) {
      ring.setSpeedScale(1);
    } else {
      let t = constrain((millis() - phaseStart) / zoomDuration, 0, 1);
      let easedSpeed = 1 - easeOutExpo(t) * 0.9;
      ring.setSpeedScale(easedSpeed);
    }

    ring.update();
    ring.display();
  }
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - pow(2, -10 * t);
}

class Ring {
  constructor(num, targetRadius, baseSpeed) {
    this.num = num;
    this.targetRadius = targetRadius;
    this.currentRadius = 0;
    this.baseSpeed = baseSpeed;
    this.angle = 0;
    this.speedScale = 1;
    this.startTime = millis();
    this.tiles = [];

    for (let i = 0; i < num; i++) {
      let index = (Ring.imageIndex++) % loadedImages.length;
      let img = loadedImages[index];
      this.tiles.push(this.cropToSquare(img));
    }
  }

  setSpeedScale(scale) {
    this.speedScale = scale;
  }

  update() {
    let t = constrain((millis() - this.startTime) / expandDuration, 0, 1);
    let easedT = 1 - pow(1 - t, 3);
    this.currentRadius = this.targetRadius * easedT;

    this.angle += this.baseSpeed * this.speedScale;
  }

  cropToSquare(img) {
    let size = min(img.width, img.height);
    let x = (img.width - size) / 2;
    let y = (img.height - size) / 2;
    return img.get(x, y, size, size);
  }

  display() {
    for (let i = 0; i < this.num; i++) {
      let a = TWO_PI / this.num * i + this.angle;
      let x = cos(a) * this.currentRadius;
      let y = sin(a) * this.currentRadius;
      image(this.tiles[i], x, y, imageSize, imageSize);
    }
  }
}

Ring.imageIndex = 0;
