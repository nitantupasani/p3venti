import React, { useMemo, useRef, useEffect, useCallback } from 'react';

const PERSON_VISUAL_SCALE = 0.75;
const FINE_GRID_STEP_SCALE = 0.5;
export const LAYOUT_GRID_STEP_SCALE = FINE_GRID_STEP_SCALE;
const RESIDENT_DISTANCE_MULTIPLIERS = [1.8, 1.5, 1.25, 1.1, 1.0];

/* --------------------- Utility: grid positions & capacity --------------------- */
export const getPositionsAndTheoreticalMax = (shape, dims, social_d, options = {}) => {
  if (!dims || !Number.isFinite(social_d) || social_d <= 0) {
    return { positions: [], fullTheoretical: 0, theoreticalPositions: [] };
  }

  const createPositions = (spacing, r_person) => {
    if (!Number.isFinite(spacing) || spacing <= 0) {
      return [];
    }
    const pts = [];

    if (shape === 'Rectangle') {
      const { length: l, width: w } = dims;
      const nx = Math.floor((l - 2 * r_person) / spacing);
      const ny = Math.floor((w - 2 * r_person) / spacing);
      for (let i = 0; i <= nx; i++) {
        for (let j = 0; j <= ny; j++) {
          pts.push({ x: r_person + i * spacing, y: r_person + j * spacing });
        }
      }
    } else if (shape === 'Circle') {
      const { diameter } = dims;
      const radius = diameter / 2;
      const center = { x: radius, y: radius };
      const nx = Math.floor((diameter - 2 * r_person) / spacing) + 1;
      const ny = Math.floor((diameter - 2 * r_person) / spacing) + 1;
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const pos = { x: r_person + i * spacing, y: r_person + j * spacing };
          if (Math.hypot(pos.x - center.x, pos.y - center.y) <= radius - r_person) {
            pts.push(pos);
          }
        }
      }
    } else if (shape === 'Oval') {
      const { major_axis: maj, minor_axis: minn } = dims;
      const h = maj / 2;
      const k = minn / 2;
      const center = { x: h, y: k };
      const nx = Math.floor((maj - 2 * r_person) / spacing) + 1;
      const ny = Math.floor((minn - 2 * r_person) / spacing) + 1;
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const pos = { x: r_person + i * spacing, y: r_person + j * spacing };
          if (((pos.x - center.x) ** 2) / ((h - r_person) ** 2) + ((pos.y - center.y) ** 2) / ((k - r_person) ** 2) <= 1) {
            pts.push(pos);
          }
        }
      }
    } else if (shape === 'L-Shape') {
      const { l1_len, l1_wid, l2_len, l2_wid } = dims;
      const nx1 = Math.floor((l1_len - 2 * r_person) / spacing);
      const ny1 = Math.floor((l1_wid - 2 * r_person) / spacing);
      for (let i = 0; i <= nx1; i++) {
        for (let j = 0; j <= ny1; j++) {
          pts.push({ x: r_person + i * spacing, y: r_person + j * spacing });
        }
      }

      const nx2 = Math.floor((l2_wid - 2 * r_person) / spacing);
      const ny2 = Math.floor((l2_len - 2 * r_person) / spacing);
      for (let i = 0; i <= nx2; i++) {
        for (let j = 0; j <= ny2; j++) {
          const newPos = { x: r_person + i * spacing, y: l1_wid + r_person + j * spacing };
          if (!pts.some(p => p.x === newPos.x && p.y === newPos.y)) {
            pts.push(newPos);
          }
        }
      }
    }

    return pts;
  };

  const theoreticalRadius = social_d / 2;
  const theoreticalPositions = createPositions(social_d, theoreticalRadius);

  const rawSpacing = options.gridStep ?? social_d;
  const candidateSpacing = rawSpacing > 0 ? rawSpacing : social_d;
  const marginRadius = options.marginRadius;
  const candidateRadius = Number.isFinite(marginRadius) ? marginRadius : theoreticalRadius;

  let positions = theoreticalPositions;
  if (candidateSpacing !== social_d || Math.abs(candidateRadius - theoreticalRadius) > 1e-9) {
    positions = createPositions(candidateSpacing, candidateRadius);
  }

  return {
    positions,
    fullTheoretical: theoreticalPositions.length,
    theoreticalPositions,
  };
};

// Helper function to shuffle array elements
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const EMPLOYEE_EMPLOYEE_GAP_MULTIPLIER = 1.02;
const EMPLOYEE_RESIDENT_GAP_MULTIPLIER = 1.08;

/* -------------------------- Spacing Diagram + Physics ------------------------- */

const SpacingDiagram = ({ shape, dims, people, socialDistance, color, meta, visualizationTitle, labels = {}, noteBox = null }) => {
  const animationFrameId = useRef(null);
  const nodeRefs = useRef([]);
  const particlesRef = useRef([]);
  const lastTimeRef = useRef(null);

  const occupancyRadius = socialDistance ? socialDistance / 2 : 0;
  const personRadius = occupancyRadius * PERSON_VISUAL_SCALE;

  const personIconPath =
    'M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z';
  const iconScale = (personRadius * 1) / 512;

  const baseResidentCount = people?.length ?? 0;

  const employeeCount = useMemo(() => {
    if (baseResidentCount <= 0) return 0;
    return Math.ceil(baseResidentCount / 8);
  }, [baseResidentCount]);

  const residentCount = useMemo(() => {
    return Math.max(baseResidentCount - employeeCount, 0);
  }, [baseResidentCount, employeeCount]);

  const { layoutPositions, theoreticalResidentPositions } = useMemo(() => {
    if (!dims || !socialDistance) {
      return { layoutPositions: [], theoreticalResidentPositions: [] };
    }
    try {
      const gridStep = socialDistance * FINE_GRID_STEP_SCALE;
      const effectiveGridStep = gridStep > 0 ? gridStep : socialDistance;
      const { positions, theoreticalPositions } = getPositionsAndTheoreticalMax(shape, dims, socialDistance, {
        gridStep: effectiveGridStep,
        marginRadius: occupancyRadius,
      });
      return { layoutPositions: positions, theoreticalResidentPositions: theoreticalPositions };
    } catch {
      return { layoutPositions: [], theoreticalResidentPositions: [] };
    }
  }, [shape, dims, socialDistance, occupancyRadius]);

  const residentPositions = useMemo(() => {
    if (residentCount === 0) return [];
    const basePool = (theoreticalResidentPositions && theoreticalResidentPositions.length)
      ? theoreticalResidentPositions
      : (layoutPositions && layoutPositions.length
        ? layoutPositions
        : (people && people.length ? people : []));

    if (!basePool.length) return [];

    const shuffledPositions = shuffleArray(basePool);
    const targetCount = Math.min(residentCount, shuffledPositions.length);
    if (targetCount === 0) return [];

    const buildSelection = (source, minDistance) => {
      const candidate = [];
      for (const pos of source) {
        const isFarEnough = candidate.every((selected) =>
          Math.hypot(selected.x - pos.x, selected.y - pos.y) >= minDistance - 1e-6
        );
        if (isFarEnough) {
          candidate.push(pos);
          if (candidate.length === targetCount) break;
        }
      }
      return candidate;
    };

    const attemptSelection = (source) => {
      let best = [];
      for (const multiplier of RESIDENT_DISTANCE_MULTIPLIERS) {
        const minDistance = Math.max((socialDistance || 0) * multiplier, socialDistance || 0);
        const candidate = buildSelection(source, minDistance);
        if (candidate.length === targetCount) return candidate;
        if (candidate.length > best.length) best = candidate;
      }
      return best;
    };

    const shuffledSelection = attemptSelection(shuffledPositions);
    if (shuffledSelection.length === targetCount) return shuffledSelection;

    const orderedPositions = [...basePool].sort((a, b) => (a.x - b.x) || (a.y - b.y));
    const orderedSelection = attemptSelection(orderedPositions);
    if (orderedSelection.length === targetCount) return orderedSelection;

    return shuffledSelection.length >= orderedSelection.length ? shuffledSelection : orderedSelection;
  }, [people, layoutPositions, theoreticalResidentPositions, residentCount, socialDistance]);

  const employeeDescriptors = useMemo(() => {
    return Array.from({ length: employeeCount }, () => 'employee');
  }, [employeeCount]);

  const { viewBoxWidth, viewBoxHeight, wallElement, floorElement, isInsideShape } = useMemo(() => {
    let viewBoxWidth = 10, viewBoxHeight = 10;
    let wallElement, floorElement, isInsideShape;
    const wallThickness = 0.5;
    const margin = personRadius || 0;

    if (!dims) return {};

    if (shape === 'Rectangle') {
      viewBoxWidth = dims.length; viewBoxHeight = dims.width;
      floorElement = <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} className="room-floor" />;
      wallElement = <rect x={-wallThickness / 2} y={-wallThickness / 2} width={viewBoxWidth + wallThickness} height={viewBoxHeight + wallThickness} className="room-wall" strokeWidth={wallThickness} rx="1" />;
      isInsideShape = (x, y) => x >= margin && x <= viewBoxWidth - margin && y >= margin && y <= viewBoxHeight - margin;
    } else if (shape === 'Circle') {
      viewBoxWidth = viewBoxHeight = dims.diameter;
      const r = dims.diameter / 2;
      floorElement = <circle cx={r} cy={r} r={r} className="room-floor" />;
      wallElement = <circle cx={r} cy={r} r={r + wallThickness / 2} className="room-wall" strokeWidth={wallThickness} />;
      isInsideShape = (x, y) => Math.hypot(x - r, y - r) <= r - margin;
    } else if (shape === 'Oval') {
      viewBoxWidth = dims.major_axis; viewBoxHeight = dims.minor_axis;
      const rx = viewBoxWidth / 2, ry = viewBoxHeight / 2;
      floorElement = <ellipse cx={rx} cy={ry} rx={rx} ry={ry} className="room-floor" />;
      wallElement = <ellipse cx={rx} cy={ry} rx={rx + wallThickness / 2} ry={ry + wallThickness / 2} className="room-wall" strokeWidth={wallThickness} />;
      isInsideShape = (x, y) => ((x - rx) ** 2) / ((rx - margin) ** 2) + ((y - ry) ** 2) / ((ry - margin) ** 2) <= 1;
    } else if (shape === 'L-Shape') {
      const { l1_len, l1_wid, l2_len, l2_wid } = dims;
      viewBoxWidth = Math.max(l1_len, l2_wid);
      viewBoxHeight = l1_wid + l2_len;
      const path = `M0,0 H${l1_len} V${l1_wid} H${l2_wid} V${viewBoxHeight} H0 Z`;
      wallElement = <path d={path} className="room-wall-filled" />;
      floorElement = <path d={path} className="room-floor" />;
      isInsideShape = (x, y) => {
        const inTop = x >= margin && x <= l1_len - margin && y >= margin && y <= l1_wid - margin;
        const inBottom = x >= margin && x <= l2_wid - margin && y > l1_wid && y <= viewBoxHeight - margin;
        return inTop || inBottom;
      };
    }

    return { viewBoxWidth, viewBoxHeight, wallElement, floorElement, isInsideShape };
  }, [shape, dims, personRadius]);

  const projectInside = useCallback((from, to) => {
    if (!isInsideShape) return { point: to, normal: null };
    if (isInsideShape(to.x, to.y)) return { point: to, normal: null };

    const dirX = to.x - from.x;
    const dirY = to.y - from.y;
    let low = 0;
    let high = 1;
    let point = { ...from };
    for (let iter = 0; iter < 12; iter++) {
      const mid = (low + high) / 2;
      const test = { x: from.x + dirX * mid, y: from.y + dirY * mid };
      if (isInsideShape(test.x, test.y)) {
        point = test;
        low = mid;
      } else {
        high = mid;
      }
    }
    const nx = to.x - point.x;
    const ny = to.y - point.y;
    const normalLength = Math.hypot(nx, ny);
    if (normalLength > 1e-6) {
      const normal = { x: nx / normalLength, y: ny / normalLength };
      const nudgedPoint = {
        x: point.x - normal.x * 0.01,
        y: point.y - normal.y * 0.01,
      };
      if (isInsideShape(nudgedPoint.x, nudgedPoint.y)) {
        return { point: nudgedPoint, normal };
      }
      return { point, normal };
    }
    return { point, normal: null };
  }, [isInsideShape]);

  const isClearOfResidents = useCallback((x, y, minDistance) => {
    const clearance = Math.max(minDistance ?? 0, personRadius * 2);
    for (const pos of residentPositions) {
      if (Math.hypot(x - pos.x, y - pos.y) < clearance) return false;
    }
    return true;
  }, [residentPositions, personRadius]);

  const isClearOfEmployees = useCallback((x, y, minDistance, existing) => {
    const clearance = Math.max(minDistance ?? 0, personRadius * 2);
    for (const e of existing) {
      if (Math.hypot(x - e.x, y - e.y) < clearance) return false;
    }
    return true;
  }, [personRadius]);

  const randomPointInside = useCallback((minClearance, existing = []) => {
    if (!isInsideShape || !Number.isFinite(viewBoxWidth) || !Number.isFinite(viewBoxHeight)) {
      return { x: 0, y: 0 };
    }
    const margin = personRadius || 0;
    for (let attempt = 0; attempt < 400; attempt++) {
      const rx = margin + Math.random() * Math.max(0.0001, viewBoxWidth - 2 * margin);
      const ry = margin + Math.random() * Math.max(0.0001, viewBoxHeight - 2 * margin);
      if (
        isInsideShape(rx, ry) &&
        isClearOfResidents(rx, ry, minClearance) &&
        isClearOfEmployees(rx, ry, minClearance, existing)
      ) {
        return { x: rx, y: ry };
      }
    }
    return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
  }, [isInsideShape, viewBoxWidth, viewBoxHeight, personRadius, isClearOfResidents, isClearOfEmployees]);

  const drawFrame = useCallback(() => {
    const pts = particlesRef.current;
    const nodes = nodeRefs.current;
    for (let i = 0; i < pts.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      node.setAttribute('transform', `translate(${pts[i].x}, ${pts[i].y})`);
    }
  }, []);

  /* --------------------- Elastic-physics step (no damping) -------------------- */

  const stepPhysics = useCallback((dt) => {
    const pts = particlesRef.current;
    if (!pts || pts.length === 0) return;
    const desired = socialDistance;
    if (!Number.isFinite(desired) || desired <= 0) return;

    const r = personRadius;
    const redRedContact = r * 2 * EMPLOYEE_EMPLOYEE_GAP_MULTIPLIER;
    const redGreenContact = r * 2 * EMPLOYEE_RESIDENT_GAP_MULTIPLIER;

    const MIN_SPEED = desired * 0.6;   // ensures they never stop
    const MAX_SPEED = desired * 2.4;   // cap so they don't explode in speed
    const ANGLE_JITTER = 0.18;         // mild heading jitter to avoid perfect loops (rad/s)

    // 1) Advance with mild heading jitter and handle boundary bounces (elastic)
    for (const p of pts) {
      const angleDelta = (Math.random() - 0.5) * ANGLE_JITTER * dt;
      const c = Math.cos(angleDelta), s = Math.sin(angleDelta);
      const vx = p.vx * c - p.vy * s;
      const vy = p.vx * s + p.vy * c;
      p.vx = vx; p.vy = vy;

      let nx = p.x + p.vx * dt;
      let ny = p.y + p.vy * dt;

      if (!isInsideShape(nx, ny)) {
        const { point, normal } = projectInside({ x: p.x, y: p.y }, { x: nx, y: ny });
        p.x = point.x; p.y = point.y;
        if (normal) {
          const vdotn = p.vx * normal.x + p.vy * normal.y;
          // Elastic reflection: v' = v - 2 (v·n) n
          p.vx = p.vx - 2 * vdotn * normal.x;
          p.vy = p.vy - 2 * vdotn * normal.y;
        } else {
          p.vx = -p.vx;
          p.vy = -p.vy;
        }
        nx = p.x + p.vx * dt;
        ny = p.y + p.vy * dt;
        if (!isInsideShape(nx, ny)) {
          const { point: p2 } = projectInside({ x: p.x, y: p.y }, { x: nx, y: ny });
          p.x = p2.x; p.y = p2.y;
        } else {
          p.x = nx; p.y = ny;
        }
      } else {
        p.x = nx; p.y = ny;
      }
    }

    // 2) Resolve red–red overlaps with elastic collisions (equal mass)
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy) || 1e-6;
        if (dist < redRedContact) {
          const nux = dx / dist, nuy = dy / dist;
          const overlap = redRedContact - dist;
          const half = overlap / 2;

          // Positional correction (split evenly)
          let ax = a.x - nux * half, ay = a.y - nuy * half;
          let bx = b.x + nux * half, by = b.y + nuy * half;

          if (!isInsideShape(ax, ay)) {
            const { point } = projectInside({ x: a.x, y: a.y }, { x: ax, y: ay });
            ax = point.x; ay = point.y;
          }
          if (!isInsideShape(bx, by)) {
            const { point } = projectInside({ x: b.x, y: b.y }, { x: bx, y: by });
            bx = point.x; by = point.y;
          }
          a.x = ax; a.y = ay;
          b.x = bx; b.y = by;

          // Elastic collision: swap normal components (equal mass)
          const va_n = a.vx * nux + a.vy * nuy;
          const vb_n = b.vx * nux + b.vy * nuy;
          const va_t_x = a.vx - va_n * nux;
          const va_t_y = a.vy - va_n * nuy;
          const vb_t_x = b.vx - vb_n * nux;
          const vb_t_y = b.vy - vb_n * nuy;

          a.vx = va_t_x + vb_n * nux;
          a.vy = va_t_y + vb_n * nuy;
          b.vx = vb_t_x + va_n * nux;
          b.vy = vb_t_y + va_n * nuy;
        }
      }
    }

    // 3) Resolve red–green overlaps with elastic reflection off stationary circle
    for (const p of pts) {
      for (const g of residentPositions) {
        const dx = p.x - g.x;
        const dy = p.y - g.y;
        const dist = Math.hypot(dx, dy) || 1e-6;
        if (dist < redGreenContact) {
          const nx = dx / dist, ny = dy / dist;
          const push = redGreenContact - dist;
          let px = p.x + nx * push;
          let py = p.y + ny * push;
          if (!isInsideShape(px, py)) {
            const { point } = projectInside({ x: p.x, y: p.y }, { x: px, y: py });
            px = point.x; py = point.y;
          }
          p.x = px; p.y = py;

          const vdotn = p.vx * nx + p.vy * ny;
          p.vx = p.vx - 2 * vdotn * nx;
          p.vy = p.vy - 2 * vdotn * ny;
        }
      }
    }

    // 4) Enforce speed bounds so reds never stall and don't get too fast
    for (const p of pts) {
      const speed = Math.hypot(p.vx, p.vy);
      if (speed < MIN_SPEED) {
        if (speed < 1e-9) {
          const theta = Math.random() * Math.PI * 2;
          p.vx = Math.cos(theta) * MIN_SPEED;
          p.vy = Math.sin(theta) * MIN_SPEED;
        } else {
          const s = MIN_SPEED / speed;
          p.vx *= s; p.vy *= s;
        }
      } else if (speed > MAX_SPEED) {
        const s = MAX_SPEED / speed;
        p.vx *= s; p.vy *= s;
      }
    }
  }, [isInsideShape, socialDistance, projectInside, residentPositions, personRadius]);

  /* ------------------------- Initialize moving particles ---------------------- */

  useEffect(() => {
    if (!dims || !isInsideShape || !Number.isFinite(socialDistance)) return;

    const minClearFromResidents = Math.max(personRadius * 2 * EMPLOYEE_RESIDENT_GAP_MULTIPLIER, socialDistance * 0.8);
    // const minClearFromEmployees = personRadius * 2 * EMPLOYEE_EMPLOYEE_GAP_MULTIPLIER;

    const newParticles = [];
    for (let i = 0; i < employeeDescriptors.length; i++) {
      const pos = randomPointInside(minClearFromResidents, newParticles);
      const theta = Math.random() * Math.PI * 2;
      const baseSpeed = socialDistance * 1.2;
      newParticles.push({
        id: i,
        type: 'employee',
        x: pos.x,
        y: pos.y,
        vx: Math.cos(theta) * baseSpeed,
        vy: Math.sin(theta) * baseSpeed,
      });
    }
    particlesRef.current = newParticles;

    lastTimeRef.current = null;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

    const loop = (t) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      const dtMs = t - lastTimeRef.current;
      lastTimeRef.current = t;
      const dt = Math.min(32, dtMs) / 1000;
      stepPhysics(dt);
      drawFrame();
      animationFrameId.current = requestAnimationFrame(loop);
    };

    requestAnimationFrame(() => {
      drawFrame();
      animationFrameId.current = requestAnimationFrame(loop);
    });

    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [
    shape, dims, people, socialDistance,
    isInsideShape, employeeDescriptors, personRadius,
    randomPointInside, stepPhysics, drawFrame
  ]);

  const padding = 1.5;

  return (
    <>
    <h1 className="text-2xl font-bold text-[#431325] mt-8 text-center">{visualizationTitle}</h1>
    <div className="p-4 bg-white rounded-lg shadow">
      <style>{`
        .room-wall { fill: none; stroke: #1f2937; stroke-linejoin: round; }
        .room-wall-filled { fill: #1f2937; stroke: #1f2937; stroke-width: 1; stroke-linejoin: round; }
        .room-floor { fill: url(#floorPattern); stroke: none; }
        .diagram-container { width: 100%; margin: 0 auto; background-color: #ffffff; padding: 1rem; border-radius: 8px; }
        .svg-wrap { width: 100%; max-width: 600px; }
        .caption-box { width: 260px; }
      `}</style>
      <div className="diagram-container">
        <div
          className="diagram-row grid mx-auto items-center justify-items-center"
          style={{
            gridTemplateColumns: '325px minmax(360px, max-content) 325px',
            columnGap: '2px'
          }}
        >
          {noteBox?.text && (
            <div className="caption-box bg-slate-50 border border-slate-300 rounded-md p-4 w-[500px]">
              <div className="text-slate-900 font-bold text-xl leading-tight">
                {noteBox.title || 'Please Note'}
              </div>
              <div className="h-px bg-slate-200 my-3" />
              <p className="text-slate-700 text-sm whitespace-pre-line text-center">
                {noteBox.text}
              </p>
            </div>
          )}

          <div className="svg-wrap">
            <svg
              className="overflow-visible max-w-full"
              style={{ width: 'min(72vw, 640px)' }}
              viewBox={`${-padding} ${-padding} ${viewBoxWidth + 2 * padding} ${viewBoxHeight + 2 * padding}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="floorPattern" patternUnits="userSpaceOnUse" width="1" height="1">
                  <rect width="1" height="1" fill="#f3f0e8" />
                  <path
                    d="M -0.25,0.25 L 0.25, -0.25 M 0.75,-0.25 L 1.25,0.25 M -0.25,0.75 L 0.25,0.25 M 0.75,0.25 L 1.25,0.75"
                    stroke="#dcd6c8"
                    strokeWidth="0.04"
                  />
                </pattern>
              </defs>
              {wallElement}
              {floorElement}

              {residentPositions.map((pos, i) => (
                <g key={`resident-${i}`} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle cx="0" cy="0" r={personRadius} fill="#22c55e" opacity="0.85" />
                  <g transform={`scale(${iconScale}) translate(-224, -256)`}>
                    <path d={personIconPath} fill="white" />
                  </g>
                </g>
              ))}

              {employeeDescriptors.map((_, i) => (
                <g
                  key={`employee-${i}`}
                  ref={(el) => { nodeRefs.current[i] = el; }}
                  transform="translate(-1000,-1000)"
                >
                  <circle cx="0" cy="0" r={personRadius} fill="#ef4444" opacity="0.85" />
                  <g transform={`scale(${iconScale}) translate(-224, -256)`}>
                    <path d={personIconPath} fill="white" />
                  </g>
                </g>
              ))}
            </svg>
          </div>

          {meta && (
            <div className="caption-box bg-slate-50 border border-slate-300 rounded-md p-4 w-[260px]">
              <div className="text-slate-900 font-bold text-xl leading-tight">
                {labels.maxPeople || 'Max people'}: {meta.capacityMax}
              </div>
              <div className="text-slate-600 text-sm mt-1">
                {meta.limiting === 'ventilation'
                  ? (labels.ventilationLimited || 'Ventilation-limited')
                  : (labels.geometryLimited || 'Geometry-limited')}
              </div>
              <div className="h-px bg-slate-200 my-3" />
              <div className="space-y-1.5 text-slate-700 text-sm">
                <div>
                  {labels.roomArea || 'Room area'}{' '}
                  <span className="font-medium">
                    {Number.isFinite(meta.roomArea) ? meta.roomArea.toFixed(1) : meta.roomArea} m²
                  </span>
                </div>
                <div>
                  {labels.usableArea || 'Usable area (packing)'}{' '}
                  <span className="font-medium">{meta.usablePercent}%</span>
                </div>
                <div>
                  {labels.socialDistance || 'Social distance'}{' '}
                  <span className="font-medium">{socialDistance} m</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default SpacingDiagram;