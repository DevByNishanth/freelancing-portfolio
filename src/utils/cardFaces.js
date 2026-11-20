/* Paints the ID-card faces and the strap tile for <Lanyard /> at runtime,
   so each team member only needs a photo + a few text fields in Team.jsx.
   Everything returns data-URLs, which Lanyard accepts as frontImage /
   backImage / strapImage.

   Card canvas is 1024 x 1440 (the Lanyard portrait card is 1.6 x 2.25).
   The strap slot sits ~83px from the top, so the header row lives there. */

const W = 1024;
const H = 1440;
const FONT = '"Geist Variable", "Geist", ui-sans-serif, system-ui, sans-serif';
const INK = "#0c1a14";
const EMERALD = "#009966";

const loadImg = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const makeCanvas = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

const roundRectPath = (g, x, y, w, h, r) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

/* atom-style mark: three orbits + nucleus */
const drawMark = (g, cx, cy, r, color, lw) => {
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = lw;
  for (let k = 0; k < 3; k++) {
    g.save();
    g.rotate((k * Math.PI) / 3);
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.38, 0, 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
  g.beginPath();
  g.arc(0, 0, r * 0.14, 0, Math.PI * 2);
  g.fill();
  g.restore();
};

/* grayscale that works in every browser (ctx.filter is missing in Safari) */
const toGray = (img) => {
  const c = makeCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    let v = 0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
    v = Math.min(255, Math.max(0, (v - 128) * 1.08 + 128));
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
  }
  g.putImageData(d, 0, 0);
  return c;
};

const drawCover = (g, src, x, y, w, h, alignY = 0.3) => {
  const sw = src.width;
  const sh = src.height;
  const s = Math.max(w / sw, h / sh);
  const dw = sw * s;
  const dh = sh * s;
  g.drawImage(src, x + (w - dw) / 2, y + (h - dh) * alignY, dw, dh);
};

const fitText = (g, text, maxWidth, size, weight) => {
  let s = size;
  g.font = `${weight} ${s}px ${FONT}`;
  while (g.measureText(text).width > maxWidth && s > 36) {
    s -= 2;
    g.font = `${weight} ${s}px ${FONT}`;
  }
  return s;
};

const paintFront = (m, photo) => {
  const c = makeCanvas(W, H);
  const g = c.getContext("2d");

  g.fillStyle = "#f4f4f2";
  g.fillRect(0, 0, W, H);
  const sheen = g.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, "rgba(255,255,255,0.9)");
  sheen.addColorStop(1, "rgba(0,0,0,0.04)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H);

  // header row, level with the strap slot
  drawMark(g, 104, 84, 34, INK, 5);
  g.textAlign = "right";
  g.textBaseline = "middle";
  g.fillStyle = "#6b746f";
  g.font = `500 34px ${FONT}`;
  g.fillText(`@${m.handle}`, W - 96, 84);

  // photo panel
  const px = 56;
  const py = 190;
  const pw = W - 112;
  const ph = 760;
  g.save();
  roundRectPath(g, px, py, pw, ph, 44);
  g.clip();
  const bg = g.createLinearGradient(px, py, px + pw, py + ph);
  bg.addColorStop(0, "#eceeed");
  bg.addColorStop(1, "#d6dad8");
  g.fillStyle = bg;
  g.fillRect(px, py, pw, ph);
  g.fillStyle = "rgba(255,255,255,0.55)";
  g.beginPath();
  g.moveTo(px, py + ph * 0.55);
  g.lineTo(px + pw * 0.7, py);
  g.lineTo(px + pw, py);
  g.lineTo(px + pw, py + ph * 0.2);
  g.lineTo(px + pw * 0.2, py + ph);
  g.lineTo(px, py + ph);
  g.closePath();
  g.fill();
  if (photo) {
    drawCover(g, toGray(photo), px, py, pw, ph, 0.25);
  } else {
    g.fillStyle = "#b9bfbc";
    g.font = `700 320px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(m.name.charAt(0), px + pw / 2, py + ph / 2);
  }
  g.restore();

  // name + role
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.fillStyle = INK;
  fitText(g, m.name, W - 176, 88, 700);
  g.fillText(m.name, 88, 1124);

  g.fillStyle = m.statusColor || "#22c55e";
  g.beginPath();
  g.arc(100, 1200, 13, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#4b5550";
  fitText(g, m.title, W - 230, 46, 500);
  g.fillText(m.title, 132, 1215);

  return c.toDataURL("image/jpeg", 0.92);
};

const paintBack = (m) => {
  const c = makeCanvas(W, H);
  const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0d1713");
  bg.addColorStop(1, "#050a08");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, 520);
  glow.addColorStop(0, "rgba(0,153,102,0.34)");
  glow.addColorStop(1, "rgba(0,153,102,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);

  drawMark(g, W / 2, H * 0.48, 190, "#ffffff", 9);

  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillStyle = "#ffffff";
  fitText(g, m.name, W - 200, 64, 600);
  g.fillText(m.name, W / 2, H * 0.74);
  g.fillStyle = "#8a948f";
  g.font = `500 36px ${FONT}`;
  g.fillText(m.email || `@${m.handle}`, W / 2, H * 0.74 + 66);

  return c.toDataURL("image/jpeg", 0.92);
};

/* One tile, repeated along the strap. Lanyard rotates the image 90° when it
   wraps it onto the strap, so the mark is pre-rotated to end up upright. */
export const buildStrap = () => {
  const c = makeCanvas(576, 192);
  const g = c.getContext("2d");
  g.fillStyle = "#101312";
  g.fillRect(0, 0, 576, 192);
  g.fillStyle = "rgba(255,255,255,0.06)";
  g.fillRect(0, 0, 576, 3);
  g.fillRect(0, 189, 576, 3);
  g.save();
  g.translate(288, 96);
  g.rotate(-Math.PI / 2);
  drawMark(g, 0, 0, 34, "rgba(255,255,255,0.92)", 4);
  g.restore();
  return c.toDataURL("image/png");
};

const ensureFonts = async () => {
  try {
    await Promise.all([
      document.fonts.load(`700 80px ${FONT}`),
      document.fonts.load(`500 40px ${FONT}`),
    ]);
  } catch {
    /* falls back to the system font */
  }
};

/* members: [{ id, name, title, handle, statusColor, avatarUrl, email }] */
export const buildCardFaces = async (members) => {
  await ensureFonts();
  const strap = buildStrap();
  const entries = await Promise.all(
    members.map(async (m) => {
      const photo = await loadImg(m.avatarUrl);
      return [m.id, { front: paintFront(m, photo), back: paintBack(m), strap }];
    }),
  );
  return Object.fromEntries(entries);
};
