import React, { useMemo, useRef, useEffect, useCallback } from 'react';

const PERSON_VISUAL_SCALE = 0.5;
const FINE_GRID_STEP_SCALE = 0.5;
export const LAYOUT_GRID_STEP_SCALE = FINE_GRID_STEP_SCALE;
const RESIDENT_DISTANCE_MULTIPLIERS = [1.8, 1.5, 1.25, 1.1, 1.0];
const EMPLOYEE_MIN_ACTIVE_SPEED_FACTOR = 0.05;
const EMPLOYEE_SPEED_NUDGE_FACTOR = 0.12;

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

const EMPLOYEE_SPEED_MULTIPLIER = 2.4;
const FORCE_CAP_MULTIPLIER = 2.2;
const SEPARATION_ITERATIONS = 5; // Increased for more stable collision resolution
const EMPLOYEE_RESIDENT_GAP_MULTIPLIER = 1.08;
const EMPLOYEE_EMPLOYEE_GAP_MULTIPLIER = 1.02;
/* -------------------------- Spacing Diagram + Physics ------------------------- */

const SpacingDiagram = ({ shape, dims, people, socialDistance, color, meta, visualizationTitle, labels = {}, noteBox = null }) => {
    const animationFrameId = useRef(null);
    const nodeRefs = useRef([]);
    const particlesRef = useRef([]);
    const startTimeRef = useRef(null);

    const occupancyRadius = socialDistance ? socialDistance / 2 : 0;
    const personRadius = occupancyRadius * PERSON_VISUAL_SCALE;
    const personIconPath =
    "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z\";";
    const iconScale = (personRadius * 1) / 512;
    
    const employeeMinClearance = useMemo(() => {
        // Clearance is now based on the visual radius of the circles to prevent initial overlap
        // and allow employees to be placed closer to residents.
        return personRadius > 0 ? personRadius * 2 * EMPLOYEE_RESIDENT_GAP_MULTIPLIER : 0;
    }, [personRadius]);

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
        } catch (error) {
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
                    if (candidate.length === targetCount) {
                        break;
                    }
                }
            }
            return candidate;
        };

        const attemptSelection = (source) => {
            let best = [];
            for (const multiplier of RESIDENT_DISTANCE_MULTIPLIERS) {
                const minDistance = Math.max((socialDistance || 0) * multiplier, socialDistance || 0);
                const candidate = buildSelection(source, minDistance);
                if (candidate.length === targetCount) {
                    return candidate;
                }
                if (candidate.length > best.length) {
                    best = candidate;
                }
            }
            return best;
        };

        const shuffledSelection = attemptSelection(shuffledPositions);
        if (shuffledSelection.length === targetCount) {
            return shuffledSelection;
        }

        const orderedPositions = [...basePool].sort((a, b) => (a.x - b.x) || (a.y - b.y));
        const orderedSelection = attemptSelection(orderedPositions);
        if (orderedSelection.length === targetCount) {
            return orderedSelection;
        }

        return shuffledSelection.length >= orderedSelection.length ? shuffledSelection : orderedSelection;
    }, [people, layoutPositions, theoreticalResidentPositions, residentCount, socialDistance]);

    const employeeDescriptors = useMemo(() => {
        return Array.from({ length: employeeCount }, () => 'employee');
    }, [employeeCount]);

    const { viewBoxWidth, viewBoxHeight, wallElement, floorElement, isInsideShape } = useMemo(() => {
        let viewBoxWidth = 10, viewBoxHeight = 10;
        let wallElement, floorElement, isInsideShape;
        const wallThickness = 0.5;
        // Use personRadius for margin so circles can move to the visual edge of the shape
        const margin = personRadius || 0;

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

    const isClearOfResidents = useCallback((x, y, minDistance) => {
        const clearance = Math.max(minDistance ?? 0, personRadius * 2);
        for (const pos of residentPositions) {
            if (Math.hypot(x - pos.x, y - pos.y) < clearance) {
                return false;
            }
        }
        return true;
    }, [residentPositions, personRadius]);

    const randomPointInside = useCallback((minClearance) => {
        if (!isInsideShape || !Number.isFinite(viewBoxWidth) || !Number.isFinite(viewBoxHeight)) {
            return { x: 0, y: 0 };
        }
        const margin = personRadius || 0;
        for (let attempt = 0; attempt < 200; attempt++) {
            const rx = margin + Math.random() * Math.max(0.0001, viewBoxWidth - 2 * margin);
            const ry = margin + Math.random() * Math.max(0.0001, viewBoxHeight - 2 * margin);
            if (isInsideShape(rx, ry) && isClearOfResidents(rx, ry, minClearance)) {
                return { x: rx, y: ry };
            }
        }
        return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
    }, [isInsideShape, viewBoxWidth, viewBoxHeight, personRadius, isClearOfResidents]);

    const assignNewTarget = useCallback((particle) => {
        const clearance = Math.max(employeeMinClearance, (socialDistance || 0) * EMPLOYEE_RESIDENT_GAP_MULTIPLIER);
        const destination = randomPointInside(clearance);
        particle.targetX = destination.x;
        particle.targetY = destination.y;
        particle.targetTimer = 0.9 + Math.random() * 1.8;
    }, [randomPointInside, employeeMinClearance, socialDistance]);

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
    if (!Number.isFinite(desired) || desired <= 0) {
        return;
    }
    const kClose = 0.18;
    const kFar = 0.035;
    const farRange = desired * 3.5;
    const residentDamping = 0.92;
    const employeeDamping = 0.93;
    const boundaryBounceRetention = 0.72;
    const timeScale = 1.05;
    const forceCap = desired * FORCE_CAP_MULTIPLIER;
    
    // Contact distances are now based on the visual radius to prevent visual overlap
    const employeeContactDistance = personRadius * 2 * EMPLOYEE_EMPLOYEE_GAP_MULTIPLIER;
    const residentContactDistance = personRadius * 2 * EMPLOYEE_RESIDENT_GAP_MULTIPLIER;

    for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        let fx = 0, fy = 0;
        for (let j = 0; j < pts.length; j++) {
            if (i === j) continue;
            const p2 = pts[j];
            const dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.hypot(dx, dy) || 1e-6, ux = dx / dist, uy = dy / dist;
            if (dist < employeeContactDistance) {
                const overlap = employeeContactDistance - dist;
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
            if (dist < residentContactDistance) {
                const overlap = residentContactDistance - dist;
                const residentRepulsion = 2.1;
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

        const targetPull = desired * (p1.type === 'employee' ? 0.55 : 0.42);
        if (targetDist > 1e-4) {
            const eased = Math.min(targetDist, desired * 1.6) / Math.max(targetDist, 1e-4);
            fx += toTargetX * eased * targetPull;
            fy += toTargetY * eased * targetPull;
        }

        const wanderFreq = p1.type === 'employee' ? 1.0 : 0.72;
        const wanderStrength = desired * (p1.type === 'employee' ? 0.26 : 0.14);
        p1.px += dt * wanderFreq;
        p1.py += dt * (wanderFreq * 0.77);
        fx += Math.cos(p1.px) * wanderStrength;
        fy += Math.sin(p1.py) * wanderStrength;

        const forceMag = Math.hypot(fx, fy);
        if (forceMag > forceCap && forceMag > 1e-9) {
            const scale = forceCap / forceMag;
            fx *= scale;
            fy *= scale;
        }
        const multiplier = p1.type === 'employee' ? EMPLOYEE_SPEED_MULTIPLIER : 1;
        const damping = p1.type === 'employee' ? employeeDamping : residentDamping;
        p1.vx = (p1.vx + fx * timeScale * multiplier * dt) * damping;
        p1.vy = (p1.vy + fy * timeScale * multiplier * dt) * damping;

        const maxSpeed = socialDistance * 2.4;
        let speed = Math.hypot(p1.vx, p1.vy);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            p1.vx *= scale;
            p1.vy *= scale;
            speed = Math.hypot(p1.vx, p1.vy);
        }

        if (p1.type === 'employee' && speed < desired * EMPLOYEE_MIN_ACTIVE_SPEED_FACTOR) {
            const angle = Math.atan2(p1.targetY - p1.y, p1.targetX - p1.x) || 0;
            p1.vx += Math.cos(angle) * desired * EMPLOYEE_SPEED_NUDGE_FACTOR * dt;
            p1.vy += Math.sin(angle) * desired * EMPLOYEE_SPEED_NUDGE_FACTOR * dt;
            speed = Math.hypot(p1.vx, p1.vy);
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

    // --- START: Improved Collision Resolution ---
    // This logic ensures circles do not overlap, handling collisions with other moving circles,
    // static circles, and the boundaries of the shape.
    for (let it = 0; it < SEPARATION_ITERATIONS; it++) {
        // Resolve collisions between moving red circles
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const a = pts[i], b = pts[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy) || 1e-6;

                if (dist < employeeContactDistance) {
                    const overlap = (employeeContactDistance - dist) * 0.5;
                    const ux = dx / dist, uy = dy / dist;
                    const ax_new = a.x - ux * overlap, ay_new = a.y - uy * overlap;
                    const bx_new = b.x + ux * overlap, by_new = b.y + uy * overlap;

                    const a_can_move = isInsideShape(ax_new, ay_new);
                    const b_can_move = isInsideShape(bx_new, by_new);

                    if (a_can_move && b_can_move) {
                        a.x = ax_new; a.y = ay_new;
                        b.x = bx_new; b.y = by_new;
                    } else if (a_can_move) {
                        // If b is blocked (e.g., by a wall), 'a' takes the full correction
                        const { point } = projectInside({ x: a.x, y: a.y }, { x: a.x - ux * overlap * 2, y: a.y - uy * overlap * 2 });
                        a.x = point.x; a.y = point.y;
                    } else if (b_can_move) {
                        // If a is blocked, 'b' takes the full correction
                        const { point } = projectInside({ x: b.x, y: b.y }, { x: b.x + ux * overlap * 2, y: b.y + uy * overlap * 2 });
                        b.x = point.x; b.y = point.y;
                    }
                }
            }
        }

        // Resolve collisions between moving red circles and static green circles
        for (let i = 0; i < pts.length; i++) {
            const particle = pts[i];
            for (const resident of residentPositions) {
                const dx = particle.x - resident.x;
                const dy = particle.y - resident.y;
                const dist = Math.hypot(dx, dy) || 1e-6;

                if (dist < residentContactDistance) {
                    const overlap = residentContactDistance - dist;
                    const ux = dx / dist;
                    const uy = dy / dist;
                    const newX = particle.x + ux * overlap;
                    const newY = particle.y + uy * overlap;

                    if (isInsideShape(newX, newY)) {
                        particle.x = newX;
                        particle.y = newY;
                    } else {
                        // If pushed outside the shape, project back to the boundary
                        const { point } = projectInside({ x: particle.x, y: particle.y }, { x: newX, y: newY });
                        particle.x = point.x;
                        particle.y = point.y;
                    }
                }
            }
        }
    }
    // --- END: Improved Collision Resolution ---
}, [isInsideShape, socialDistance, projectInside, assignNewTarget, residentPositions, personRadius]);

    useEffect(() => {
        if (!dims || !isInsideShape || !viewBoxWidth || !viewBoxHeight) return;
        
        // Red circles (employees) are now placed randomly, not on a grid.
        particlesRef.current = employeeDescriptors.map((descriptor, i) => {
            const basePosition = randomPointInside(employeeMinClearance);

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

    }, [shape, dims, people, socialDistance, isInsideShape, viewBoxWidth, viewBoxHeight, stepPhysics, drawFrame, employeeDescriptors, employeeMinClearance, randomPointInside, assignNewTarget, residentPositions]);

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

