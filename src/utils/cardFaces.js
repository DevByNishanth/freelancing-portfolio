/* Paints the ID-card faces and the strap tile for <Lanyard /> at runtime,
   so each team member only needs a photo + a few text fields in Team.jsx.

   Performance notes
   - Faces are built ON DEMAND, one member at a time (buildCardFace), through a serial queue that
     yields to the browser between steps, so nothing blocks the main thread for long.
   - Results are cached per member.
   - Faces are encoded with canvas.toBlob (off the main thread) and handed to Lanyard as blob: URLs.
   - The photo is cropped to the photo panel FIRST and only then turned grayscale, so the pixel loop
     touches ~0.7M pixels instead of a full-resolution photo.

   Card canvas is 1024 x 1440 (the Lanyard portrait card is 1.6 x 2.25).
   The strap slot sits ~83px from the top, so the header row lives there. */

const W = 1024;
const H = 1440;
const FONT = '"Geist Variable", "Geist", ui-sans-serif, system-ui, sans-serif';
const INK = "#0c1a14";

const loadImg = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
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

/* grayscale in place (works in every browser; ctx.filter is missing in Safari) */
const grayInPlace = (g, w, h) => {
  const d = g.getImageData(0, 0, w, h);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    let v = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    v = Math.min(255, Math.max(0, (v - 128) * 1.08 + 128));
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  g.putImageData(d, 0, 0);
};

const drawCover = (g, src, x, y, w, h, alignY = 0.3) => {
  const sw = src.naturalWidth || src.width;
  const sh = src.naturalHeight || src.height;
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
    // crop to the panel first, then gray only those pixels
    const panel = makeCanvas(pw, ph);
    const pg = panel.getContext("2d");
    pg.imageSmoothingQuality = "high";
    drawCover(pg, photo, 0, 0, pw, ph, 0.25);
    grayInPlace(pg, pw, ph);
    g.drawImage(panel, px, py);
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

  return c;
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

  return c;
};

/* One tile, repeated along the strap. Lanyard rotates the image 90° when it
   wraps it onto the strap, so the mark is pre-rotated to end up upright. */
const buildStrapCanvas = () => {
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
  return c;
};

export const buildStrap = () => buildStrapCanvas().toDataURL("image/png");

/* ---------- scheduling ---------- */

// canvas -> blob: URL, encoded off the main thread (falls back to a data URL)
const toUrl = (canvas, type, quality) =>
  new Promise((resolve) => {
    if (!canvas.toBlob) return resolve(canvas.toDataURL(type, quality));
    canvas.toBlob(
      (blob) => resolve(blob ? URL.createObjectURL(blob) : canvas.toDataURL(type, quality)),
      type,
      quality
    );
  });

// give the browser a turn between heavy steps
const nextSlot = () =>
  new Promise((resolve) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => resolve(), { timeout: 300 });
    } else {
      setTimeout(resolve, 16);
    }
  });

// one build at a time, in the order requested
let queue = Promise.resolve();
const enqueue = (job) => {
  const run = queue.then(job);
  queue = run.catch(() => {});
  return run;
};

let fontsPromise;
const ensureFonts = () => {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      try {
        await Promise.all([
          document.fonts.load(`700 80px ${FONT}`),
          document.fonts.load(`500 40px ${FONT}`),
        ]);
      } catch {
        /* falls back to the system font */
      }
    })();
  }
  return fontsPromise;
};

let strapPromise;
const getStrap = () => {
  if (!strapPromise) strapPromise = toUrl(buildStrapCanvas(), "image/png");
  return strapPromise;
};

const faceCache = new Map();
const keyOf = (m) => [m.id, m.name, m.title, m.handle, m.statusColor, m.avatarUrl, m.email].join("|");

/* member: { id, name, title, handle, statusColor, avatarUrl, email }
   -> Promise<{ front, back, strap }>  (cached; safe to call repeatedly) */
export const buildCardFace = (member) => {
  const key = keyOf(member);
  const cached = faceCache.get(key);
  if (cached) return cached;

  const promise = enqueue(async () => {
    await ensureFonts();
    const [photo, strap] = await Promise.all([loadImg(member.avatarUrl), getStrap()]);
    await nextSlot();
    const front = await toUrl(paintFront(member, photo), "image/jpeg", 0.92);
    await nextSlot();
    const back = await toUrl(paintBack(member), "image/jpeg", 0.92);
    return { front, back, strap };
  });

  promise.catch(() => faceCache.delete(key)); // let a failed build be retried
  faceCache.set(key, promise);
  return promise;
};

/* kept for compatibility: builds everything (still one at a time) */
export const buildCardFaces = async (members) => {
  const entries = [];
  for (const m of members) entries.push([m.id, await buildCardFace(m)]);
  return Object.fromEntries(entries);
};
