import React, { useMemo, useRef, useEffect, useCallback } from 'react';

/* --------------------- Utility: grid positions & capacity --------------------- */
export const getPositionsAndTheoreticalMax = (shape, dims, social_d) => {
    const positions = [];
    const spacing = social_d;
    const r_person = social_d / 2;

    if (shape === 'Rectangle') {
        const { length: l, width: w } = dims;
        const nx = Math.floor((l - 2 * r_person) / spacing);
        const ny = Math.floor((w - 2 * r_person) / spacing);
        for (let i = 0; i <= nx; i++) {
            for (let j = 0; j <= ny; j++) {
                positions.push({ x: r_person + i * spacing, y: r_person + j * spacing });
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
                    positions.push(pos);
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
                    positions.push(pos);
                }
            }
        }
    } else if (shape === 'L-Shape') {
        const { l1_len, l1_wid, l2_len, l2_wid } = dims;
        // Top rectangle
        const nx1 = Math.floor((l1_len - 2 * r_person) / spacing);
        const ny1 = Math.floor((l1_wid - 2 * r_person) / spacing);
        for (let i = 0; i <= nx1; i++) {
            for (let j = 0; j <= ny1; j++) {
                positions.push({ x: r_person + i * spacing, y: r_person + j * spacing });
            }
        }
        // Bottom rectangle
        const nx2 = Math.floor((l2_wid - 2 * r_person) / spacing);
        const ny2 = Math.floor((l2_len - 2 * r_person) / spacing);
        for (let i = 0; i <= nx2; i++) {
            for (let j = 0; j <= ny2; j++) {
                 const newPos = { x: r_person + i * spacing, y: l1_wid + r_person + j * spacing };
                 if (!positions.some(p => p.x === newPos.x && p.y === newPos.y)) {
                    positions.push(newPos);
                 }
            }
        }
    }
    return { positions, fullTheoretical: positions.length };
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

const EMPLOYEE_SPEED_MULTIPLIER = 2.4;
/* -------------------------- Spacing Diagram + Physics ------------------------- */

const SpacingDiagram = ({ shape, dims, people, socialDistance, color, meta, visualizationTitle, labels = {}, noteBox = null }) => {
    const animationFrameId = useRef(null);
    const nodeRefs = useRef([]);
    const particlesRef = useRef([]);
    const startTimeRef = useRef(null);

    const personRadius = socialDistance / 2;
    const personIconPath =
    "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z";
    const iconScale = (personRadius * 1) / 512;

    const baseResidentCount = people?.length ?? 0;
    const employeeCount = useMemo(() => {
        if (baseResidentCount <= 0) {
            return 0;
        }
        return Math.ceil(baseResidentCount / 8);
    }, [baseResidentCount]);

    const residentCount = useMemo(() => {
        return Math.max(baseResidentCount - employeeCount, 0);
    }, [baseResidentCount, employeeCount]);

    const layoutPositions = useMemo(() => {
        if (!dims || !socialDistance) return [];
        try {
            const { positions } = getPositionsAndTheoreticalMax(shape, dims, socialDistance);
            return positions;
        } catch (error) {
            return [];
        }
    }, [shape, dims, socialDistance]);

    const residentPositions = useMemo(() => {
    if (residentCount === 0) return [];
    const basePositions = (people && people.length) ? people : layoutPositions;

    // Shuffle positions for a uniform distribution
        const shuffledPositions = shuffleArray(basePositions);

        return shuffledPositions.slice(0, residentCount);
    }, [people, layoutPositions, residentCount]);

    const availableLayoutPositions = useMemo(() => {
        if (!layoutPositions?.length) return [];
        if (!residentPositions?.length) return layoutPositions;

        const formatKey = (pos) => `${pos.x.toFixed(4)}:${pos.y.toFixed(4)}`;
        const residentKeys = new Set(residentPositions.map(formatKey));

        return layoutPositions.filter((pos) => !residentKeys.has(formatKey(pos)));
    }, [layoutPositions, residentPositions]);

    const employeeDescriptors = useMemo(() => {
        return Array.from({ length: employeeCount }, () => 'employee');
    }, [employeeCount]);

    const { viewBoxWidth, viewBoxHeight, wallElement, floorElement, isInsideShape } = useMemo(() => {
        let viewBoxWidth = 10, viewBoxHeight = 10;
        let wallElement, floorElement, isInsideShape;
        const wallThickness = 0.5;
        const margin = personRadius;

        if (!dims) return {};

        if (shape === 'Rectangle') {
            viewBoxWidth = dims.length; viewBoxHeight = dims.width;
            floorElement = <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} className="room-floor" />;
            wallElement = <rect x={-wallThickness/2} y={-wallThickness/2} width={viewBoxWidth + wallThickness} height={viewBoxHeight + wallThickness} className="room-wall" strokeWidth={wallThickness} rx="1" />;
            isInsideShape = (x, y) => x >= margin && x <= viewBoxWidth - margin && y >= margin && y <= viewBoxHeight - margin;
        } else if (shape === 'Circle') {
            viewBoxWidth = viewBoxHeight = dims.diameter;
            const r = dims.diameter / 2;
            floorElement = <circle cx={r} cy={r} r={r} className="room-floor" />;
            wallElement = <circle cx={r} cy={r} r={r + wallThickness/2} className="room-wall" strokeWidth={wallThickness} />;
            isInsideShape = (x, y) => Math.hypot(x - r, y - r) <= r - margin;
        } else if (shape === 'Oval') {
            viewBoxWidth = dims.major_axis; viewBoxHeight = dims.minor_axis;
            const rx = viewBoxWidth / 2, ry = viewBoxHeight / 2;
            floorElement = <ellipse cx={rx} cy={ry} rx={rx} ry={ry} className="room-floor" />;
            wallElement = <ellipse cx={rx} cy={ry} rx={rx + wallThickness/2} ry={ry + wallThickness/2} className="room-wall" strokeWidth={wallThickness} />;
            isInsideShape = (x, y) => ((x - rx) ** 2) / ((rx - margin) ** 2) + ((y - ry) ** 2) / ((ry - margin) ** 2) <= 1;
        } else if (shape === 'L-Shape') {
            const { l1_len, l1_wid, l2_len, l2_wid } = dims;
            viewBoxWidth  = Math.max(l1_len, l2_wid);
            viewBoxHeight = l1_wid + l2_len;
            const path = `M0,0 H${l1_len} V${l1_wid} H${l2_wid} V${viewBoxHeight} H0 Z`;
            
            // Reverted L-Shape Logic
            wallElement  = <path d={path} className="room-wall-filled" />;
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
        if (!isInsideShape) {
            return { point: to, normal: null };
        }
        if (isInsideShape(to.x, to.y)) {
            return { point: to, normal: null };
        }
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

    const isClearOfResidents = useCallback((x, y, minDistance = socialDistance) => {
        for (const pos of residentPositions) {
            if (Math.hypot(x - pos.x, y - pos.y) < minDistance) {
                return false;
            }
        }
        return true;
    }, [residentPositions, socialDistance]);

    const randomPointInside = useCallback(() => {
        if (!isInsideShape || !Number.isFinite(viewBoxWidth) || !Number.isFinite(viewBoxHeight)) {
            return { x: 0, y: 0 };
        }
        const margin = personRadius;
        for (let attempt = 0; attempt < 80; attempt++) {
            const rx = margin + Math.random() * Math.max(0.0001, viewBoxWidth - 2 * margin);
            const ry = margin + Math.random() * Math.max(0.0001, viewBoxHeight - 2 * margin);
            if (isInsideShape(rx, ry) && isClearOfResidents(rx, ry)) {
                return { x: rx, y: ry };
            }
        }
        return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
    }, [isInsideShape, viewBoxWidth, viewBoxHeight, personRadius, isClearOfResidents]);

    const assignNewTarget = useCallback((particle) => {
        const destination = randomPointInside();
        particle.targetX = destination.x;
        particle.targetY = destination.y;
        particle.targetTimer = 1.6 + Math.random() * 2.8;
    }, [randomPointInside]);

    const drawFrame = useCallback(() => {
        const pts = particlesRef.current;
        const nodes = nodeRefs.current;
        for (let i = 0; i < pts.length; i++) {
            const node = nodes[i];
            if (!node) continue;
            node.setAttribute('transform', `translate(${pts[i].x}, ${pts[i].y})`);
        }
    }, []);

    const stepPhysics = useCallback((dt) => {
    const pts = particlesRef.current;
    if (!pts || pts.length === 0) return;
    const desired = socialDistance;
    const kClose = 0.22;
    const kFar = 0.045;
    const farRange = desired * 3.5;
    const residentDamping = 0.9;
    const employeeDamping = 0.94;
    const boundaryBounceRetention = 0.6;
    const timeScale = 1.2;
    for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        let fx = 0, fy = 0;
        for (let j = 0; j < pts.length; j++) {
            if (i === j) continue;
            const p2 = pts[j];
            const dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.hypot(dx, dy) || 1e-6, ux = dx / dist, uy = dy / dist;
            if (dist < desired) {
                const overlap = desired - dist;
                fx += ux * (kClose * overlap);
                fy += uy * (kClose * overlap);
            } else if (dist < farRange) {
                const s = 1 - (dist - desired) / (farRange - desired);
                const falloff = kFar * s * s / Math.max(dist * dist, 1e-6);
                fx += ux * falloff;
                fy += uy * falloff;
            }
        }
        
        for (const resident of residentPositions) {
            const dx = p1.x - resident.x;
            const dy = p1.y - resident.y;
            const dist = Math.hypot(dx, dy) || 1e-6;
            const ux = dx / dist;
            const uy = dy / dist;
            if (dist < desired) {
                const overlap = desired - dist;
                const residentRepulsion = 1.8; 
                fx += ux * (kClose * overlap * residentRepulsion);
                fy += uy * (kClose * overlap * residentRepulsion);
            } else if (dist < farRange) {
                const s = 1 - (dist - desired) / (farRange - desired);
                const falloff = kFar * s * s / Math.max(dist * dist, 1e-6);
                fx += ux * falloff;
                fy += uy * falloff;
            }
        }

        p1.targetTimer = Math.max(0, (p1.targetTimer ?? 0) - dt);
        if (!Number.isFinite(p1.targetX) || !Number.isFinite(p1.targetY) || p1.targetTimer <= 0 || !isInsideShape(p1.targetX, p1.targetY)) {
            assignNewTarget(p1);
        }

        let toTargetX = p1.targetX - p1.x;
        let toTargetY = p1.targetY - p1.y;
        let targetDist = Math.hypot(toTargetX, toTargetY);
        if (targetDist < desired * 0.25) {
            assignNewTarget(p1);
            toTargetX = p1.targetX - p1.x;
            toTargetY = p1.targetY - p1.y;
            targetDist = Math.hypot(toTargetX, toTargetY);
        }

        const targetPull = desired * (p1.type === 'employee' ? 0.62 : 0.48);
        if (targetDist > 1e-4) {
            const eased = Math.min(targetDist, desired * 1.6) / Math.max(targetDist, 1e-4);
            fx += toTargetX * eased * targetPull;
            fy += toTargetY * eased * targetPull;
        }

        const wanderFreq = p1.type === 'employee' ? 0.95 : 0.75;
        const wanderStrength = desired * (p1.type === 'employee' ? 0.24 : 0.16);
        p1.px += dt * wanderFreq;
        p1.py += dt * (wanderFreq * 0.77);
        fx += Math.cos(p1.px) * wanderStrength;
        fy += Math.sin(p1.py) * wanderStrength;
        const multiplier = p1.type === 'employee' ? EMPLOYEE_SPEED_MULTIPLIER : 1;
        const damping = p1.type === 'employee' ? employeeDamping : residentDamping;
        p1.vx = (p1.vx + fx * timeScale * multiplier * dt) * damping;
        p1.vy = (p1.vy + fy * timeScale * multiplier * dt) * damping;

        const maxSpeed = socialDistance * 2.8;
        const speed = Math.hypot(p1.vx, p1.vy);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            p1.vx *= scale;
            p1.vy *= scale;
        }

        let nx = p1.x + p1.vx * dt;
        let ny = p1.y + p1.vy * dt;

        if (!isInsideShape(nx, ny)) {
            const { point, normal } = projectInside({ x: p1.x, y: p1.y }, { x: nx, y: ny });
            nx = point.x;
            ny = point.y;
            if (normal) {
                const vn = p1.vx * normal.x + p1.vy * normal.y;
                const vtX = p1.vx - vn * normal.x;
                const vtY = p1.vy - vn * normal.y;
                p1.vx = vtX - vn * normal.x * boundaryBounceRetention;
                p1.vy = vtY - vn * normal.y * boundaryBounceRetention;
            } else {
                p1.vx *= -boundaryBounceRetention;
                p1.vy *= -boundaryBounceRetention;
            }
        }
        p1.x = nx; p1.y = ny;
    }

    const iterations = 2;
    for (let it = 0; it < iterations; it++) {
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const a = pts[i], b = pts[j], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 1e-6;
                if (dist < socialDistance) {
                    const overlap = (socialDistance - dist) * 0.5, ux = dx / dist, uy = dy / dist;
                    const ax = a.x - ux * overlap, ay = a.y - uy * overlap, bx = b.x + ux * overlap, by = b.y + uy * overlap;
                    if (isInsideShape(ax, ay)) { a.x = ax; a.y = ay; }
                    if (isInsideShape(bx, by)) { b.x = bx; b.y = by; }
                }
            }
        }

        for (let i = 0; i < pts.length; i++) {
            const particle = pts[i];
            for (const resident of residentPositions) {
                const dx = particle.x - resident.x;
                const dy = particle.y - resident.y;
                const dist = Math.hypot(dx, dy) || 1e-6;
                if (dist < socialDistance) {
                    const overlap = socialDistance - dist;
                    const ux = dx / dist;
                    const uy = dy / dist;
                    const newX = particle.x + ux * overlap;
                    const newY = particle.y + uy * overlap;
                    if (isInsideShape(newX, newY)) {
                        particle.x = newX;
                        particle.y = newY;
                    }
                }
            }
        }

    }
}, [isInsideShape, socialDistance, projectInside, assignNewTarget, residentPositions]);

    useEffect(() => {
        if (!dims || !isInsideShape || !viewBoxWidth || !viewBoxHeight) return;
        const jitter = socialDistance * 0.04;
        let layoutIndex = 0;

        const availableLayout = availableLayoutPositions;
        particlesRef.current = employeeDescriptors.map((descriptor, i) => {
            let basePosition;
            if (layoutIndex < availableLayout.length) {
                const layoutPos = availableLayout[layoutIndex++];
                basePosition = {
                    x: layoutPos.x + (Math.random() - 0.5) * jitter,
                    y: layoutPos.y + (Math.random() - 0.5) * jitter,
                };
            } else {
                basePosition = randomPointInside();
            }

            if (!isClearOfResidents(basePosition.x, basePosition.y, socialDistance * 0.9)) {
                basePosition = randomPointInside();
            }

            const velocityRange = socialDistance * 0.12 * EMPLOYEE_SPEED_MULTIPLIER;
            const particle = {
                id: i,
                type: descriptor,
                x: basePosition.x,
                y: basePosition.y,
                vx: (Math.random() - 0.5) * velocityRange,
                vy: (Math.random() - 0.5) * velocityRange,
                px: Math.random() * Math.PI * 2,
                py: Math.random() * Math.PI * 2,
                speedMultiplier: EMPLOYEE_SPEED_MULTIPLIER,
                targetX: basePosition.x,
                targetY: basePosition.y,
                targetTimer: 0,
            };
            assignNewTarget(particle);
            return particle;
        });
        startTimeRef.current = null;
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        const loop = (t) => {
            if (startTimeRef.current == null) startTimeRef.current = t;
            const dtMs = t - startTimeRef.current;
            startTimeRef.current = t;
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

    }, [shape, dims, people, socialDistance, isInsideShape, viewBoxWidth, viewBoxHeight, stepPhysics, drawFrame, employeeDescriptors, personRadius, availableLayoutPositions, randomPointInside, assignNewTarget, residentPositions, isClearOfResidents]);

    const padding = 1.5;
    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h1 className="text-3xl font-bold text-slate-800 mt-8 text-center">{visualizationTitle}</h1>
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
  {/* Left-side: Please Note */}
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

  {/* Center: Diagram */}
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
        <g
          key={`resident-${i}`}
          transform={`translate(${pos.x}, ${pos.y})`}
        >
          <circle
            cx="0"
            cy="0"
            r={personRadius}
            fill="#22c55e"
            opacity="0.85"
          />
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
          <circle
            cx="0"
            cy="0"
            r={personRadius}
            fill="#ef4444"
            opacity="0.85"
          />
          <g transform={`scale(${iconScale}) translate(-224, -256)`}>
            <path d={personIconPath} fill="white" />
          </g>
        </g>
      ))}
    </svg>
  </div>

  {/* Right-side: Max people */}
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
          {labels.roomArea || 'Room area'}:{' '}
          <span className="font-medium">
            {Number.isFinite(meta.roomArea) ? meta.roomArea.toFixed(1) : meta.roomArea} m²
          </span>
        </div>
        <div>
          {labels.usableArea || 'Usable area (packing)'}:{' '}
          <span className="font-medium">{meta.usablePercent}%</span>
        </div>
        <div>
          {labels.socialDistance || 'Social distance'}:{' '}
          <span className="font-medium">{socialDistance} m</span>
        </div>
      </div>
    </div>
  )}
</div>
            </div>
        </div>
    );
};
export default SpacingDiagram;