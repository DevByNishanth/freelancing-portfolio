// SloshButton — the water/dye effect as a small, background-free button.
//
// Wraps TinctureSlosh: the pill is sized in real pixels like a normal button, the
// page background shows through, and the glow/slosh may spill outside its box
// (so don't put it inside a parent with overflow: hidden).

import TinctureSlosh from "./TinctureSlosh"

const REF_BH = 160 // TinctureSlosh's internal button height, in its reference units

export function SloshButton({
    label,
    width = 168, // px (like px-4 + text width)
    height = 40, // px (like py-2 + 24px line height)
    fontSize = 16, // px (text-base)
    fontWeight = 500,
    base = "#ffffff", // the water's own colour = the button's fill
    dye = "#6b7280", // the colour poured in by the cursor
    textColor = "#000000",
    glow = 40, // 0–200: the soft reflection under the pill (0 = none)
    link,
    onClick,
    response,
    fade = 2.5,
}) {
    const k = height / REF_BH // px per internal unit
    const S = 800 * k // internal frame height
    const frameH = S
    // 1.5·S keeps the scale tied to height; widen only if a long button needs the room.
    const frameW = Math.max(1.5 * S, width + 1.6 * height + 24)

    return (
        <div style={{ position: "relative", width, height, flex: "none" }}>
            <div
                style={{
                    position: "absolute",
                    left: width / 2 - frameW / 2,
                    top: height / 2 - frameH / 2,
                    width: frameW,
                    height: frameH,
                    pointerEvents: "none", // only the button itself catches the mouse
                }}
            >
                <TinctureSlosh
                    initialWidth={frameW}
                    initialHeight={frameH}
                    label={label}
                    link={link}
                    onClick={onClick}
                    textColor={textColor}
                    buttonWidth={width / k}
                    buttonHeight={REF_BH}
                    radius={REF_BH / 2}
                    font={{ fontFamily: "Inter", fontWeight, fontSize: fontSize / k }}
                    colors={{ mode: "mono", dye, base }}
                    reflection={{ intensity: glow, distance: 18, blur: 15 }}
                    response={response}
                    fade={fade}
                    style={{ background: "transparent" }}
                />
            </div>
        </div>
    )
}

export default SloshButton
