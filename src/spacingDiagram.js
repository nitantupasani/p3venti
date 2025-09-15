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


/* -------------------------- Spacing Diagram + Physics ------------------------- */
const SpacingDiagram = ({ shape, dims, people, socialDistance, color, meta, visualizationTitle, labels = {} }) => {
    const animationFrameId = useRef(null);
    const nodeRefs = useRef([]);
    const particlesRef = useRef([]);
    const startTimeRef = useRef(null);

    const personRadius = socialDistance / 2;
    const personIconPath =
    "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z";
    const iconScale = (personRadius * 1) / 512;

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
        const desired = socialDistance, kClose = 0.18, kFar = 0.06, farRange = desired * 4, damping = 0.88, timeScale = 1.5;
        for (let i = 0; i < pts.length; i++) {
            const p1 = pts[i];
            let fx = 0, fy = 0;
            for (let j = 0; j < pts.length; j++) {
                if (i === j) continue;
                const p2 = pts[j];
                const dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.hypot(dx, dy) || 1e-6, ux = dx / dist, uy = dy / dist;
                if (dist < desired) {
                    const overlap = desired - dist;
                    fx += ux * (kClose * overlap); fy += uy * (kClose * overlap);
                } else if (dist < farRange) {
                    const s = 1 - (dist - desired) / (farRange - desired);
                    fx += ux * (kFar * s * s / (dist * dist)); fy += uy * (kFar * s * s / (dist * dist));
                }
            }
            
            p1.vx = (p1.vx + fx * timeScale) * damping;
            p1.vy = (p1.vy + fy * timeScale) * damping;

            let nx = p1.x + p1.vx * dt;
            let ny = p1.y + p1.vy * dt;

            if (!isInsideShape(nx, ny)) {
                if (isInsideShape(nx, p1.y)) {
                    ny = p1.y;
                    p1.vy *= -0.5;
                } 
                else if (isInsideShape(p1.x, ny)) {
                    nx = p1.x;
                    p1.vx *= -0.5;
                } 
                else {
                    nx = p1.x;
                    ny = p1.y;
                    p1.vx *= -0.5;
                    p1.vy *= -0.5;
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
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shape, isInsideShape, socialDistance, viewBoxWidth, viewBoxHeight, dims]);

    useEffect(() => {
        if (!dims || !isInsideShape || !viewBoxWidth || !viewBoxHeight) return;
        const jitter = socialDistance * 0.05;
        particlesRef.current = people.map((pos, i) => ({
            id: i, x: pos.x + (Math.random() - 0.5) * jitter, y: pos.y + (Math.random() - 0.5) * jitter,
            vx: (Math.random() - 0.5) * 0.02, vy: (Math.random() - 0.5) * 0.02,
            px: Math.random() * Math.PI * 2, py: Math.random() * Math.PI * 2,
        }));
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
    }, [shape, dims, people, socialDistance, isInsideShape, viewBoxWidth, viewBoxHeight, stepPhysics, drawFrame]);

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
                <div className="diagram-row flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mx-auto">
                    <div className="svg-wrap">
                        <svg className="w-full h-auto overflow-visible" viewBox={`${-padding} ${-padding} ${viewBoxWidth + 2 * padding} ${viewBoxHeight + 2 * padding}`} preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <pattern id="floorPattern" patternUnits="userSpaceOnUse" width="1" height="1">
                                    <rect width="1" height="1" fill="#f3f0e8" />
                                    <path d="M -0.25,0.25 L 0.25, -0.25 M 0.75,-0.25 L 1.25,0.25 M -0.25,0.75 L 0.25,0.25 M 0.75,0.25 L 1.25,0.75" stroke="#dcd6c8" strokeWidth="0.04" />
                                </pattern>
                            </defs>
                            {wallElement}
                            {floorElement}
                            {people.map((_, i) => (
                                <g key={i} ref={(el) => { nodeRefs.current[i] = el; }} transform="translate(-1000,-1000)">
                                    <circle cx="0" cy="0" r={personRadius} fill="#22c55e" opacity="0.85" />
                                    <g transform={`scale(${iconScale}) translate(-224, -256)`}>
                                        <path d={personIconPath} fill="white" />
                                    </g>
                                </g>
                            ))}
                        </svg>
                    </div>
                    {meta && (
                        <div className="caption-box bg-slate-50 border border-slate-300 rounded-md p-4 md:self-center">
                            <div className="text-slate-900 font-bold text-xl leading-tight">{labels.maxPeople || 'Max people'}: {meta.capacityMax}</div>
                            <div className="text-slate-600 text-sm mt-1">{meta.limiting === 'ventilation' ? (labels.ventilationLimited || 'Ventilation-limited') : (labels.geometryLimited || 'Geometry-limited')}</div>
                            <div className="h-px bg-slate-200 my-3" />
                            <div className="space-y-1.5 text-slate-700 text-sm">
                                <div>{labels.roomArea || 'Room area'}: <span className="font-medium">{Number.isFinite(meta.roomArea) ? meta.roomArea.toFixed(1) : meta.roomArea} m²</span></div>
                                <div>{labels.usableArea || 'Usable area (packing)'}: <span className="font-medium">{meta.usablePercent}%</span></div>
                                <div>{labels.socialDistance || 'Social distance'}: <span className="font-medium">{socialDistance} m</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SpacingDiagram;