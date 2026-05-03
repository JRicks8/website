/**
 * ****************  WARNING !!! ****************
 * Ahead of you is truly terrible code! I wrote this 
 * When I was learning JavaScript (and just starting to code
 * in general). You have been warned!
 */

// global variables
const cv0 = document.getElementById('frog-biz-content');
const cv1 = document.getElementById('frog-biz-loadingscreen');
const ctx0 = cv0.getContext('2d');
const ctx1 = cv1.getContext('2d');

let mouseDown = false;
let mouseDownThisFrame = false;
let mouseUpThisFrame = false;
let collisionIDs = {
  normal: 0,
  stampPad: 1,
  paperStack: 2,
  paperDeleteTrigger: 3,
  donutEatTrigger: 4,
  hand: 5,
  phoneBox: 6,
  phone: 7,
  flower: 8,
  sprayer: 9,
};
let taskIDs = {
  donuts: 0,
  computer: 1,
  plant: 2,
  phone: 3,
  wave: 4,
  papers: 5,
} //[textDonutFail, textEmailFail, textFlowerFail, textPhoneFail, textWaveFail]
// events
function handleMouseDown() {
  mouseDown = true;
  mouseDownThisFrame = true;
}

function handleMouseUp() {
  mouseDown = false;
  mouseUpThisFrame = true;
}

function preventDefaultSpacebar(e) {
  if (e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
}
document.addEventListener('mousedown', handleMouseDown, false);
document.addEventListener('mouseup', handleMouseUp, false);
document.addEventListener('keydown', preventDefaultSpacebar, false);
// sleep function for halting code execution
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  normalize() {
    let m = this.magnitude();
    this.x /= m;
    this.y /= m;
  }
  setMagnitude(newMag) {
    this.normalize();
    this.x *= newMag;
    this.y *= newMag;
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalized() {
    let m = this.magnitude();
    return new Vector2(this.x / m, this.y / m);
  }
  getPerpendicular(clockwise = true) {
    if (clockwise) return new Vector2(this.y, -this.x);
    return new Vector2(-this.y, this.x);
  }
} // mostly just to hold rgb values
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  getRGBColor() {
    return 'rgb(' + Math.round(this.x) + ',' + Math.round(this.y) + ',' + Math.round(this.z) + ')';
  }
} // more globals
let mousePos = new Vector2();

function handleMouseMove() {
  let mx = event.clientX;
  let my = event.clientY;
  let rect = cv0.getBoundingClientRect();
  mousePos = new Vector2(mx - rect.left, my - rect.top);
}
document.addEventListener('mousemove', handleMouseMove, false);
class MyMath {
  static multiplyVector(v0, num) {
    return new Vector2(v0.x * num, v0.y * num);
  }
  static subtractVector(v0, v1) {
    return new Vector2(v0.x - v1.x, v0.y - v1.y);
  }
  static addVector(v0, v1) {
    return new Vector2(v0.x + v1.x, v0.y + v1.y);
  }
  static dot(v0, v1) {
    return v0.x * v1.x + v0.y * v1.y;
  }
}
class Utility {
  // source of this function: https://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
  static parse_rgb_string(rgb) {
    rgb = rgb.replace(/[^\d,]/g, '').split(',');
    return new Vector3(rgb[0], rgb[1], rgb[2]);
  }
  static tweenAllPositions(offset, objects, tween = Tween.easeInOut, dur = 1) {
    let thing = 'bleh';
    let lastTime = Date.now();
    let duration = dur;
    let time = 0;
    let starts = [];
    let ends = [];
    for (let i = 0; i < objects.length; i++) {
      starts.push(objects[i].getMiddle());
      ends.push(MyMath.addVector(objects[i].getMiddle(), offset));
    }

    function wrapper() {
      let dt = (Date.now() - lastTime) / 1000;
      lastTime = Date.now();
      time += dt;
      if (time > duration) time = duration;
      for (let i = 0; i < objects.length; i++) {
        let newPos = Tween.tweenVec2(starts[i], ends[i], tween(time / duration, 2));
        objects[i].setPosition(newPos, true);
      }
      if (time === duration) return;
      requestAnimationFrame(wrapper);
    }
    requestAnimationFrame(wrapper);
  }
}
class GameObject {
  constructor(position = new Vector2(), size = new Vector2(10, 10), img = null) {
    this.enabled = true;
    this.position = position;
    this.size = size;
    this.rotation = 0; // degrees, converted to radians in draw()
    this.mColor = '#FF00FF';
    this.img = img;
    this.flipped = false;
    this.destroy = false;
  }
  draw(ctx = ctx0) {
    if (this.enabled === false) return;
    ctx.fillStyle = this.mColor;
    ctx.translate(this.getMiddle().x, this.getMiddle().y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.size.x / 2, -this.size.y / 2);
    if (this.flipped) {
      ctx.translate(this.size.x, 0);
      ctx.scale(-1, 1);
    }
    if (this.img === null) ctx.fillRect(0, 0, this.size.x, this.size.y);
    else ctx.drawImage(this.img, 0, 0, this.size.x, this.size.y);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix
  } // set the absolute position of the gameobject
  setPosition(newPosition, middle = false) {
    if (middle) {
      this.position.x = newPosition.x - this.size.x / 2;
      this.position.y = newPosition.y - this.size.y / 2;
    } else {
      this.position = newPosition;
    }
  } // set the position of the gameobject relative to another
  setPositionRelative(otherPosition, newPosition, middle = false) {
    let x = newPosition.x + otherPosition.x;
    let y = newPosition.y + otherPosition.y;
    if (middle) {
      x -= this.size.x / 2;
      y -= this.size.y / 2;
    }
    this.position = new Vector2(x, y);
  }
  setSizeFromMiddle(newSize) {
    let offset = new Vector2((newSize.x - this.size.x) / 2, (newSize.y - this.size.y) / 2);
    this.setPosition(
      new Vector2(this.position.x - offset.x, this.position.y - offset.y)
    );
    this.size = newSize;
  }
  getMiddle() {
    return new Vector2(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
  }
  getOverlapping(otherObjects) {
    let overlapping = [];
    let minA = this.position;
    let maxA = new Vector2(this.position.x + this.size.x, this.position.y + this.size.y);
    for (let i = 0; i < otherObjects.length; i++) {
      let other = otherObjects[i];
      if (other === this) continue;
      let minB = other.position;
      let maxB = new Vector2(other.position.x + other.size.x, other.position.y + other.size.y);
      if (
        !(
          maxA.x <= minB.x ||
          minA.x >= maxB.x ||
          minA.y >= maxB.y ||
          maxA.y <= minB.y
        )
      ) // if overlapping
      {
        overlapping.push(other);
      }
    }
    return overlapping;
  }
}
class UIElement extends GameObject {
  constructor(position = new Vector2(), size = new Vector2(10, 10), img = null) {
    super(position, size, img);
    this.mouseHovering = false;
    this.mouseHoveringLastFrame = false;
    this.clickDown = false; // for click events
    // DEFAULTS
    this.defaultSize = size;
    this.mouseHoveringSize = new Vector2(this.defaultSize.x * 1.1, this.defaultSize.y * 1.1);
    this.mouseDownSize = new Vector2(this.defaultSize.x * 0.9, this.defaultSize.y * 0.9);
    this.defaultColor = new Vector3(44, 219, 217);
    this.mouseHoveringColor = new Vector3(44, 219, 217);
    this.mouseDownColor = new Vector3(44, 219, 217);
    // TWEENING
    // Size
    this.lerpSizeStart = size;
    this.lerpSizeEnd = size;
    this.lerpSizeDuration = 0;
    this.lerpSizeTime = 0;
    this.sizeEasing = Tween.easeIn;
    this.lerpColorStart = this.defaultColor;
    this.lerpColorEnd = this.defaultColor;
    this.lerpColorDuration = 0;
    this.lerpColorTime = 0;
    this.colorEasing = Tween.easeIn;
    this.dt = 0;
    // INITIALIZE
    this.mColor = this.defaultColor.getRGBColor();
  }
  update(dt) {
    if (this.enabled === false) return;
    this.dt = dt;
    // lerp size and color
    if (this.lerpSizeTime !== 0) {
      let t = this.sizeEasing(this.lerpSizeTime / this.lerpSizeDuration, 2);
      this.setSizeFromMiddle(Tween.tweenVec2(this.lerpSizeEnd, this.lerpSizeStart, t));
      this.lerpSizeTime -= dt;
      if (this.lerpSizeTime < 0) this.lerpSizeTime = 0;
    }
    if (this.lerpColorTime !== 0) {
      let t = this.colorEasing(this.lerpColorTime / this.lerpColorDuration, 2);
      this.mColor = Tween.tweenVec3(this.lerpColorEnd, this.lerpColorStart, t).getRGBColor();
      this.lerpColorTime -= dt;
      if (this.lerpColorTime < 0) this.lerpColorTime = 0;
    } // do mouse actions
    this.mouseHoveringLastFrame = this.mouseHovering;
    if (this.getMouseInBounds()) // if the mouse is in bounds
    {
      this.mouseHovering = true;
      if (mouseDownThisFrame) // if the mouse started down this frame
      {
        this.clickDown = true;
        this.startLerp(this.mouseDownSize, this.mouseDownColor);
        this.onMouseDown();
      } else if (mouseUpThisFrame) // if the mouse stopped down this frame
      {
        this.startLerp(this.mouseHoveringSize, this.mouseHoveringColor);
        this.onMouseUp();
        if (this.clickDown) {
          this.clickDown = false;
          this.onMouseClick();
        }
      }
      if (this.mouseHoveringLastFrame === false) // if the mouse just entered bounds
      {
        this.startLerp(this.mouseHoveringSize, this.mouseHoveringColor);
        this.onMouseHover();
      }
    } else // if the mouse is not in bounds
    {
      this.clickDown = false;
      this.mouseHovering = false;
      if (this.mouseHoveringLastFrame === true) // if the mouse just left
      {
        this.startLerp(this.defaultSize, this.defaultColor);
        this.onMouseEndHover();
      }
    }
  }
  startLerp(sizeEnd, colorEnd) {
    this.lerpSizeStart = new Vector2(this.size.x, this.size.y);
    this.lerpSizeEnd = sizeEnd;
    this.lerpSizeTime = this.lerpSizeDuration;
    this.lerpColorStart = Utility.parse_rgb_string(this.mColor);
    this.lerpColorEnd = colorEnd;
    this.lerpColorTime = this.lerpColorDuration;
  }
  onMouseHover() { }
  onMouseEndHover() { }
  onMouseDown() { }
  onMouseUp() { }
  onMouseClick() { }
  getMouseInBounds() {
    return (
      mousePos.x >= this.position.x &&
      mousePos.x <= this.position.x + this.size.x &&
      mousePos.y >= this.position.y &&
      mousePos.y <= this.position.y + this.size.y
    );
  }
}
class Tween {
  static tweenValue(start, end, t) {
    return start + (end - start) * t;
  }
  static tweenVec2(start, end, t) {
    return new Vector2(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
  }
  static tweenVec3(start, end, t) {
    return new Vector3(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t,
      start.z + (end.z - start.z) * t
    );
  }
  static linear(t) {
    return t;
  }
  static easeIn(t, exp) {
    return Math.pow(t, exp);
  }
  static easeOut(t, exp) {
    return 1 - Math.pow(1 - t, exp);
  }
  static easeInOut(t, exp) {
    return Tween.tweenValue(Tween.easeIn(t, exp), Tween.easeOut(t, exp), t);
  }
}
class PhysicsObject extends GameObject {
  constructor(
    position = new Vector2(),
    size = new Vector2(10, 10),
    velocity = new Vector2()
  ) {
    super(position, size);
    this.Id = collisionIDs.normal;
    this.mVelocity = velocity;
    this.mHasGravity = true;
    this.mHasCollision = false;
    this.mKinematic = false;
    this.isTrigger = false;
    this.mass = 1;
  }
  onCollide(other) // replace
  { }
}
class GrabbableObject extends PhysicsObject {
  constructor(
    position = new Vector2(),
    size = new Vector2(10, 10),
    velocity = new Vector2(),
    canCollide = true
  ) {
    super(position, size, velocity, canCollide);
    this.mIsGrabbable = true;
    this.mIsGrabbed = false;
  }
  toggleGrab() {
    this.mIsGrabbed = !this.mIsGrabbed;
    this.mHasGravity = !this.mHasGravity;
    if (this.mIsGrabbed) this.mVelocity = new Vector2();
  }
}
class Hand extends PhysicsObject {
  constructor(
    position = new Vector2(),
    size = new Vector2(10, 10),
    velocity = new Vector2()
  ) {
    super(position, size, velocity);
    this.isGrabbing = false;
    this.grabbedObject = null;
  }
  stopGrabbing(throwing = false) {
    if (throwing) {
      let newVel = MyMath.subtractVector(this.grabbedObject.getMiddle(), new Vector2(200, 150));
      newVel.setMagnitude(10);
      this.grabbedObject.mVelocity.x = newVel.x;
      this.grabbedObject.mVelocity.y = newVel.y;
    } else {
      this.grabbedObject.mVelocity.x = this.mVelocity.x;
      this.grabbedObject.mVelocity.y = this.mVelocity.y;
    }
    this.isGrabbing = false;
    this.grabbedObject = null;
  }
  grab(obj) {
    this.isGrabbing = true;
    obj.mKinematic = false;
    this.grabbedObject = obj;
  }
}
class Arm {
  constructor(shoulder, upperArm, elbow, lowerArm, hand, right) {
    this.shoulder = shoulder;
    this.upperArm = upperArm;
    this.elbow = elbow;
    this.lowerArm = lowerArm;
    this.hand = hand;
    this.right = right;
  }
  update(armLength) {
    // imagine the shoulder-hand-elbow as an isosceles triangle.
    // set the position of the elbow
    let base = MyMath.subtractVector(this.hand.getMiddle(), this.shoulder.getMiddle());
    let halfBase = MyMath.multiplyVector(base, 0.5);
    // should the elbow be on the left or the right side of the shoulder->hand vector
    let shouldElbowLeftRight = this.hand.getMiddle().x < this.shoulder.getMiddle().x;
    // adjust length of the arm based on the difference in x positions of the hand and shoulder
    let v0 = MyMath.multiplyVector(new Vector2(1, 0), 0.5);
    let v1 = MyMath.multiplyVector(base.normalized(), 0.5);
    let adjustedArmLength = Math.abs(armLength * MyMath.dot(v0, v1)) + base.magnitude();
    if (adjustedArmLength > armLength) adjustedArmLength = armLength;
    // utilize the pythagorean theorem to get the height of the triangle
    // a^2 + b^2 = c^2
    // a = sqrt(c^2 - b^2)
    // a = height of triangle (unknown)
    // b = half distance to hand from shoulder
    // c = distance from shoulder to elbow (adjustedArmLength / 2)
    let b = halfBase.magnitude();
    let c = adjustedArmLength / 2;
    let a = Math.sqrt(c * c - b * b); // magnitude of the height vector
    let height = base.getPerpendicular(shouldElbowLeftRight);
    height.normalize();
    height = MyMath.multiplyVector(height, a);
    let elbowPosition = MyMath.addVector(halfBase, height);
    this.elbow.setPositionRelative(this.shoulder.position, elbowPosition, false);
    this.calculateArmPositionRotation(this.upperArm, this.shoulder, this.elbow, adjustedArmLength);
    this.calculateArmPositionRotation(this.lowerArm, this.elbow, this.hand, adjustedArmLength);
  }
  draw() {
    this.elbow.draw();
    this.hand.draw();
    // custom draw functions for the arm segments
    this.drawArmSegment(this.upperArm);
    this.drawArmSegment(this.lowerArm);
    this.shoulder.draw();
  }
  drawArmSegment(segment) {
    ctx0.fillStyle = segment.mColor;
    ctx0.translate(segment.position.x, segment.position.y);
    ctx0.rotate((segment.rotation * Math.PI) / 180);
    ctx0.translate(0, -segment.size.y / 2);
    ctx0.drawImage(segment.img, 0, 0, segment.size.x, segment.size.y);
    ctx0.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix
  }
  calculateArmPositionRotation(armSegment, fromJoint, toJoint, armLength) {
    // set positions and rotations of arm segments
    armSegment.size.x = armLength / 2;
    let upperArmPos = new Vector2(
      fromJoint.getMiddle().x,
      fromJoint.getMiddle().y - armSegment.size.y / 2
    );
    armSegment.setPosition(fromJoint.getMiddle(), false);
    // get angle of arm rotation
    let dirToJoint = MyMath.subtractVector(toJoint.getMiddle(), fromJoint.getMiddle());
    dirToJoint.normalize();
    let dot = MyMath.dot(new Vector2(1, 0), dirToJoint);
    // theta = arccos(dot(A,B) / (|A|*|B|))
    // A = world right (|A| is always 1)
    // B = dirToJoint
    let angle = Math.acos(dot / dirToJoint.magnitude()); // radians
    if (toJoint.getMiddle().y < fromJoint.getMiddle().y) angle *= -1;
    armSegment.rotation = angle * (180 / Math.PI); // convert to angles
  }
}
class Character {
  constructor() {
    // variables
    this.armLength = 186;
    // declare arm components
    let shoulder0 = new GameObject(new Vector2(), new Vector2(19, 19));
    let upperArm0 = new GameObject(new Vector2(), new Vector2(94, 18));
    let elbow0 = new GameObject(new Vector2(), new Vector2(17, 16));
    let lowerArm0 = new GameObject(new Vector2(), new Vector2(94, 14));
    let hand0 = new Hand(new Vector2(100, 150), new Vector2(34, 29));
    let shoulder1 = new GameObject(new Vector2(), new Vector2(19, 19));
    let upperArm1 = new GameObject(new Vector2(), new Vector2(94, 18));
    let elbow1 = new GameObject(new Vector2(), new Vector2(17, 16));
    let lowerArm1 = new GameObject(new Vector2(), new Vector2(94, 14));
    let hand1 = new Hand(new Vector2(300, 150), new Vector2(34, 29));
    // init arm components
    hand0.mHasGravity = false;
    hand1.mHasGravity = false;
    this.head = new GameObject();
    this.body = new GameObject();
    this.body.size = new Vector2(62, 76);
    this.body.setPosition(new Vector2(200, 174), true);
    this.body.mColor = 'blue';
    this.head.size = new Vector2(118, 90);
    this.head.setPosition(new Vector2(200, 91), true);
    this.head.mColor = 'blue';
    shoulder0.setPositionRelative(this.body.getMiddle(), new Vector2(-35, -30), true);
    shoulder1.setPositionRelative(this.body.getMiddle(), new Vector2(35, -30), true);
    upperArm0.size.x,
      lowerArm0.size.x,
      upperArm1.size.x,
      lowerArm1.size.x = this.armLength / 2;
    let arm0 = new Arm(shoulder0, upperArm0, elbow0, lowerArm0, hand0, false);
    let arm1 = new Arm(shoulder1, upperArm1, elbow1, lowerArm1, hand1, true);
    this.arms = [
      arm0,
      arm1
    ];
  }
  draw() {
    this.body.draw();
    this.head.draw();
    this.arms[0].draw();
    this.arms[1].draw();
  }
}
class PhysicsWorld {
  constructor() {
    this.physicsObjects = [];
    this.gravity = 9.81;
  }
  doTick(dt) {
    for (let i = 0; i < this.physicsObjects.length; i++) {
      let o = this.physicsObjects[i];
      if (o.destroy) {
        this.physicsObjects.splice(i, 1);
        i--;
        continue;
      }
      if (o.mKinematic) continue;
      // apply gravity
      if (o.mHasGravity) o.mVelocity.y += this.gravity * dt;
      let newPosition = new Vector2();
      newPosition.x = o.position.x + o.mVelocity.x;
      newPosition.y = o.position.y + o.mVelocity.y;
      // object - object collision
      if (o.mHasCollision === true || o.isTrigger === true) {
        o.setPosition(newPosition);
        let overlapping = o.getOverlapping(this.physicsObjects);
        for (let i = 0; i < overlapping.length; i++) {
          if (o.isTrigger === true) {
            o.onCollide(overlapping[i]);
            continue;
          }
          o.onCollide(overlapping[i]);
          if (overlapping[i].mHasCollision === false) continue;
          let dirToOther = MyMath.subtractVector(overlapping[i].position, o.position).normalized();
          let vertA = new Vector2();
          let vertB = new Vector2();
          vertA.x = o.position.x + o.size.x * (+(dirToOther.x >= 0));
          vertA.y = o.position.y + o.size.y * (+(dirToOther.y >= 0));
          vertB.x = overlapping[i].position.x + overlapping[i].size.x * (+(-dirToOther.x >= 0));
          vertB.y = overlapping[i].position.y + overlapping[i].size.y * (+(-dirToOther.y >= 0));
          let dirToA = MyMath.subtractVector(vertA, vertB);
          if (Math.abs(dirToA.y) < Math.abs(dirToA.x)) o.position.y -= dirToA.y;
          else if (Math.abs(dirToA.x) < Math.abs(dirToA.y)) o.position.x -= dirToA.x;
          let thisVel = o.mVelocity;
          let otherVel = overlapping[i].mVelocity;
          // set velocity of the other object
          overlapping[i].mVelocity = MyMath.multiplyVector(MyMath.addVector(overlapping[i].mVelocity, thisVel), 0.4);
          // set velocity of this object
          o.mVelocity = MyMath.multiplyVector(MyMath.addVector(o.mVelocity, otherVel), 0.4);
        }
      }
      if (o.mKinematic) continue; // just in case an onCollide function changed the kinematic state
      // restrict final position to game boundaries
      if (newPosition.y + o.size.y > cv0.clientHeight - 89) { // if hit the bottom of the canvas
        newPosition.y = cv0.clientHeight - o.size.y - 89;
        o.mVelocity.y *= -0.2; // bounce
        o.mVelocity.x *= 0.7;
      } else if (newPosition.y < -40) { // if hit the top of the canvas
        newPosition.y = -40;
        o.mVelocity.y *= -0.2;
        o.mVelocity.x *= 0.7;
      }
      if (newPosition.x + o.size.x > cv0.clientWidth) { // if hit the right of the canvas
        newPosition.x = cv0.clientWidth - o.size.x;
        o.mVelocity.y *= 0.7;
        o.mVelocity.x *= -0.2;
      } else if (newPosition.x < 0) { // if hit the left of the canvas
        if (o.Id !== 2 || o.isStamped === false) {
          newPosition.x = 0;
          o.mVelocity.y *= 0.7;
          o.mVelocity.x *= -0.2;
        }
      }
      o.setPosition(newPosition);
    }
  }
}
class Player {
  constructor(headImages = []) {
    this.character = new Character();
    this.activeHand = false;
    this.handLerp = 0.7;
    this.eating = false;
    this.headImages = headImages;
  }
  update() {
    // update hand position and physics
    let aHand = this.character.arms[+this.activeHand].hand;
    let bHand = this.character.arms[+!this.activeHand].hand;
    aHand.mVelocity.x = (mousePos.x - aHand.getMiddle().x) * this.handLerp;
    aHand.mVelocity.y = (mousePos.y - aHand.getMiddle().y) * this.handLerp;
    bHand.mVelocity.x *= 0.8;
    bHand.mVelocity.y *= 0.8;
    // restrict the active hand to the arm length
    {
      let shoulder = this.character.arms[+this.activeHand].shoulder;
      let desiredPosition = MyMath.addVector(aHand.getMiddle(), aHand.mVelocity);
      let desiredRelativePosition = MyMath.subtractVector(desiredPosition, shoulder.getMiddle());
      if (desiredRelativePosition.magnitude() > this.character.armLength) {
        desiredRelativePosition.setMagnitude(this.character.armLength - 0.05); // reduce magnitude by miniscule amount to prevent jerkiness  
        desiredPosition = MyMath.addVector(shoulder.getMiddle(), desiredRelativePosition);
        aHand.mVelocity = MyMath.subtractVector(desiredPosition, aHand.getMiddle());
      }
    } // now do a similar but less complicated version for the inactive hand
    {
      let shoulder = this.character.arms[+!this.activeHand].shoulder;
      let desiredPosition = MyMath.addVector(bHand.getMiddle(), bHand.mVelocity);
      let desiredRelativePosition = MyMath.subtractVector(desiredPosition, shoulder.getMiddle());
      if (desiredRelativePosition.magnitude() > this.character.armLength) {
        bHand.mVelocity = new Vector2();
      }
    }
    if (aHand.isGrabbing) {
      aHand.grabbedObject.mVelocity = new Vector2(aHand.mVelocity.x, aHand.mVelocity.y);
      if (aHand.grabbedObject.destroy === true) aHand.stopGrabbing();
      else aHand.grabbedObject.setPosition(aHand.getMiddle(), true);
    }
    if (bHand.isGrabbing) {
      bHand.grabbedObject.mVelocity = new Vector2(bHand.mVelocity.x, bHand.mVelocity.y);
      if (bHand.grabbedObject.destroy === true) bHand.stopGrabbing();
      else bHand.grabbedObject.setPosition(bHand.getMiddle(), true);
    }
    if (!this.eating) {
      // [headEat, headDerp, headDown, headLeft, headRight, headULeft, headURight];
      let mouseRight = mousePos.x > 250;
      let mouseLeft = mousePos.x < 150;
      let mouseUp = mousePos.y < 120;
      let mouseDown = mousePos.y > 140 &&
        !mouseRight &&
        !mouseLeft;
      let mouseUR = mouseRight &&
        mouseUp;
      let mouseUL = mouseLeft &&
        mouseUp;
      if (mouseDown) this.character.head.img = this.headImages[2];
      else if (mouseUR) this.character.head.img = this.headImages[6];
      else if (mouseUL) this.character.head.img = this.headImages[5];
      else if (mouseLeft) this.character.head.img = this.headImages[3];
      else if (mouseRight) this.character.head.img = this.headImages[4];
      else this.character.head.img = this.headImages[1];
    } // update arms positions
    let char = this.character;
    char.arms[0].update(char.armLength);
    char.arms[1].update(char.armLength);
    char.arms[0].hand.rotation = char.arms[0].lowerArm.rotation + 180;
    char.arms[1].hand.rotation = char.arms[1].lowerArm.rotation;
    char.arms[0].shoulder.rotation = char.arms[0].upperArm.rotation + 180;
    char.arms[1].shoulder.rotation = char.arms[1].upperArm.rotation + 180;
    char.head.setPositionRelative(char.body.getMiddle(), new Vector2(-1, -69), true);
  }
}
class VFXWaterVapor extends GameObject {
  constructor(start) {
    super(start, new Vector2(5, 5));
    this.mColor = 'rgb(100, 100, 220)';
    this.lifespan = Math.random() * 1 + 0.5; // 0.5 - 1.5 seconds
    this.lifetime = 0;
    this.start = start;
    this.startSize = new Vector2(5, 5);
    let dx = Math.random() * 40 + 50; // 20 - 40 px
    let dy = ((Math.random() - 0.5) * 2) * 20; // -10 - 10 px;
    this.end = MyMath.addVector(start, new Vector2(dx, dy));
  }
  update(dt) {
    this.lifetime += dt;
    let t = this.lifetime / this.lifespan;
    let newPos = Tween.tweenVec2(this.start, this.end, Tween.easeOut(t, 2));
    let newSize = Tween.tweenVec2(this.startSize, new Vector2(1, 1), Tween.easeOut(t, 3));
    this.setPosition(newPos);
    this.setSizeFromMiddle(newSize);
    this.destroy = t > 1;
  }
}
class Dialogue extends GameObject {
  // instantiate and push this object to mainGame.UIObjects when you want to run it
  // call startText() before pushing
  constructor(textImage) {
    super();
    this.img = textImage;
    this.startPos = new Vector2();
    this.endPos = new Vector2();
    this.startSize = new Vector2();
    this.endSize = new Vector2();
    this.easeFunction = Tween.easeIn;
    this.duration = 1;
    this.time = 0;
  }
  update(dt) {
    this.time += dt;
    if (this.time > this.duration) this.time = this.duration;
    let t = this.time / this.duration;
    this.setPosition(
      Tween.tweenVec2(this.startPos, this.endPos, this.easeFunction(t, 2))
    );
    this.size = Tween.tweenVec2(this.startSize, this.endSize, this.easeFunction(t, 2));
  }
  draw() {
    ctx0.drawImage(this.img, 0, 0, this.size.x, this.size.y, this.position.x, this.position.y, this.size.x, this.size.y);
  }
  async startText() // replace, but keep async if that's what you want
  { // example function
    this.startPos = new Vector2(100, 100);
    this.startSize = new Vector2(70, 70);
    this.endPos = new Vector2(200, 200);
    this.endSize = new Vector2(200, 70);
    this.duration = 2;
    this.time = 0;
    this.easeFunction = Tween.easeOut;
    await sleep(this.duration * 1000);
    this.startPos = this.position;
    this.startSize = this.size;
    this.endPos = new Vector2();
    this.endSize = new Vector2();
    this.duration = 2;
    this.time = 0;
    this.easeFunction = Tween.easeIn;
    await sleep(this.duration * 1000);
    this.destroy = true;
    return true;
  }
}
class TextObject extends GameObject {
  constructor(text) {
    super();
    this.text = text;
    this.textStyle = '20px serif';
  }
  draw() {
    if (this.enabled === false) return;
    ctx0.font = this.textStyle;
    ctx0.fillStyle = 'black';
    ctx0.fillText(this.text, this.position.x, this.position.y);
  }
  update() { }
}
class Task {
  constructor() {
    this.active = false;
    this.defaultTimerDuration = 3;
    this.timerDuration = 3;
    this.timer = 3;
    this.timerVariance = 0.5;
    this.incompleteTimer = 0;
    this.complete = false;
    this.lastFrameComplete = false;
  }
  update(dt) {
    this.timer -= dt;
    if (!this.complete) this.incompleteTimer += dt;
    else this.incompleteTimer = 0
    let lastActive = this.active;
    if (this.timer <= 0) {
      this.active = true;
      if (lastActive === false) this.onActivate();
    } else this.active = false;
    this.lastFrameComplete = this.complete;
    this.complete = this.evaluateCompletion();
    if (this.complete && !this.lastFrameComplete) this.onCompletion();
  }
  resetTimer() {
    let offset = ((Math.random() - 0.5) * 2) * (this.timerDuration * this.timerVariance);
    this.timerDuration = this.defaultTimerDuration * mainGame.difficulty;
    this.timer = this.timerDuration + offset;
  }
  evaluateCompletion() // replace
  { }
  onActivate() // replace
  { }
  onCompletion() // replace
  { }
  checkFailure() // replace optional
  {
    return this.incompleteTimer > 13;
  }
}
class GameState {
  constructor() {
    this.mode = 0; // for different game modes (mainGame endless or story)
  }
  doLoop(dt) {
    console.log('doLoop function for ' + this + ' uninitiated.');
  }
  async onSwitchTo() {
    console.log('onSwitchTo function for ' + this + ' uninitiated.');
  }
  onSwitchFrom() {
    console.log('onSwitchFrom function for ' + this + ' uninitiated.');
  }
}
class GameStateManager {
  constructor() {
    this.activeState = null;
    this.lastTime = Date.now();
    this.paused = false; // prevents execution of the active state's loop
  }
  switchState(newState) {
    console.log('switching from');
    let loadingFrom = this.activeState.onSwitchFrom();
    loadingFrom.then(
      () => {
        console.log('switching to');
        this.paused = true;
        let doneLoading = newState.onSwitchTo();
        doneLoading.then(
          () => {
            console.log('done loading');
            this.activeState = newState;
            this.paused = false;
          }
        );
      }
    );
  }
  runGame() {
    let dt = (Date.now() - this.lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    this.lastTime = Date.now();
    if (this.paused) return;
    this.activeState.doLoop(dt);
    mouseDownThisFrame = false;
    mouseUpThisFrame = false;
  }
}
class Loader {
  constructor() {
    this.squares = [];
    this.time = 0;
    this.duration = 0;
    this.totalTime = 0;
    this.squareSizeStart = 0;
    this.squareSizeEnd = 0;
    this.offsetDiv = 20;
    // make squares
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 8; j++) {
        let square = new GameObject(new Vector2(50 * j, 50 * i), new Vector2(50, 50));
        square.mColor = 'rgb(247, 233, 188)';
        this.squares.push(square);
      }
    }
  }
  playTransition(dt) {
    if (this.totalTime < 0) {
      return true;
    }
    this.time -= dt;
    this.totalTime -= dt;
    let t = this.time / this.duration;
    ctx1.clearRect(0, 0, 400, 300);
    for (let i = 0; i < this.squares.length; i++) {
      let localt = t + i / this.offsetDiv;
      if (localt > 1) localt = 1;
      else if (localt < 0) localt = 0;
      let newSize = new Vector2();
      newSize.x = this.squareSizeStart + (this.squareSizeEnd - this.squareSizeStart) * localt;
      newSize.y = this.squareSizeStart + (this.squareSizeEnd - this.squareSizeStart) * localt;
      this.squares[i].setSizeFromMiddle(newSize);
      this.squares[i].draw(ctx1);
    }
    return false;
  }
  loadingScreenEnd(duration = 0.5, start = 0, end = 50, offsetDiv = 20) {
    this.time = duration;
    this.duration = duration;
    this.totalTime = (this.squares.length - 2) / this.offsetDiv;
    this.squareSizeStart = start;
    this.squareSizeEnd = end;
    this.offsetDiv = offsetDiv;
    // set square positions (different for start/end loading screen)
    for (let i = 0; i < this.squares.length; i++) {
      this.squares[i].size = new Vector2(start, start);
      this.squares[i].position.x += end / 2;
      this.squares[i].position.y += end / 2;
    }
  }
  loadingScreenStart(duration = 0.5, start = 50, end = 0, offsetDiv = 20) {
    this.time = duration;
    this.duration = duration;
    this.totalTime = (this.squares.length - 2) / this.offsetDiv;
    this.squareSizeStart = start;
    this.squareSizeEnd = end;
    this.offsetDiv = offsetDiv;
    // set square positions (different for start/end loading screen)
    for (let i = 0; i < this.squares.length; i++) {
      this.squares[i].size = new Vector2(start, start);
      this.squares[i].position.x -= start / 2;
      this.squares[i].position.y -= start / 2;
    }
  } // how to use the loader
  // IF EXITING LOADING SCREEN
  // loader.loadingScreenEnd();
  // loader.playTransition(0); // update with 0 dt to draw
  // actually load the assets here and other stuff
  // while (notDoneLoadingAssets) await sleep(ms);
  // actually run the loading animation
  // let lastTime = Date.now()
  // function loadingWrapper()
  // {
  //     let dt = (Date.now() - lastTime) / 1000;
  //     lastTime = Date.now();
  //     let loadAnimationComplete = loader.playTransition(dt);
  //     if (loadAnimationComplete) return;
  //     requestAnimationFrame(loadingWrapper);
  // }
  // requestAnimationFrame(loadingWrapper);
  // IF ENTERING LOADING SCREEN
  // let loadAnimationComplete = false;
  // loader.loadingScreenStart();
  // let lastTime = Date.now()
  // function loadingWrapper()
  // {
  //     let dt = (Date.now() - lastTime) / 1000;
  //     lastTime = Date.now();
  //     loadAnimationComplete = loader.playTransition(dt);
  //     if (loadAnimationComplete) return;
  //     requestAnimationFrame(loadingWrapper);
  // }
  // requestAnimationFrame(loadingWrapper);
  // load and do stuff
  // while(loadAnimationComplete === false)
  // {
  //     await sleep(200);
  // }
}
class SaveData {
  constructor() {
    this.bestEndlessScore = 0;
    this.currentStoryDay = 0;
  }
  save() {
    document.cookie = 'bestEndlessScore=' + this.bestEndlessScore + ';';
    document.cookie = 'currentStoryDay=' + this.currentStoryDay + ';';
  }
  load() {
    function parseCookie(cname) {
      let name = cname + '=';
      let cookie = decodeURIComponent(document.cookie);
      let cookieArr = cookie.split(';');
      for (let i = 0; i < cookieArr.length; i++) {
        let c = cookieArr[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return 'err';
    }
    this.bestEndlessScore = parseInt(parseCookie('bestEndlessScore'));
    this.currentStoryDay = parseInt(parseCookie('currentStoryDay'));
    if (!(Infinity > this.bestEndlessScore)) this.bestEndlessScore = 0; // if data is NaN for whatever reason
    if (!(Infinity > this.currentStoryDay)) this.currentStoryDay = 0;
  }
} // game loop
let saveData = new SaveData();
saveData.load();
let loader = new Loader();
let stateManager = new GameStateManager();
let mainGame = new GameState();
let mainMenu = new GameState();
mainGame.onSwitchTo = (
  async function () {
    // LOADING SCREEN
    let loadComplete = false;
    loader.loadingScreenEnd();
    loader.playTransition(0);
    // load the loading screen animation first
    let animImages = [
      new Image(),
      new Image(),
      new Image()
    ];
    animImages[0].src = '../../assets/frogbiz/anim-loading-0.png';
    animImages[1].src = '../../assets/frogbiz/anim-loading-1.png';
    animImages[2].src = '../../assets/frogbiz/anim-loading-2.png';
    // load images into bitmaps
    let loadedImages = 0;
    const paperStack0 = new Image();
    const paperStack1 = new Image();
    const paperStack2 = new Image();
    const paperStack3 = new Image();
    const paperStackStamped0 = new Image();
    const paperStackStamped1 = new Image();
    const paperStackStamped2 = new Image();
    const paperStackStamped3 = new Image();
    const backgroundImage = new Image();
    const flowerPotImage = new Image();
    const flowerWiltedImage = new Image();
    const stampImage = new Image();
    const stampPadImage = new Image();
    const donut0Image = new Image();
    const donut1Image = new Image();
    const donut2Image = new Image();
    const bossImage = new Image();
    const coffeeMImage = new Image();
    const coffeeStreamImage = new Image();
    const computerImage = new Image();
    const deskImage = new Image();
    const elbowImage = new Image();
    const emailImage = new Image();
    const forearmImage = new Image();
    const handImage = new Image();
    const headDerp = new Image();
    const headDown = new Image();
    const headEat = new Image();
    const headLeft = new Image();
    const headRight = new Image();
    const headULeft = new Image();
    const headURight = new Image();
    const keyboardImage = new Image();
    const mugEmptyImage = new Image();
    const mugFullImage = new Image();
    const phoneImage = new Image();
    const phoneBoxImage = new Image();
    const shoulderImage = new Image();
    const sprayBottleImage = new Image();
    const torsoImage = new Image();
    const upperarmImage = new Image();
    const textDonutFail = new Image();
    const textEmailFail = new Image();
    const textFlowerFail = new Image();
    const textPhoneFail = new Image();
    const textWaveFail = new Image();
    const textPapersFail = new Image();
    const textFired = new Image();
    const textStop = new Image();
    const textboxImage = new Image();
    const day0Dialogue0 = new Image();
    const day0Dialogue1 = new Image();
    const day0Dialogue2 = new Image();
    const day0Dialogue3 = new Image();
    const day0Dialogue4 = new Image();
    const day1Dialogue0 = new Image();
    const day1Dialogue1 = new Image();
    const day1Dialogue2 = new Image();
    const day1Dialogue3 = new Image();
    const day1Dialogue4 = new Image();
    const day1Dialogue5 = new Image();
    const day1Dialogue6 = new Image();
    const day1Dialogue7 = new Image();
    const day1Dialogue8 = new Image();
    const day1Dialogue9 = new Image();
    const day1Dialogue10 = new Image();
    const day2Dialogue0 = new Image();
    const day2Dialogue1 = new Image();
    const day2Dialogue2 = new Image();
    const day2Dialogue3 = new Image();
    const day2Dialogue4 = new Image();
    const day2Dialogue5 = new Image();
    const day2Dialogue6 = new Image();
    const day2Dialogue7 = new Image();
    const day2Dialogue8 = new Image();
    const day3Dialogue0 = new Image();
    const day3Dialogue1 = new Image();
    const day3Dialogue2 = new Image();
    const day3Dialogue3 = new Image();
    const day3Dialogue4 = new Image();
    const day3Dialogue5 = new Image();
    const day3Dialogue6 = new Image();
    const day3Dialogue7 = new Image();
    const day3Dialogue8 = new Image();
    const day4Dialogue0 = new Image();
    const day4Dialogue1 = new Image();
    const day4Dialogue2 = new Image();
    const day4Dialogue3 = new Image();
    const day4Dialogue4 = new Image();
    const day4Dialogue5 = new Image();
    const day4Dialogue6 = new Image();
    const day4Dialogue7 = new Image();
    const day4Dialogue8 = new Image();
    const day4Dialogue9 = new Image();
    const day4Dialogue10 = new Image();
    const day4Dialogue11 = new Image();
    const day4Dialogue12 = new Image();
    const day4Dialogue13 = new Image();
    const day4Dialogue14 = new Image();
    const day4Dialogue15 = new Image();
    const day4Dialogue16 = new Image();
    const day4Dialogue17 = new Image();
    const day4Dialogue18 = new Image();
    const day4Dialogue19 = new Image();
    const pauseButtonImage = new Image();
    const retryButtonImage = new Image();
    const resumeButtonImage = new Image();
    const exitButtonImage = new Image();
    let images = [ paperStack0, paperStack1, paperStack2, paperStack3, paperStackStamped0, paperStackStamped1, paperStackStamped2, paperStackStamped3, backgroundImage, flowerPotImage, flowerWiltedImage, stampImage, stampPadImage, donut0Image, donut1Image, donut2Image, bossImage, coffeeMImage, coffeeStreamImage, computerImage, deskImage, elbowImage, emailImage, forearmImage, handImage, headDerp, headDown, headEat, headLeft, headRight, headULeft, headURight, keyboardImage, mugEmptyImage, mugFullImage, phoneImage, phoneBoxImage, shoulderImage, sprayBottleImage, torsoImage, upperarmImage, textDonutFail, textEmailFail, textFlowerFail, textPhoneFail, textWaveFail, textPapersFail, textFired, textStop, textboxImage, day0Dialogue0, day0Dialogue1, day0Dialogue2, day0Dialogue3, day0Dialogue4, day1Dialogue0, day1Dialogue1, day1Dialogue2, day1Dialogue3, day1Dialogue4, day1Dialogue5, day1Dialogue6, day1Dialogue7, day1Dialogue8, day1Dialogue9, day1Dialogue10, day2Dialogue0, day2Dialogue1, day2Dialogue2, day2Dialogue3, day2Dialogue4, day2Dialogue5, day2Dialogue6, day2Dialogue7, day2Dialogue8, day3Dialogue0, day3Dialogue1, day3Dialogue2, day3Dialogue3, day3Dialogue4, day3Dialogue5, day3Dialogue6, day3Dialogue7, day3Dialogue8, day4Dialogue0, day4Dialogue1, day4Dialogue2, day4Dialogue3, day4Dialogue4, day4Dialogue5, day4Dialogue6, day4Dialogue7, day4Dialogue8, day4Dialogue9, day4Dialogue10, day4Dialogue11, day4Dialogue12, day4Dialogue13, day4Dialogue14, day4Dialogue15, day4Dialogue16, day4Dialogue17, day4Dialogue18, day4Dialogue19, pauseButtonImage, retryButtonImage, resumeButtonImage, exitButtonImage ];
    {
      backgroundImage.src = '../../assets/frogbiz/background.png';
      paperStack0.src = '../../assets/frogbiz/paper-stack-0.png';
      paperStack1.src = '../../assets/frogbiz/paper-stack-1.png';
      paperStack2.src = '../../assets/frogbiz/paper-stack-2.png';
      paperStack3.src = '../../assets/frogbiz/paper-stack-3.png';
      paperStackStamped0.src = '../../assets/frogbiz/paper-stack-0-stamped.png';
      paperStackStamped1.src = '../../assets/frogbiz/paper-stack-1-stamped.png';
      paperStackStamped2.src = '../../assets/frogbiz/paper-stack-2-stamped.png';
      paperStackStamped3.src = '../../assets/frogbiz/paper-stack-3-stamped.png';
      flowerPotImage.src = '../../assets/frogbiz/flower-pot.png';
      flowerWiltedImage.src = '../../assets/frogbiz/flower-wilted.png';
      stampImage.src = '../../assets/frogbiz/stamp.png';
      stampPadImage.src = '../../assets/frogbiz/stamp-pad.png';
      donut0Image.src = '../../assets/frogbiz/donut-0-bite.png';
      donut1Image.src = '../../assets/frogbiz/donut-1-bite.png';
      donut2Image.src = '../../assets/frogbiz/donut-2-bite.png';
      bossImage.src = '../../assets/frogbiz/boss.png';
      coffeeMImage.src = '../../assets/frogbiz/coffee-machine.png';
      coffeeStreamImage.src = '../../assets/frogbiz/coffee-stream.png';
      computerImage.src = '../../assets/frogbiz/computer.png';
      deskImage.src = '../../assets/frogbiz/desk.png';
      elbowImage.src = '../../assets/frogbiz/elbow.png';
      emailImage.src = '../../assets/frogbiz/email-notification.png';
      forearmImage.src = '../../assets/frogbiz/forearm.png';
      handImage.src = '../../assets/frogbiz/hand.png';
      headDerp.src = '../../assets/frogbiz/head-derp.png';
      headDown.src = '../../assets/frogbiz/head-down.png';
      headEat.src = '../../assets/frogbiz/head-eat.png';
      headLeft.src = '../../assets/frogbiz/head-left.png';
      headRight.src = '../../assets/frogbiz/head-right.png';
      headULeft.src = '../../assets/frogbiz/head-uleft.png';
      headURight.src = '../../assets/frogbiz/head-uright.png';
      keyboardImage.src = '../../assets/frogbiz/keyboard.png';
      mugEmptyImage.src = '../../assets/frogbiz/mug-empty.png';
      mugFullImage.src = '../../assets/frogbiz/mug-full.png';
      phoneImage.src = '../../assets/frogbiz/phone.png';
      phoneBoxImage.src = '../../assets/frogbiz/phonebox.png';
      shoulderImage.src = '../../assets/frogbiz/shoulder.png';
      sprayBottleImage.src = '../../assets/frogbiz/spray-bottle.png';
      torsoImage.src = '../../assets/frogbiz/torso.png';
      upperarmImage.src = '../../assets/frogbiz/upperarm.png';
      textDonutFail.src = '../../assets/frogbiz/text-donutfail.png';
      textEmailFail.src = '../../assets/frogbiz/text-emailfail.png';
      textFired.src = '../../assets/frogbiz/text-fired.png';
      textFlowerFail.src = '../../assets/frogbiz/text-flowerfail.png';
      textPhoneFail.src = '../../assets/frogbiz/text-phonefail.png';
      textPapersFail.src = '../../assets/frogbiz/text-papersfail.png';
      textStop.src = '../../assets/frogbiz/text-stop.png';
      textWaveFail.src = '../../assets/frogbiz/text-wavefail.png';
      textboxImage.src = '../../assets/frogbiz/textbox.png';
      day0Dialogue0.src = '../../assets/frogbiz/day0-dialogue0.png';
      day0Dialogue1.src = '../../assets/frogbiz/day0-dialogue1.png';
      day0Dialogue2.src = '../../assets/frogbiz/day0-dialogue2.png';
      day0Dialogue3.src = '../../assets/frogbiz/day0-dialogue3.png';
      day0Dialogue4.src = '../../assets/frogbiz/day0-dialogue4.png';
      day1Dialogue0.src = '../../assets/frogbiz/day1-dialogue0.png';
      day1Dialogue1.src = '../../assets/frogbiz/day1-dialogue1.png';
      day1Dialogue2.src = '../../assets/frogbiz/day1-dialogue2.png';
      day1Dialogue3.src = '../../assets/frogbiz/day1-dialogue3.png';
      day1Dialogue4.src = '../../assets/frogbiz/day1-dialogue4.png';
      day1Dialogue5.src = '../../assets/frogbiz/day1-dialogue5.png';
      day1Dialogue6.src = '../../assets/frogbiz/day1-dialogue6.png';
      day1Dialogue7.src = '../../assets/frogbiz/day1-dialogue7.png';
      day1Dialogue8.src = '../../assets/frogbiz/day1-dialogue8.png';
      day1Dialogue9.src = '../../assets/frogbiz/day1-dialogue9.png';
      day1Dialogue10.src = '../../assets/frogbiz/day1-dialogue10.png';
      day2Dialogue0.src = '../../assets/frogbiz/day2-dialogue0.png';
      day2Dialogue1.src = '../../assets/frogbiz/day2-dialogue1.png';
      day2Dialogue2.src = '../../assets/frogbiz/day2-dialogue2.png';
      day2Dialogue3.src = '../../assets/frogbiz/day2-dialogue3.png';
      day2Dialogue4.src = '../../assets/frogbiz/day2-dialogue4.png';
      day2Dialogue5.src = '../../assets/frogbiz/day2-dialogue5.png';
      day2Dialogue6.src = '../../assets/frogbiz/day2-dialogue6.png';
      day2Dialogue7.src = '../../assets/frogbiz/day2-dialogue7.png';
      day2Dialogue8.src = '../../assets/frogbiz/day2-dialogue8.png';
      day3Dialogue0.src = '../../assets/frogbiz/day3-dialogue0.png';
      day3Dialogue1.src = '../../assets/frogbiz/day3-dialogue1.png';
      day3Dialogue2.src = '../../assets/frogbiz/day3-dialogue2.png';
      day3Dialogue3.src = '../../assets/frogbiz/day3-dialogue3.png';
      day3Dialogue4.src = '../../assets/frogbiz/day3-dialogue4.png';
      day3Dialogue5.src = '../../assets/frogbiz/day3-dialogue5.png';
      day3Dialogue6.src = '../../assets/frogbiz/day3-dialogue6.png';
      day3Dialogue7.src = '../../assets/frogbiz/day3-dialogue7.png';
      day3Dialogue8.src = '../../assets/frogbiz/day3-dialogue8.png';
      day4Dialogue0.src = '../../assets/frogbiz/day4-dialogue0.png';
      day4Dialogue1.src = '../../assets/frogbiz/day4-dialogue1.png';
      day4Dialogue2.src = '../../assets/frogbiz/day4-dialogue2.png';
      day4Dialogue3.src = '../../assets/frogbiz/day4-dialogue3.png';
      day4Dialogue4.src = '../../assets/frogbiz/day4-dialogue4.png';
      day4Dialogue5.src = '../../assets/frogbiz/day4-dialogue5.png';
      day4Dialogue6.src = '../../assets/frogbiz/day4-dialogue6.png';
      day4Dialogue7.src = '../../assets/frogbiz/day4-dialogue7.png';
      day4Dialogue8.src = '../../assets/frogbiz/day4-dialogue8.png';
      day4Dialogue9.src = '../../assets/frogbiz/day4-dialogue9.png';
      day4Dialogue10.src = '../../assets/frogbiz/day4-dialogue10.png';
      day4Dialogue11.src = '../../assets/frogbiz/day4-dialogue11.png';
      day4Dialogue12.src = '../../assets/frogbiz/day4-dialogue12.png';
      day4Dialogue13.src = '../../assets/frogbiz/day4-dialogue13.png';
      day4Dialogue14.src = '../../assets/frogbiz/day4-dialogue14.png';
      day4Dialogue15.src = '../../assets/frogbiz/day4-dialogue15.png';
      day4Dialogue16.src = '../../assets/frogbiz/day4-dialogue16.png';
      day4Dialogue17.src = '../../assets/frogbiz/day4-dialogue17.png';
      day4Dialogue18.src = '../../assets/frogbiz/day4-dialogue18.png';
      day4Dialogue19.src = '../../assets/frogbiz/day4-dialogue19.png';
      pauseButtonImage.src = '../../assets/frogbiz/pause-button.png';
      retryButtonImage.src = '../../assets/frogbiz/retry-button.png';
      resumeButtonImage.src = '../../assets/frogbiz/resume-button.png';
      exitButtonImage.src = '../../assets/frogbiz/exit-button.png';
    }
    for (let i = 0; i < images.length; i++) {
      images[i].onload = () => {
        Promise.resolve(createImageBitmap(images[i])).then(() => {
          loadedImages++;
        })
      }
    }
    mainGame.backgroundImage = backgroundImage;
    // settings & vars
    mainGame.paused = false;
    mainGame.difficulty = 3; // the higher the number, the easier the game
    mainGame.dayTimer = 180;
    mainGame.hasLost = false;
    mainGame.hasWon = false;
    mainGame.failedTask = -1;
    mainGame.tasksCompleted = -2;
    mainGame.taskFailDialogue = [
      textDonutFail,
      textEmailFail,
      textFlowerFail,
      textPhoneFail,
      textWaveFail,
      textPapersFail
    ];
    if (mainGame.mode === 0) // story
    {
      switch (saveData.currentStoryDay) {
        case 0:
          mainGame.difficulty = 3;
          break;
        case 1:
          mainGame.difficulty = 2.6;
          break;
        case 2:
          mainGame.difficulty = 2.3;
          break;
        case 3:
          mainGame.difficulty = 2;
          break;
        case 4:
          mainGame.difficulty = 1.6;
          break;
      }
    } // initialize the game objects and classes
    mainGame.world = new PhysicsWorld();
    mainGame.grabbableObjects = [];
    mainGame.physicsObjects = [];
    mainGame.gameObjects = [];
    mainGame.tasks = [];
    mainGame.vfx = [];
    mainGame.UIObjects = [];
    // controls instructions
    let controlTexts = [
      new TextObject('left click: Grab/Drop'),
      new TextObject('space: Switch Hands'),
      new TextObject('shift: Throw'),
      new TextObject('ctrl: Use Spray Bottle')
    ];
    for (let i = 0; i < controlTexts.length; i++) {
      controlTexts[i].setPosition(new Vector2(260, 235 + 15 * i));
      controlTexts[i].textStyle = '14px serif';
      mainGame.UIObjects.push(controlTexts[i]);
    } // score
    if (mainGame.mode === 1) // endless
    {
      mainGame.scoreText = new TextObject('err');
      mainGame.scoreText.setPosition(new Vector2(5, 250));
      mainGame.UIObjects.push(mainGame.scoreText);
    } // GAME OBJECTS ///////////////////////////////////////////////////////////////
    let desk = new GameObject(new Vector2(0, 211), new Vector2(400, 89));
    desk.img = deskImage;
    mainGame.gameObjects.push(desk);
    let computer = new GameObject(new Vector2(5, 131), new Vector2(68, 80));
    computer.img = computerImage;
    mainGame.gameObjects.push(computer);
    let computerNotify = new GameObject(new Vector2(60, 90), new Vector2(40, 47));
    computerNotify.img = emailImage;
    computerNotify.enabled = false;
    mainGame.gameObjects.push(computerNotify);
    let boss = new GameObject(new Vector2(-136, 0), new Vector2(136, 130));
    boss.img = bossImage;
    mainGame.gameObjects.push(boss);
    // PHYSICS OBJECTS /////////////////////////////////////////////////////////////
    let stampPad = new PhysicsObject(new Vector2(140, 203), new Vector2(36, 8));
    stampPad.img = stampPadImage;
    stampPad.mHasCollision = true;
    stampPad.mKinematic = true;
    stampPad.Id = collisionIDs.stampPad;
    mainGame.physicsObjects.push(stampPad);
    let paperCollector = new PhysicsObject(new Vector2(-30, 0), new Vector2(5, 300));
    paperCollector.mKinematic = true;
    paperCollector.isTrigger = true;
    paperCollector.Id = collisionIDs.paperDeleteTrigger;
    mainGame.physicsObjects.push(paperCollector);
    let donutEatTrigger = new PhysicsObject(new Vector2(175, 90), new Vector2(50, 50));
    donutEatTrigger.enabled = false;
    donutEatTrigger.mKinematic = true;
    donutEatTrigger.isTrigger = true;
    donutEatTrigger.Id = collisionIDs.donutEatTrigger;
    mainGame.physicsObjects.push(donutEatTrigger);
    let keyboard = new PhysicsObject(new Vector2(70, 200), new Vector2(50, 10));
    keyboard.img = keyboardImage;
    keyboard.isTrigger = true;
    keyboard.onCollide = (
      function (other) {
        if (other.Id !== collisionIDs.hand || !emails.hasEmail) return;
        let sufficientTime = Date.now() - emails.lastKeyboardHitTime > emails.timeBetweenKeyboardHits;
        emails.lastKeyboardHitTime = Date.now();
        if (sufficientTime === false) return;
        emails.keyboardHits += 1;
        emails.hasEmail = emails.keyboardHits < emails.keyboardHitsToCompletion;
        emails.keyboardHits *= emails.hasEmail;
      }
    );
    mainGame.physicsObjects.push(keyboard);
    let phoneBox = new PhysicsObject(new Vector2(370, 80), new Vector2(30, 54));
    phoneBox.img = phoneBoxImage;
    phoneBox.mKinematic = true;
    phoneBox.isTrigger = true;
    phoneBox.Id = collisionIDs.phoneBox;
    mainGame.physicsObjects.push(phoneBox);
    let plant = new PhysicsObject(new Vector2(310, 119), new Vector2(45, 93));
    plant.Id = collisionIDs.flower;
    plant.isTrigger = true;
    plant.img = flowerPotImage;
    mainGame.physicsObjects.push(plant);
    let waveHitbox0 = new PhysicsObject(new Vector2(50, 30), new Vector2(200, 50));
    waveHitbox0.enabled = false;
    waveHitbox0.mHasGravity = false;
    waveHitbox0.isTrigger = true;
    waveHitbox0.onCollide = (
      function (other) {
        if (other.Id === collisionIDs.hand && waveHi.active) {
          waveHi.currentWave = false;
          if (waveHi.currentWave !== waveHi.lastWave) waveHi.numWaves++;
          waveHi.lastWave = false;
        }
      }
    );
    mainGame.physicsObjects.push(waveHitbox0);
    let waveHitbox1 = new PhysicsObject(new Vector2(50, 120), new Vector2(200, 50));
    waveHitbox1.enabled = false;
    waveHitbox1.mHasGravity = false;
    waveHitbox1.isTrigger = true;
    waveHitbox1.onCollide = (
      function (other) {
        if (other.Id === collisionIDs.hand && waveHi.active) {
          waveHi.currentWave = true;
          if (waveHi.currentWave !== waveHi.lastWave) waveHi.numWaves++;
          waveHi.lastWave = true;
        }
      }
    );
    mainGame.physicsObjects.push(waveHitbox1);
    // GRABBABLE OBJECTS ///////////////////////////////////////////////////////////////
    let stamp = new GrabbableObject(new Vector2(143, 200), new Vector2(29, 29));
    stamp.img = stampImage;
    stamp.mHasCollision = true;
    stamp.hasInk = false;
    stamp.onCollide = (
      function (other) {
        if (other.Id === collisionIDs.stampPad) // stampPad
        {
          stamp.hasInk = true;
        } else if (other.Id === collisionIDs.paperStack) // paper
        {
          if (stamp.hasInk && other.isStamped === false && stamp.mVelocity.y > 3) {
            other.isStamped = true;
            other.img = images[other.imgId + 4];
            stamp.hasInk = false;
          }
        }
      }
    );
    mainGame.grabbableObjects.push(stamp);
    let phone = new GrabbableObject(new Vector2(350, 80), new Vector2(20, 42));
    phone.img = phoneImage;
    phone.isTrigger = true;
    phone.mKinematic = true;
    phone.Id = collisionIDs.phone;
    phone.onCollide = (
      function (other) {
        if (other.Id === collisionIDs.phoneBox && !phone.mIsGrabbed) {
          phone.mKinematic = true;
          phone.setPosition(new Vector2(350, 80));
        }
      }
    );
    mainGame.grabbableObjects.push(phone);
    let sprayer = new GrabbableObject(new Vector2(200, 100), new Vector2(29, 47));
    sprayer.Id = collisionIDs.sprayer;
    sprayer.isTrigger = true;
    sprayer.img = sprayBottleImage;
    mainGame.grabbableObjects.push(sprayer);
    // TASKS ////////////////////////////////////////////////////////////////////////
    let stampPapers = new Task();
    stampPapers.Id = taskIDs.papers;
    stampPapers.stack = [];
    stampPapers.paperImages = [
      paperStack0,
      paperStack1,
      paperStack2,
      paperStack3
    ];
    stampPapers.defaultTimerDuration = 10;
    stampPapers.timerDuration = stampPapers.defaultTimerDuration * mainGame.difficulty;
    stampPapers.resetTimer();
    stampPapers.numPapers = 0;
    stampPapers.onActivate = (
      function () {
        stampPapers.resetTimer();
        stampPapers.numPapers++;
        let rand = Math.floor(Math.random() * 4); // 0 - 3
        let i = stampPapers.paperImages[rand];
        let p = new GrabbableObject(new Vector2(250, -40), new Vector2(i.width, i.height));
        p.img = i;
        p.imgId = rand;
        p.mHasCollision = true;
        p.Id = collisionIDs.paperStack;
        p.isStamped = false;
        p.onCollide = (
          function (other) {
            if (other.Id === collisionIDs.paperDeleteTrigger) {
              mainGame.tasksCompleted++;
              stampPapers.numPapers--;
              p.destroy = true;
            }
          }
        );
        mainGame.grabbableObjects.push(p);
        mainGame.world.physicsObjects.push(p);
      }
    );
    stampPapers.evaluateCompletion = (function () {
      return stampPapers.numPapers < 3;
    });
    mainGame.tasks.push(stampPapers);
    let eatDonuts = new Task();
    eatDonuts.Id = taskIDs.donuts;
    eatDonuts.donutImages = [
      donut0Image,
      donut1Image,
      donut2Image
    ];
    eatDonuts.donuts = [];
    eatDonuts.numDonuts = 0;
    eatDonuts.defaultTimerDuration = 9;
    eatDonuts.timerDuration = eatDonuts.defaultTimerDuration * mainGame.difficulty;
    eatDonuts.resetTimer();
    eatDonuts.lastBiteTime = 0;
    eatDonuts.timeBetweenBites = 2000; //ms
    eatDonuts.onActivate = (
      function () {
        eatDonuts.resetTimer();
        eatDonuts.numDonuts++;
        let d = new GrabbableObject(new Vector2(0, -40), new Vector2());
        d.mVelocity = new Vector2(Math.random() * 5, 0);
        d.bites = 0;
        d.lastBiteTime = 0;
        d.img = donut0Image;
        d.size = new Vector2(d.img.width, d.img.height);
        d.isTrigger = true;
        d.onCollide = (
          function (other) {
            let distanceFromHead = MyMath.subtractVector(mainGame.player.character.head.getMiddle(), d.getMiddle()).magnitude();
            if (
              distanceFromHead < 100 &&
              Date.now() - eatDonuts.lastBiteTime >= eatDonuts.timeBetweenBites - 200
            ) mainGame.player.character.head.img = headEat;
            if (
              other.Id === collisionIDs.donutEatTrigger &&
              Date.now() - eatDonuts.lastBiteTime >= eatDonuts.timeBetweenBites
            ) {
              eatDonuts.lastBiteTime = Date.now();
              d.bites++;
              if (d.bites > 2) {
                mainGame.tasksCompleted++;
                d.destroy = true;
                eatDonuts.numDonuts--;
                return;
              }
              d.img = eatDonuts.donutImages[d.bites];
              d.size = new Vector2(d.img.width, d.img.height);
            }
          }
        );
        mainGame.grabbableObjects.push(d);
        mainGame.world.physicsObjects.push(d);
      }
    );
    eatDonuts.evaluateCompletion = (function () {
      return eatDonuts.numDonuts < 3;
    });
    mainGame.tasks.push(eatDonuts);
    let emails = new Task();
    emails.Id = taskIDs.computer;
    emails.hasEmail = false;
    emails.lastEmailTime = 0;
    emails.defaultTimerDuration = 12;
    emails.timerDuration = emails.defaultTimerDuration * mainGame.difficulty;
    emails.resetTimer();
    emails.keyboardHits = 0;
    emails.keyboardHitsToCompletion = 5;
    emails.lastKeyboardHitTime = 0;
    emails.timeBetweenKeyboardHits = 100; //ms
    emails.onActivate = (
      function () {
        emails.hasEmail = true;
        emails.lastEmailTime = Date.now();
        async function notification() {
          if (emails.hasEmail === false) {
            computerNotify.enabled = false;
            return;
          }
          computerNotify.enabled = !computerNotify.enabled;
          await sleep(500 / (+(emails.incompleteTimer > 10) + 1));
          requestAnimationFrame(notification);
        }
        requestAnimationFrame(notification);
      }
    );
    emails.evaluateCompletion = (function () {
      return !emails.hasEmail;
    });
    emails.onCompletion = (function () {
      mainGame.tasksCompleted++;
      emails.resetTimer();
    });
    mainGame.tasks.push(emails);
    let phoneCalls = new Task();
    phoneCalls.Id = taskIDs.phone;
    phoneCalls.defaultTimerDuration = 14;
    phoneCalls.timerDuration = phoneCalls.defaultTimerDuration * mainGame.difficulty;
    phoneCalls.resetTimer();
    phoneCalls.timeOnPhone = 0;
    phoneCalls.timeRequiredOnPhone = 10;
    phoneCalls.hasCall = false;
    phoneCalls.phoneNearHead = false;
    phoneCalls.onActivate = (
      function () {
        phoneCalls.hasCall = true;
        phoneCalls.timeOnPhone = 0;
        let animatedRotation = 10;
        phone.rotation = 10;
        async function animatePhone() {
          if (phoneCalls.hasCall === false) return;
          if (phoneCalls.phoneNearHead) {
            // face the phone towards the head
            let headPos = mainGame.player.character.head.getMiddle();
            let dirToHead = MyMath.subtractVector(headPos, phone.getMiddle()).normalized();
            let dot = MyMath.dot(new Vector2(1, 0), dirToHead);
            let angle = Math.acos(dot / dirToHead.magnitude());
            if (headPos.y < phone.getMiddle().y) angle *= -1;
            phone.rotation = angle * (180 / Math.PI);
          } else phone.rotation = animatedRotation;
          animatedRotation *= -1;
          await sleep(100);
          requestAnimationFrame(animatePhone);
        }
        requestAnimationFrame(animatePhone);
        let lastTime = Date.now();

        function checkPhone() {
          let dt = (Date.now() - lastTime) / 1000;
          lastTime = Date.now();
          let distanceFromHead = MyMath.subtractVector(mainGame.player.character.head.getMiddle(), phone.getMiddle()).magnitude();
          if (distanceFromHead < 80) {
            phoneCalls.phoneNearHead = true;
            phoneCalls.timeOnPhone += dt;
            if (phoneCalls.timeOnPhone >= phoneCalls.timeRequiredOnPhone) {
              phoneCalls.hasCall = false;
              phoneCalls.timeOnPhone = 0;
              phoneCalls.phoneNearHead = false;
              phone.rotation = 0;
              return;
            }
          } else {
            phoneCalls.phoneNearHead = false;
          }
          requestAnimationFrame(checkPhone);
        }
        requestAnimationFrame(checkPhone);
      }
    );
    phoneCalls.evaluateCompletion = (function () {
      return !phoneCalls.hasCall;
    });
    phoneCalls.onCompletion = (
      function () {
        if (mainGame.hasWon) return;
        mainGame.tasksCompleted++;
        phoneCalls.incompleteTimer = 0;
        phoneCalls.resetTimer();
      }
    );
    phoneCalls.checkFailure = (
      function () // custom failure check to account for phone
      {
        return phoneCalls.incompleteTimer - phoneCalls.timeOnPhone > 10;
      }
    );
    mainGame.tasks.push(phoneCalls);
    let waterPlant = new Task();
    waterPlant.Id = taskIDs.plant;
    waterPlant.defaultTimerDuration = 7;
    waterPlant.timerDuration = waterPlant.defaultTimerDuration * mainGame.difficulty;
    waterPlant.resetTimer();
    waterPlant.wilting = false;
    waterPlant.onActivate = (
      function () {
        waterPlant.wilting = true;
        plant.img = flowerWiltedImage;
        plant.size = new Vector2(flowerWiltedImage.width, flowerWiltedImage.height);
      }
    );
    waterPlant.evaluateCompletion = (function () {
      return !waterPlant.wilting;
    });
    waterPlant.onCompletion = (
      function () {
        if (mainGame.hasWon) return;
        waterPlant.resetTimer();
      }
    );
    mainGame.tasks.push(waterPlant);
    let waveHi = new Task();
    waveHi.Id = taskIDs.wave;
    waveHi.defaultTimerDuration = 9;
    waveHi.timerDuration = waveHi.defaultTimerDuration * mainGame.difficulty;
    waveHi.resetTimer();
    waveHi.complete = true;
    waveHi.lastWave = false;
    waveHi.currentWave = false; // waving up and down, which hitbox was hit last
    waveHi.numWaves = 8;
    waveHi.requiredWaves = 8;
    waveHi.onActivate = (
      function () {
        waveHi.numWaves = 0;
        waveHi.lastWave = false;
        waveHi.currentWave = false;
        let lastTime = Date.now();
        let start = new Vector2(-boss.size.x, 0);
        let end = new Vector2(-20, 0);
        let time = 0;

        function animateBoss() {
          let dt = (Date.now() - lastTime) / 1000;
          lastTime = Date.now();
          time += dt;
          boss.setPosition(Tween.tweenVec2(start, end, Tween.easeOut(time, 2)));
          if (time > 1) return;
          requestAnimationFrame(animateBoss);
        }
        requestAnimationFrame(animateBoss);
      }
    );
    waveHi.evaluateCompletion = (function () {
      return waveHi.numWaves >= waveHi.requiredWaves;
    });
    waveHi.onCompletion = (
      function () {
        mainGame.tasksCompleted++;
        waveHi.resetTimer();
        let lastTime = Date.now();
        let start = new Vector2(-20, 0);
        let end = new Vector2(-boss.size.x, 0);
        let time = 0;

        function animateBoss() {
          let dt = (Date.now() - lastTime) / 1000;
          lastTime = Date.now();
          time += dt;
          boss.setPosition(Tween.tweenVec2(start, end, Tween.easeIn(time, 2)));
          if (time > 1) return;
          requestAnimationFrame(animateBoss);
        }
        requestAnimationFrame(animateBoss);
      }
    );
    mainGame.tasks.push(waveHi);
    // UI OBJECTS ////////////////////////////////////////////////////////////////////
    const pauseButton = new UIElement(new Vector2(5, 255), new Vector2(40, 40));
    pauseButton.img = pauseButtonImage;
    pauseButton.lerpSizeDuration = 0.1;
    pauseButton.onMouseClick = (
      function () {
        if (loader.totalTime > 0) return;
        mainGame.paused = !mainGame.paused;
        resumeButton.enabled = !resumeButton.enabled;
        exitButton.enabled = !exitButton.enabled;
      }
    );
    mainGame.UIObjects.push(pauseButton);
    const resumeButton = new UIElement(new Vector2(125, 80), new Vector2(153, 56));
    resumeButton.img = resumeButtonImage;
    resumeButton.enabled = false;
    resumeButton.lerpSizeDuration = 0.1;
    resumeButton.onMouseClick = (
      function () {
        if (loader.totalTime > 0) return;
        pauseButton.onMouseClick();
      }
    );
    mainGame.UIObjects.push(resumeButton);
    const exitButton = new UIElement(new Vector2(125, 180), new Vector2(153, 56));
    exitButton.img = exitButtonImage;
    exitButton.enabled = false;
    exitButton.lerpSizeDuration = 0.1;
    exitButton.onMouseClick = (
      function () {
        if (loader.totalTime > 0) return;
        stateManager.switchState(mainMenu);
      }
    );
    mainGame.UIObjects.push(exitButton);
    const retryButton = new UIElement(new Vector2(125, 80), new Vector2(153, 56));
    retryButton.img = retryButtonImage;
    retryButton.enabled = false;
    retryButton.lerpSizeDuration = 0.1;
    retryButton.onMouseClick = (
      function () {
        if (loader.totalTime > 0) return;
        stateManager.switchState(mainGame);
      }
    );
    mainGame.UIObjects.push(retryButton);
    // DIALOGUE SEQUENCES //////////////////////////////////////////////////////////////////////////////////////////
    function getStartTextFunction(thisText, type = 0) // 0 is single line, 1 is double line
    {
      return (
        async function () {
          mainGame.UIObjects.push(thisText);
          this.startPos = new Vector2(0, 300 - thisText.img.height);
          this.startSize = new Vector2(0, thisText.img.height);
          this.endPos = new Vector2(0, 300 - thisText.img.height);
          this.endSize = new Vector2(thisText.img.width, thisText.img.height);
          this.duration = 1.5;
          this.time = 0;
          this.easeFunction = Tween.linear;
          if (type === 1) {
            await sleep(1500);
            async function waitDestroy() {
              await sleep(3100);
              thisText.destroy = true;
            }
            waitDestroy();
          } else {
            await sleep(3100);
            this.destroy = true;
          }
          return true;
        }
      );
    }

    function endSequence() {
      exitButton.setPosition(MyMath.addVector(exitButton.position, new Vector2(0, -50)));
      exitButton.enabled = true;
      retryButton.setPosition(MyMath.addVector(retryButton.position, new Vector2(0, -50)));
      retryButton.enabled = true;
      phoneCalls.timer = 9999;
      phoneCalls.hasCall = false;
      phoneCalls.active = false;
      phoneCalls.timeRequiredOnPhone = 0;
      phone.rotation = 0;
    };

    function disablePhone() {
      phoneCalls.timer = 9999;
      phoneCalls.hasCall = false;
      phoneCalls.active = false;
      phoneCalls.timeRequiredOnPhone = 0;
      phone.rotation = 0;
    }

    function enablePhone() {
      phoneCalls.timeRequiredOnPhone = 9999;
      phoneCalls.timer = 0;
    }
    mainGame.loseSequence = (
      async function () {
        let textbox = new Dialogue(textboxImage);
        textbox.startText = (
          async function () {
            mainGame.UIObjects.push(textbox);
            this.startPos = new Vector2(0, 300);
            this.startSize = new Vector2(textbox.img.width, textbox.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(textbox.img.width, textbox.img.height);
            this.duration = 1;
            this.time = 0;
            this.easeFunction = Tween.easeOut;
            await sleep(textbox.duration * 1000 + 500);
            return true;
          }
        );
        let stopText = new Dialogue(textStop);
        stopText.startText = (
          async function () {
            mainGame.UIObjects.push(stopText);
            this.startPos = new Vector2(0, 300 - textbox.img.height);
            this.startSize = new Vector2(0, this.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(this.img.width, this.img.height);
            this.duration = 0.5;
            this.time = 0;
            this.easeFunction = Tween.linear;
            await sleep(textbox.duration * 1000 + 1000);
            this.destroy = true;
            return true;
          }
        );
        let failedTaskText = new Dialogue(mainGame.taskFailDialogue[mainGame.failedTask]);
        failedTaskText.startText = (
          async function () {
            mainGame.UIObjects.push(failedTaskText);
            this.startPos = new Vector2(0, 300 - textbox.img.height);
            this.startSize = new Vector2(0, this.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(this.img.width, this.img.height);
            this.duration = 0.5;
            this.time = 0;
            this.easeFunction = Tween.linear;
            await sleep(textbox.duration * 1000 + 2500);
            this.destroy = true;
            return true;
          }
        );
        let firedDialogue = new Dialogue(textFired);
        firedDialogue.startText = (
          async function () {
            mainGame.UIObjects.push(firedDialogue);
            this.startPos = new Vector2(0, 300 - textbox.img.height);
            this.startSize = new Vector2(0, this.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(this.img.width, this.img.height);
            this.duration = 0.5;
            this.time = 0;
            this.easeFunction = Tween.linear;
            await sleep(textbox.duration * 1000 + 2000);
            return true;
          }
        );
        // now run the text
        textbox.startText().then(
          () => {
            stopText.startText().then(
              () => {
                failedTaskText.startText().then(
                  () => {
                    firedDialogue.startText().then(
                      () => {
                        exitButton.setPosition(MyMath.addVector(exitButton.position, new Vector2(0, -50)));
                        exitButton.enabled = true;
                        retryButton.setPosition(MyMath.addVector(retryButton.position, new Vector2(0, -50)));
                        retryButton.enabled = true;
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
    mainGame.winSequence0 = (
      async function () {
        await sleep(5000);
        enablePhone();
        let pickedUpPhone = false;
        let timeNotPickedUpPhone = 0;
        while (!pickedUpPhone) {
          pickedUpPhone = phone.mIsGrabbed;
          timeNotPickedUpPhone += 100;
          await sleep(100);
          if (timeNotPickedUpPhone > 10000) {
            disablePhone();
            return true;
          }
        }
        let textbox = new Dialogue(textboxImage);
        textbox.startText = (
          async function () {
            mainGame.UIObjects.push(textbox);
            this.startPos = new Vector2(0, 300);
            this.startSize = new Vector2(textbox.img.width, textbox.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(textbox.img.width, textbox.img.height);
            this.duration = 1;
            this.time = 0;
            this.easeFunction = Tween.easeOut;
            await sleep(1500);
          }
        );
        let dialogueArr = [
          new Dialogue(day0Dialogue0),
          new Dialogue(day0Dialogue1),
          new Dialogue(day0Dialogue2),
          new Dialogue(day0Dialogue3),
          new Dialogue(day0Dialogue4),
        ];
        await textbox.startText();
        for (let i = 0; i < dialogueArr.length; i++) {
          let type = 0;
          if (i === 1 || i === 3) type = 1;
          dialogueArr[i].startText = getStartTextFunction(dialogueArr[i], type);
          await dialogueArr[i].startText();
        }
        endSequence();
        return true;
      }
    );
    mainGame.winSequence1 = (
      async function () {
        await sleep(5000);
        enablePhone();
        let pickedUpPhone = false;
        let timeNotPickedUpPhone = 0;
        while (!pickedUpPhone) {
          pickedUpPhone = phone.mIsGrabbed;
          timeNotPickedUpPhone += 100;
          await sleep(100);
          if (timeNotPickedUpPhone > 10000) {
            disablePhone();
            return true;
          }
        }
        let textbox = new Dialogue(textboxImage);
        textbox.startText = (
          async function () {
            mainGame.UIObjects.push(textbox);
            this.startPos = new Vector2(0, 300);
            this.startSize = new Vector2(textbox.img.width, textbox.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(textbox.img.width, textbox.img.height);
            this.duration = 1;
            this.time = 0;
            this.easeFunction = Tween.easeOut;
            await sleep(1500);
          }
        );
        let dialogueArr = [
          new Dialogue(day1Dialogue0),
          new Dialogue(day1Dialogue1),
          new Dialogue(day1Dialogue2),
          new Dialogue(day1Dialogue3),
          new Dialogue(day1Dialogue4),
          new Dialogue(day1Dialogue5),
          new Dialogue(day1Dialogue6),
          new Dialogue(day1Dialogue7),
          new Dialogue(day1Dialogue8),
          new Dialogue(day1Dialogue9),
          new Dialogue(day1Dialogue10),
        ];
        await textbox.startText();
        for (let i = 0; i < dialogueArr.length; i++) {
          let type = 0;
          if (i === 8) type = 1;
          dialogueArr[i].startText = getStartTextFunction(dialogueArr[i], type);
          await dialogueArr[i].startText();
        }
        endSequence();
        return true;
      }
    );
    mainGame.winSequence2 = (
      async function () {
        await sleep(5000);
        enablePhone();
        let pickedUpPhone = false;
        let timeNotPickedUpPhone = 0;
        while (!pickedUpPhone) {
          pickedUpPhone = phone.mIsGrabbed;
          timeNotPickedUpPhone += 100;
          await sleep(100);
          if (timeNotPickedUpPhone > 10000) {
            disablePhone();
            return true;
          }
        }
        let textbox = new Dialogue(textboxImage);
        textbox.startText = (
          async function () {
            mainGame.UIObjects.push(textbox);
            this.startPos = new Vector2(0, 300);
            this.startSize = new Vector2(textbox.img.width, textbox.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(textbox.img.width, textbox.img.height);
            this.duration = 1;
            this.time = 0;
            this.easeFunction = Tween.easeOut;
            await sleep(1500);
          }
        );
        let dialogueArr = [
          new Dialogue(day2Dialogue0),
          new Dialogue(day2Dialogue1),
          new Dialogue(day2Dialogue2),
          new Dialogue(day2Dialogue3),
          new Dialogue(day2Dialogue4),
          new Dialogue(day2Dialogue5),
          new Dialogue(day2Dialogue6),
          new Dialogue(day2Dialogue7),
          new Dialogue(day2Dialogue8),
        ];
        await textbox.startText();
        for (let i = 0; i < dialogueArr.length; i++) {
          let type = 0;
          if (i === 2 || i === 6) type = 1;
          dialogueArr[i].startText = getStartTextFunction(dialogueArr[i], type);
          await dialogueArr[i].startText();
        }
        endSequence();
        return true;
      }
    );
    mainGame.winSequence3 = (
      async function () {
        await sleep(5000);
        enablePhone();
        let pickedUpPhone = false;
        let timeNotPickedUpPhone = 0;
        while (!pickedUpPhone) {
          pickedUpPhone = phone.mIsGrabbed;
          timeNotPickedUpPhone += 100;
          await sleep(100);
          if (timeNotPickedUpPhone > 10000) {
            disablePhone();
            return true;
          }
        }
        let textbox = new Dialogue(textboxImage);
        textbox.startText = (
          async function () {
            mainGame.UIObjects.push(textbox);
            this.startPos = new Vector2(0, 300);
            this.startSize = new Vector2(textbox.img.width, textbox.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(textbox.img.width, textbox.img.height);
            this.duration = 1;
            this.time = 0;
            this.easeFunction = Tween.easeOut;
            await sleep(1500);
          }
        );
        let dialogueArr = [
          new Dialogue(day3Dialogue0),
          new Dialogue(day3Dialogue1),
          new Dialogue(day3Dialogue2),
          new Dialogue(day3Dialogue3),
          new Dialogue(day3Dialogue4),
          new Dialogue(day3Dialogue5),
          new Dialogue(day3Dialogue6),
          new Dialogue(day3Dialogue7),
          new Dialogue(day3Dialogue8),
        ];
        await textbox.startText();
        for (let i = 0; i < dialogueArr.length; i++) {
          let type = 0;
          if (i === 6) type = 1;
          dialogueArr[i].startText = getStartTextFunction(dialogueArr[i], type);
          await dialogueArr[i].startText();
        }
        endSequence();
        return true;
      }
    );
    mainGame.winSequence4 = (
      async function () {
        await sleep(5000);
        enablePhone();
        let pickedUpPhone = false;
        let timeNotPickedUpPhone = 0;
        while (!pickedUpPhone) {
          pickedUpPhone = phone.mIsGrabbed;
          timeNotPickedUpPhone += 100;
          await sleep(100);
          if (timeNotPickedUpPhone > 10000) {
            disablePhone();
            return true;
          }
        }
        let textbox = new Dialogue(textboxImage);
        textbox.startText = (
          async function () {
            mainGame.UIObjects.push(textbox);
            this.startPos = new Vector2(0, 300);
            this.startSize = new Vector2(textbox.img.width, textbox.img.height);
            this.endPos = new Vector2(0, 300 - textbox.img.height);
            this.endSize = new Vector2(textbox.img.width, textbox.img.height);
            this.duration = 1;
            this.time = 0;
            this.easeFunction = Tween.easeOut;
            await sleep(1500);
          }
        );
        let dialogueArr = [
          new Dialogue(day4Dialogue0),
          new Dialogue(day4Dialogue1),
          new Dialogue(day4Dialogue2),
          new Dialogue(day4Dialogue3),
          new Dialogue(day4Dialogue4),
          new Dialogue(day4Dialogue5),
          new Dialogue(day4Dialogue6),
          new Dialogue(day4Dialogue7),
          new Dialogue(day4Dialogue8),
          new Dialogue(day4Dialogue9),
          new Dialogue(day4Dialogue10),
          new Dialogue(day4Dialogue11),
          new Dialogue(day4Dialogue12),
          new Dialogue(day4Dialogue13),
          new Dialogue(day4Dialogue14),
          new Dialogue(day4Dialogue15),
          new Dialogue(day4Dialogue16),
          new Dialogue(day4Dialogue17),
          new Dialogue(day4Dialogue18),
          new Dialogue(day4Dialogue19),
        ];
        await textbox.startText();
        for (let i = 0; i < dialogueArr.length; i++) {
          let type = 0;
          if (i === 3 || i === 5 || i === 7 || i === 12) type = 1;
          dialogueArr[i].startText = getStartTextFunction(dialogueArr[i], type);
          await dialogueArr[i].startText();
        }
        endSequence();
        let theEndText = new TextObject('You win! Thanks for playing :)');
        theEndText.setPosition(new Vector2(50, 265));
        mainGame.UIObjects.push(theEndText);
        return true;
      }
    );
    // combine the arrays
    mainGame.world.physicsObjects = mainGame.physicsObjects.concat(mainGame.grabbableObjects);
    // initialize player
    let headImages = [
      headEat,
      headDerp,
      headDown,
      headLeft,
      headRight,
      headULeft,
      headURight
    ];
    mainGame.player = new Player(headImages);
    {
      mainGame.player.character.head.img = headDerp;
      mainGame.player.character.body.img = torsoImage;
      mainGame.player.character.arms[0].hand.Id = collisionIDs.hand;
      mainGame.player.character.arms[1].hand.Id = collisionIDs.hand;
      mainGame.player.character.arms[0].hand.img = handImage;
      mainGame.player.character.arms[1].hand.img = handImage;
      mainGame.player.character.arms[1].hand.flipped = true;
      mainGame.player.character.arms[0].elbow.img = elbowImage;
      mainGame.player.character.arms[1].elbow.img = elbowImage;
      mainGame.player.character.arms[0].shoulder.img = shoulderImage;
      mainGame.player.character.arms[1].shoulder.img = shoulderImage;
      mainGame.player.character.arms[0].upperArm.img = upperarmImage;
      mainGame.player.character.arms[1].upperArm.img = upperarmImage;
      mainGame.player.character.arms[0].lowerArm.img = forearmImage;
      mainGame.player.character.arms[1].lowerArm.img = forearmImage;
    }
    mainGame.world.physicsObjects.push(mainGame.player.character.arms[0].hand);
    mainGame.world.physicsObjects.push(mainGame.player.character.arms[1].hand);
    // events
    mainGame.handleMouseDown = (
      function (event) {
        if (event.button === 0) // left click
        {
          let aHand = mainGame.player.character.arms[+mainGame.player.activeHand].hand;
          let objects = aHand.getOverlapping(mainGame.grabbableObjects);
          if (aHand.isGrabbing) // if the active hand is grabbing something
          {
            aHand.grabbedObject.toggleGrab();
            aHand.stopGrabbing();
            return;
          }
          for (let i = 0; i < objects.length; i++) // for all overlapping grabbables
          {
            let obj = objects[i];
            // the hand.isgrabbing variable is just to ensure that we dont pick up another thing when we already have something in our hand that we want to drop
            if (!obj.mIsGrabbable || obj.mIsGrabbed) continue; // if the object isn't grabbable, continue
            obj.toggleGrab();
            aHand.grab(obj);
            return;
          }
        }
      }
    );
    mainGame.handleKeyDown = (
      function (event) {
        if (event.keyCode === 32) // space
        {
          mainGame.player.activeHand = !mainGame.player.activeHand;
        } else if (event.keyCode === 17) // ctrl
        {
          let aHand = mainGame.player.character.arms[+mainGame.player.activeHand].hand;
          if (aHand.grabbedObject === null) return;
          if (aHand.grabbedObject.Id === collisionIDs.sprayer) {
            let pos = MyMath.addVector(aHand.grabbedObject.position, new Vector2(25, 3));
            for (let i = 0; i < 25; i++) {
              mainGame.vfx.push(new VFXWaterVapor(pos));
            } // make collision object that tells the flower to stop wilting
            async function wrapper() {
              let o = new PhysicsObject(pos, new Vector2(50, 10));
              o.enabled = false;
              o.isTrigger = true;
              o.mHasGravity = false;
              o.onCollide = (
                function (other) {
                  if (other.Id === collisionIDs.flower) {
                    if (waterPlant.wilting) mainGame.tasksCompleted++;
                    waterPlant.wilting = false;
                    waterPlant.onCompletion();
                    plant.img = flowerPotImage;
                    plant.size = new Vector2(flowerPotImage.width, flowerPotImage.height);
                  }
                }
              );
              mainGame.physicsObjects.push(o);
              mainGame.world.physicsObjects.push(o);
              await sleep(100);
              o.destroy = true;
            }
            wrapper();
          }
        } else if (event.keyCode === 16) // shift
        {
          let aHand = mainGame.player.character.arms[+mainGame.player.activeHand].hand;
          if (aHand.grabbedObject === null) return;
          aHand.grabbedObject.toggleGrab();
          aHand.stopGrabbing(true);
        }
      }
    );
    document.addEventListener('mousedown', mainGame.handleMouseDown, false);
    document.addEventListener('keydown', mainGame.handleKeyDown, false);
    // wait for finish loading
    let loadingAnim = new GameObject(new Vector2(335, 219), new Vector2(60, 76), animImages[0]);
    let incrementer = 1;
    let index = 0;

    function loadingAnimWrapper() {
      ctx1.fillStyle = 'rgb(247, 233, 188)';
      ctx1.fillRect(0, 0, 400, 300);
      loadingAnim.draw(ctx1);
      if (loadComplete) return;
      requestAnimationFrame(loadingAnimWrapper);
    }
    requestAnimationFrame(loadingAnimWrapper);
    while (loadComplete === false) {
      await sleep(200);
      index += incrementer
      loadingAnim.img = animImages[index];
      if (index !== 1) incrementer *= -1; // short logic for 3 frames of animation
      loadComplete = (loadedImages === images.length);
    } // run loading animation
    let lastTime = Date.now()

    function loadingWrapper() {
      let dt = (Date.now() - lastTime) / 1000;
      lastTime = Date.now();
      let loadAnimationComplete = loader.playTransition(dt);
      if (loadAnimationComplete) return;
      requestAnimationFrame(loadingWrapper);
    }
    requestAnimationFrame(loadingWrapper);
    return true;
  }
);
mainGame.onSwitchFrom = (
  async function () {
    // LOADING SCREEN
    let loadAnimationComplete = false;
    loader.loadingScreenStart();
    let lastTime = Date.now();

    function loadingWrapper() {
      let dt = (Date.now() - lastTime) / 1000;
      lastTime = Date.now();
      loadAnimationComplete = loader.playTransition(dt);
      if (loadAnimationComplete) return;
      requestAnimationFrame(loadingWrapper);
    }
    requestAnimationFrame(loadingWrapper);
    document.removeEventListener('mousedown', mainGame.handleMouseDown, false);
    document.removeEventListener('keydown', mainGame.handleKeyDown, false);
    // wait for loading animation to complete
    while (loadAnimationComplete === false) {
      console.log('waiting to finish animation');
      await sleep(200);
    }
    return true;
  }
);
mainGame.doLoop = (
  function (dt) {
    if (mainGame.paused === false) {
      mainGame.dayTimer -= dt;
      // update the player
      mainGame.player.update();
      // update physics simulation
      mainGame.world.doTick(dt);
      // check for loss
      for (let i = 0; i < mainGame.tasks.length; i++) {
        mainGame.tasks[i].update(dt);
        if (mainGame.tasks[mainGame.tasks.length - 1].active) // if the boss is here
        {
          if (
            mainGame.tasks[i].checkFailure() &&
            !mainGame.hasLost &&
            !mainGame.hasWon
          ) // on lost game
          {
            for (let i = 0; i < mainGame.UIObjects.length; i++) mainGame.UIObjects[i].enabled = false; // disable UI
            for (let i = 0; i < mainGame.tasks.length; i++) mainGame.tasks[i].timer = 9999; // disable tasks
            mainGame.hasLost = true;
            mainGame.failedTask = mainGame.tasks[i].Id;
            mainGame.loseSequence();
            if (
              mainGame.mode === 1 &&
              mainGame.tasksCompleted > saveData.bestEndlessScore
            ) {
              saveData.bestEndlessScore = mainGame.tasksCompleted;
              saveData.save();
            }
          }
        }
      } // check for win
      if (
        mainGame.dayTimer <= 0 &&
        !mainGame.hasWon &&
        !mainGame.hasLost &&
        mainGame.mode === 0
      ) {
        mainGame.hasWon = true;
        for (let i = 0; i < mainGame.UIObjects.length; i++) mainGame.UIObjects[i].enabled = false; // disable UI
        for (let i = 0; i < mainGame.tasks.length; i++) {
          mainGame.tasks[i].onCompletion();
          mainGame.tasks[i].complete = true; // disable tasks
          mainGame.tasks[i].timer = 9999;
          mainGame.tasks[i].active = false;
        }
        let winSequence = (function () { });
        switch (saveData.currentStoryDay) {
          case 0:
            winSequence = mainGame.winSequence0;
            break;
          case 1:
            winSequence = mainGame.winSequence1;
            break;
          case 2:
            winSequence = mainGame.winSequence2;
            break;
          case 3:
            winSequence = mainGame.winSequence3;
            break;
          case 4:
            winSequence = mainGame.winSequence4;
            break;
          default:
            stateManager.switchState(mainMenu);
            break;
        }
        winSequence();
        saveData.currentStoryDay++;
        if (saveData.currentStoryDay > 4) saveData.currentStoryDay = 0;
        saveData.save();
        console.log(saveData);
      } // update score text
      if (mainGame.mode === 1) {
        mainGame.difficulty -= dt / 60;
        if (mainGame.difficulty < 0.8) mainGame.difficulty = 0.8; // clamp difficulty
        mainGame.scoreText.text = 'Score: ' + mainGame.tasksCompleted;
      }
    } // draw background
    ctx0.drawImage(mainGame.backgroundImage, 0, 0);
    // draw clock hands
    if (mainGame.dayTimer < 0 && mainGame.mode === 0) mainGame.dayTimer = 0;
    {
      ctx0.fillStyle = 'black';
      ctx0.translate(280, 46);
      ctx0.rotate(((mainGame.dayTimer * -16) * Math.PI) / 180);
      ctx0.translate(-1, -19);
      ctx0.fillRect(0, 0, 1, 19);
      ctx0.setTransform(1, 0, 0, 1, 0, 0);
      ctx0.translate(280, 46);
      ctx0.rotate(((-mainGame.dayTimer * (4 / 3) - 210) * Math.PI) / 180);
      ctx0.translate(-1, -13);
      ctx0.fillRect(0, 0, 1, 13);
      ctx0.setTransform(1, 0, 0, 1, 0, 0);
    } // draw character
    mainGame.player.character.draw();
    // draw game objects
    for (let i = 0; i < mainGame.gameObjects.length; i++) {
      if (mainGame.gameObjects[i].destroy === true) {
        mainGame.gameObjects.splice(i, 1);
        i--;
      } else mainGame.gameObjects[i].draw();
    } // draw grabbable objects
    for (let i = 0; i < mainGame.grabbableObjects.length; i++) {
      if (mainGame.grabbableObjects[i].destroy === true) {
        mainGame.grabbableObjects.splice(i, 1);
        i--;
      } else mainGame.grabbableObjects[i].draw();
    } // draw physics objects
    for (let i = 0; i < mainGame.physicsObjects.length; i++) {
      if (mainGame.physicsObjects[i].destroy === true) {
        mainGame.physicsObjects.splice(i, 1);
        i--;
      } else mainGame.physicsObjects[i].draw();
    } // draw VFX
    for (let i = 0; i < mainGame.vfx.length; i++) {
      if (mainGame.vfx[i].destroy === true) {
        mainGame.vfx.splice(i, 1);
        i--;
      } else {
        mainGame.vfx[i].update(dt);
        mainGame.vfx[i].draw();
      }
    } // draw UI
    for (let i = 0; i < mainGame.UIObjects.length; i++) {
      mainGame.UIObjects[i].update(dt);
      if (mainGame.UIObjects[i].destroy === true) {
        mainGame.UIObjects.splice(i, 1);
        i--;
      } else mainGame.UIObjects[i].draw();
    }
  }
);
mainMenu.onSwitchTo = (
  async function () {
    // LOADING SCREEN
    let loadComplete = false;
    loader.loadingScreenEnd();
    loader.playTransition(0);
    // load the loading screen animation first
    let animImages = [
      new Image(),
      new Image(),
      new Image()
    ];
    animImages[0].src = '../../assets/frogbiz/anim-loading-0.png';
    animImages[1].src = '../../assets/frogbiz/anim-loading-1.png';
    animImages[2].src = '../../assets/frogbiz/anim-loading-2.png';
    // make bitmap images
    let loadedImages = 0;
    const playButtonImage = new Image();
    const aboutButtonImage = new Image();
    const playStoryButtonImage = new Image();
    const playEndlessButtonImage = new Image();
    const menuBackgroundImage = new Image();
    const menuBackButtonImage = new Image();
    const menuTitleImage = new Image();
    const aboutTextImage = new Image();
    let images = [ playButtonImage, aboutButtonImage, playStoryButtonImage, playEndlessButtonImage, menuBackgroundImage, menuBackButtonImage, menuTitleImage, aboutTextImage ];
    playButtonImage.src = '../../assets/frogbiz/play-button.png';
    aboutButtonImage.src = '../../assets/frogbiz/about-button.png';
    playStoryButtonImage.src = '../../assets/frogbiz/play-story.png';
    playEndlessButtonImage.src = '../../assets/frogbiz/play-endless.png';
    menuBackgroundImage.src = '../../assets/frogbiz/menu-background.png';
    menuBackButtonImage.src = '../../assets/frogbiz/back-button.png';
    menuTitleImage.src = '../../assets/frogbiz/menu-title.png';
    aboutTextImage.src = '../../assets/frogbiz/about-text.png';
    for (let i = 0; i < images.length; i++) {
      images[i].onload = () => {
        Promise.resolve(createImageBitmap(images[i])).then(() => {
          loadedImages++;
        })
      }
    } // declare and initialize Gameobjects
    const mainScreenBackground = new GameObject(new Vector2(), new Vector2(400, 300), menuBackgroundImage);
    const playScreenBackground = new GameObject(new Vector2(0, 300), new Vector2(400, 300), menuBackgroundImage);
    const aboutScreenBackground = new GameObject(new Vector2(400, 0), new Vector2(400, 300), menuBackgroundImage);
    const titleSplash = new GameObject(new Vector2(), new Vector2(400, 300), menuTitleImage);
    const aboutText = new GameObject(new Vector2(400, 0), new Vector2(400, 300), aboutTextImage);
    mainMenu.gameObjects = [ mainScreenBackground, playScreenBackground, aboutScreenBackground, titleSplash, aboutText ];
    // declare and initialize UI elements
    const playButton = new UIElement(new Vector2(125, 120), new Vector2(154, 56));
    const playBackButton = new UIElement(new Vector2(40, 340), new Vector2(72, 64));
    const playStoryButton = new UIElement(new Vector2(125, 380), new Vector2(154, 56));
    const playEndlessButton = new UIElement(new Vector2(125, 480), new Vector2(154, 56));
    const aboutButton = new UIElement(new Vector2(125, 190), new Vector2(154, 56));
    const aboutBackButton = new UIElement(new Vector2(440, 40), new Vector2(72, 64));
    const bestScoreLabel = new TextObject('Best Score: ' + saveData.bestEndlessScore);
    const currentStoryDayLabel = new TextObject('Day ' + (saveData.currentStoryDay + 1) + '/5');
    mainMenu.UIObjects = [ playButton, playBackButton, playStoryButton, playEndlessButton, aboutButton, aboutBackButton, bestScoreLabel, currentStoryDayLabel ];
    playButton.img = playButtonImage;
    playButton.lerpSizeDuration = 0.1;
    playButton.onMouseClick = (
      function () {
        if (loader.totalTime > 0) return;
        Utility.tweenAllPositions(new Vector2(0, -300), mainMenu.UIObjects);
        Utility.tweenAllPositions(new Vector2(0, -300), mainMenu.gameObjects);
      }
    );
    playBackButton.img = menuBackButtonImage;
    playBackButton.lerpSizeDuration = 0.1;
    playBackButton.onMouseClick = (
      function () {
        Utility.tweenAllPositions(new Vector2(0, 300), mainMenu.UIObjects);
        Utility.tweenAllPositions(new Vector2(0, 300), mainMenu.gameObjects);
      }
    );
    playStoryButton.img = playStoryButtonImage;
    playStoryButton.lerpSizeDuration = 0.1;
    playStoryButton.onMouseClick = (
      function () {
        if (loader.totalTime > 0) return;
        mainGame.mode = 0;
        stateManager.switchState(mainGame);
      }
    );
    playEndlessButton.img = playEndlessButtonImage;
    playEndlessButton.lerpSizeDuration = 0.1;
    playEndlessButton.onMouseClick = (
      function () {
        if (loader.totalTime > 0) return;
        mainGame.mode = 1;
        stateManager.switchState(mainGame);
      }
    );
    aboutButton.img = aboutButtonImage;
    aboutButton.lerpSizeDuration = 0.1;
    aboutButton.onMouseClick = (
      function () // transition to about screen
      {
        if (loader.totalTime > 0) return;
        Utility.tweenAllPositions(new Vector2(-400, 0), mainMenu.UIObjects);
        Utility.tweenAllPositions(new Vector2(-400, 0), mainMenu.gameObjects);
      }
    );
    aboutBackButton.img = menuBackButtonImage;
    aboutBackButton.lerpSizeDuration = 0.1;
    aboutBackButton.onMouseClick = (
      function () // transition to main menu
      {
        Utility.tweenAllPositions(new Vector2(400, 0), mainMenu.UIObjects);
        Utility.tweenAllPositions(new Vector2(400, 0), mainMenu.gameObjects);
      }
    );
    bestScoreLabel.setPosition(new Vector2(155, 555), true);
    currentStoryDayLabel.setPosition(new Vector2(175, 455), true);
    // wait for finish loading
    let loadingAnim = new GameObject(new Vector2(335, 219), new Vector2(60, 76), animImages[0]);
    let incrementer = 1;
    let index = 0;

    function loadingAnimWrapper() {
      ctx1.fillStyle = 'rgb(247, 233, 188)';
      ctx1.fillRect(0, 0, 400, 300);
      loadingAnim.draw(ctx1);
      if (loadComplete) return;
      requestAnimationFrame(loadingAnimWrapper);
    }
    requestAnimationFrame(loadingAnimWrapper);
    while (loadComplete === false) {
      await sleep(200);
      index += incrementer
      loadingAnim.img = animImages[index];
      if (index !== 1) incrementer *= -1; // short logic for 3 frames of animation
      loadComplete = (loadedImages === images.length);
    } // run loading transition
    let lastTime = Date.now()

    function loadingWrapper() {
      let dt = (Date.now() - lastTime) / 1000;
      lastTime = Date.now();
      let loadAnimationComplete = loader.playTransition(dt);
      if (loadAnimationComplete) return;
      requestAnimationFrame(loadingWrapper);
    }
    requestAnimationFrame(loadingWrapper);
    return true;
  }
);
mainMenu.onSwitchFrom = (
  async function () {
    // LOADING SCREEN
    let loadAnimationComplete = false;
    loader.loadingScreenStart();
    let lastTime = Date.now();

    function loadingWrapper() {
      let dt = (Date.now() - lastTime) / 1000;
      lastTime = Date.now();
      loadAnimationComplete = loader.playTransition(dt);
      if (loadAnimationComplete) return;
      requestAnimationFrame(loadingWrapper);
    }
    requestAnimationFrame(loadingWrapper);
    // wait for loading animation to complete
    while (loadAnimationComplete === false) {
      console.log('waiting to finish animation');
      await sleep(200);
    }
    return true;
  }
);
mainMenu.doLoop = (
  function (dt) {
    // overwrite previous animation frame
    ctx0.fillStyle = 'white';
    ctx0.fillRect(0, 0, cv0.clientWidth, cv0.clientHeight);
    // draw gameobjects
    for (let i = 0; i < mainMenu.gameObjects.length; i++) {
      if (mainMenu.gameObjects[i].destroy) {
        mainMenu.gameObjects.splice(i, 1);
        i--;
      }
      mainMenu.gameObjects[i].draw();
    } // draw UI
    for (let i = 0; i < mainMenu.UIObjects.length; i++) {
      mainMenu.UIObjects[i].update(dt);
      mainMenu.UIObjects[i].draw();
    }
  }
);

function loopGame() {
  stateManager.runGame();
  requestAnimationFrame(loopGame);
}
stateManager.activeState = mainMenu; // initial game state
let doneLoading = stateManager.activeState.onSwitchTo();
doneLoading.then(() => {
  requestAnimationFrame(loopGame)
});