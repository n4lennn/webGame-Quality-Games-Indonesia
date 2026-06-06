// Draw a rounded rectangle
export function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

// Draw the road/track
export function drawTrack(ctx, camera, trackWidth, worldHeight) {
  const roadX = 300 - trackWidth / 2;

  // Asphalt
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(roadX, camera.y - 100, trackWidth, worldHeight + 200);

  // Lane markers — dashed white lines, offset follows camera for scroll effect
  const dashLen = 40;
  const gapLen = 30;
  ctx.setLineDash([dashLen, gapLen]);
  ctx.lineDashOffset = -(camera.y % (dashLen + gapLen));
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 3;
  const laneCount = 3;
  for (let i = 1; i < laneCount; i++) {
    const lx = roadX + (trackWidth / laneCount) * i;
    ctx.beginPath();
    ctx.moveTo(lx, camera.y - 100);
    ctx.lineTo(lx, camera.y + worldHeight + 200);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // Road edges
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(roadX, camera.y - 100);
  ctx.lineTo(roadX, camera.y + worldHeight + 200);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(roadX + trackWidth, camera.y - 100);
  ctx.lineTo(roadX + trackWidth, camera.y + worldHeight + 200);
  ctx.stroke();
}

// Draw road markings (kilometer markers)
export function drawKmMarker(ctx, y, km) {
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(100, y, 80, 24);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "12px Courier New";
  ctx.textAlign = "center";
  ctx.fillText(`${km} km`, 140, y + 16);
}
