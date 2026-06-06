export class Camera {
  constructor(canvasWidth, canvasHeight) {
    this.x = 0;
    this.y = 0;
    this.w = canvasWidth;
    this.h = canvasHeight;
    this.lerp = 0.08;
  }

  // Smooth follow player
  follow(target) {
    const targetX = target.x - this.w / 2;
    const targetY = target.y - this.h / 2;
    this.x += (targetX - this.x) * this.lerp;
    this.y += (targetY - this.y) * this.lerp;
  }

  // Apply camera transform to ctx
  begin(ctx) {
    ctx.save();
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  end(ctx) {
    ctx.restore();
  }

  // Check if a rect is visible (viewport culling)
  isVisible(x, y, w, h) {
    return (
      x + w > this.x &&
      x < this.x + this.w &&
      y + h > this.y &&
      y < this.y + this.h
    );
  }
}