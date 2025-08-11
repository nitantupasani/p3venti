import React, { useMemo, useRef, useEffect, useCallback } from 'react';

export const getPositionsAndTheoreticalMax = (shape, d, social_d) => {
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

export default SpacingDiagram;