import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* --------------------- Utility: grid positions & capacity --------------------- */
const getPositionsAndTheoreticalMax = (shape, d, social_d) => {
  const positions = [];
  const spacing = social_d;
  const r_person = social_d / 2;

  if (shape === 'Rectangle') {
    const { length: l, width: w } = d;
    const nx = Math.floor(l / spacing);
    const ny = Math.floor(w / spacing);
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        positions.push({ x: (i + 0.5) * spacing, y: (j + 0.5) * spacing });
      }
    }
  } else if (shape === 'Circle') {
    const { diameter } = d;
    const radius = diameter / 2;
    const center = { x: radius, y: radius };
    const nx = Math.floor(diameter / spacing) + 1;
    const ny = Math.floor(diameter / spacing) + 1;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const pos = { x: (i + 0.5) * spacing, y: (j + 0.5) * spacing };
        const dist = Math.hypot(pos.x - center.x, pos.y - center.y);
        if (dist <= radius - r_person) positions.push(pos);
      }
    }
  } else if (shape === 'Oval') {
    const { major_axis: maj, minor_axis: minn } = d;
    const h = maj / 2;
    const k = minn / 2;
    const center = { x: h, y: k };
    const nx = Math.floor(maj / spacing) + 1;
    const ny = Math.floor(minn / spacing) + 1;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const pos = { x: (i + 0.5) * spacing, y: (j + 0.5) * spacing };
        const dx = pos.x - center.x;
        const dy = pos.y - center.y;
        if ((dx / h) ** 2 + (dy / k) ** 2 <= 1 - (r_person / Math.min(h, k)) ** 2) {
          positions.push(pos);
        }
      }
    }
  } else if (shape === 'L-Shape') {
    const { l1_len, l1_wid, l2_len, l2_wid } = d;
    const nx1 = Math.floor(l1_len / spacing);
    const ny1 = Math.floor(l1_wid / spacing);
    for (let i = 0; i < nx1; i++) {
      for (let j = 0; j < ny1; j++) {
        positions.push({ x: (i + 0.5) * spacing, y: (j + 0.5) * spacing });
      }
    }
    const nx2 = Math.floor(l2_wid / spacing);
    const ny2 = Math.floor(l2_len / spacing);
    for (let i = 0; i < nx2; i++) {
      for (let j = 0; j < ny2; j++) {
        positions.push({ x: (i + 0.5) * spacing, y: l1_wid + (j + 0.5) * spacing });
      }
    }
  }
  return { positions, fullTheoretical: positions.length };
};

/* -------------------------- Spacing Diagram + Physics ------------------------- */
const SpacingDiagram = ({ shape, dims, people, socialDistance, color, meta }) => {
  const animationFrameId = useRef(null);
  const nodeRefs = useRef([]);     // DOM refs for each particle <g>
  const particlesRef = useRef([]); // physics state (no React state)
  const startTimeRef = useRef(null);

  // Shapes
  const personRadius = socialDistance / 2;
  const personIconPath =
  "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z";

  const iconScale = (personRadius * 1) / 512; // tweak multiplier if needed

  const { viewBoxWidth, viewBoxHeight, wallElement, floorElement, isInsideShape } = useMemo(() => {
    let viewBoxWidth = 10, viewBoxHeight = 10;
    let wallElement, floorElement, isInsideShape;
    const wallThickness = 1;

    if (!dims) return {};

    if (shape === 'Rectangle') {
      viewBoxWidth = dims.length; viewBoxHeight = dims.width;
      wallElement = <rect x={-wallThickness} y={-wallThickness} width={viewBoxWidth + wallThickness * 2} height={viewBoxHeight + wallThickness * 2} className="room-wall" rx="1" />;
      floorElement = <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} className="room-floor" />;
      isInsideShape = (x, y) => x > personRadius && x < viewBoxWidth - personRadius && y > personRadius && y < viewBoxHeight - personRadius;
    } else if (shape === 'Circle') {
      viewBoxWidth = viewBoxHeight = dims.diameter;
      const r = dims.diameter / 2;
      wallElement = <circle cx={r} cy={r} r={r + wallThickness} className="room-wall" />;
      floorElement = <circle cx={r} cy={r} r={r} className="room-floor" />;
      isInsideShape = (x, y) => Math.hypot(x - r, y - r) < r - personRadius;
    } else if (shape === 'Oval') {
      viewBoxWidth = dims.major_axis; viewBoxHeight = dims.minor_axis;
      const rx = viewBoxWidth / 2, ry = viewBoxHeight / 2;
      wallElement = <ellipse cx={rx} cy={ry} rx={rx + wallThickness} ry={ry + wallThickness} className="room-wall" />;
      floorElement = <ellipse cx={rx} cy={ry} rx={rx} ry={ry} className="room-floor" />;
      isInsideShape = (x, y) => ((x - rx) ** 2) / (rx ** 2) + ((y - ry) ** 2) / (ry ** 2) < 1;
    } else if (shape === 'L-Shape') {
  const { l1_len, l1_wid, l2_len, l2_wid } = dims;
  viewBoxWidth  = Math.max(l1_len, l2_wid);
  viewBoxHeight = l1_wid + l2_len;

  // Single polygon path for a proper L
  const path = `M0,0 H${l1_len} V${l1_wid} H${l2_wid} V${viewBoxHeight} H0 Z`;

  // Walls: stroke-only outline (no fill)
  wallElement  = <path d={path} className="room-wall" strokeWidth={wallThickness * 2} />;

  // Floor: the filled interior
  floorElement = <path d={path} className="room-floor" />;

  // Inclusive bounds so first rows/columns aren’t rejected
  isInsideShape = (x, y) => {
    const inRect1 =
      x >= personRadius && x <= l1_len - personRadius &&
      y >= personRadius && y <= l1_wid - personRadius;

    const inRect2 =
      x >= personRadius && x <= l2_wid - personRadius &&
      y >= l1_wid + personRadius && y <= viewBoxHeight - personRadius;

    return inRect1 || inRect2;
  };
}

return { viewBoxWidth, viewBoxHeight, wallElement, floorElement, isInsideShape };
  }, [shape, dims, personRadius]);

  // Draw: directly mutate <g transform> (no React state per frame)
  const drawFrame = useCallback(() => {
    const pts = particlesRef.current;
    const nodes = nodeRefs.current;
    for (let i = 0; i < pts.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      node.setAttribute('transform', `translate(${pts[i].x}, ${pts[i].y})`);
    }
  }, []);

  // Physics: repel + far-field spread + boundary softness + no-overlap correction
  const stepPhysics = useCallback((dt) => {
    const pts = particlesRef.current;
    if (!pts || pts.length === 0) return;

    const desired = socialDistance;           // min center-to-center distance
    const kClose = 0.18;                      // strong spring when too close
    const kFar = 0.06;                        // weak far-field repulsion
    const farRange = desired * 4;             // spread across room
    const damping = 0.88;                     // smooth but responsive
    const timeScale = 1.5;                    // overall speed
    const noiseAmp = 0.01;                    // subtle breathing
    const noiseFreq = 0.11;

    const t = performance.now() / 1000;

    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      let fx = 0, fy = 0;

      for (let j = 0; j < pts.length; j++) {
        if (i === j) continue;
        const p2 = pts[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / dist, uy = dy / dist;

        if (dist < desired) {
          const overlap = desired - dist;
          const f = kClose * overlap;
          fx += ux * f; fy += uy * f;
        } else if (dist < farRange) {
          const s = 1 - (dist - desired) / (farRange - desired); // taper 1..0
          const f = kFar * s * s / (dist * dist);
          fx += ux * f; fy += uy * f;
        }
      }

      // Boundary softness / keep away from edges (by shape)
      if (shape === 'Rectangle') {
        const pad = desired * 0.75;
        const dL = p1.x;                        if (dL < pad) fx += (pad - dL) * 0.08;
        const dR = viewBoxWidth - p1.x;         if (dR < pad) fx -= (pad - dR) * 0.08;
        const dT = p1.y;                        if (dT < pad) fy += (pad - dT) * 0.08;
        const dB = viewBoxHeight - p1.y;        if (dB < pad) fy -= (pad - dB) * 0.08;
      } else if (shape === 'Circle') {
        const r = viewBoxWidth / 2, cx = r, cy = r;
        const distC = Math.hypot(p1.x - cx, p1.y - cy) || 1e-6;
        const margin = r - distC;
        const pad = desired * 0.75;
        if (margin < pad) {
          const ux = (cx - p1.x) / distC, uy = (cy - p1.y) / distC;
          const f = (pad - margin) * 0.10;
          fx -= ux * f; fy -= uy * f;
        }
      } else if (shape === 'Oval') {
        const rx = viewBoxWidth / 2, ry = viewBoxHeight / 2;
        const cx = rx, cy = ry;
        const nx = (p1.x - cx) / rx;
        const ny = (p1.y - cy) / ry;
        const r2 = nx * nx + ny * ny;
        if (r2 > 0.85) {
          const gradX = 2 * nx / rx, gradY = 2 * ny / ry;
          const mag = Math.hypot(gradX, gradY) || 1e-6;
          const ux = gradX / mag, uy = gradY / mag;
          const f = (r2 - 0.85) * 0.08;
          fx -= ux * f; fy -= uy * f;
        }
      } else if (shape === 'L-Shape') {
        const { l1_len, l1_wid, l2_len, l2_wid } = dims;
        const pad = desired * 0.75;
        const inTop = (p1.x >= 0 && p1.x <= l1_len && p1.y >= 0 && p1.y <= l1_wid);
        const inBottom = (p1.x >= 0 && p1.x <= l2_wid && p1.y >= l1_wid && p1.y <= (l1_wid + l2_len));

        if (inTop) {
          const dL = p1.x;                 if (dL < pad) fx += (pad - dL) * 0.08;
          const dR = l1_len - p1.x;        if (dR < pad) fx -= (pad - dR) * 0.08;
          const dT = p1.y;                 if (dT < pad) fy += (pad - dT) * 0.08;
          const dB = l1_wid - p1.y;        if (dB < pad) fy -= (pad - dB) * 0.08;
          // inner corner soft push
          if (p1.x > l2_wid && p1.y > l1_wid - pad) {
            const dy = p1.y - l1_wid; if (dy < pad) fy -= (pad - dy) * 0.06;
          }
        } else if (inBottom) {
          const dL = p1.x;                           if (dL < pad) fx += (pad - dL) * 0.08;
          const dR = l2_wid - p1.x;                  if (dR < pad) fx -= (pad - dR) * 0.08;
          const dT = p1.y - l1_wid;                  if (dT < pad) fy += (pad - dT) * 0.08;
          const dB = (l1_wid + l2_len) - p1.y;       if (dB < pad) fy -= (pad - dB) * 0.08;
          // inner corner soft push
          if (p1.y < l1_wid && p1.x > l2_wid - pad) {
            const dx = p1.x - l2_wid; if (dx < pad) fx -= (pad - dx) * 0.06;
          }
        }
      }

      // Smooth “breathing” noise
      fx += Math.sin(t * noiseFreq + p1.px) * noiseAmp;
      fy += Math.cos(t * noiseFreq + p1.py) * noiseAmp;

      // Integrate
      p1.vx = (p1.vx + fx * timeScale) * damping;
      p1.vy = (p1.vy + fy * timeScale) * damping;

      let nx = p1.x + p1.vx * dt;
      let ny = p1.y + p1.vy * dt;

      if (!isInsideShape(nx, ny)) {
        p1.vx *= -0.5; p1.vy *= -0.5;
        nx = p1.x + p1.vx * dt;
        ny = p1.y + p1.vy * dt;
        if (!isInsideShape(nx, ny)) {
          nx = (nx + p1.x) * 0.5;
          ny = (ny + p1.y) * 0.5;
        }
      }

      p1.x = nx; p1.y = ny;
    }

    // Positional no-overlap correction
    const iterations = 2;
    for (let it = 0; it < iterations; it++) {
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let dist = Math.hypot(dx, dy) || 1e-6;
          if (dist < socialDistance) {
            const overlap = socialDistance - dist;
            const ux = dx / dist, uy = dy / dist;
            const shift = overlap * 0.5;
            let ax = a.x - ux * shift, ay = a.y - uy * shift;
            let bx = b.x + ux * shift, by = b.y + uy * shift;
            if (isInsideShape(ax, ay)) { a.x = ax; a.y = ay; }
            if (isInsideShape(bx, by)) { b.x = bx; b.y = by; }
          }
        }
      }
    }
  }, [shape, dims, isInsideShape, socialDistance, viewBoxWidth, viewBoxHeight]);

  // Init + RAF
  useEffect(() => {
  if (!dims || !isInsideShape || !viewBoxWidth || !viewBoxHeight) return;

  // Seed particles from provided grid positions (tiny jitter so they can relax)
  const jitter = socialDistance * 0.05;
  particlesRef.current = people.map((pos, i) => ({
    id: i,
    x: pos.x + (Math.random() - 0.5) * jitter,
    y: pos.y + (Math.random() - 0.5) * jitter,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02,
    px: Math.random() * Math.PI * 2,
    py: Math.random() * Math.PI * 2,
  }));

  // IMPORTANT: Do NOT overwrite nodeRefs.current here.
  // The ref callbacks on the <g> nodes populate nodeRefs.current for us.

  // reset timing & any previous RAF
  startTimeRef.current = null;
  if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

  const loop = (t) => {
    if (startTimeRef.current == null) startTimeRef.current = t;
    const dtMs = t - startTimeRef.current;
    startTimeRef.current = t;

    // cap dt for stability; convert to seconds
    const dt = Math.min(32, Math.max(0, dtMs)) / 1000;

    stepPhysics(dt);
    drawFrame();

    animationFrameId.current = requestAnimationFrame(loop);
  };

  // Kick once to place everyone immediately on first frame
  requestAnimationFrame(() => {
    drawFrame();
    animationFrameId.current = requestAnimationFrame(loop);
  });

  return () => {
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  };
}, [
  shape,
  dims,
  people,           // depends on actual positions, not just length
  socialDistance,
  isInsideShape,
  viewBoxWidth,
  viewBoxHeight,
  stepPhysics,
  drawFrame
]);


  // Render
  const padding = 2;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Living Room Occupancy Visualization</h3>

      <style>{`
        .room-wall { fill: none; stroke: #57534e; stroke-linejoin: round; }
        .room-floor { fill: url(#floorPattern); stroke: none; }
        .diagram-container { width: 100%; margin: 0 auto; background-color: #ffffff; padding: 1rem; border-radius: 8px; }
        .svg-wrap { width: 100%; max-width: 600px; }
        .caption-box { width: 260px; }
      `}</style>

      {/* SIDE-BY-SIDE: SVG (left) + caption (right) */}
      <div className="diagram-container">
        <div className="diagram-row flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mx-auto">
          {/* SVG keeps original size */}
          <div className="svg-wrap">
            <svg
              className="w-full h-auto overflow-visible"
              viewBox={`${-padding} ${-padding} ${viewBoxWidth + 2 * padding} ${viewBoxHeight + 2 * padding}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="floorPattern" patternUnits="userSpaceOnUse" width="1" height="1">
                  <rect width="1" height="1" fill="#f3f0e8" />
                  <path d="M -0.25,0.25 L 0.25, -0.25 M 0.75,-0.25 L 1.25,0.25 M -0.25,0.75 L 0.25,0.25 M 0.75,0.25 L 1.25,0.75"
                        stroke="#dcd6c8" strokeWidth="0.04" />
                </pattern>
              </defs>

              {/* Room */}
              {wallElement}
              {floorElement}

              {/* People — fixed green */}
              {people.map((_, i) => (
  <g
    key={i}
    ref={(el) => { nodeRefs.current[i] = el; }}
    transform="translate(-1000,-1000)" // offscreen until first draw
  >
    <circle cx="0" cy="0" r={personRadius} fill="#22c55e" opacity="0.85" />
    {/* centered icon */}
    <g transform={`scale(${iconScale}) translate(-224, -256)`}>
      <path d={personIconPath} fill="white" />
    </g>
  </g>
))}
            </svg>
          </div>

          {/* Caption OUTSIDE the room, aligned with SVG */}
          {meta && (
            <div className="caption-box bg-slate-50 border border-slate-300 rounded-md p-4 md:self-center">
              <div className="text-slate-900 font-bold text-xl leading-tight">
                Max people: {meta.capacityMax}
              </div>
              <div className="text-slate-600 text-sm mt-1">
                {meta.limiting === 'ventilation' ? 'Ventilation-limited' : 'Geometry-limited'}
              </div>

              <div className="h-px bg-slate-200 my-3" />

              <div className="space-y-1.5 text-slate-700 text-sm">
                <div>Room area: <span className="font-medium">
                  {Number.isFinite(meta.roomArea) ? meta.roomArea.toFixed(1) : meta.roomArea} m²
                </span></div>
                <div>Usable area (packing): <span className="font-medium">{meta.usablePercent}%</span></div>
                <div>Geometric cap: <span className="font-medium">{meta.geometricCapacity}</span></div>
                {/* <div>Ventilation cap: <span className="font-medium">{meta.ventilationCapacity}</span></div> */}
                <div>Social distance: <span className="font-medium">{socialDistance} m</span></div>
              </div>

              <div className="h-px bg-slate-200 my-3" />
              <div className="text-xs text-slate-500 space-y-1">
                <div>
                  <span className="font-semibold">Geometric cap</span> =
                  <span> floor(theoretical grid × usable area%)</span>
                </div>
                {/* <div>
                  <span className="font-semibold">Ventilation cap</span> =
                  <span> floor(geometric cap × (1 − risk% × 0.3))</span>
                </div> */}
                <div>(Usable area% defines how tightly we “pack” people on the grid.)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------- Dials ----------------------------------- */
const Dial = ({ value, label }) => {
  const rotation = (value / 100) * 180 - 90;
  const isReversed = label.includes("Risk of exposure");

  const getColor = (val) => {
    if (isReversed) {
      if (val > 66) return "#ef4444";
      if (val > 33) return "#f59e0b";
      return "#22c55e";
    } else {
      if (val > 66) return "#22c55e";
      if (val > 33) return "#f59e0b";
      return "#ef4444";
    }
  };
  const needleColor = getColor(value);
  const lowColor = isReversed ? "#22c55e" : "#ef4444";
  const mediumColor = "#f59e0b";
  const highColor = isReversed ? "#ef4444" : "#22c55e";
  const p1 = { x: 30, y: 15.3 };
  const p2 = { x: 70, y: 15.3 };

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 100 60" className="w-40 h-auto">
        <path d={`M 10 50 A 40 40 0 0 1 ${p1.x} ${p1.y}`} stroke={lowColor} strokeWidth="10" fill="none" />
        <path d={`M ${p1.x} ${p1.y} A 40 40 0 0 1 ${p2.x} ${p2.y}`} stroke={mediumColor} strokeWidth="10" fill="none" />
        <path d={`M ${p2.x} ${p2.y} A 40 40 0 0 1 90 50`} stroke={highColor} strokeWidth="10" fill="none" />
        <g transform={`rotate(${rotation} 50 50)`}>
          <path d="M 50 50 L 50 15" stroke={needleColor} strokeWidth="3" />
          <circle cx="50" cy="50" r="5" fill={needleColor} />
        </g>
        <text x="10" y="58" fontSize="8" fill="#64748b" textAnchor="middle">LOW</text>
        <text x="50" y="5.5" fontSize="8" fill="#64748b" textAnchor="middle">MEDIUM</text>
        <text x="90" y="58" fontSize="8" fill="#64748b" textAnchor="middle">HIGH</text>
      </svg>
      <span className="mt-1 text-sm font-semibold text-slate-600">{label}</span>
    </div>
  );
};

/* ----------------------------- Analysis Row --------------------------------- */
const AnalysisRow = ({ title, score1, score2, recommendations }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="md:col-span-4 flex justify-around">
          <Dial value={score1} label="Values" />
          <Dial value={score2} label="Risk of exposure" />
        </div>
        <div className="md:col-span-6 flex items-center justify-end">
          <svg className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-semibold text-slate-700 mb-2 pb-2 border-b border-slate-200">
            <h4>Impact on risk of exposure</h4>
            <h4>Impact on values</h4>
            <h4>Preventive Actions</h4>
          </div>
          {recommendations.map((rec, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <p className="text-sm text-slate-600">{rec[0]}</p>
              <p className="text-sm text-slate-600">{rec[1]}</p>
              <p className="text-sm text-slate-600">{rec[2]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Score Bars ---------------------------------- */
const TotalScoreBar = ({ label, value, colorClass }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold text-slate-800 mb-2">{label}</h3>
      <div className="w-full bg-slate-200 rounded-full h-6">
        <div className={`${colorClass} h-6 rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

/* ---------------------- Recommendations & Scoring Data ----------------------- */
const dashboardLayout = [
  { title: "Personal", questionIds: ['q4', 'q5', 'q6'] },
  { title: "Interaction", questionIds: ['q12', 'q14', 'q15', 'q16'] },
  { title: "Organizational", questionIds: ['q17', 'q18', 'q19', 'q20'] },
];

// (Your full recommendations and translations — unchanged)
const recommendations = {
  en: {
    'q4': [
      ["If people can and are willing to isolate or take preventive measures, the risk of exposure decreases.", "Isolation may reduce quality of life by increasing anxiety and loneliness, in addition to other potential health problems. Quality of life will likely be less affected if people are comfortable and willing to be alone.", "Prepare residents by sharing the plan with them so they are prepared when a new pandemic breaks out."],
      ["If people are unable or unwilling to comply with the measures, the risk of exposure increases.", "Isolation may reduce quality of life by increasing anxiety and loneliness, in addition to other potential health problems. This will be even more pronounced if people are forced to isolate themselves when they don't want to. Autonomy will diminish, and this can lead to ethical discussions.", "Create a personalized plan for each person. Consider alternatives to stay safe around someone who can't isolate themselves."]
    ],
    'q5': [
      ["If people understand the situation and can remember the measures, they are more likely to comply, reducing the risk of exposure. They are also less likely to fear workers in personal protective equipment, allowing them to do their jobs safely and reducing the risk of exposure.", "People with good cognitive abilities understand the situation better and remember the measures better. This has a positive impact on values such as quality of life, autonomy, sense of safety, and health.", "Prepare residents by creating an action plan for a new pandemic together or sharing it with them so they are aware."],
      ["If people have difficulty understanding the situation and remembering the measures, they are less likely to comply, increasing the risk of exposure. If they are afraid of workers in personal protective equipment, this can make it difficult for them to perform their jobs safely, increasing the risk of exposure.", "People with cognitive impairments may not fully understand the situation or remember the measures. This can negatively impact values such as quality of life, autonomy, sense of safety, and health.", "Increase daily hygiene measures so they become more routine for residents. Use simple messages (such as pictograms) to increase understanding."],
      ["If people cannot understand the situation and cannot remember the measures, they are less likely to comply, increasing the risk of exposure. If they are afraid of workers in personal protective equipment, this can make it difficult for them to perform their jobs safely, increasing the risk of exposure.", "People with severe cognitive impairments are unlikely to fully understand the situation and/or remember the measures. This can negatively impact values such as quality of life, autonomy, sense of safety, and health.", "Increase daily hygiene measures so they become more routine. Display posters with simple messages (such as pictograms) to remind people of the measures. Involve familiar people (e.g., family) in the communication."]
    ],
    'q6': [
      ["Good knowledge increases the chance of good action and reduces the risk of exposure.", "Sufficient knowledge creates autonomy and a sense of security. People can assess risks themselves and act accordingly.", "Keep knowledge up to date with regular updates or refreshers (posters, flyers, courses, articles, etc.)."],
      ["A lack of knowledge increases the risk of exposure.", "A lack of knowledge reduces autonomy and prevents people from feeling safe. People cannot accurately assess risks themselves and act accordingly.", "Ensure that everyone's knowledge of infection prevention grows. This can be done, for example, through courses, flyers, posters, and articles."]
    ],
    'q12': [
      ["With recirculation, the risk of contamination will be greater because a virus can be spread within a building via the ventilation system.", "With recirculation, there will be less fresh air which could negatively impact comfort by affecting eyes, nose and throat.", "Contact the building's facility manager/HVAC supplier and ensure that recirculation is not occurring."],
      ["No recirculation ensures a constant flow of fresh air. This prevents a virus from spreading within a building through the ventilation system.", "With no recirculation, there will be more fresh air which could impact comfort positively by making people feel refreshed.", "No action is required."]
    ],
    'q14': [
      ["Good air ventilation reduces the risk of exposure. 1. Good ventilation systems improve health, sense of safety, quality of life, and quality of work.", "Good ventilation systems improve health, sense of safety, quality of life, and quality of work.", "Ensure regular maintenance. Perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic."],
      ["Poor ventilation systems can reduce health, sense of safety, quality of life, and quality of work.", "Perform additional maintenance to ensure it is functioning properly. Also, perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic.", "Slechte luchtventilatie verhoogt het risico op blootstelling."],
      ["Good ventilation lowers exposure risk by removing airborne viruses and bringing in fresh air.", "No ventilation system reduces health, sense of safety, quality of life, and quality of work.", "Install a ventilation system and ensure it is functioning properly. Also, perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic."]
    ],
    'q15': [
      ["Good air quality reduces the risk of exposure.", "Good air quality improves health, sense of safety, quality of life, and quality of work.", "Perform regular check-ups."],
      ["Poor air quality increases the risk of exposure.", "Poor air quality can reduce health, sense of safety, quality of life, and quality of work. Poor air quality also reduces confidence in the ventilation system.", "Repair the ventilation system. Make sure it's working properly."],
      ["Poor air quality increases the risk of exposure.", "Poor air quality can reduce health, sense of safety, quality of life, and quality of work. Poor air quality also reduces confidence in the ventilation system.", "Repair the ventilation system. Make sure it's working properly."]
    ],
    'q16': [
      ["If there are no complaints, ventilation can be increased without any problems. This reduces the risk of exposure.", "Increased ventilation improves health and work quality. If residents experience no discomfort from increased ventilation, it likely won't affect values like comfort.", "Educate residents and employees about the positive effects of increased ventilation."],
      ["If there are no complaints, ventilation can be increased without any problems. This reduces the risk of exposure.", "Increased ventilation improves health and work quality. If residents experience the positive effects of ventilation, that's an additional reason to increase ventilation. This increases their sense of safety.", "No action required."],
      ["If there are many complaints, ventilation cannot be increased as much/as often as desired, which increases the risk of exposure.", "Increased ventilation improves health and work quality. However, if residents develop colds and stiff necks when ventilation is increased, their comfort level drops significantly. They're likely to complain, and it becomes a constant battle with staff, which in turn reduces work quality.", "Educate residents and employees about the positive effects of increased ventilation. Look for solutions to the negative effects of increased ventilation. For example, avoid drafts in seating areas."],
      ["If there are complaints, ventilation cannot be increased as much/as often as desired, which increases the risk of exposure. However, if positive effects are also observed, ventilation can be increased slightly, which reduces the risk of exposure.", "Increased ventilation improves health and work quality. However, if residents develop colds and stiff necks when ventilation is increased, their comfort level drops significantly. They're likely to complain, and it becomes a constant battle with staff, which in turn reduces work quality. If residents experience the positive effects of ventilation, that's an additional reason to increase ventilation. This increases their sense of safety.", "Educate residents and employees about the positive effects of increased ventilation. Look for solutions to the negative effects of increased ventilation. For example, avoid drafts in seating areas."]
    ],
    'q17': [
      ["Having sufficient PPE in stock reduces the risk of exposure.", "Having sufficient PPE increases the feeling of safety, health, and quality of work. This increases safety and familiarity. The PPE itself can reduce the quality of work because it is uncomfortable.", "Check that the PPE is not expired. If so, ensure that new items are ordered in time."],
      ["Having sufficient PPE in stock reduces the risk of exposure. However, sufficient PPE must be available for an extended period.", "Having some PPE increases the feeling of safety, health, and quality of work in the short term. This increases safety and familiarity. However, there must be enough PPE for a longer period. The PPE itself can reduce the quality of work because it is uncomfortable.", "Check that the PPE is not expired. Also, ensure that the inventory is replenished."],
      ["Not having sufficient PPE in stock increases the risk of exposure.", "The lack of sufficient PPE reduces the feeling of safety, health, and quality of work.", "Order sufficient PPE to maintain stock. Check that the PPE is not expired."]
    ],
    'q18': [
      ["Receiving all the care necessary typically means there are many contact moments. The more interactions there are, the higher the risk of exposure.", "Receiving all the care necessary is important for quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner."],
      ["Scaling back on some of the necessary care means there are less contact moments. Reducing the number of interactions also reduces the risk of exposure.", "Scaling back on some of the necessary care means scaling back on quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner. Try to find safe alternatives instead of fully stopping a certain activity."],
      ["Scaling back on most of the care means there are less contact moments. Reducing the number of interactions also reduces the risk of exposure.", "Scaling back on most of the care means scaling back on quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner. Try to find safe alternatives instead of fully stopping a certain activity."]
    ],
    'q19': [
      ["Increasing the measures without increasing the number of people in the building is positive in terms of the risk of rejection.", "In principle, there is no impact on values. Be aware that workload is not given much consideration. This could negatively impact the quality of work.", "Prepare systems and personnel to understand how tasks can be expanded if necessary."],
      ["Being able to increase capacity allows for other safe ways of working (e.g., cohorts), which reduces the risk of rejection. On the other hand, there are now more people in the building, which can lead to more interactions, increasing the risk of rejection.", "The ability to increase capacity when necessary enhances values such as quality of work, comfort, quality of life, health, and care.", "Prepare systems and personnel to understand how capacity can be expanded if necessary."],
      ["Not being able to increase capacity leads to pushing boundaries, overwork, and rushing, which entails the risk of errors and/or errors, thus increasing the risk of rejection.", "There is no possibility of increasing capacity if necessary values such as quality of work, comfort, quality of life, health, and care are affected.", "Ensure additional capacity, allowing for increased capacity when needed. Prepare systems and personnel to understand how capacity can be expanded if necessary."]
    ],
    'q20': [
      ["Being able to enhance safety measures reduces the risk of exposure.", "Being able to invest in measures (e.g., PPE, ventilation, additional staff) increases work quality, comfort, and a sense of safety and health.", "No action required. Ensure that budget remains available to invest in safety measures when needed."],
      ["Being able to enhance even a few safety measures already reduces the risk of exposure somewhat. Ideally, you should implement all measures.", "Being able to invest in measures (e.g., PPE, ventilation, additional staff) increases work quality, comfort, and a sense of safety and health. However, not being able to invest in everything puts these under pressure.", "Try to increase the budget to invest in safety measures when needed. Grants may be available to help with this."],
      ["Not enhancing safety measures increases the risk of exposure.", "If measures (e.g., PPE, ventilation, additional staff) cannot be invested in, work quality, comfort, and a sense of safety and health will deteriorate.", "Look for ways to increase or save the budget to invest in safety measures when needed. Grants may be available to help with this."]
    ]
  },
  nl: {
    // ... (Dutch block unchanged — keep your full content here)
  }
};

// --- Scoring Rules ---
const scoringRules = {
  'q4': { values: [5, 1], risk: [1, 5] },
  'q5': { values: [5, 3, 1], risk: [1, 3, 5] },
  'q6': { values: [5, 1], risk: [1, 5] },
  'q12': { values: [1, 5], risk: [5, 1] },
  'q14': { values: [5, 3, 1], risk: [1, 3, 5] },
  'q15': { values: [5, 3, 1], risk: [1, 3, 5] },
  'q16': { values: [4, 5, 1, 3], risk: [1, 1, 5, 3] },
  'q17': { values: [5, 3, 1], risk: [1, 3, 5] },
  'q18': { values: [5, 2, 1], risk: [5, 3, 1] },
  'q19': { values: [5, 3, 1], risk: [1, 3, 5] },
  'q20': { values: [5, 3, 1], risk: [1, 3, 5] }
};

/* -------------------------------- Dashboard --------------------------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { answers, content } = location.state || { answers: {}, content: {} };

  const language = content.pageSubtitle === 'Zorghuis Actieplan' ? 'nl' : 'en';

  const handleRestart = () => navigate('/');

  const safeSpaceData = useMemo(() => {
    const shapeMap = { 0: 'Rectangle', 1: 'Circle', 2: 'Oval', 3: 'L-Shape' };
    const shape = shapeMap[answers['q8']] || 'Rectangle';
    const area = answers['q7'] || 50;
    let dims = {};

    switch (shape) {
      case 'Circle': {
        const radius = Math.sqrt(area / Math.PI);
        dims = { diameter: radius * 2 };
        break;
      }
      case 'Oval': {
        const minor_axis = Math.sqrt(area / (2 * Math.PI));
        dims = { major_axis: 2 * minor_axis, minor_axis: minor_axis };
        break;
      }
      case 'L-Shape': {
        const legArea = area / 2;
        const legWidth = Math.sqrt(legArea / 2);
        dims = { l1_len: legWidth * 2, l1_wid: legWidth, l2_len: legWidth * 2, l2_wid: legWidth };
        break;
      }
      default: {
        const side_length = Math.sqrt(area);
        dims = { length: side_length, width: side_length };
      }
    }

    const socialDistance = answers['q9'] || 1.5;
    const windowsDoors = answers['q10'] || 2;
    const ventGrates = answers['q11'] || 1;
    const airRecirc = (answers['q12'] === 0);
    const usablePercent = 75;

    const { positions, fullTheoretical } = getPositionsAndTheoreticalMax(shape, dims, socialDistance);

    // Geometric cap (layout)
    const geometricCapacity = Math.floor(fullTheoretical * usablePercent / 100);

    // Ventilation derate (kept, but not used for capacityMax unless you want it)
    const ventScore = Math.min((windowsDoors + ventGrates) / 20, 1);
    const recircPen = airRecirc ? 0.2 : 0;
    const riskPct = (1 - ventScore) * 50 + recircPen * 50; // 0..100
    const ventilationDerate = 1 - (riskPct / 100) * 0.3;
    const ventilationCapacity = Math.max(1, Math.floor(geometricCapacity * ventilationDerate));

    // If you want to skip ventilation cutoff: capacityMax = geometricCapacity.
    // If you want it: Math.min(geometricCapacity, ventilationCapacity)
    const capacityMax = geometricCapacity;
    const limiting = 'geometry';

    const roomArea = answers['q7'] || 50;

    const shuffledPositions = [...positions].sort(() => 0.5 - Math.random());
    const peopleToDraw = shuffledPositions.slice(0, Math.min(capacityMax, positions.length));

    return {
      shape,
      dims,
      people: peopleToDraw,
      socialDistance,
      color: '#22c55e',
      meta: {
        geometricCapacity,
        ventilationCapacity,
        capacityMax,
        limiting,
        roomArea,
        usablePercent
      }
    };
  }, [answers]);

  const analysisData = useMemo(() => {
    const normalizeScore = (score) => (score / 5) * 100;
    const getScore = (type, qId, aIdx) => {
      if (scoringRules[qId] && scoringRules[qId][type] && aIdx < scoringRules[qId][type].length) {
        return scoringRules[qId][type][aIdx];
      }
      return 0;
    };

    return dashboardLayout.map(row => {
      let totalValueScore = 0;
      let totalRiskScore = 0;
      let recommendationsList = [];

      row.questionIds.forEach(id => {
        const answerIndex = answers[id];
        if (answerIndex !== undefined) {
          totalValueScore += getScore('values', id, answerIndex);
          totalRiskScore += getScore('risk', id, answerIndex);
          if (recommendations[language][id] && recommendations[language][id][answerIndex]) {
            recommendationsList.push(recommendations[language][id][answerIndex]);
          }
        }
      });

      const avgValueScore = row.questionIds.length > 0 ? totalValueScore / row.questionIds.length : 0;
      const avgRiskScore = row.questionIds.length > 0 ? totalRiskScore / row.questionIds.length : 0;

      return {
        title: row.title,
        score1: normalizeScore(avgValueScore),
        score2: normalizeScore(avgRiskScore),
        recommendations: recommendationsList
      };
    });
  }, [answers, language]);

  const { totalScoreValues, totalScoreExposure } = useMemo(() => {
    if (analysisData.length === 0) return { totalScoreValues: 0, totalScoreExposure: 0 };
    const totalValuesRaw = analysisData.reduce((acc, item) => acc + item.score1, 0) / analysisData.length;
    const totalExposureRaw = analysisData.reduce((acc, item) => acc + item.score2, 0) / analysisData.length;
    return { totalScoreValues: totalValuesRaw, totalScoreExposure: totalExposureRaw };
  }, [analysisData]);

  if (!Object.keys(answers).length || !Object.keys(content).length) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex justify-center items-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">No summary to display.</h2>
          <p className="text-lg text-slate-600 mb-6">Please start the action plan first.</p>
          <button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg">
            Go to Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-9xl mx-auto">

        {/* Visualization + caption */}
        

        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Analysis per Category</h1>

        <div className="space-y-6 mb-12">
          {analysisData.map(data => (
            <AnalysisRow
              key={data.title}
              title={data.title}
              score1={data.score1}
              score2={data.score2}
              recommendations={data.recommendations}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Total Scores of Analysis</h2>
          <TotalScoreBar label="Total Score of Protection against Exposure" value={totalScoreExposure} colorClass="bg-green-500" />
          <TotalScoreBar label="Total Score of Values" value={totalScoreValues} colorClass="bg-blue-500" />
        </div>
        <div className="mt-12">
          <SpacingDiagram {...safeSpaceData} />
        </div>
        <div className="text-center mt-12">
          <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md">
            {content.startOver || "Start Over"}
          </button>
        </div>
      </div>
    </div>
  );
}
