
import { useState, useRef } from "react";

export default function VenomButton({
  label = "Start a Project",
  background = "#050505",
  color = "#ffffff",
  border = "rgba(255,255,255,0.2)",
  onClick,
  className = "",
}) {
  const buttonRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = buttonRef.current.getBoundingClientRect();

    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <>
      <style>{`
        .venom-wrapper {
          position: relative;
          display: inline-flex;
          isolation: isolate;
        }

        .venom-button {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 25px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          overflow: visible;
          transition: transform 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .venom-button:hover {
          transform: scale(1.04);
        }

        .venom-button:active {
          transform: scale(0.97);
        }

        .venom-liquid {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          filter: url(#venom-goo);
        }

        .venom-blob {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #050505;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .venom-wrapper:hover .venom-blob {
          opacity: 1;
        }

        .venom-blob-one {
          left: 10%;
          top: -10px;
          animation: venom-float-one 1.4s ease-in-out infinite alternate;
        }

        .venom-blob-two {
          right: 15%;
          bottom: -12px;
          animation: venom-float-two 1.6s ease-in-out infinite alternate;
        }

        .venom-blob-three {
          right: -10px;
          top: 35%;
          width: 20px;
          height: 20px;
          animation: venom-float-three 1.2s ease-in-out infinite alternate;
        }

        .venom-strands {
          position: absolute;
          inset: -45px;
          z-index: -2;
          overflow: visible;
          pointer-events: none;
        }

        .venom-strands path {
          fill: none;
          stroke: #050505;
          stroke-width: 5;
          stroke-linecap: round;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .venom-wrapper:hover .venom-strands path {
          opacity: 0.9;
        }

        @keyframes venom-float-one {
          from { transform: translate(0, 0) scale(0.8); }
          to { transform: translate(-10px, -15px) scale(1.2); }
        }

        @keyframes venom-float-two {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(10px, 12px) scale(1.3); }
        }

        @keyframes venom-float-three {
          from { transform: translate(0, 0); }
          to { transform: translate(12px, -12px); }
        }
      `}</style>

      {/* SVG Goo Filter */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="venom-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 22 -10
              "
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className={`venom-wrapper ${className}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Liquid blobs */}
        <div className="venom-liquid">
          <span className="venom-blob venom-blob-one" />
          <span className="venom-blob venom-blob-two" />
          <span className="venom-blob venom-blob-three" />
        </div>

        {/* Mouse-following strands */}
        <svg className="venom-strands">
          <path
            d={`M ${mouse.x + 45} ${mouse.y + 45}
                Q ${mouse.x + 90} ${mouse.y + 100}
                ${mouse.x + 120} ${mouse.y + 70}`}
          />

          <path
            d={`M ${mouse.x + 45} ${mouse.y + 45}
                Q ${mouse.x - 20} ${mouse.y + 100}
                ${mouse.x - 60} ${mouse.y + 70}`}
          />

          <path
            d={`M ${mouse.x + 45} ${mouse.y + 45}
                Q ${mouse.x + 50} ${mouse.y - 50}
                ${mouse.x + 100} ${mouse.y - 80}`}
          />

          <path
            d={`M ${mouse.x + 45} ${mouse.y + 45}
                Q ${mouse.x - 20} ${mouse.y - 30}
                ${mouse.x - 80} ${mouse.y - 70}`}
          />
        </svg>

        {/* Actual button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={onClick}
          className="venom-button"
          style={{
            background,
            color,
            border: `1px solid ${border}`,
          }}
        >
          {label}
          <span style={{ fontSize: "16px" }}>↗</span>
        </button>
      </div>
    </>
  );
}
