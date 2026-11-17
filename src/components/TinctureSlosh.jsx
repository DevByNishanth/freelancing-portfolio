/* eslint-disable */
// Tincture Slosh — plain JSX version (no TypeScript)
//
// A water-filled pill button that takes up dye from the cursor.
// Usage:
//   import TinctureSlosh from "./TinctureSlosh"
//   <div style={{ width: 900, height: 600 }}>
//     <TinctureSlosh label="SIGN UP" link="/signup" />
//   </div>
//
// The component fills its parent (width/height 100%), so give the parent a size.
// If you use the Next.js App Router, add "use client" as the very first line.

import { useEffect, useRef, useState } from "react"

// ---------------------------------------------------------------- constants

const REF_W = 1200
const REF_H = 800
const REF_ASPECT = REF_W / REF_H
const MAX_DPR = 2
const PIXEL_CAP = 2.6e6
const PERSPECTIVE = 1000 // ref px: the lens Tilt leans the button under
const STEP = 1 / 120 // physics substep, s
const QUALITY_FLOOR = 0.6
// Canvas room around the button, in button heights: slosh at the sides, the
// glow underneath.
const ROOM_X = 0.8
const ROOM_TOP = 0.4
const ROOM_BOTTOM = 1.3

// Label: Inter 600 at 0.298 h, cap centred.
const TEXT_SIZE = 0.298
const TEXT_MAX_W = 0.9
const LINE_H = 1.12

const BEVEL = 0.5

const RAMP_L = [0.45, 0.45, 0.48, 0.55, 0.67, 0.8, 0.9, 0.96, 1.0, 1.06, 1.12, 1.18, 1.24, 1.28, 1.3, 1.29, 1.25]
const RAMP_E = [0.354, 0.795, 0.88, 0.92, 0.95, 1.04, 1.03, 1.008, 0.993, 0.97, 0.931, 0.86, 0.801, 0.7, 0.62, 0.575, 0.56]
const RAMP_W = [0.594, 0.078, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const LATERAL = 0.17
const GLINT_ANGLE = -2.07
const GLINT_R = 0.68

// Slosh lattice
const GRID_PITCH = 0.05
const GRID_MARGIN = 0.32
const RESTORE = 50
const DAMP = 3.4
const DRAG_SIGMA = 0.3
const DRAG_GAIN = 1.5
const DENT_SIGMA = 0.22
const DENT_Z = 0.035
const PRESS_Z = 0.12
const PRESS_SQUASH = 0.025
const Z_TENSION = 0.3
const Z_DAMP = 3.2
const MAX_SHIFT = 0.12

// Ripple field
const WATER_PITCH = 0.03
const WATER_STEP = 1 / 240
const WATER_DAMP = 2.8
const WATER_RESTORE = 6
const FINGER_SIGMA = 0.045
const FINGER_GAIN = 0.1
const PLOP_WATER = 0.3
const WATER_TILT = 1.0
const WATER_REFRACT = 0.045
const WATER_SHIFT = 0.05
const WATER_CAUSTIC = 0.03
const WATER_GLINT = 70

// Flow
const FLUID_PITCH = 0.05
const FLUID_STEP = 1 / 60
const STIR_SIGMA = 0.13
const STIR_RATE = 16
const SWIRL = 0.9
const FLOW_DAMP = 0.7
const FLOW_TAIL = 0.12
const PRESSURE_ITERS = 24
const MAX_FLOW = 6
// Dye
const DYE_PITCH = 0.025
const DYE_SIGMA = 0.1
const DYE_POUR = 9
const DYE_SPREAD = 0.15
const DYE_CLEAR = 0.004

// Letters
const LETTER_W = 2 * Math.PI * 2.4
const LETTER_ZETA = 0.14
const LETTER_PUSH = 9
const LETTER_TWIST = 70
const LETTER_REACH = 0.22
const LETTER_DETUNE = 0.14
const LETTER_SLIDE = 0.25
const LETTER_BOB = 0.6
const LETTER_RIDE = 0.3

// ---------------------------------------------------------------- defaults

const DEFAULTS = {
    link: "",
    label: "HOVER ME",
    background: "#000000",
    textColor: "#000000",
    buttonWidth: 500,
    buttonHeight: 160,
    radius: 120,
    fade: 3,
}

const DEFAULT_FONT = { fontFamily: "Inter", fontWeight: 600 }
const DEFAULT_COLORS = {
    mode: "gradient", // "mono" | "gradient"
    dye: "#FF3D8B",
    dyes: ["#FF3D8B", "#FFB03B", "#8B5CFF", "#22D3C5"],
    base: "#3E78ED",
}
const DEFAULT_PLACEMENT = { x: 0, y: 0, angle: 0, tilt: 0 }
const DEFAULT_RESPONSE = { reach: 0, pour: 5, stir: 5, swirl: 5, ripple: 5, wobble: 5, dent: 5, letters: 5, press: 5 }
const DEFAULT_ADVANCED = {
    depth: 64,
    gloss: 100,
    refraction: 100,
    gradientSpan: 1.6,
    detail: 100,
    waveSpeed: 2.2,
    vignette: 4,
}
const DEFAULT_REFLECTION = { intensity: 100, distance: 18, blur: 15 }

const SANS = '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif'

// ---------------------------------------------------------------- helpers

function clamp(x, a, b) {
    return x < a ? a : x > b ? b : x
}

function num(v, d) {
    const n = typeof v === "number" ? v : parseFloat(String(v))
    return Number.isFinite(n) ? n : d
}

function mulberry(seed) {
    let s = seed >>> 0
    return () => {
        s = (s + 0x6d2b79f5) >>> 0
        let t = s
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function srgbToLin(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linToSrgb(c) {
    c = Math.max(0, c)
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

// Colours can arrive as var(--token); the GPU cannot read those.
function resolveRGB(el, c) {
    const prev = el.style.color
    el.style.color = ""
    el.style.color = c
    const out = getComputedStyle(el).color
    el.style.color = prev
    const m = out.match(/[\d.]+/g)
    if (!m || m.length < 3) return [0, 0, 0]
    return [+m[0] / 255, +m[1] / 255, +m[2] / 255]
}

function fontFamilyCss(font) {
    const fam = String({ ...DEFAULT_FONT, ...font }.fontFamily || "").trim()
    return !fam ? SANS : /[,"']/.test(fam) ? fam : `"${fam}", ${SANS}`
}

function fontCss(font, px) {
    const f = { ...DEFAULT_FONT, ...font }
    const weight = num(f.fontWeight, 600)
    const style = f.fontStyle === "italic" ? "italic" : "normal"
    return `${style} ${weight} ${px.toFixed(2)}px ${fontFamilyCss(font)}`
}

// Fonts: fetched from Google Fonts when the family is not already registered.
const requestedFonts = new Set()
function ensureFont(font, onReady) {
    const fonts = typeof document !== "undefined" ? document.fonts : undefined
    if (!fonts) return
    const f = { ...DEFAULT_FONT, ...font }
    const fam = String(f.fontFamily || "").trim()
    const css = fontCss(font, 40)
    if (!fam || /[,"']/.test(fam) || /^(serif|sans-serif|monospace|system-ui)$/i.test(fam)) {
        fonts.load(css, "S").then(onReady, onReady)
        return
    }
    let registered = false
    fonts.forEach((face) => {
        if (face.family.replace(/^["']|["']$/g, "") === fam) registered = true
    })
    const weight = clamp(Math.round(num(f.fontWeight, 600) / 100) * 100, 100, 900)
    const italic = f.fontStyle === "italic" ? 1 : 0
    const key = `${fam}|${weight}|${italic}`
    if (registered || requestedFonts.has(key)) {
        fonts.load(css, "S").then(onReady, onReady)
        return
    }
    requestedFonts.add(key)
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam).replace(/%20/g, "+")}:ital,wght@${italic},${weight}&display=swap`
    link.onload = () => fonts.load(css, "S").then(onReady, onReady)
    // Not a Google family, or offline: the fallback stack stands.
    link.onerror = onReady
    document.head.appendChild(link)
}

function isExternal(href) {
    if (typeof window === "undefined") return /^https?:\/\//i.test(href)
    try {
        return new URL(href, window.location.href).origin !== window.location.origin
    } catch {
        return false
    }
}

// Signed distance to the button's outline, in button units.
function sdButton(x, y, hw, rr) {
    const qx = Math.abs(x) - hw + rr
    const qy = Math.abs(y) - 0.5 + rr
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - rr
}

// ---------------------------------------------------------------- bakes

let noiseCache = null

/** Dither noise, RGB. */
function bakeNoise() {
    if (noiseCache) return noiseCache
    const N = 256
    const rnd = mulberry(20261026)
    const out = new Uint8Array(N * N * 4)
    for (let i = 0; i < out.length; i++) out[i] = Math.floor(rnd() * 256)
    noiseCache = out
    return out
}

/** The light ramp as a 17×1 texture: L, E, W per stop. */
function bakeRamp() {
    const out = new Float32Array(17 * 4)
    for (let i = 0; i < 17; i++) {
        out[i * 4] = RAMP_L[i]
        out[i * 4 + 1] = RAMP_E[i]
        out[i * 4 + 2] = RAMP_W[i]
        out[i * 4 + 3] = 1
    }
    return out
}

// ---------------------------------------------------------------- shaders

const VERT = `#version 300 es
void main() {
    vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

// Everything is in button units: one unit is the button's height, origin at
// its centre, y down (as on screen).
const FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform vec2 uCanvas;
uniform vec2 uOrigin;
uniform float uUpp;
uniform float uUcss;
uniform vec4 uLabelBox;  // caption texture: whole-pixel origin and size, buffer px
uniform vec2 uHalf;
uniform float uRad;
uniform vec4 uGrid;      // slosh lattice: origin xy, span xy
uniform float uDeform;   // bound on how far the outline moved, 0 at rest
uniform float uScale;    // press squash
uniform vec4 uLook;      // depth, gloss, -, -
uniform vec4 uGround;    // -, reflection, reflection drop, reflection blur
uniform vec3 uGlowCol;
uniform vec3 uBase;      // the water's own colour, linear
uniform vec3 uOnText;
uniform vec3 uHand;      // where the hand rests (xy) and how firmly
uniform float uWaterOn;  // 1 while the ripple field moves
uniform vec4 uWaterGrid;
uniform vec2 uWaterLook; // refraction, glint strength
uniform float uDyeOn;    // 1 while any dye is in the water
uniform vec4 uDyeGrid;
uniform sampler2D uGridTex;   // displacement xy
uniform sampler2D uGridGrad;  // slope of the raised height
uniform sampler2D uRamp;      // light ramp: L, E, W over the normal
uniform sampler2D uNoise;
uniform sampler2D uLabel;
uniform sampler2D uWater;     // ripples: height, slope xy, curvature
uniform sampler2D uDye;       // dye: premultiplied linear colour, amount
out vec4 outColor;

float sdRR(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// The outline's distance and normal; inside, the two straight edges'
// distances blend across the corner diagonals so the bevel turns a squarish
// corner without a mitre. The outline itself stays exact.
float sdBody(vec2 p, out vec2 n, out float depth) {
    vec2 q = abs(p) - uHalf + uRad;
    vec2 s = vec2(p.x < 0.0 ? -1.0 : 1.0, p.y < 0.0 ? -1.0 : 1.0);
    if (q.x > 0.0 && q.y > 0.0) {
        n = normalize(q) * s;
        depth = uRad - length(q);
        return -depth;
    }
    float sharp = max(q.x, q.y) - uRad;
    float k = 0.3 * clamp(1.0 - 2.0 * uRad, 0.0, 1.0);
    if (k < 1e-4) {
        n = (q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0)) * s;
        depth = -sharp;
        return sharp;
    }
    float h = clamp(0.5 + 0.5 * (q.x - q.y) / k, 0.0, 1.0);
    n = normalize(vec2(h, 1.0 - h)) * s;
    depth = -(mix(q.y, q.x, h) + k * h * (1.0 - h) - uRad);
    return sharp;
}

vec4 cubicW(float v) {
    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    return vec4(x, y, z, 6.0 - x - y - z) * (1.0 / 6.0);
}

// Cubic B-spline grid lookup in four bilinear taps: smooth enough that
// normals and dye taken from it show no grid.
vec4 bspline(sampler2D tex, vec2 q, vec4 grid) {
    vec2 size = vec2(textureSize(tex, 0));
    vec2 t = (q - grid.xy) / grid.zw * (size - 1.0);
    vec2 f = fract(t);
    t -= f;
    vec4 xc = cubicW(f.x);
    vec4 yc = cubicW(f.y);
    vec4 c = t.xxyy + vec2(-0.5, 1.5).xyxy + 0.5;
    vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
    vec4 o = (c + vec4(xc.yw, yc.yw) / s) / size.xxyy;
    vec4 s0 = texture(tex, o.xz);
    vec4 s1 = texture(tex, o.yz);
    vec4 s2 = texture(tex, o.xw);
    vec4 s3 = texture(tex, o.yw);
    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);
    return mix(mix(s3, s2, sx), mix(s1, s0, sx), sy);
}

// The water's sideways slosh: the surface rides toward its troughs, so the
// outline and everything under it ripple as rings pass.
vec2 waterShift(vec2 q) {
    if (uWaterOn < 0.5) return vec2(0.0);
    vec2 size = vec2(textureSize(uWater, 0));
    vec2 uv = ((q - uWaterGrid.xy) / uWaterGrid.zw * (size - 1.0) + 0.5) / size;
    return -${WATER_SHIFT.toFixed(3)} * texture(uWater, uv).yz;
}

// Share of a Gaussian-blurred edge covering a point at signed distance x/σ.
float blurCover(float x) {
    return 1.0 / (1.0 + exp(1.5976 * x + 0.07056 * x * x * x));
}

// Slope of the cross-section at depth e inside the outline.
float slope(float e, float W, float aa) {
    float s = clamp(max(e, 0.35 * aa) / W, 0.0, 1.0);
    float u = 1.0 - s;
    return uLook.x * u / sqrt(max(1.0 - u * u, 1e-4));
}

vec3 toSrgb(vec3 c) {
    c = max(c, 0.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

// Coloured water lit as the capture's: E·c^L + W·tint(c) over the normal,
// light from the left, and the white crescent on the upper-left curve.
vec3 lightWater(vec3 N, vec3 col) {
    vec2 n = N.xy;
    float r = length(n);
    if (r > 1.0) {
        n /= r;
        r = 1.0;
    }
    vec4 rp = texture(uRamp, vec2((n.y + 1.0) * 0.5 * (16.0 / 17.0) + 0.5 / 17.0, 0.5));
    float L = rp.x * (1.0 + 0.1 * n.x);
    float E = rp.y * (1.0 - ${LATERAL.toFixed(2)} * n.x);
    vec3 tw = pow(col, vec3(0.2));
    vec3 tint = tw / max(max(tw.r, tw.g), max(tw.b, 1e-4));
    float da = atan(n.y, n.x + 1e-6) - ${GLINT_ANGLE.toFixed(3)};
    da = mod(da + 3.14159265, 6.2831853) - 3.14159265;
    float glint = uLook.y * 1.3 * exp(-(da / 0.32) * (da / 0.32)) * exp(-pow((r - ${GLINT_R.toFixed(2)}) / 0.07, 2.0));
    return E * pow(col, vec3(L)) + rp.z * tint + glint;
}

void main() {
    vec2 fc = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);
    vec2 p = uOrigin + fc * uUpp;
    float aa = uUpp;
    vec3 col = vec3(0.0);
    float alpha = 0.0;

    // Invert the displacement (slosh lattice + ripple slosh): find the water
    // point q that landed here. One step serves the ground; the body takes
    // two more.
    vec2 q = p / uScale;
    if (uDeform > 0.0) q = (p - bspline(uGridTex, q, uGrid).xy - waterShift(q)) / uScale;
    vec2 toEdge = min(p - uOrigin, uOrigin + uCanvas * uUpp - p);
    float win = smoothstep(0.0, 0.2, min(toEdge.x, toEdge.y));

    // Ground: the reflection — the pill blurred and dropped, glowing in the
    // water's current colour.
    float gw = min(uGround.y * win * 0.51 * blurCover(sdRR(q - vec2(0.0, uGround.z), uHalf, uRad) / max(uGround.w, 0.01)), 1.0);
    col = uGlowCol * gw;
    alpha = gw;

    float far = 2.0 * aa + 0.01;
    if (sdRR(q, uHalf, uRad) - uDeform / uScale < far) {
        if (uDeform > 0.0) {
            for (int i = 0; i < 2; i++) q = (p - bspline(uGridTex, q, uGrid).xy - waterShift(q)) / uScale;
        }
        vec2 nS;
        float depth;
        float sdB = sdBody(q, nS, depth);
        if (sdB < far) {
            float cover = clamp(0.5 - sdB / aa, 0.0, 1.0);
            float e = max(depth, 0.0);
            float dz = slope(e, ${BEVEL.toFixed(2)}, aa);
            float inner = smoothstep(0.0, 0.08, e);
            vec2 g = vec2(0.0);
            if (uDeform > 0.0) g = bspline(uGridGrad, q, uGrid).xy * inner;

            // Ripples tilt the surface; what lies under it (label, dye) is
            // seen refracted through them; crests focus light.
            vec2 wSlope = vec2(0.0);
            float caustic = 0.0;
            vec2 qSeen = q;
            if (uWaterOn > 0.5) {
                vec4 w = bspline(uWater, q, uWaterGrid);
                wSlope = w.yz * inner;
                g += ${WATER_TILT.toFixed(2)} * wSlope;
                caustic = clamp(-w.w * ${WATER_CAUSTIC.toFixed(3)}, -0.22, 0.4) * inner;
                qSeen = q - uWaterLook.x * wSlope;
            }

            // The water's colour: its own, mixed with the dye carried in it.
            // Dyes mix in absorbance (log space), as real ones do.
            vec3 colLin = uBase;
            if (uDyeOn > 0.5) {
                vec4 dy = bspline(uDye, qSeen, uDyeGrid);
                float a = clamp(dy.a, 0.0, 1.0);
                vec3 dl = dy.rgb / max(dy.a, 1e-4);
                colLin = exp(mix(log(max(uBase, vec3(1e-3))), log(max(dl, vec3(1e-3))), a));
            }

            vec3 N = normalize(vec3(dz * nS - g, 1.0));
            vec3 c = toSrgb(lightWater(N, colLin));
            // Light carried through the water from the dip under the hand.
            if (uHand.z > 0.0) {
                vec2 dh = q - uHand.xy;
                c += uGlowCol * (0.16 * uHand.z * exp(-dot(dh, dh) / 0.1));
            }
            // A bright hairline where the surface turns away from you,
            // strongest on the lit left.
            float rim = exp(-e / (0.9 * uUcss)) * (0.62 - 0.38 * nS.x) * 0.45;
            c = mix(c, toSrgb(colLin + (1.0 - colLin) * 0.35), clamp(rim, 0.0, 1.0));

            // The label lies under the water, seen through its ripples, on
            // the buffer's own pixel grid so it stays as sharp as drawn.
            vec2 luv = ((qSeen - uOrigin) / uUpp - uLabelBox.xy) / uLabelBox.zw;
            float lab = texture(uLabel, luv).a * smoothstep(0.0, 0.04, e);
            c = mix(c, uOnText, lab);

            // Light through the water: crests focus it into soft bands, and
            // ripple faces turned to the light flash white.
            if (uWaterOn > 0.5) {
                c *= 1.0 + caustic;
                vec3 Hs = normalize(vec3(-0.18, -0.24, 1.0));
                vec3 Nw = normalize(vec3(-${WATER_TILT.toFixed(2)} * wSlope, 1.0));
                float flat0 = pow(Hs.z, ${WATER_GLINT.toFixed(1)});
                float glint = max(pow(max(dot(Nw, Hs), 0.0), ${WATER_GLINT.toFixed(1)}) - flat0, 0.0) / (1.0 - flat0);
                c += vec3(uWaterLook.y * glint);
            }

            col = c * cover + col * (1.0 - cover);
            alpha = cover + alpha * (1.0 - cover);
        }
    }

    vec3 dither = (texelFetch(uNoise, ivec2(gl_FragCoord.xy) & 255, 0).rgb - 0.5) / 255.0;
    outColor = vec4(col + dither * min(alpha * 4.0, 1.0), alpha);
}`

// ---------------------------------------------------------------- slosh lattice

function makeLattice(hw, rr) {
    const spanX = 2 * (hw + GRID_MARGIN)
    const spanY = 2 * (0.5 + GRID_MARGIN)
    const nx = clamp(Math.round(spanX / GRID_PITCH) + 1, 8, 200)
    const ny = clamp(Math.round(spanY / GRID_PITCH) + 1, 8, 64)
    const n = nx * ny
    const mask = new Float32Array(n)
    for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
            const t = clamp(1 - sdButton(-spanX / 2 + (spanX * i) / (nx - 1), -spanY / 2 + (spanY * j) / (ny - 1), hw, rr) / 0.22, 0, 1)
            mask[j * nx + i] = t * t * (3 - 2 * t)
        }
    }
    return {
        nx,
        ny,
        ox: -spanX / 2,
        oy: -spanY / 2,
        spanX,
        spanY,
        d: new Float32Array(n * 3),
        v: new Float32Array(n * 3),
        gx: new Float32Array(nx * 2),
        gy: new Float32Array(ny * 2),
        tex: new Float32Array(n * 4),
        grad: new Float32Array(n * 2),
        mask,
        key: "",
    }
}

/** Free edges: each border node copies its inward neighbour. */
function freeEdges(L) {
    const { nx, ny, d, v } = L
    const copy = (to, from) => {
        for (let c = 0; c < 3; c++) {
            d[to * 3 + c] = d[from * 3 + c]
            v[to * 3 + c] = v[from * 3 + c]
        }
    }
    for (let i = 0; i < nx; i++) {
        copy(i, nx + i)
        copy((ny - 1) * nx + i, (ny - 2) * nx + i)
    }
    for (let j = 0; j < ny; j++) {
        copy(j * nx, j * nx + 1)
        copy(j * nx + nx - 1, j * nx + nx - 2)
    }
}

// ---------------------------------------------------------------- ripples

function makeWater(hw, rr) {
    const m = 2 * WATER_PITCH
    const spanX = 2 * (hw + m)
    const spanY = 2 * (0.5 + m)
    const nx = clamp(Math.round(spanX / WATER_PITCH) + 1, 8, 400)
    const ny = clamp(Math.round(spanY / WATER_PITCH) + 1, 8, 120)
    const n = nx * ny
    const wet = new Uint8Array(n)
    for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
            const sd = sdButton(-spanX / 2 + (spanX * i) / (nx - 1), -spanY / 2 + (spanY * j) / (ny - 1), hw, rr)
            wet[j * nx + i] = sd < 0 && i > 0 && j > 0 && i < nx - 1 && j < ny - 1 ? 1 : 0
        }
    }
    return { nx, ny, ox: -spanX / 2, oy: -spanY / 2, spanX, spanY, pitch: spanX / (nx - 1), h: new Float32Array(n), v: new Float32Array(n), wet, tex: new Float32Array(n * 4), key: "" }
}

/** Kick the water round a point: rings run out from it. */
function splashWater(W, x, y, sigma, amount) {
    const inv = 1 / (2 * sigma * sigma)
    const r = 3 * sigma
    const i0 = Math.max(1, Math.floor((x - r - W.ox) / W.pitch))
    const i1 = Math.min(W.nx - 2, Math.ceil((x + r - W.ox) / W.pitch))
    const j0 = Math.max(1, Math.floor((y - r - W.oy) / W.pitch))
    const j1 = Math.min(W.ny - 2, Math.ceil((y + r - W.oy) / W.pitch))
    for (let j = j0; j <= j1; j++) {
        const dy = W.oy + j * W.pitch - y
        for (let i = i0; i <= i1; i++) {
            const k = j * W.nx + i
            if (!W.wet[k]) continue
            const dx = W.ox + i * W.pitch - x
            W.v[k] -= amount * Math.exp(-(dx * dx + dy * dy) * inv)
        }
    }
}

// ---------------------------------------------------------------- flow + dye

function makeFluid(hw, rr, dyePitch) {
    const grid = (pitch) => {
        const nx = clamp(Math.ceil((2 * hw) / pitch) + 3, 8, 400)
        const ny = clamp(Math.ceil(1 / pitch) + 3, 6, 160)
        const ox = -((nx - 1) * pitch) / 2
        const oy = -((ny - 1) * pitch) / 2
        const wet = new Uint8Array(nx * ny)
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) wet[j * nx + i] = sdButton(ox + i * pitch, oy + j * pitch, hw, rr) < -pitch * 0.25 && i > 0 && j > 0 && i < nx - 1 && j < ny - 1 ? 1 : 0
        return { nx, ny, ox, oy, wet }
    }
    const f = grid(FLUID_PITCH)
    const d = grid(dyePitch)
    const n = f.nx * f.ny
    const dn = d.nx * d.ny
    return {
        nx: f.nx,
        ny: f.ny,
        ox: f.ox,
        oy: f.oy,
        pitch: FLUID_PITCH,
        u: new Float32Array(n),
        v: new Float32Array(n),
        u2: new Float32Array(n),
        v2: new Float32Array(n),
        p: new Float32Array(n),
        div: new Float32Array(n),
        curl: new Float32Array(n),
        wet: f.wet,
        dnx: d.nx,
        dny: d.ny,
        dox: d.ox,
        doy: d.oy,
        dpitch: dyePitch,
        dye: new Float32Array(dn * 4),
        dye2: new Float32Array(dn * 4),
        dwet: d.wet,
        key: "",
    }
}

/** Bilinear sample of one channel of a grid at (x, y) in button units. */
function sampleGrid(a, stride, ch, nx, ny, ox, oy, pitch, x, y) {
    const fx = clamp((x - ox) / pitch, 0, nx - 1.001)
    const fy = clamp((y - oy) / pitch, 0, ny - 1.001)
    const i = fx | 0
    const j = fy | 0
    const s = fx - i
    const t = fy - j
    const k = (j * nx + i) * stride + ch
    const r = nx * stride
    return (1 - t) * ((1 - s) * a[k] + s * a[k + stride]) + t * ((1 - s) * a[k + r] + s * a[k + r + stride])
}

// ---------------------------------------------------------------- component

function TinctureSloshBase(props) {
    const {
        link = DEFAULTS.link,
        background = DEFAULTS.background,
        label: text = DEFAULTS.label,
        font,
        textColor = DEFAULTS.textColor,
        buttonWidth = DEFAULTS.buttonWidth,
        buttonHeight = DEFAULTS.buttonHeight,
        radius = DEFAULTS.radius,
        colors,
        placement,
        response,
        reflection,
        fade = DEFAULTS.fade,
        advanced,
        onClick,
        style,
    } = props
    const cl = { ...DEFAULT_COLORS, ...colors }
    const pl = { ...DEFAULT_PLACEMENT, ...placement }
    const rs = { ...DEFAULT_RESPONSE, ...response }
    const adv = { ...DEFAULT_ADVANCED, ...advanced }
    const rf = { ...DEFAULT_REFLECTION, ...reflection }
    // One line of text; the layout below still takes a list.
    const lines = String(text ?? "").trim() ? [String(text).trim()] : []
    const dyes = (cl.dyes || []).map((d) => String(d ?? "")).filter((d) => d.trim())

    const rootRef = useRef(null)
    const canvasRef = useRef(null)
    const hitRef = useRef(null)
    const wakeRef = useRef(() => {})
    const pressRef = useRef(() => {})
    const focusRef = useRef(() => {})
    // initialWidth/initialHeight let a small wrapper avoid a first frame at the 1200×800 default.
    const [size, setSize] = useState({ w: props.initialWidth ?? REF_W, h: props.initialHeight ?? REF_H })
    const [fallback, setFallback] = useState(false)

    // Composition unit: contain the 1200×800 reference in the frame.
    const S = Math.min(size.h, size.w / REF_ASPECT)
    const u = S / REF_H
    const bwRef = Math.max(120, buttonWidth)
    const bhRef = Math.max(32, buttonHeight)
    const rRef = clamp(radius, 0, Math.min(bwRef, bhRef) / 2)
    const bh = bhRef * u
    const hw = bwRef / bhRef / 2
    const x0 = -hw - ROOM_X
    const y0 = -0.5 - ROOM_TOP
    const cw = (2 * hw + 2 * ROOM_X) * bh
    const ch = (0.5 + ROOM_BOTTOM - y0) * bh

    const cfg = { bwRef, bhRef, rRef, lines, font, cl, dyes, textColor, pl, rs, adv, rf, fade, background }
    const live = useRef({ cfg, key: "", w: size.w, h: size.h })
    const key = JSON.stringify(cfg)
    live.current.cfg = cfg
    live.current.w = size.w
    live.current.h = size.h

    useEffect(() => {
        if (live.current.key !== key) {
            live.current.key = key
            wakeRef.current()
        }
    })

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return

        // ------------------------------------------------------------ state
        const state = {
            hov: 0,
            hovTarget: 0,
            cx: 0,
            cy: 0,
            pvx: 0,
            pvy: 0,
            pres: 0,
            press: 0,
            pressV: 0,
            pressTarget: 0,
            acc: 0,
            fluidAcc: 0,
            hue: 0, // where along the gradient the pour is
            shown: 1,
            shownDirty: true,
            colorKey: "",
            base: [0, 0, 0],
            stops: [],
            onText: [1, 1, 1],
            light: 0,
            glow: [0, 0, 0],
            shadow: [0, 0, 0],
            quality: 1,
            raiseLocked: false,
            lastRaiseAt: -1,
            lost: false,
            labelKey: "",
            labelDirty: true,
            dyeAmount: 0, // mean dye in the pill, 0–1
            dyeMean: [0, 0, 0],
        }
        const pt = { has: false, had: false, x: 0, y: 0, dirty: false, down: false, focus: false, bx: 0, by: 0 }
        const ro = new ResizeObserver((entries) => {
            const r = entries[0].contentRect
            if (r.width > 0 && r.height > 0) {
                setSize((s) => (Math.abs(s.w - r.width) < 0.5 && Math.abs(s.h - r.height) < 0.5 ? s : { w: r.width, h: r.height }))
                state.shownDirty = true
                // Through the ref: a no-op until the GL path installs wake().
                wakeRef.current()
            }
        })
        ro.observe(root)

        const glOpts = {
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "low-power",
            preserveDrawingBuffer: false,
        }
        let gl = canvas.getContext("webgl2", glOpts)
        if (!gl) {
            setFallback(true)
            return () => ro.disconnect()
        }

        let lattice = null
        let water = null
        let fluid = null
        let waterLive = false
        let glyphs = []
        const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
        let reduced = !!mq?.matches
        const onMq = () => {
            reduced = !!mq?.matches
            wake()
        }
        mq?.addEventListener?.("change", onMq)

        // ------------------------------------------------------------ GL setup
        let prog = null
        let vs = null
        let fs = null
        let texGrid = null
        let texGrad = null
        let texRamp = null
        let texNoise = null
        let texLabel = null
        let texWater = null
        let texDye = null
        let timer = null
        const pendingQ = []
        let gpuMs = 0
        let gpuN = 0
        let gridDims = ""
        let waterDims = ""
        let dyeDims = ""
        const loc = {}
        // Doubles, so a value compared against a JS number ever matches.
        const ucache = {}
        let compiled = false
        let parallel = null
        const labelCanvas = document.createElement("canvas")
        let labelW = 0
        let labelH = 0
        let dyeTex = new Float32Array(0)

        const build = () => {
            const g = gl
            compiled = false
            parallel = g.getExtension("KHR_parallel_shader_compile")
            vs = g.createShader(g.VERTEX_SHADER)
            fs = g.createShader(g.FRAGMENT_SHADER)
            prog = g.createProgram()
            if (!vs || !fs || !prog) return
            g.shaderSource(vs, VERT)
            g.shaderSource(fs, FRAG)
            g.compileShader(vs)
            g.compileShader(fs)
            g.attachShader(prog, vs)
            g.attachShader(prog, fs)
            g.linkProgram(prog)
            gridDims = ""
            waterDims = ""
            dyeDims = ""
            for (const k in ucache) delete ucache[k]
            const mk = (filter, wrap) => {
                const t = g.createTexture()
                g.bindTexture(g.TEXTURE_2D, t)
                g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, filter)
                g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
                g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, wrap)
                g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, wrap)
                return t
            }
            texGrid = mk(g.LINEAR, g.CLAMP_TO_EDGE)
            texGrad = mk(g.LINEAR, g.CLAMP_TO_EDGE)
            texRamp = mk(g.LINEAR, g.CLAMP_TO_EDGE)
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, 17, 1, 0, g.RGBA, g.FLOAT, bakeRamp())
            texNoise = mk(g.NEAREST, g.REPEAT)
            g.pixelStorei(g.UNPACK_ALIGNMENT, 1)
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, 256, 256, 0, g.RGBA, g.UNSIGNED_BYTE, bakeNoise())
            texLabel = mk(g.LINEAR, g.CLAMP_TO_EDGE)
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, 1, 1, 0, g.RGBA, g.UNSIGNED_BYTE, new Uint8Array(4))
            texWater = mk(g.LINEAR, g.CLAMP_TO_EDGE)
            texDye = mk(g.LINEAR, g.CLAMP_TO_EDGE)
            timer = g.getExtension("EXT_disjoint_timer_query_webgl2")
            pendingQ.length = 0
            gpuN = 0
            state.colorKey = ""
            state.labelKey = ""
            labelW = 0
            labelH = 0
        }

        const finishCompile = () => {
            const g = gl
            if (compiled) return true
            if (!prog || !vs || !fs) return false
            if (parallel && !g.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) return false
            if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
                console.warn("TinctureSlosh:", g.getShaderInfoLog(fs) || g.getProgramInfoLog(prog))
                return false
            }
            g.useProgram(prog)
            const names = [
                "uCanvas", "uOrigin", "uUpp", "uUcss", "uLabelBox", "uHalf", "uRad", "uGrid", "uDeform", "uScale", "uLook",
                "uGround", "uGlowCol", "uBase", "uOnText", "uHand", "uWaterOn", "uWaterGrid",
                "uWaterLook", "uDyeOn", "uDyeGrid", "uGridTex", "uGridGrad", "uRamp", "uNoise", "uLabel", "uWater", "uDye",
            ]
            for (const n of names) loc[n] = g.getUniformLocation(prog, n)
            g.uniform1i(loc.uGridTex, 0)
            g.uniform1i(loc.uGridGrad, 1)
            g.uniform1i(loc.uRamp, 2)
            g.uniform1i(loc.uNoise, 3)
            g.uniform1i(loc.uLabel, 4)
            g.uniform1i(loc.uWater, 5)
            g.uniform1i(loc.uDye, 6)
            g.disable(g.BLEND)
            compiled = true
            return true
        }

        // Upload a uniform only when its value changed.
        const setU = (name, a, b, c, d) => {
            const g = gl
            let v = ucache[name]
            if (!v) v = ucache[name] = new Float64Array([NaN, NaN, NaN, NaN])
            const n = d !== undefined ? 4 : c !== undefined ? 3 : b !== undefined ? 2 : 1
            if (v[0] === a && (n < 2 || v[1] === b) && (n < 3 || v[2] === c) && (n < 4 || v[3] === d)) return
            v[0] = a
            if (b !== undefined) v[1] = b
            if (c !== undefined) v[2] = c
            if (d !== undefined) v[3] = d
            const l = loc[name]
            if (n === 1) g.uniform1f(l, a)
            else if (n === 2) g.uniform2f(l, a, b)
            else if (n === 3) g.uniform3f(l, a, b, c)
            else g.uniform4f(l, a, b, c, d)
        }

        build()

        // ------------------------------------------------------------ label
        let fontTick = 0
        let fontKey = ""
        const onFontReady = () => {
            fontTick++
            state.labelDirty = true
            wake()
        }
        document.fonts?.addEventListener?.("loadingdone", onFontReady)
        let labelFont = ""
        let labelCap = 0
        let labelScale = 1
        let labelOrgX = 0
        let labelOrgY = 0

        // Lay the caption out once per text/size/font: one glyph per letter,
        // kerned by measuring each prefix, so each can move on its own.
        const layoutLabel = (bwPx, bhPx, scale) => {
            const c = live.current.cfg
            const W = Math.max(1, Math.min(2048, Math.round(bwPx * scale)))
            const H = Math.max(1, Math.min(1024, Math.round(bhPx * scale)))
            const lk = JSON.stringify([c.lines, c.font, W, H, fontTick])
            if (lk === state.labelKey) return
            const fk = JSON.stringify(c.font ?? null)
            if (fk !== fontKey) {
                fontKey = fk
                ensureFont(c.font, onFontReady)
            }
            state.labelKey = lk
            state.labelDirty = true
            labelCanvas.width = W
            labelCanvas.height = H
            const ctx = labelCanvas.getContext("2d")
            const old = glyphs
            glyphs = []
            if (!ctx) return
            const n = c.lines.length
            if (!n) return
            // The Font control's size, in reference px (scaled with the frame
            // like the button); without one it follows Button Height.
            const fontPx = num(c.font?.fontSize, 0)
            let fsz = (fontPx > 0 ? fontPx : c.bhRef * TEXT_SIZE) * (bhPx / c.bhRef) * scale
            fsz = Math.min(fsz, (H * 0.95) / (n * LINE_H))
            ctx.font = fontCss(c.font, fsz)
            const ls = c.font?.letterSpacing
            const ctxLs = ctx
            const lsEm = typeof ls === "string" && ls.endsWith("em") ? parseFloat(ls) : typeof ls === "number" ? ls / 16 : 0
            const applyLs = () => {
                if ("letterSpacing" in ctxLs) ctxLs.letterSpacing = `${(num(lsEm, 0) * fsz).toFixed(2)}px`
            }
            applyLs()
            let widest = 0
            for (const l of c.lines) widest = Math.max(widest, ctx.measureText(l).width)
            if (widest > W * TEXT_MAX_W) {
                fsz *= (W * TEXT_MAX_W) / widest
                ctx.font = fontCss(c.font, fsz)
                applyLs()
            }
            const capH = ctx.measureText("H").actualBoundingBoxAscent || fsz * 0.72
            // Centre the block on its ink.
            const m0 = ctx.measureText(c.lines[0])
            const mN = ctx.measureText(c.lines[n - 1])
            const asc0 = m0.actualBoundingBoxAscent || capH
            const descN = mN.actualBoundingBoxDescent || 0
            let y = H / 2 - (asc0 + (n - 1) * fsz * LINE_H + descN) / 2 + asc0
            for (const l of c.lines) {
                const m = ctx.measureText(l)
                const inkL = Number.isFinite(m.actualBoundingBoxLeft) ? m.actualBoundingBoxLeft : 0
                const inkR = Number.isFinite(m.actualBoundingBoxRight) ? m.actualBoundingBoxRight : m.width
                const left = W / 2 - (inkR - inkL) / 2
                let pre = ""
                for (const chr of Array.from(l)) {
                    const x = left + ctx.measureText(pre).width
                    pre += chr
                    const w = left + ctx.measureText(pre).width - x
                    if (chr.trim()) {
                        const g0 = old[glyphs.length]
                        glyphs.push({
                            ch: chr,
                            x: x / scale,
                            w: w / scale,
                            base: y / scale,
                            cx: ((x + w / 2) / W - 0.5) * 2 * (bwPx / bhPx / 2),
                            cy: (y - capH / 2) / H - 0.5,
                            ox: g0?.ox ?? 0,
                            oy: g0?.oy ?? 0,
                            rot: g0?.rot ?? 0,
                            vx: g0?.vx ?? 0,
                            vy: g0?.vy ?? 0,
                            vr: g0?.vr ?? 0,
                        })
                    }
                }
                y += fsz * LINE_H
            }
            labelFont = ctx.font
            labelCap = capH / scale
            labelScale = scale
        }

        const drawLabel = (bhPx) => {
            const g = gl
            const ctx = labelCanvas.getContext("2d")
            if (!ctx) return
            const W = labelCanvas.width
            const H = labelCanvas.height
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, W, H)
            ctx.font = labelFont
            ctx.fillStyle = "#fff"
            ctx.textBaseline = "alphabetic"
            const k = labelScale
            const toPx = bhPx * k
            for (const gph of glyphs) {
                const cx = (gph.x + gph.w / 2) * k + gph.ox * toPx
                const cy = (gph.base - labelCap / 2) * k + gph.oy * toPx
                ctx.setTransform(Math.cos(gph.rot), Math.sin(gph.rot), -Math.sin(gph.rot), Math.cos(gph.rot), cx, cy)
                ctx.fillText(gph.ch, -(gph.w * k) / 2, (labelCap * k) / 2)
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            g.activeTexture(g.TEXTURE4)
            g.bindTexture(g.TEXTURE_2D, texLabel)
            g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
            if (labelW !== W || labelH !== H) {
                labelW = W
                labelH = H
                g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, g.RGBA, g.UNSIGNED_BYTE, labelCanvas)
            } else g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, g.RGBA, g.UNSIGNED_BYTE, labelCanvas)
            state.labelDirty = false
        }

        // ------------------------------------------------------------ pointer
        const onMove = (e) => {
            if (pt.has && e.clientX === pt.x && e.clientY === pt.y) return
            pt.x = e.clientX
            pt.y = e.clientY
            pt.has = true
            pt.dirty = true
            wake()
        }
        const onLeave = () => {
            pt.has = false
            pt.down = false
            wake()
        }
        const onDown = (e) => {
            onMove(e)
            pt.down = true
            wake()
        }
        const onUp = (e) => {
            pt.down = false
            // Lifting a finger ends the hover too.
            if (e.pointerType === "touch") pt.has = false
            wake()
        }
        const onScroll = () => {
            if (pt.has) {
                pt.dirty = true
                wake()
            }
        }
        root.addEventListener("pointermove", onMove)
        root.addEventListener("pointerdown", onDown)
        root.addEventListener("pointerup", onUp)
        root.addEventListener("pointercancel", onLeave)
        root.addEventListener("pointerleave", onLeave)
        window.addEventListener("scroll", onScroll, { passive: true, capture: true })
        // A click on the swollen edge, outside the DOM target, is still a
        // click on the button.
        const onRootClick = (e) => {
            const hit = hitRef.current
            if (!hit || state.hovTarget === 0 || hit.contains(e.target)) return
            hit.click()
        }
        root.addEventListener("click", onRootClick)
        // Keyboard focus swells it as a hover would.
        focusRef.current = (v) => {
            pt.focus = v
            wake()
        }
        let pulseUntil = 0
        let dipAt = 0
        let tapAt = 0
        pressRef.current = () => {
            pulseUntil = performance.now() + 140
            tapAt = 1
            wake()
        }

        // ------------------------------------------------------------ loop
        let raf = 0
        let running = false
        let visible = true
        let pageVisible = !document.hidden
        let last = 0
        let tickCount = 0
        let drawnFrames = 0
        let idle = false
        const gaps = new Float32Array(15)
        let gapN = 0
        const lates = new Float32Array(9)
        let lateN = 0
        let slowFrames = 0
        let fastFrames = 0
        let lastRaf = 0
        let expected = 16.7
        const medTmp = new Float32Array(16)

        function wake() {
            if (running || !visible || !pageVisible || state.lost) return
            running = true
            last = 0
            raf = requestAnimationFrame(tick)
        }
        wakeRef.current = wake

        const io = new IntersectionObserver((es) => {
            visible = es[0].isIntersecting
            if (visible) wake()
        })
        io.observe(root)
        const onVis = () => {
            pageVisible = !document.hidden
            if (pageVisible) wake()
        }
        document.addEventListener("visibilitychange", onVis)

        const onLost = (e) => {
            e.preventDefault()
            state.lost = true
            running = false
            cancelAnimationFrame(raf)
        }
        const onRestored = () => {
            state.lost = false
            gl = canvas.getContext("webgl2", glOpts)
            if (!gl) return
            build()
            wake()
        }
        canvas.addEventListener("webglcontextlost", onLost)
        canvas.addEventListener("webglcontextrestored", onRestored)

        const median = (a, n) => {
            const k = Math.min(n, a.length)
            const tmp = medTmp
            for (let i = 0; i < k; i++) tmp[i] = a[i]
            for (let i = 1; i < k; i++) {
                const v = tmp[i]
                let j = i - 1
                while (j >= 0 && tmp[j] > v) {
                    tmp[j + 1] = tmp[j]
                    j--
                }
                tmp[j + 1] = v
            }
            return tmp[k >> 1]
        }

        // Wobble 5 is the capture; lower is thicker, higher rings on.
        const dampScale = () => (reduced ? 2.5 : Math.exp(-0.16 * (clamp(live.current.cfg.rs.wobble, 0, 10) - 5)))

        const stepLattice = (L) => {
            const c = live.current.cfg
            const dragK = reduced ? 0 : clamp(c.rs.stir, 0, 10) / 5
            const dentK = clamp(c.rs.dent, 0, 10) / 5
            const pressK = clamp(c.rs.press, 0, 10) / 5
            const wv = Math.max(0.3, c.adv.waveSpeed)
            const h = L.spanX / (L.nx - 1)
            const hy = L.spanY / (L.ny - 1)
            const Tx = (wv * wv) / (h * h)
            const Ty = (wv * wv) / (hy * hy)
            const damp = DAMP * dampScale()
            const inv2d = 1 / (2 * DRAG_SIGMA * DRAG_SIGMA)
            const inv2n = 1 / (2 * DENT_SIGMA * DENT_SIGMA)
            const { nx, ny, d, v, gx, gy } = L
            const pres = state.pres
            const fx = DRAG_GAIN * dragK * pres * clamp(state.pvx, -8, 8)
            const fy = DRAG_GAIN * dragK * pres * clamp(state.pvy, -8, 8)
            const zDent = DENT_Z * dentK * state.hov + PRESS_Z * pressK * state.press
            const active = pres > 1e-4 || zDent > 1e-5
            if (active) {
                for (let i = 0; i < nx; i++) {
                    const t = L.ox + (L.spanX * i) / (nx - 1) - state.cx
                    gx[i * 2] = Math.exp(-t * t * inv2d)
                    gx[i * 2 + 1] = Math.exp(-t * t * inv2n)
                }
                for (let j = 0; j < ny; j++) {
                    const t = L.oy + (L.spanY * j) / (ny - 1) - state.cy
                    gy[j * 2] = Math.exp(-t * t * inv2d)
                    gy[j * 2 + 1] = Math.exp(-t * t * inv2n)
                }
            }
            for (let j = 1; j < ny - 1; j++) {
                for (let i = 1; i < nx - 1; i++) {
                    const k = j * nx + i
                    const k3 = k * 3
                    let ax = 0
                    let ay = 0
                    let tz = 0
                    if (active) {
                        const mk = L.mask[k]
                        const gd = gx[i * 2] * gy[j * 2] * mk
                        ax = gd * fx
                        ay = gd * fy
                        tz = -zDent * gx[i * 2 + 1] * gy[j * 2 + 1] * mk
                    }
                    const kl = k3 - 3
                    const kr = k3 + 3
                    const ku = k3 - nx * 3
                    const kd = k3 + nx * 3
                    let di = d[k3]
                    v[k3] += (Tx * (d[kl] + d[kr] - 2 * di) + Ty * (d[ku] + d[kd] - 2 * di) - RESTORE * di - damp * v[k3] + ax) * STEP
                    di = d[k3 + 1]
                    v[k3 + 1] += (Tx * (d[kl + 1] + d[kr + 1] - 2 * di) + Ty * (d[ku + 1] + d[kd + 1] - 2 * di) - RESTORE * di - damp * v[k3 + 1] + ay) * STEP
                    di = d[k3 + 2]
                    v[k3 + 2] += (Z_TENSION * (Tx * (d[kl + 2] + d[kr + 2] - 2 * di) + Ty * (d[ku + 2] + d[kd + 2] - 2 * di)) + RESTORE * 1.6 * (tz - di) - damp * Z_DAMP * v[k3 + 2]) * STEP
                }
            }
            for (let k = 0; k < nx * ny * 3; k++) {
                let dk = d[k] + v[k] * STEP
                if (dk > MAX_SHIFT) {
                    dk = MAX_SHIFT
                    if (v[k] > 0) v[k] = 0
                } else if (dk < -MAX_SHIFT) {
                    dk = -MAX_SHIFT
                    if (v[k] < 0) v[k] = 0
                }
                d[k] = dk
            }
            freeEdges(L)
        }

        // Ripples: wave equation with walls at the outline (a dry neighbour
        // mirrors the node, so rings bounce back off the edge).
        const stepWater = (Wt) => {
            const c = live.current.cfg
            const wv = Math.min(4.5, Math.max(0.3, c.adv.waveSpeed)) // stable on this grid at WATER_STEP
            const k2 = (wv * wv) / (Wt.pitch * Wt.pitch)
            const damp = WATER_DAMP * dampScale()
            const { nx, ny, h, v, wet } = Wt
            // A moving finger drags a wake through the water.
            const rk = reduced ? 0 : clamp(c.rs.ripple, 0, 10) / 5
            const speed = Math.min(Math.hypot(state.pvx, state.pvy), 8)
            if (rk > 0 && state.pres > 1e-3 && speed > 0.05) {
                splashWater(Wt, state.cx, state.cy, FINGER_SIGMA, FINGER_GAIN * rk * state.pres * speed * WATER_STEP * 60)
            }
            for (let j = 1; j < ny - 1; j++) {
                for (let i = 1; i < nx - 1; i++) {
                    const k = j * nx + i
                    if (!wet[k]) continue
                    const hk = h[k]
                    const lap = (wet[k - 1] ? h[k - 1] : hk) + (wet[k + 1] ? h[k + 1] : hk) + (wet[k - nx] ? h[k - nx] : hk) + (wet[k + nx] ? h[k + nx] : hk) - 4 * hk
                    v[k] += (k2 * lap - damp * v[k] - WATER_RESTORE * hk) * WATER_STEP
                }
            }
            for (let k = 0; k < nx * ny; k++) if (wet[k]) h[k] += v[k] * WATER_STEP
        }

        // Flow + dye, one 60 Hz step: stir, advect, swirl, damp, keep it
        // incompressible inside the walls, then carry the dye, pour, spread
        // and clear.
        const stepFluid = (F, dt) => {
            const c = live.current.cfg
            const { nx, ny, pitch, u, v, wet } = F
            const n = nx * ny
            const stirK = reduced ? 0 : clamp(c.rs.stir, 0, 10) / 5
            const swirlK = reduced ? 0 : clamp(c.rs.swirl, 0, 10) / 5
            const pourK = clamp(c.rs.pour, 0, 10) / 5
            const pvx = clamp(state.pvx, -MAX_FLOW, MAX_FLOW)
            const pvy = clamp(state.pvy, -MAX_FLOW, MAX_FLOW)
            const speed = Math.hypot(pvx, pvy)

            // 1. The hand drags the water under it toward its own speed.
            if (stirK > 0 && state.pres > 1e-3) {
                const inv = 1 / (2 * STIR_SIGMA * STIR_SIGMA)
                const rate = STIR_RATE * stirK * state.pres
                const r = 3 * STIR_SIGMA
                const i0 = Math.max(1, Math.floor((state.cx - r - F.ox) / pitch))
                const i1 = Math.min(nx - 2, Math.ceil((state.cx + r - F.ox) / pitch))
                const j0 = Math.max(1, Math.floor((state.cy - r - F.oy) / pitch))
                const j1 = Math.min(ny - 2, Math.ceil((state.cy + r - F.oy) / pitch))
                for (let j = j0; j <= j1; j++) {
                    const dy = F.oy + j * pitch - state.cy
                    for (let i = i0; i <= i1; i++) {
                        const k = j * nx + i
                        if (!wet[k]) continue
                        const dx = F.ox + i * pitch - state.cx
                        const kk = 1 - Math.exp(-dt * rate * Math.exp(-(dx * dx + dy * dy) * inv))
                        u[k] += (pvx - u[k]) * kk
                        v[k] += (pvy - v[k]) * kk
                    }
                }
            }

            if (!reduced) {
                // 2. Advect the flow by itself (semi-Lagrangian).
                const { u2, v2 } = F
                for (let j = 0; j < ny; j++) {
                    for (let i = 0; i < nx; i++) {
                        const k = j * nx + i
                        if (!wet[k]) {
                            u2[k] = 0
                            v2[k] = 0
                            continue
                        }
                        const x = F.ox + i * pitch - dt * u[k]
                        const y = F.oy + j * pitch - dt * v[k]
                        u2[k] = sampleGrid(u, 1, 0, nx, ny, F.ox, F.oy, pitch, x, y)
                        v2[k] = sampleGrid(v, 1, 0, nx, ny, F.ox, F.oy, pitch, x, y)
                    }
                }
                u.set(u2)
                v.set(v2)

                // 3. Keep it swirling: vorticity confinement turns smeared
                // eddies back into curls.
                if (swirlK > 0) {
                    const curl = F.curl
                    for (let j = 1; j < ny - 1; j++) {
                        for (let i = 1; i < nx - 1; i++) {
                            const k = j * nx + i
                            curl[k] = wet[k] ? (v[k + 1] - v[k - 1] - u[k + nx] + u[k - nx]) / (2 * pitch) : 0
                        }
                    }
                    const eps = SWIRL * swirlK * pitch
                    for (let j = 2; j < ny - 2; j++) {
                        for (let i = 2; i < nx - 2; i++) {
                            const k = j * nx + i
                            if (!wet[k]) continue
                            // Only where the water is really moving: the
                            // confinement must never keep a dying crawl going.
                            const sp = Math.abs(u[k]) + Math.abs(v[k])
                            if (sp < 0.05) continue
                            const gxw = (Math.abs(curl[k + 1]) - Math.abs(curl[k - 1])) / (2 * pitch)
                            const gyw = (Math.abs(curl[k + nx]) - Math.abs(curl[k - nx])) / (2 * pitch)
                            const len = Math.hypot(gxw, gyw) + 1e-5
                            const gate = Math.min(1, sp / 0.3)
                            u[k] += dt * eps * gate * (gyw / len) * curl[k]
                            v[k] -= dt * eps * gate * (gxw / len) * curl[k]
                        }
                    }
                }
            }

            // 4. Water slows by itself, with a small linear tail so a coast
            // actually comes to a stop instead of creeping on for seconds.
            const fd = Math.exp(-dt * FLOW_DAMP * dampScale())
            const tail = FLOW_TAIL * dt
            for (let k = 0; k < n; k++) {
                const uk = u[k] * fd
                const vk = v[k] * fd
                const m = Math.hypot(uk, vk)
                const sc = m > tail ? (m - tail) / m : 0
                u[k] = uk * sc
                v[k] = vk * sc
            }

            // 5. Incompressible inside the walls: pressure projection
            // (Jacobi, warm-started; a wall mirrors pressure, carries no flow).
            const { p, div } = F
            for (let j = 1; j < ny - 1; j++) {
                for (let i = 1; i < nx - 1; i++) {
                    const k = j * nx + i
                    div[k] = wet[k] ? ((wet[k + 1] ? u[k + 1] : 0) - (wet[k - 1] ? u[k - 1] : 0) + (wet[k + nx] ? v[k + nx] : 0) - (wet[k - nx] ? v[k - nx] : 0)) / (2 * pitch) : 0
                }
            }
            const h2 = pitch * pitch
            for (let it = 0; it < PRESSURE_ITERS; it++) {
                for (let j = 1; j < ny - 1; j++) {
                    for (let i = 1; i < nx - 1; i++) {
                        const k = j * nx + i
                        if (!wet[k]) continue
                        const pc = p[k]
                        p[k] = ((wet[k + 1] ? p[k + 1] : pc) + (wet[k - 1] ? p[k - 1] : pc) + (wet[k + nx] ? p[k + nx] : pc) + (wet[k - nx] ? p[k - nx] : pc) - div[k] * h2) * 0.25
                    }
                }
            }
            for (let j = 1; j < ny - 1; j++) {
                for (let i = 1; i < nx - 1; i++) {
                    const k = j * nx + i
                    if (!wet[k]) continue
                    const pc = p[k]
                    u[k] -= ((wet[k + 1] ? p[k + 1] : pc) - (wet[k - 1] ? p[k - 1] : pc)) / (2 * pitch)
                    v[k] -= ((wet[k + nx] ? p[k + nx] : pc) - (wet[k - nx] ? p[k - nx] : pc)) / (2 * pitch)
                    if (u[k] > MAX_FLOW) u[k] = MAX_FLOW
                    else if (u[k] < -MAX_FLOW) u[k] = -MAX_FLOW
                    if (v[k] > MAX_FLOW) v[k] = MAX_FLOW
                    else if (v[k] < -MAX_FLOW) v[k] = -MAX_FLOW
                }
            }

            // 6. Carry the dye on the flow (finer grid, bilinear back-trace).
            const { dnx, dny, dpitch, dye, dye2, dwet } = F
            let moving = false
            for (let k = 0; k < n; k++) {
                if (Math.abs(u[k]) + Math.abs(v[k]) > 0.01) {
                    moving = true
                    break
                }
            }
            if (moving && !reduced) {
                for (let j = 0; j < dny; j++) {
                    for (let i = 0; i < dnx; i++) {
                        const k = j * dnx + i
                        const o = k * 4
                        if (!dwet[k]) {
                            dye2[o] = dye2[o + 1] = dye2[o + 2] = dye2[o + 3] = 0
                            continue
                        }
                        const x = F.dox + i * dpitch
                        const y = F.doy + j * dpitch
                        const bx = x - dt * sampleGrid(u, 1, 0, nx, ny, F.ox, F.oy, pitch, x, y)
                        const by = y - dt * sampleGrid(v, 1, 0, nx, ny, F.ox, F.oy, pitch, x, y)
                        // Bilinear, all four channels off one set of weights.
                        const fx = clamp((bx - F.dox) / dpitch, 0, dnx - 1.001)
                        const fy = clamp((by - F.doy) / dpitch, 0, dny - 1.001)
                        const ii = fx | 0
                        const jj = fy | 0
                        const s = fx - ii
                        const t = fy - jj
                        const w00 = (1 - s) * (1 - t)
                        const w10 = s * (1 - t)
                        const w01 = (1 - s) * t
                        const w11 = s * t
                        const b00 = (jj * dnx + ii) * 4
                        const b10 = b00 + 4
                        const b01 = b00 + dnx * 4
                        const b11 = b01 + 4
                        dye2[o] = w00 * dye[b00] + w10 * dye[b10] + w01 * dye[b01] + w11 * dye[b11]
                        dye2[o + 1] = w00 * dye[b00 + 1] + w10 * dye[b10 + 1] + w01 * dye[b01 + 1] + w11 * dye[b11 + 1]
                        dye2[o + 2] = w00 * dye[b00 + 2] + w10 * dye[b10 + 2] + w01 * dye[b01 + 2] + w11 * dye[b11 + 2]
                        dye2[o + 3] = w00 * dye[b00 + 3] + w10 * dye[b10 + 3] + w01 * dye[b01 + 3] + w11 * dye[b11 + 3]
                    }
                }
                // A little spreading while the water moves, so the trails mix
                // into the water instead of staying as hard ribbons.
                const sp = Math.min(0.25, DYE_SPREAD * dt * 4) // share of the neighbour mean, per step
                for (let j = 1; j < dny - 1; j++) {
                    for (let i = 1; i < dnx - 1; i++) {
                        const k = j * dnx + i
                        if (!dwet[k]) continue
                        const o = k * 4
                        for (let ch = 0; ch < 4; ch++) {
                            const cc = dye2[o + ch]
                            const avg =
                                ((dwet[k - 1] ? dye2[o - 4 + ch] : cc) + (dwet[k + 1] ? dye2[o + 4 + ch] : cc) + (dwet[k - dnx] ? dye2[o - dnx * 4 + ch] : cc) + (dwet[k + dnx] ? dye2[o + dnx * 4 + ch] : cc)) * 0.25
                            dye[o + ch] = cc + (avg - cc) * sp
                        }
                    }
                }
            }

            // 7. Pour: the moving hand lets dye into the water under it, more
            // the faster it goes. Gradient walks through the colours as the
            // hand travels.
            const stops = state.stops
            if (pourK > 0 && state.pres > 1e-3 && speed > 0.05 && stops.length) {
                const span = Math.max(0.1, c.adv.gradientSpan)
                state.hue = (state.hue + (speed * dt) / span) % (stops.length * 1000)
                let cr = stops[0][0]
                let cg = stops[0][1]
                let cb = stops[0][2]
                if (stops.length > 1) {
                    const t = state.hue % stops.length
                    const i0 = Math.floor(t)
                    const f = t - i0
                    const s = f * f * (3 - 2 * f)
                    const A = stops[i0]
                    const B = stops[(i0 + 1) % stops.length]
                    cr = A[0] + (B[0] - A[0]) * s
                    cg = A[1] + (B[1] - A[1]) * s
                    cb = A[2] + (B[2] - A[2]) * s
                }
                const amt = DYE_POUR * pourK * state.pres * Math.min(speed, 6) * dt
                const sg = DYE_SIGMA * (Math.max(10, c.adv.detail) / 100) ** -0.5
                const inv = 1 / (2 * sg * sg)
                const r = 3 * sg
                const i0 = Math.max(1, Math.floor((state.cx - r - F.dox) / dpitch))
                const i1 = Math.min(dnx - 2, Math.ceil((state.cx + r - F.dox) / dpitch))
                const j0 = Math.max(1, Math.floor((state.cy - r - F.doy) / dpitch))
                const j1 = Math.min(dny - 2, Math.ceil((state.cy + r - F.doy) / dpitch))
                for (let j = j0; j <= j1; j++) {
                    const dy = F.doy + j * dpitch - state.cy
                    for (let i = i0; i <= i1; i++) {
                        const k = j * dnx + i
                        if (!dwet[k]) continue
                        const dx = F.dox + i * dpitch - state.cx
                        const add = amt * Math.exp(-(dx * dx + dy * dy) * inv)
                        if (add < 1e-5) continue
                        const o = k * 4
                        dye[o] += cr * add
                        dye[o + 1] += cg * add
                        dye[o + 2] += cb * add
                        dye[o + 3] += add
                        // Never more than solid colour: renormalise, keeping
                        // the mix of what was there and what came in.
                        if (dye[o + 3] > 1) {
                            const sc = 1 / dye[o + 3]
                            dye[o] *= sc
                            dye[o + 1] *= sc
                            dye[o + 2] *= sc
                            dye[o + 3] = 1
                        }
                    }
                }
            }

            // 8. Clear: once the hand has gone the dye fades back out, nearly
            // gone by Fade (three time constants); under a hand it stays.
            if (!pt.has || state.pres < 1e-3) {
                const kf = Math.exp(-dt / Math.max(0.1, c.fade / 3))
                for (let k = 0; k < dye.length; k++) dye[k] *= kf
            }
        }

        // Water height and slope at a point, bilinear (letters ride the slosh).
        const waterAt = (Wt, x, y, out) => {
            const fx = clamp((x - Wt.ox) / Wt.pitch, 1, Wt.nx - 2.001)
            const fy = clamp((y - Wt.oy) / Wt.pitch, 1, Wt.ny - 2.001)
            const i = Math.floor(fx)
            const j = Math.floor(fy)
            const a = fx - i
            const b = fy - j
            const k = j * Wt.nx + i
            const h = Wt.h
            const h00 = h[k]
            const h10 = h[k + 1]
            const h01 = h[k + Wt.nx]
            const h11 = h[k + Wt.nx + 1]
            out[0] = (1 - b) * ((1 - a) * h00 + a * h10) + b * ((1 - a) * h01 + a * h11)
            out[1] = ((1 - b) * (h10 - h00) + b * (h11 - h01)) / Wt.pitch
        }
        const waterTmp = [0, 0]

        const stepLetters = () => {
            const c = live.current.cfg
            const gain = reduced ? 0 : clamp(c.rs.letters, 0, 10) / 5
            const z = LETTER_ZETA * dampScale()
            const inv2 = 1 / (2 * LETTER_REACH * LETTER_REACH)
            const pvx = clamp(state.pvx, -12, 12)
            const pvy = clamp(state.pvy, -12, 12)
            for (let gi = 0; gi < glyphs.length; gi++) {
                const g = glyphs[gi]
                const w = LETTER_W * (1 + LETTER_DETUNE * Math.sin(gi * 2.399 + 0.7))
                let fx = 0
                let fy = 0
                let tq = 0
                if (gain > 0) {
                    const rx = state.cx - g.cx
                    const ry = state.cy - g.cy
                    const gk = state.pres * Math.exp(-(rx * rx + ry * ry) * inv2)
                    fx += LETTER_PUSH * gk * pvx
                    fy += LETTER_PUSH * gk * pvy
                    tq += LETTER_TWIST * gk * (rx * pvy - ry * pvx)
                    // Floating: each letter lifts on a passing crest and tips
                    // with its slope.
                    if (water && waterLive) {
                        waterAt(water, g.cx, g.cy, waterTmp)
                        fy -= w * w * LETTER_BOB * waterTmp[0]
                        tq += w * w * LETTER_RIDE * waterTmp[1]
                    }
                    fx *= gain
                    fy *= gain
                    tq *= gain
                }
                // Letters keep their spacing: they tilt and bob, and barely
                // slide along the line.
                g.vx += (-w * w * g.ox - 2 * z * w * g.vx + fx * LETTER_SLIDE) * STEP
                g.vy += (-w * w * g.oy - 2 * z * w * g.vy + fy) * STEP
                g.vr += (-w * w * g.rot - 2 * z * w * g.vr + tq) * STEP
                g.ox = clamp(g.ox + g.vx * STEP, -0.025, 0.025)
                g.oy = clamp(g.oy + g.vy * STEP, -0.12, 0.12)
                g.rot = clamp(g.rot + g.vr * STEP, -0.3, 0.3)
            }
        }

        // Where on the water a point in button units lies, inverting the
        // lattice displacement as the shader does.
        const clothOut = [0, 0]
        const clothPoint = (x, y) => {
            const L = lattice
            let qx = x
            let qy = y
            if (L) {
                for (let it = 0; it < 3; it++) {
                    qx = x - sampleGrid(L.d, 3, 0, L.nx, L.ny, L.ox, L.oy, L.spanX / (L.nx - 1), qx, qy)
                    qy = y - sampleGrid(L.d, 3, 1, L.nx, L.ny, L.ox, L.oy, L.spanX / (L.nx - 1), qx, qy)
                }
            }
            clothOut[0] = qx
            clothOut[1] = qy
            return clothOut
        }

        const tick = (now) => {
            raf = 0
            if (!running) return
            // Pace by vsync count so 120/144 Hz panels draw at 60 fps.
            if (lastRaf) {
                gaps[gapN % gaps.length] = now - lastRaf
                gapN++
            }
            lastRaf = now
            tickCount++
            const period = gapN >= 5 ? median(gaps, gapN) : 16.7
            const every = Math.max(1, Math.floor(16.7 / Math.max(period, 1) + 0.1)) * (idle ? 2 : 1)
            // What a drawn frame should take on this display (capped at 30 fps).
            expected = Math.min(Math.max(1, Math.floor(16.7 / Math.max(period, 1) + 0.1)) * Math.max(period, 1), 33.4)
            if (tickCount % every !== 0) {
                raf = requestAnimationFrame(tick)
                return
            }
            const mode = frame(now)
            idle = mode === 2
            if (mode) raf = requestAnimationFrame(tick)
            else {
                running = false
                lastRaf = 0
                gapN = 0
            }
        }

        // 0: settled. 1: moving, full rate. 2: only the dye clearing, half rate.
        const frame = (now) => {
            const g = gl
            if (!g || g.isContextLost()) return 0
            if (!finishCompile()) return 1
            const L0 = live.current
            const c = L0.cfg
            const W = L0.w
            const H = L0.h
            const Su = Math.min(H, W / REF_ASPECT)
            const uu = Su / REF_H
            const bhPx = c.bhRef * uu
            const bwPx = c.bwRef * uu
            const hw = c.bwRef / c.bhRef / 2
            const rr = c.rRef / c.bhRef
            const ox = -hw - ROOM_X
            const oy = -0.5 - ROOM_TOP
            const cssW = (2 * hw + 2 * ROOM_X) * bhPx
            const cssH = (0.5 + ROOM_BOTTOM - oy) * bhPx

            const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60
            last = now

            // Shown scale (zoom, scaled previews): read rarely.
            if (state.shownDirty || drawnFrames % 30 === 0) {
                state.shownDirty = false
                const r = root.getBoundingClientRect()
                state.shown = W > 0 ? r.width / W : 1
            }

            // Pointer → button units, through the Placement transform.
            const pl0 = c.pl
            const P = PERSPECTIVE * uu
            if (pt.has && pt.dirty) {
                pt.dirty = false
                const r = root.getBoundingClientRect()
                if (r.width > 0 && r.height > 0) {
                    const lx = ((pt.x - r.left) / r.width) * W
                    const ly = ((pt.y - r.top) / r.height) * H
                    const X = lx - (W / 2 + (pl0.x / 100) * W)
                    const Y = ly - (H / 2 + (pl0.y / 100) * H)
                    const t = (clamp(pl0.tilt, -89, 89) * Math.PI) / 180
                    const ct = Math.cos(t)
                    const st = Math.sin(t)
                    const yr = Y / Math.max(1e-3, ct + (Y * st) / P)
                    const xr = X * (1 - (yr * st) / P)
                    const a = (pl0.angle * Math.PI) / 180
                    const ca = Math.cos(a)
                    const sa = Math.sin(a)
                    pt.bx = (xr * ca + yr * sa) / bhPx
                    pt.by = (-xr * sa + yr * ca) / bhPx
                }
            }
            const reach = clamp(c.rs.reach, 0, 10) * 0.03
            let target = 0
            if (pt.has) {
                const q = clothPoint(pt.bx, pt.by)
                target = sdButton(q[0], q[1], hw, rr) <= reach + (state.hovTarget > 0 ? 0.02 : 0) ? 1 : 0
            } else if (pt.focus) target = 1
            // The hand dipping into the water: a small plop of rings.
            if (target > 0 && state.hovTarget === 0 && pt.has) dipAt = 1
            state.hovTarget = target
            const pressing = (pt.down && pt.has && target > 0) || now < pulseUntil
            state.pressTarget = pressing ? 1 : 0
            const wantCursor = target > 0 && pt.has ? "pointer" : ""
            if (root.style.cursor !== wantCursor) root.style.cursor = wantCursor

            // Simulation grids follow the button's proportions.
            const lk = `${hw.toFixed(4)}|${rr.toFixed(4)}`
            if (!lattice || lattice.key !== lk) {
                lattice = makeLattice(hw, rr)
                lattice.key = lk
            }
            const L = lattice
            if (!water || water.key !== lk) {
                water = makeWater(hw, rr)
                water.key = lk
            }
            const Wt = water
            const dyePitch = DYE_PITCH / Math.sqrt(clamp(c.adv.detail, 25, 200) / 100)
            const fk = `${lk}|${dyePitch.toFixed(4)}`
            if (!fluid || fluid.key !== fk) {
                fluid = makeFluid(hw, rr, dyePitch)
                fluid.key = fk
                dyeTex = new Float32Array(fluid.dnx * fluid.dny * 4)
            }
            const F = fluid

            // Colours.
            const ck = `${c.cl.mode}|${c.cl.dye}|${c.dyes.join(",")}|${c.cl.base}|${c.textColor}|${c.background}`
            if (ck !== state.colorKey) {
                state.colorKey = ck
                state.base = resolveRGB(root, c.cl.base).map(srgbToLin)
                const list = c.cl.mode === "gradient" && c.dyes.length ? c.dyes : [c.cl.dye]
                state.stops = list.map((s) => resolveRGB(root, s).map(srgbToLin))
                state.onText = resolveRGB(root, c.textColor)
            }

            // Taps and the hand dipping in ring the water.
            const rippleK = reduced ? 0 : clamp(c.rs.ripple, 0, 10) / 5
            if (dipAt > 0) {
                splashWater(Wt, clamp(pt.bx, -hw, hw), clamp(pt.by, -0.5, 0.5), 0.08, PLOP_WATER * rippleK)
                dipAt = 0
            }
            if (tapAt > 0) {
                splashWater(Wt, clamp(state.cx, -hw, hw), clamp(state.cy, -0.5, 0.5), 0.07, PLOP_WATER * 1.6 * rippleK)
                tapAt = 0
            }

            // Fixed substeps: same motion at any refresh rate.
            state.acc = Math.min(state.acc + dt, 0.1)
            while (state.acc >= STEP) {
                state.acc -= STEP
                // Hand: follows the pointer within a few ms; its velocity (h/s)
                // stirs the water. Re-entering never makes a jump.
                if (pt.has) {
                    if (!pt.had) {
                        state.cx = pt.bx
                        state.cy = pt.by
                        state.pvx = 0
                        state.pvy = 0
                        pt.had = true
                    }
                    const kc = 1 - Math.exp(-STEP / 0.012)
                    const ncx = state.cx + (pt.bx - state.cx) * kc
                    const ncy = state.cy + (pt.by - state.cy) * kc
                    const kv = 1 - Math.exp(-STEP / 0.03)
                    state.pvx += ((ncx - state.cx) / STEP - state.pvx) * kv
                    state.pvy += ((ncy - state.cy) / STEP - state.pvy) * kv
                    state.cx = ncx
                    state.cy = ncy
                } else {
                    pt.had = false
                    const kv = 1 - Math.exp(-STEP / 0.03)
                    state.pvx -= state.pvx * kv
                    state.pvy -= state.pvy * kv
                }
                // Presence: how strongly the hand is in the water; fades with
                // distance outside the outline.
                const near = pt.has ? sdButton(state.cx, state.cy, hw, rr) : 1
                const presT = pt.has ? clamp(1 - (near - reach) / 0.35, 0, 1) : 0
                state.pres += (presT - state.pres) * (1 - Math.exp(-STEP / 0.04))
                state.hov += (state.hovTarget - state.hov) * (1 - Math.exp(-STEP / (state.hovTarget > state.hov ? 0.05 : 0.12)))
                // Press: quick in, springy out.
                const wp = 2 * Math.PI * (state.pressTarget > state.press ? 6 : 3.2)
                const zp = Math.min(1, 0.5 * dampScale())
                state.pressV += (wp * wp * (state.pressTarget - state.press) - 2 * zp * wp * state.pressV) * STEP
                state.press += state.pressV * STEP

                stepLattice(L)
                stepWater(Wt)
                stepWater(Wt)
                state.fluidAcc += STEP
                if (state.fluidAcc >= FLUID_STEP - 1e-6) {
                    state.fluidAcc -= FLUID_STEP
                    stepFluid(F, FLUID_STEP)
                }
                stepLetters()
            }

            // ------------------------------------------------ settle
            const tolD = 0.25 / Math.max(bhPx, 1)
            const tolV = 0.5 / Math.max(bhPx, 1)
            let maxV = 0
            let maxD = 0
            let maxXY = 0
            for (let k = 0; k < L.d.length; k++) {
                const a = Math.abs(L.v[k])
                if (a > maxV) maxV = a
                const b = Math.abs(L.d[k])
                if (b > maxD) maxD = b
                if (k % 3 !== 2 && b > maxXY) maxXY = b
            }
            let lettersMoving = false
            let lettersOff = false
            for (const gph of glyphs) {
                if (Math.abs(gph.vx) + Math.abs(gph.vy) > tolV || Math.abs(gph.vr) > 0.01) lettersMoving = true
                if (Math.abs(gph.ox) + Math.abs(gph.oy) > 1e-5 || Math.abs(gph.rot) > 1e-4) lettersOff = true
            }
            // Ripples still below ~0.15 px: snap level.
            let maxH = 0
            let maxHV = 0
            for (let k = 0; k < Wt.h.length; k++) {
                const a = Math.abs(Wt.h[k])
                if (a > maxH) maxH = a
                const b = Math.abs(Wt.v[k])
                if (b > maxHV) maxHV = b
            }
            const waterOn = maxH > 1.5e-3 || maxHV > 0.05
            if (!waterOn && (maxH > 0 || maxHV > 0)) {
                Wt.h.fill(0)
                Wt.v.fill(0)
            }
            waterLive = waterOn
            // Flow still (< 0.3 px/s): snap. Dye clear: snap.
            let maxF = 0
            for (let k = 0; k < F.u.length; k++) {
                const a = Math.abs(F.u[k]) + Math.abs(F.v[k])
                if (a > maxF) maxF = a
            }
            const flowOn = maxF > 0.3 / Math.max(bhPx, 1)
            if (!flowOn && maxF > 0) {
                F.u.fill(0)
                F.v.fill(0)
                F.p.fill(0)
            }
            let maxA = 0
            let sumA = 0
            let sr = 0
            let sg = 0
            let sb = 0
            const D = F.dye
            for (let k = 0; k < D.length; k += 4) {
                const a = D[k + 3]
                if (a > maxA) maxA = a
                sumA += a
                sr += D[k]
                sg += D[k + 1]
                sb += D[k + 2]
            }
            const dyeOn = maxA > DYE_CLEAR
            if (!dyeOn && maxA > 0) D.fill(0)
            let wetCells = 0
            for (let k = 0; k < F.dwet.length; k++) wetCells += F.dwet[k]
            state.dyeAmount = dyeOn ? sumA / Math.max(1, wetCells) : 0
            if (sumA > 1e-6) state.dyeMean = [sr / sumA, sg / sumA, sb / sumA]
            const fading = dyeOn && (!pt.has || state.pres < 1e-3)

            const springsQuiet =
                Math.abs(state.hov - state.hovTarget) < 1e-3 &&
                Math.abs(state.press - state.pressTarget) < 2e-3 &&
                Math.abs(state.pressV) < 0.01 &&
                Math.abs(state.pvx) + Math.abs(state.pvy) < 0.01
            let settled = springsQuiet && maxV < tolV && !lettersMoving && !waterOn && !flowOn && !fading
            if (settled && state.pres < 1e-3 && state.hovTarget === 0 && state.pressTarget === 0) {
                // Back to rest: snap exactly, so the rest frame is the rest frame.
                if (maxD < tolD * 4) {
                    L.d.fill(0)
                    L.v.fill(0)
                    maxD = 0
                    maxXY = 0
                    state.press = 0
                    state.pressV = 0
                    state.hov = 0
                    state.pres = 0
                    if (lettersOff) {
                        for (const gph of glyphs) gph.ox = gph.oy = gph.rot = gph.vx = gph.vy = gph.vr = 0
                        state.labelDirty = true
                    }
                } else settled = false
            }
            const deformed = maxD > 1e-6
            // Only the dye clearing (nothing else moving): half rate is plenty.
            const onlyFading = fading && springsQuiet && maxV < tolV && !lettersMoving && !waterOn && !flowOn

            // ------------------------------------------------ resolution
            const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
            const shown = clamp(state.shown, 1, 2)
            let scale = Math.min(MAX_DPR, dpr * shown) * state.quality
            const capPx = Math.sqrt(PIXEL_CAP / Math.max(1, cssW * cssH))
            scale = Math.max(1, Math.min(scale, capPx))
            const pw = Math.max(1, Math.round(cssW * scale))
            // The buffer's true density, so units map to whole buffer pixels.
            scale = pw / Math.max(1, cssW)
            const ph = Math.max(1, Math.round(cssH * scale))
            if (canvas.width !== pw || canvas.height !== ph) {
                canvas.width = pw
                canvas.height = ph
            }
            g.viewport(0, 0, pw, ph)

            // The caption is drawn at the buffer's density on its own pixel
            // grid, so nothing resamples it at rest.
            labelOrgX = Math.round((-hw - ox) * bhPx * scale)
            labelOrgY = Math.round((-0.5 - oy) * bhPx * scale)
            layoutLabel(bwPx, bhPx, scale)
            if (state.labelDirty || lettersOff || lettersMoving) drawLabel(bhPx)

            // ------------------------------------------------ upload lattice
            const Lt = L.tex
            const Lg = L.grad
            const hx = L.spanX / (L.nx - 1)
            const hy = L.spanY / (L.ny - 1)
            const D3 = L.d
            if (deformed || !settled) {
                for (let j = 0; j < L.ny; j++) {
                    for (let i = 0; i < L.nx; i++) {
                        const k = j * L.nx + i
                        const il = i > 0 ? k - 1 : k
                        const ir = i < L.nx - 1 ? k + 1 : k
                        const ju = j > 0 ? k - L.nx : k
                        const jd = j < L.ny - 1 ? k + L.nx : k
                        Lt[k * 4] = D3[k * 3]
                        Lt[k * 4 + 1] = D3[k * 3 + 1]
                        Lg[k * 2] = (D3[ir * 3 + 2] - D3[il * 3 + 2]) / (hx * (ir - il || 1))
                        Lg[k * 2 + 1] = (D3[jd * 3 + 2] - D3[ju * 3 + 2]) / (hy * ((jd - ju) / L.nx || 1))
                    }
                }
            }
            g.activeTexture(g.TEXTURE0)
            g.bindTexture(g.TEXTURE_2D, texGrid)
            const gd = `${L.nx}x${L.ny}`
            if (gd !== gridDims) {
                gridDims = gd
                g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, L.nx, L.ny, 0, g.RGBA, g.FLOAT, Lt)
                g.activeTexture(g.TEXTURE1)
                g.bindTexture(g.TEXTURE_2D, texGrad)
                g.texImage2D(g.TEXTURE_2D, 0, g.RG16F, L.nx, L.ny, 0, g.RG, g.FLOAT, Lg)
            } else if (deformed || !settled) {
                g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, L.nx, L.ny, g.RGBA, g.FLOAT, Lt)
                g.activeTexture(g.TEXTURE1)
                g.bindTexture(g.TEXTURE_2D, texGrad)
                g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, L.nx, L.ny, g.RG, g.FLOAT, Lg)
            }
            g.activeTexture(g.TEXTURE1)
            g.bindTexture(g.TEXTURE_2D, texGrad)
            g.activeTexture(g.TEXTURE2)
            g.bindTexture(g.TEXTURE_2D, texRamp)
            g.activeTexture(g.TEXTURE3)
            g.bindTexture(g.TEXTURE_2D, texNoise)
            g.activeTexture(g.TEXTURE4)
            g.bindTexture(g.TEXTURE_2D, texLabel)

            // ------------------------------------------------ upload ripples
            let maxSlope = 0
            g.activeTexture(g.TEXTURE5)
            g.bindTexture(g.TEXTURE_2D, texWater)
            if (waterOn) {
                const { nx, ny, h, wet, tex } = Wt
                const inv2p = 1 / (2 * Wt.pitch)
                const invp2 = 1 / (Wt.pitch * Wt.pitch)
                for (let j = 0; j < ny; j++) {
                    for (let i = 0; i < nx; i++) {
                        const k = j * nx + i
                        const o = k * 4
                        if (!wet[k]) {
                            tex[o] = tex[o + 1] = tex[o + 2] = tex[o + 3] = 0
                            continue
                        }
                        const hk = h[k]
                        const l = wet[k - 1] ? h[k - 1] : hk
                        const r = wet[k + 1] ? h[k + 1] : hk
                        const uu2 = wet[k - nx] ? h[k - nx] : hk
                        const dd = wet[k + nx] ? h[k + nx] : hk
                        const sx = (r - l) * inv2p
                        const sy = (dd - uu2) * inv2p
                        tex[o] = hk
                        tex[o + 1] = sx
                        tex[o + 2] = sy
                        tex[o + 3] = (l + r + uu2 + dd - 4 * hk) * invp2
                        const s = Math.abs(sx) + Math.abs(sy)
                        if (s > maxSlope) maxSlope = s
                    }
                }
                const wd = `${nx}x${ny}`
                if (wd !== waterDims) {
                    waterDims = wd
                    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, nx, ny, 0, g.RGBA, g.FLOAT, tex)
                } else g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, nx, ny, g.RGBA, g.FLOAT, tex)
            }

            // ------------------------------------------------ upload dye
            g.activeTexture(g.TEXTURE6)
            g.bindTexture(g.TEXTURE_2D, texDye)
            if (dyeOn) {
                dyeTex.set(F.dye)
                const dd = `${F.dnx}x${F.dny}`
                if (dd !== dyeDims) {
                    dyeDims = dd
                    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, F.dnx, F.dny, 0, g.RGBA, g.FLOAT, dyeTex)
                } else g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, F.dnx, F.dny, g.RGBA, g.FLOAT, dyeTex)
            }

            // ------------------------------------------------ uniforms
            const a = c.adv
            // The glow under the pill takes the water's current colour: its
            // own, mixed with the dye in it (as the shader mixes it).
            const base = state.base
            const mixA = clamp(state.dyeAmount * 1.4, 0, 1)
            const cur = base.map((b, i) => Math.exp((1 - mixA) * Math.log(Math.max(b, 1e-3)) + mixA * Math.log(Math.max(state.dyeMean[i], 1e-3))))
            const glow = cur.map((v) => Math.min(1, linToSrgb(v) * 1.07 + 0.02))
            const upp = 1 / (bhPx * scale)
            setU("uCanvas", pw, ph)
            setU("uOrigin", ox, oy)
            setU("uUpp", upp)
            setU("uLabelBox", labelOrgX, labelOrgY, labelCanvas.width, labelCanvas.height)
            setU("uUcss", 1 / bhPx)
            setU("uHalf", hw, 0.5)
            setU("uRad", rr)
            setU("uGrid", L.ox, L.oy, L.spanX, L.spanY)
            const shift = (deformed ? maxXY * 1.42 : 0) + (waterOn ? maxSlope * WATER_SHIFT * 1.05 : 0)
            setU("uDeform", shift > 1e-6 ? Math.max(shift, 1e-5) : 0)
            setU("uScale", 1 - PRESS_SQUASH * Math.max(0, state.press) * (clamp(c.rs.press, 0, 10) / 5))
            setU("uLook", Math.max(5, a.depth) / 100, Math.max(0, a.gloss) / 100, 0, 0)
            // Reflection: intensity %, distance and blur as % of the pill's height.
            setU("uGround", 0, clamp(c.rf.intensity, 0, 200) / 100, clamp(c.rf.distance, -20, 60) / 100, clamp(c.rf.blur, 5, 50) / 100)
            setU("uGlowCol", glow[0], glow[1], glow[2])
            setU("uBase", base[0], base[1], base[2])
            setU("uOnText", state.onText[0], state.onText[1], state.onText[2])
            setU("uHand", state.cx, state.cy, reduced ? 0 : (state.hov * clamp(c.rs.dent, 0, 10)) / 5)
            setU("uWaterOn", waterOn ? 1 : 0)
            setU("uWaterGrid", Wt.ox, Wt.oy, Wt.spanX, Wt.spanY)
            setU("uWaterLook", WATER_REFRACT * (Math.max(0, a.refraction) / 100), 1.3 * (Math.max(0, a.gloss) / 100))
            setU("uDyeOn", dyeOn ? 1 : 0)
            setU("uDyeGrid", F.dox, F.doy, (F.dnx - 1) * F.dpitch, (F.dny - 1) * F.dpitch)

            // The GPU's own time for this frame, when the browser can tell us.
            let q = null
            if (timer && pendingQ.length < 4) {
                q = g.createQuery()
                if (q) g.beginQuery(timer.TIME_ELAPSED_EXT, q)
            }
            g.drawArrays(g.TRIANGLES, 0, 3)
            if (q && timer) {
                g.endQuery(timer.TIME_ELAPSED_EXT)
                pendingQ.push(q)
            }
            while (timer && pendingQ.length) {
                const q0 = pendingQ[0]
                if (!g.getQueryParameter(q0, g.QUERY_RESULT_AVAILABLE)) break
                if (!g.getParameter(timer.GPU_DISJOINT_EXT)) {
                    const ms = g.getQueryParameter(q0, g.QUERY_RESULT) / 1e6
                    gpuMs = gpuN ? gpuMs * 0.85 + ms * 0.15 : ms
                    gpuN++
                }
                g.deleteQuery(q0)
                pendingQ.shift()
            }
            drawnFrames++

            // ------------------------------------------------ quality ladder
            // Lower the resolution only when the GPU itself is too slow.
            // Never ping-pong.
            lates[lateN % lates.length] = dt * 1000
            lateN++
            if (lateN > 30 && !settled) {
                const med = median(lates, lateN)
                const budget = Math.min(expected, 33.4)
                const slow = gpuN > 10 ? gpuMs > 0.85 * budget : med > Math.max(26, expected * 1.5)
                const quick = gpuN > 10 ? gpuMs < 0.45 * budget : med < Math.max(19, expected * 1.15)
                if (slow) {
                    slowFrames++
                    fastFrames = 0
                    if (slowFrames > 20 && state.quality > QUALITY_FLOOR) {
                        state.quality = Math.max(QUALITY_FLOOR, state.quality * 0.85)
                        slowFrames = 0
                        if (drawnFrames - state.lastRaiseAt < 120) state.raiseLocked = true
                    }
                } else if (quick) {
                    fastFrames++
                    slowFrames = 0
                    if (fastFrames > 120 && state.quality < 1 && !state.raiseLocked) {
                        state.quality = Math.min(1, state.quality / 0.85)
                        state.lastRaiseAt = drawnFrames
                        fastFrames = 0
                    }
                }
            }
            if (settled) return 0
            return onlyFading ? 2 : 1
        }

        wake()

        return () => {
            running = false
            cancelAnimationFrame(raf)
            ro.disconnect()
            io.disconnect()
            mq?.removeEventListener?.("change", onMq)
            document.removeEventListener("visibilitychange", onVis)
            document.fonts?.removeEventListener?.("loadingdone", onFontReady)
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerdown", onDown)
            root.removeEventListener("pointerup", onUp)
            root.removeEventListener("pointercancel", onLeave)
            root.removeEventListener("pointerleave", onLeave)
            root.removeEventListener("click", onRootClick)
            window.removeEventListener("scroll", onScroll, { capture: true })
            canvas.removeEventListener("webglcontextlost", onLost)
            canvas.removeEventListener("webglcontextrestored", onRestored)
            focusRef.current = () => {}
            wakeRef.current = () => {}
            const g = gl
            if (g && !g.isContextLost()) {
                for (const t of [texGrid, texGrad, texRamp, texNoise, texLabel, texWater, texDye]) g.deleteTexture(t)
                g.deleteProgram(prog)
                g.deleteShader(vs)
                g.deleteShader(fs)
            }
        }
    }, [])

    // ------------------------------------------------------------ layout
    const W = size.w
    const H = size.h
    const p = pl
    // The stage holds the canvas and the DOM target; Placement turns it about
    // the button's centre.
    const stageLeft = W / 2 + x0 * bh
    const stageTop = H / 2 + y0 * bh
    const originX = -x0 * bh
    const originY = -y0 * bh
    const stageTransform = `translate(${((p.x / 100) * W).toFixed(2)}px, ${((p.y / 100) * H).toFixed(2)}px) perspective(${(PERSPECTIVE * u).toFixed(1)}px) rotateX(${clamp(p.tilt, -89, 89)}deg) rotate(${p.angle}deg)`

    const label = lines.join(" ") || "Sign up"
    const hitStyle = {
        position: "absolute",
        left: (-hw - x0) * bh,
        top: (-0.5 - y0) * bh,
        width: 2 * hw * bh,
        height: bh,
        borderRadius: rRef * u,
        background: "transparent",
        border: "none",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        outlineOffset: 4,
        WebkitTapHighlightColor: "transparent",
        display: "block",
        pointerEvents: "auto",
        // Fallback when WebGL2 is unavailable: a flat pill in the water's colour.
        ...(fallback
            ? {
                  background: cl.base,
                  color: textColor,
                  font: fontCss(font, (num(font?.fontSize, 0) > 0 ? num(font?.fontSize, 0) : bhRef * TEXT_SIZE) * u),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
              }
            : null),
    }
    const focusProps = {
        onFocus: (e) => focusRef.current(e.currentTarget.matches(":focus-visible")),
        onBlur: () => focusRef.current(false),
    }
    const press = () => {
        pressRef.current()
        onClick?.()
    }
    const href = link.trim()
    const ext = href ? isExternal(href) : false
    const vig = clamp(adv.vignette, 0, 30)
    const ground = `radial-gradient(ellipse 75% 85% at 50% 45%, ${background} 0%, ${background} 35%, color-mix(in srgb, ${background}, #000 ${vig.toFixed(1)}%) 100%), ${background}`

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                aspectRatio: `${REF_W} / ${REF_H}`,
                overflow: "hidden",
                background: ground,
                touchAction: "pan-y",
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    left: stageLeft,
                    top: stageTop,
                    width: cw,
                    height: ch,
                    transform: stageTransform,
                    transformOrigin: `${originX.toFixed(2)}px ${originY.toFixed(2)}px`,
                    pointerEvents: "none",
                }}
            >
                <canvas
                    ref={canvasRef}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: fallback ? "none" : "block" }}
                />
                {href ? (
                    <a
                        ref={(el) => {
                            hitRef.current = el
                        }}
                        href={href}
                        target={ext ? "_blank" : undefined}
                        rel={ext ? "noopener noreferrer" : undefined}
                        aria-label={label}
                        onClick={press}
                        {...focusProps}
                        style={hitStyle}
                    >
                        {fallback ? label : null}
                    </a>
                ) : (
                    <button
                        ref={(el) => {
                            hitRef.current = el
                        }}
                        type="button"
                        aria-label={label}
                        onClick={press}
                        {...focusProps}
                        style={hitStyle}
                    >
                        {fallback ? label : null}
                    </button>
                )}
            </div>
        </div>
    )
}

// ---------------------------------------------------------------- export

const presetProps = {
    advanced: {
        glow: 100,
        depth: 64,
        gloss: 100,
        detail: 100,
        shadow: 100,
        glowDrop: 18,
        vignette: 4,
        glowReach: 15,
        waveSpeed: 2.2,
        refraction: 100,
        gradientSpan: 1.6,
    },
}

export default function TinctureSlosh(props) {
    return <TinctureSloshBase {...presetProps} {...props} />
}
