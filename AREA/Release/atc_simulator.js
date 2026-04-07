const _canvas = document.getElementById('radarcanvas');
// ── CONSTANTS ──────────────────────────────────────────────────────────────
const ZOOM_MIN = 1, ZOOM_MAX = 100;
let gridSize = 10, offsetX = 0, offsetY = 0, isDragging = false, lastMouseX = 0, lastMouseY = 0, lastTouchDist = null;
let globalSpdMode = 'MACH'; // 'MACH' or 'IAS'
const FONT = '13px monospace';
const LINE_H = 14;
const MAGVAR = -3;
const MAX_AC = 50;
let initialScenarioSnapshot = null;

// Terminal Circumcircle through MAPLE, CYBER, SONNY
// Centre: (-4.512, 145.488) NM  |  Radius: 86.07 NM
const TMarc_centreNM = { x: -4.512, y: 145.488 };
const TMarc_radiusNM = 86.068;

// Aicraft Performance
const AC_PERF = {
	//          climbRt  crClRt  desRt   climbMach descMach cruiseMach maxMach  crossAlt climbIAS desIAS turnRate
	B737: { climbRt: 2200, cruiseClimbRt: 1400, descentRt: 1800, climbMach: 0.76, descMach: 0.76, cruiseMach: 0.785, maxMach: 0.82, climbIAS: 280, descentIAS: 280 },
	B738: { climbRt: 2500, cruiseClimbRt: 1500, descentRt: 1800, climbMach: 0.76, descMach: 0.76, cruiseMach: 0.785, maxMach: 0.82, climbIAS: 280, descentIAS: 280 },
	B39M: { climbRt: 2500, cruiseClimbRt: 1500, descentRt: 1800, climbMach: 0.77, descMach: 0.77, cruiseMach: 0.790, maxMach: 0.825, climbIAS: 280, descentIAS: 280 },
	B38M: { climbRt: 2500, cruiseClimbRt: 1500, descentRt: 1800, climbMach: 0.77, descMach: 0.77, cruiseMach: 0.790, maxMach: 0.825, climbIAS: 280, descentIAS: 280 },
	A319: { climbRt: 2200, cruiseClimbRt: 1400, descentRt: 1800, climbMach: 0.75, descMach: 0.75, cruiseMach: 0.780, maxMach: 0.82, climbIAS: 275, descentIAS: 275 },
	A320: { climbRt: 2300, cruiseClimbRt: 1500, descentRt: 1800, climbMach: 0.75, descMach: 0.75, cruiseMach: 0.780, maxMach: 0.82, climbIAS: 278, descentIAS: 278 },
	A20N: { climbRt: 2400, cruiseClimbRt: 1500, descentRt: 1800, climbMach: 0.76, descMach: 0.76, cruiseMach: 0.780, maxMach: 0.82, climbIAS: 278, descentIAS: 278 },
	A321: { climbRt: 2200, cruiseClimbRt: 1400, descentRt: 1700, climbMach: 0.76, descMach: 0.76, cruiseMach: 0.780, maxMach: 0.82, climbIAS: 280, descentIAS: 280 },
	A21N: { climbRt: 2300, cruiseClimbRt: 1500, descentRt: 1700, climbMach: 0.76, descMach: 0.76, cruiseMach: 0.780, maxMach: 0.82, climbIAS: 280, descentIAS: 280 },
	A333: { climbRt: 1800, cruiseClimbRt: 1200, descentRt: 1500, climbMach: 0.80, descMach: 0.80, cruiseMach: 0.820, maxMach: 0.86, climbIAS: 290, descentIAS: 290 },
	A339: { climbRt: 1900, cruiseClimbRt: 1300, descentRt: 1500, climbMach: 0.80, descMach: 0.80, cruiseMach: 0.820, maxMach: 0.86, climbIAS: 290, descentIAS: 290 },
	B788: { climbRt: 2000, cruiseClimbRt: 1400, descentRt: 1600, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.850, maxMach: 0.90, climbIAS: 290, descentIAS: 290 },
	B78X: { climbRt: 2000, cruiseClimbRt: 1400, descentRt: 1600, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.850, maxMach: 0.90, climbIAS: 290, descentIAS: 290 },
	B789: { climbRt: 2000, cruiseClimbRt: 1400, descentRt: 1600, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.850, maxMach: 0.90, climbIAS: 290, descentIAS: 290 },
	B77W: { climbRt: 1800, cruiseClimbRt: 1200, descentRt: 1400, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.840, maxMach: 0.89, climbIAS: 290, descentIAS: 290 },
	B77L: { climbRt: 1700, cruiseClimbRt: 1100, descentRt: 1400, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.840, maxMach: 0.89, climbIAS: 290, descentIAS: 290 },
	B773: { climbRt: 1800, cruiseClimbRt: 1200, descentRt: 1400, climbMach: 0.82, descMach: 0.84, cruiseMach: 0.840, maxMach: 0.89, climbIAS: 300, descentIAS: 300 },
	B762: { climbRt: 2500, cruiseClimbRt: 1400, descentRt: 1600, climbMach: 0.78, descMach: 0.78, cruiseMach: 0.800, maxMach: 0.84, climbIAS: 290, descentIAS: 290 },
	B748: { climbRt: 1600, cruiseClimbRt: 1000, descentRt: 1300, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.855, maxMach: 0.90, climbIAS: 290, descentIAS: 290 },
	B744: { climbRt: 1600, cruiseClimbRt: 1000, descentRt: 1300, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.845, maxMach: 0.89, climbIAS: 290, descentIAS: 290 },
	A359: { climbRt: 2000, cruiseClimbRt: 1400, descentRt: 1500, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.850, maxMach: 0.89, climbIAS: 290, descentIAS: 290 },
	A35K: { climbRt: 1900, cruiseClimbRt: 1300, descentRt: 1500, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.850, maxMach: 0.89, climbIAS: 290, descentIAS: 290 },
	A388: { climbRt: 1400, cruiseClimbRt: 900, descentRt: 1200, climbMach: 0.82, descMach: 0.82, cruiseMach: 0.850, maxMach: 0.89, climbIAS: 285, descentIAS: 285 },
};
const AC_PERF_DEFAULT = { climbRt: 1800, cruiseClimbRt: 1200, descentRt: 1500, climbMach: 0.78, descMach: 0.78, cruiseMach: 0.82, maxMach: 0.86, climbIAS: 280, descentIAS: 280 };
function getPerf(type) { return AC_PERF[type] ?? AC_PERF_DEFAULT; }

// Returns turn rate in °/sec given current TAS
// Rule: Rate One (3°/sec) or 25° bank, whichever is LESS
function calcTurnRate(tas) {
	const rateOne = 3;                          // °/sec
	const bankAngleDeg = 25;
	const rate25bank = 1091 * Math.tan(bankAngleDeg * Math.PI / 180) / tas;
	return Math.min(rateOne, rate25bank);             // lesser of the two
}

// Returns delay in seconds before instruction takes effect
function pilotDelay(instrType, altFt) {
	// Base delays by instruction type (seconds)
	const BASE = {
		HDG: 8,    // quickest — just roll in bank
		SPD: 10,    // moderate — power/thrust adjustment
		FL: 12,    // slowest  — checklist, pressurisation, FMS
	};

	// Altitude factor: <100 = 1.0x, 100-150 = 1.1x ..., >350 = 2.2x
	const altFactor = altFt > 35000 ? 2.2
		: altFt > 30000 ? 1.6
			: altFt > 25000 ? 1.3
				: altFt > 15000 ? 1.2
					: altFt > 10000 ? 1.1
						: 1.0;

	// Random spread: ±40% of base × altFactor
	const mean = BASE[instrType] * altFactor;
	const spread = mean * 0.4;
	const delay = mean + (Math.random() * 2 - 1) * spread;

	return Math.round(Math.max(2, delay));   // minimum 2 seconds
}

function cancelPendingType(ac, type) {
	ac.pendingInstrs = ac.pendingInstrs.filter(p => p.type !== type);
}

// CRte / Mod CRte state
let crteAcId = null;   // ac.id whose CRte is displayed
let CrteRouteHideTimer = null;
let modCrteAcId = null;   // ac.id in Mod CRte mode (waiting for right-click)
let modCrtePopupEl = null;   // the mod-crte waypoint-list popup element
let modCrteRouteHideTimer = null;
let modCrtePreviewRoute = null;   // { acId, route[] } — shown immediately after WP click

let _lastMidX = 0, _lastMidY = 0, _lastScale = 1, _lastW = 0, _lastH = 0;

// ── PHYSICS TICK (runs every 1 second) ───────────────────────────────────
function physicsTick() {
	simTimeSec++;
	updateSimClock();

	aircraft.forEach(ac => {
		// Appear time check
		if (!ac.active) {
			if (ac.appearTime === null || simTimeSec >= ac.appearTime) ac.active = true;
			else return;
		}

		// ── PENDING INSTRUCTIONS (pilot delay) ──────────────────────────
		ac.pendingInstrs = ac.pendingInstrs.filter(p => {
			if (simTimeSec >= p.triggerTime) {
				p.apply();      // execute the instruction
				return false;   // remove from queue
			}
			return true;        // keep waiting
		});

		const perf = getPerf(ac.type);
		const dt = 1; // seconds

		// ── HEADING (turn logic) ──────────────────────────────────────
		if (ac.targetHdg !== null) {
			const diff = ((ac.targetHdg - ac.hdg + 540) % 360) - 180;
			const step = calcTurnRate(ac.gs) * dt;
			if (Math.abs(diff) <= step) {
				ac.hdg = ac.targetHdg;
				ac.targetHdg = null;
			} else {
				ac.hdg = (ac.hdg + Math.sign(diff) * step + 360) % 360;
			}
		}

		// ── NAVIGATION MODE ──────────────────────────────────────────
		if (ac.navMode === 'RTE' && ac.route.length > 0) {
			trackToWaypoint(ac, ac.route[0], perf);
		} else if (ac.navMode === 'DIRECT' && ac.directWp) {
			const arrived = trackToWaypoint(ac, ac.directWp, perf);
			if (arrived) { ac.directWp = null; ac.navMode = 'HDG'; }
		}

		// ALTITUDE: climb / descend, with level-constraint support
		if (ac.altFt !== ac.targetAltFt) {
			const climbing = ac.targetAltFt > ac.altFt;
			let rateFpm;

			if (climbing) {
				rateFpm = ac.altFt > ac.xover ? perf.cruiseClimbRt : perf.climbRt;
			} else {
				// base descent rate
				rateFpm = perf.descentRt;

				// Level-constraint logic for descent
				if (ac.lcActive && ac.lcWp && ac.lcTargetAltFt != null) {
					const est = estimateTimeToWaypoint(ac, ac.lcWp);
					if (est && est.tSec > 0) {
						const deltaFt = ac.altFt - ac.lcTargetAltFt; // positive if above target
						if (deltaFt > 0) {
							const reqVsFpm = deltaFt / (est.tSec / 60); // ft/min needed
							ac.lcReqVsFpm = reqVsFpm;

							// If required VS is greater than typical, increase rate
							if (reqVsFpm > perf.descentRt) {
								rateFpm = reqVsFpm * 1.1; // 1.1x buffer for possible delay
							}
						}
					}
				}
			}

			const dt = 1; // existing physicsTick uses dt = 1 second
			const step = rateFpm / 60 * dt; // ft per tick

			if (Math.abs(ac.targetAltFt - ac.altFt) <= step) {
				ac.altFt = ac.targetAltFt;
				ac.fl = altFtToFl(ac.altFt);

				// Deactivate constraint as soon as level at cleared FL
				ac.lcActive = false;
				ac.lcWp = null;
				ac.lcTargetAltFt = null;
				ac.lcReqVsFpm = null;
				ac.lcIndex = null;
			} else {
				ac.altFt += climbing ? step : -step;
				ac.fl = altFtToFl(ac.altFt);
			}
		}

		// CFL display — clear after 20 sec of maintaining level
		if (ac.cflDisplay) {
			if (ac.cflApplied && Math.abs(ac.altFt - ac.targetAltFt) < 50) {
				// Aircraft is level AND instruction has been actioned — start countdown
				ac.cflSteadyCount = (ac.cflSteadyCount ?? 0) + 1;
				if (ac.cflSteadyCount >= 20) {
					ac.cflDisplay = null;
					ac.cflApplied = false;
					ac.cflSteadyCount = 0;
				}
			} else {
				// Still in pilot delay, or still climbing/descending — reset counter
				ac.cflSteadyCount = 0;
			}
		}

		// ── SPEED ─────────────────────────────────────────────────────────────
		const targetGs = ac.targetGs !== null ? ac.targetGs : autoGs(ac, perf);
		const gsDiff = targetGs - ac.gs;
		const gsStep = 2;
		if (Math.abs(gsDiff) <= gsStep) {
			ac.gs = targetGs;
			if (ac.targetGs !== null && Math.abs(ac.gs - ac.targetGs) < 1) ac.targetGs = null;
		} else {
			ac.gs += Math.sign(gsDiff) * gsStep;
		}

		// ── POSITION ─────────────────────────────────────────────────
		const r = Math.PI / 180;
		const distNM = ac.gs / 3600 * dt;
		const trueHdg = (ac.hdg + MAGVAR + 360) % 360;   // magnetic → true for geometry
		ac.x += distNM * Math.sin(trueHdg * r);
		ac.y += distNM * Math.cos(trueHdg * r);
		ac.x = parseFloat(ac.x.toFixed(3));
		ac.y = parseFloat(ac.y.toFixed(3));
	});

	// Refresh ATC status display for selected aircraft
	if (selectedAcId) updateAtcStatus();

	// Remove aircraft that have exited scope (>400 NM from centre)
	aircraft.forEach(ac => {
		if (ac.active && Math.hypot(ac.x, ac.y) > 400) removeAcById(ac.id);
	});

	refreshPanelIfSelected();
}

// ── RADAR SWEEP ──────────────────────────────────────────────────────────
function radarSweep() {
	aircraft.forEach(ac => {
		if (!ac.active) return;
		ac.trails.push({ x: ac.x, y: ac.y });
		if (ac.trails.length > MAX_TRAILS) ac.trails.shift();
	});
	draw();
	rebuildFdlState();
	renderFdlPanels();
}

function bearingBetweenWps(nameA, nameB) {
	const a = WAYPOINTS.find(w => w.name === nameA);
	const b = WAYPOINTS.find(w => w.name === nameB);
	if (!a || !b) return null;
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const trueBrg = ((Math.atan2(dx, dy) * 180 / Math.PI) + 360) % 360;
	return trueBrg;
}

function compass8FromBearing(brg) {
	if (brg == null) return '?';
	const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
	const idx = Math.round(brg / 45) % 8;
	return dirs[idx];
}

function arrowFromCompass8(dir) {
	switch (dir) {
		case 'N': return '↑';
		case 'NE': return '↗';
		case 'E': return '→';
		case 'SE': return '↘';
		case 'S': return '↓';
		case 'SW': return '↙';
		case 'W': return '←';
		case 'NW': return '↖';
		default: return '·';
	}
}

function classifyFlowAtWp(ac, fdlWpName) {
	if (!ac.route) return null;

	// For mid-route WPs (e.g. SULUX), handled separately below — no change needed
	const isMidRouteWp = !!FDL_MIDROUTE_WP[fdlWpName];

	const idxWp = ac.route.indexOf(fdlWpName);

	// For non-mid-route WPs: allow aircraft to remain on the FDL even after
	// passing the FDL waypoint, as long as they haven't passed their firExitWp yet.
	// idxWp === -1 means the WP was already passed (shifted off the route).
	if (!isMidRouteWp && idxWp === -1) {
		// Still show if: inbound aircraft who entered via this WP and hasn't
		// reached firExitWp yet
		const { firEntryWp, firExitWp } = ac;
		if (!firExitWp) return null;
		// firExitWp still in route → aircraft is post-entry-wp but pre-exit-wp
		if (!ac.route.includes(firExitWp)) return null;
		// Confirm this is actually the entry WP (so we know which FDL it belongs to)
		if (firEntryWp !== fdlWpName) return null;

		// Aircraft is between entryWp and exitWp — classify as inbound
		const origRoute = ac.originalRoute || ac.route;
		const wpObj = WAYPOINTS.find(w => w.name === fdlWpName);
		if (!wpObj) return null;
		const idxInOrig = origRoute.indexOf(fdlWpName);
		const prevWpName = idxInOrig > 0 ? origRoute[idxInOrig - 1] : null;
		const brg = prevWpName
			? bearingBetweenWps(prevWpName, fdlWpName)
			: (() => { const dx = wpObj.x - ac.x, dy = wpObj.y - ac.y; return Math.atan2(dx, dy) * 180 / Math.PI; })();
		const compass = compass8FromBearing(brg);
		const arrow = arrowFromCompass8(compass);
		// Use idxWp=999 so sorting works (treat as "already passed, low priority")
		return { inbound: true, outbound: false, compass, arrow, idxWp: 999 };
	}

	// Original guard for mid-route WPs or WPs still ahead in route
	if (!isMidRouteWp && idxWp === -1) return null;

	const { firEntryWp, firExitWp } = ac;

	// ── MID-ROUTE WAYPOINT OVERRIDE ──────────────────────────────────────
	// For wps that never appear as firEntryWp/firExitWp, classify by
	// checking what the aircraft's firExitWp is.
	const midCfg = FDL_MIDROUTE_WP[fdlWpName];
	if (midCfg) {
		const origRoute = ac.originalRoute || ac.route;

		let inbound = false, outbound = false;
		if (firExitWp && midCfg.outboundIfExitIs.includes(firExitWp)) outbound = true;
		else if (firExitWp && midCfg.inboundIfExitIs.includes(firExitWp)) inbound = true;
		else return null;

		// OUTBOUND: aircraft must actually have SULUX in its original route
		// AND must not have passed it yet
		if (outbound) {
			if (!origRoute.includes(fdlWpName)) return null;  // ← keep this for outbound
			if (idxWp === -1) return null;                    // already passed → hide
		}

		// INBOUND: aircraft passed SULUX heading toward firExitWp
		// origRoute check is SKIPPED — it may already be shifted off
		if (inbound) {
			// Aircraft must have actually routing through SULUX
			if (!origRoute.includes(fdlWpName)) return null;  // ← put it back, for BOTH cases
			// Still show until firExitWp is passed
			if (firExitWp && !ac.route.includes(firExitWp)) return null;
		}

		// Arrow direction
		const wpObj = WAYPOINTS.find(w => w.name === fdlWpName);
		if (!wpObj) return null;
		const idxInOrig = origRoute.indexOf(fdlWpName);
		const prevWpName = idxInOrig > 0 ? origRoute[idxInOrig - 1] : null;
		const nextWpName = idxInOrig < origRoute.length - 1 ? origRoute[idxInOrig + 1] : null;
		let brg;
		if (inbound) {
			brg = prevWpName
				? bearingBetweenWps(prevWpName, fdlWpName)
				: (() => { const dx = wpObj.x - ac.x, dy = wpObj.y - ac.y; return Math.atan2(dx, dy) * 180 / Math.PI; })();
		} else {
			brg = nextWpName
				? bearingBetweenWps(fdlWpName, nextWpName)
				: bearingBetweenWps(prevWpName ?? fdlWpName, fdlWpName);
		}
		const compass = compass8FromBearing(brg);
		const arrow = arrowFromCompass8(compass);
		return { inbound, outbound, compass, arrow, idxWp: idxWp === -1 ? 999 : idxWp };
	}
	// ── END MID-ROUTE OVERRIDE ────────────────────────────────────────────

	let inbound = false;
	let outbound = false;

	if (firEntryWp && firExitWp) {
		const idxEntry = ac.route.indexOf(firEntryWp);
		const idxExit = ac.route.indexOf(firExitWp);

		if (idxEntry === -1 && idxExit === -1) {
			// Both stripped — past everything, assume outbound
			outbound = true;

		} else if (idxEntry === -1) {
			// Entry already passed — stay inbound until exit wp is also passed
			inbound = idxWp < idxExit;
			outbound = idxWp >= idxExit;

		} else if (idxExit === -1) {
			// Exit already passed — fully outbound
			outbound = true;

		} else {
			// Both still in route — classify by position relative to entry
			inbound = idxWp <= idxEntry;
			outbound = idxWp > idxEntry;
		}
	} else if (firExitWp) {
		const idxExit = ac.route.indexOf(firExitWp);
		outbound = (idxExit === -1) || (idxWp >= idxExit);
		inbound = !outbound;
	} else if (firEntryWp) {
		const idxEntry = ac.route.indexOf(firEntryWp);
		inbound = (idxEntry !== -1) && (idxWp <= idxEntry);
		outbound = !inbound;
	} else {
		// No FIR context — can't classify
		return null;
	}

	if (!inbound && !outbound) return null;

	// Arrow direction
	let brg;
	if (inbound) {
		// Bearing toward the FDL waypoint from the previous wp (or ac position)
		const prevWp = idxWp > 0 ? ac.route[idxWp - 1] : null;
		if (prevWp) {
			brg = bearingBetweenWps(prevWp, fdlWpName);
		} else {
			const wp = WAYPOINTS.find(w => w.name === fdlWpName);
			if (!wp) return null;
			const dx = wp.x - ac.x, dy = wp.y - ac.y;
			brg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
		}
	} else {
		// Bearing away from FDL waypoint toward next wp
		const nextWp = (idxWp + 1 < ac.route.length) ? ac.route[idxWp + 1] : null;
		if (nextWp) {
			brg = bearingBetweenWps(fdlWpName, nextWp);
		} else {
			brg = bearingBetweenWps(
				idxWp > 0 ? ac.route[idxWp - 1] : fdlWpName,
				fdlWpName
			);
		}
	}

	const compass = compass8FromBearing(brg);
	const arrow = arrowFromCompass8(compass);
	return { inbound, outbound, compass, arrow, idxWp };
}

function trackToWaypoint(ac, wpName, perf) {
	const wp = WAYPOINTS.find(w => w.name === wpName);
	if (!wp) { ac.route.shift(); return false; }

	const dx = wp.x - ac.x;
	const dy = wp.y - ac.y;
	const dist = Math.hypot(dx, dy);

	// ── Compute outbound track (to next waypoint in route) ───────────
	let outboundTrack = null;
	if (ac.navMode === 'RTE' && ac.route.length >= 2) {
		const nextWp = WAYPOINTS.find(w => w.name === ac.route[1]);
		if (nextWp) {
			const nx = nextWp.x - wp.x;
			const ny = nextWp.y - wp.y;
			const trueOut = ((Math.atan2(nx, ny) * 180 / Math.PI) + 360) % 360;
			outboundTrack = (trueOut - MAGVAR + 360) % 360;
		}
	}

	// ── Initialise inbound track (magnetic) on first tick ───────────
	if (ac.inboundTrack == null) {
		const trueBearing = ((Math.atan2(dx, dy) * 180 / Math.PI) + 360) % 360;
		ac.inboundTrack = (trueBearing - MAGVAR + 360) % 360;
		ac.inboundSettled = false;   // ← NEW: reset settled flag on new leg
	}

	// ── Turn rate and radius ─────────────────────────────────────────
	const turnRate = calcTurnRate(ac.gs);
	const turnRadius = ac.gs / (3600 * turnRate * Math.PI / 180);

	// ── Shared XTE + settled logic (used in both branches) ──────────
	function getXteDesiredHdg() {
		const trueInboundRad = ((ac.inboundTrack + MAGVAR + 360) % 360) * Math.PI / 180;
		const xteNM = -dx * Math.cos(trueInboundRad) + dy * Math.sin(trueInboundRad);
		const hdgError = Math.abs(((ac.inboundTrack - ac.hdg + 540) % 360) - 180);

		// ── NEW: one-time re-snap after turn completes ───────────────
		if (!ac.inboundSettled && hdgError < 1.0) {
			const trueBearingNow = ((Math.atan2(dx, dy) * 180 / Math.PI) + 360) % 360;
			ac.inboundTrack = (trueBearingNow - MAGVAR + 360) % 360;
			ac.inboundSettled = true;
		}

		// ── NEW: suppress XTE correction while still turning ────────
		const xteGain = ac.inboundSettled ? 30 : 0;
		const correction = Math.max(-45, Math.min(45, -xteNM * xteGain));
		const desired = (ac.inboundTrack + correction + 360) % 360;

		return desired;
	}

	// ── Lead turn branch ─────────────────────────────────────────────
	let desiredHdg;
	if (outboundTrack != null) {
		const turnAngle = ((outboundTrack - ac.inboundTrack + 540) % 360) - 180;
		const leadDist = Math.abs(
			turnRadius * Math.tan((Math.abs(turnAngle) / 2) * Math.PI / 180)
		);

		if (dist <= leadDist + 0.5) {
			// Within lead turn zone: target outbound track
			desiredHdg = outboundTrack;

			// Waypoint passage check
			const trueInboundRad = ((ac.inboundTrack + MAGVAR + 360) % 360) * Math.PI / 180;
			const alongTrack = dx * Math.sin(trueInboundRad) + dy * Math.cos(trueInboundRad);
			if (alongTrack <= 0) {
				if (ac.navMode === 'RTE') {
					ac.route.shift();
					ac.inboundTrack = outboundTrack;
					ac.inboundSettled = false;   // ← NEW: reset for next leg
				}
				return true;
			}
		} else {
			// Normal tracking
			desiredHdg = getXteDesiredHdg();
		}
	} else {
		// No next waypoint — last wp or DIRECT
		if (dist < 2) {
			if (ac.navMode === 'RTE') {
				ac.route.shift();
				ac.inboundTrack = null;
				ac.inboundSettled = false;   // ← NEW: reset for next leg
			}
			return true;
		}
		desiredHdg = getXteDesiredHdg();
	}

	// ── Apply turn rate ──────────────────────────────────────────────
	const diff = ((desiredHdg - ac.hdg + 540) % 360) - 180;
	const step = turnRate;
	ac.hdg = (Math.abs(diff) <= step)
		? desiredHdg
		: ((ac.hdg + Math.sign(diff) * step) + 360) % 360;

	return false;
}

function estimateTimeToWaypoint(ac, wpName) {
	const wp = WAYPOINTS.find(w => w.name === wpName);
	if (!wp) return null;

	const dx = wp.x - ac.x;
	const dy = wp.y - ac.y;
	const distNM = Math.hypot(dx, dy);
	if (distNM < 1e-3) return { distNM: 0, tSec: 0 };

	const gs = Math.max(ac.gs, 120);  // avoid zero
	const tSec = distNM / gs * 3600;
	return { distNM, tSec };
}

function estimateSimUtcAtWp(ac, wpName) {
	const est = estimateTimeToWaypoint(ac, wpName); // { distNM, tSec }
	if (!est) return null;
	const simUtc = getSimUtcMs();
	if (simUtc == null) return null;
	return simUtc + est.tSec * 1000;
}

function autoGs(ac, perf) {
	const climbing = ac.altFt < ac.targetAltFt - 200;
	const descending = ac.altFt > ac.targetAltFt + 200;
	const level = !climbing && !descending;

	const xover = getOrCalcCrossover(ac, perf);

	if (climbing) {
		const machSpd = ac.spdMode === 'MACH' && ac.clearedMach != null
			? ac.clearedMach : perf.climbMach;
		const iasSpd = perf.climbIAS;   // crossover always based on perf climbIAS
		const xover = getOrCalcCrossover(ac, perf);

		if (ac.altFt < xover) {
			// IAS regime — use ATC IAS if issued, else perf climbIAS
			const ias = ac.spdMode === 'IAS' && ac.clearedIas != null
				? ac.clearedIas : perf.climbIAS;          // ← was always perf.climbIAS
			ac.mach = null;
			ac.ias = ias;
			return clamp(iasToTas(ias, ac.altFt), 200, 550);
		} else {
			// Mach regime
			const mach = ac.spdMode === 'MACH' && ac.clearedMach != null
				? ac.clearedMach : perf.climbMach;
			const T = isaTemp(ac.altFt);
			ac.mach = mach;
			ac.ias = null;
			return clamp(Math.round(mach * 38.967 * Math.sqrt(T)), 200, 550);
		}
	}

	if (descending) {
		const xover = getOrCalcCrossover(ac, perf);
		if (ac.altFt > xover) {
			// Mach regime — ATC Mach if issued, else descMach
			const mach = ac.spdMode === 'MACH' && ac.clearedMach != null
				? ac.clearedMach : perf.descMach;         // ← was always perf.descMach
			const T = isaTemp(ac.altFt);
			ac.mach = mach;
			ac.ias = null;
			return clamp(Math.round(mach * 38.967 * Math.sqrt(T)), 200, 550);
		} else {
			const ias = ac.spdMode === 'IAS' && ac.clearedIas != null
				? ac.clearedIas : perf.descentIAS;
			ac.mach = null;
			ac.ias = ias;
			return clamp(iasToTas(ias, ac.altFt), 200, 550);
		}
	}

	if (level) {
		if (ac.spdMode === 'MACH' && ac.clearedMach != null) {
			const T = isaTemp(ac.altFt);
			ac.mach = ac.clearedMach;
			ac.ias = null;
			return clamp(Math.round(ac.clearedMach * 38.967 * Math.sqrt(T)), 200, 550);
		}
		if (ac.spdMode === 'IAS' && ac.clearedIas != null) {
			ac.mach = null;
			ac.ias = ac.clearedIas;
			return clamp(iasToTas(ac.clearedIas, ac.altFt), 200, 550);
		}
		const xover = getOrCalcCrossover(ac, perf);
		if (ac.altFt >= xover) {
			const T = isaTemp(ac.altFt);
			ac.mach = perf.cruiseMach;
			ac.ias = null;
			return clamp(Math.round(perf.cruiseMach * 38.967 * Math.sqrt(T)), 280, 550);
		} else {
			ac.mach = null;
			ac.ias = perf.cruiseIAS;
			return clamp(iasToTas(perf.climbIAS, ac.altFt), 200, 550);  // ← climbIAS = cruiseIAS
		}
	}
}

function altFtToFl(altFt) {
	return 'F' + String(Math.round(altFt / 100)).padStart(3, '0');
}

function refreshPanelIfSelected() {
	if (!selectedAcId) return;
	const ac = getAcById(selectedAcId);
	if (!ac) return;
	const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
	set('hdgsel', Math.round(ac.hdg));
	set('flsel', ac.fl);
	set('gssl', Math.round(ac.gs));   // keep if gssl still exists, harmless if not
	set('gsn', Math.round(ac.gs));   // same
	drawCompass('sel');

	// Keep derived speeds live while sim runs
	const tasEl = document.getElementById('tasDisplay');
	const iasEl = document.getElementById('iasDisplay');
	const gsEl = document.getElementById('gsDisplay');
	if (gsEl) gsEl.textContent = `${Math.round(ac.gs)} kt`;

	// Recompute TAS/IAS from current mach/FL
	if (ac.spdMode === 'MACH' && ac.clearedMach) {
		const { tas, ias } = machToSpeeds(ac.clearedMach, ac.fl);
		if (tasEl) tasEl.textContent = `${tas} kt`;
		if (iasEl) iasEl.textContent = `${ias} kt`;
	} else if (ac.spdMode === 'IAS' && ac.clearedIas) {
		const tas = iasToTas(ac.clearedIas, ac.altFt);
		if (tasEl) tasEl.textContent = `${tas} kt`;
		if (iasEl) iasEl.textContent = `${ac.clearedIas} kt`;
	}
}

// ── ISA / MACH ENGINE ─────────────────────────────────────────────────────
const A0 = 661.479;
function flToAltFt(flStr) {
	// Accepts any F-prefixed string: F350 → 35000, F187 → 18700
	if (!flStr || !flStr.startsWith('F')) return NaN;
	const n = parseInt(flStr.slice(1), 10);
	return isNaN(n) ? NaN : n * 100;
}

function isaTemp(altFt) {
	// Returns temperature in Kelvin
	if (altFt <= 36089) return 288.15 - 0.001981 * altFt;
	return 216.65; // tropopause and above
}

function pressureRatioDelta(altFt) {
	if (altFt <= 36089) {
		const T = isaTemp(altFt);
		return Math.pow(T / 288.15, 5.2561);
	}
	return 0.22336 * Math.exp(-0.0000480634 * (altFt - 36089));
}

function machToSpeeds(mach, flStr) {
	const altFt = flToAltFt(flStr);
	const T = isaTemp(altFt);
	const a = 38.967 * Math.sqrt(T);       // local speed of sound, kt
	const tas = mach * a;

	// Impact pressure ratio qc/P  (isentropic, subsonic)
	const qcOverP = Math.pow(1 + 0.2 * mach * mach, 3.5) - 1;

	// Scale to sea-level pressure via delta
	const delta = pressureRatioDelta(altFt);
	const qcOverP0 = qcOverP * delta;

	// CAS from impact pressure (compressibility-corrected)
	const cas = A0 * Math.sqrt(5 * (Math.pow(qcOverP0 + 1, 2 / 7) - 1));

	return { tas: Math.round(tas), ias: Math.round(cas) };
}

function iasToTas(cas, altFt) {
	// CAS → Mach via sea-level impact pressure
	const qcOverP0 = Math.pow(1 + (cas / A0) * (cas / A0) * 0.2, 3.5) - 1;

	// Scale impact pressure to local static pressure
	const delta = pressureRatioDelta(altFt);
	const qcOverP = qcOverP0 / delta;

	// Mach from local impact pressure
	const mach = Math.sqrt(5 * (Math.pow(qcOverP + 1, 2 / 7) - 1));

	// TAS from Mach and local temperature
	const T = isaTemp(altFt);
	const a = 38.967 * Math.sqrt(T);
	return Math.round(mach * a);
}

function calcCrossoverAlt(ias, mach) {
	// diff > 0 means IAS TAS is above Mach TAS (above crossover)
	function diff(alt) {
		const tasFromIas = iasToTas(ias, alt);
		const T = isaTemp(alt);
		const tasFromMach = mach * 38.967 * Math.sqrt(T);
		return tasFromIas - tasFromMach;
	}

	let lo = 1000, hi = 60000;

	// Safety checks
	if (diff(hi) < 0) return hi;   // crossover above ceiling — return ceiling
	if (diff(lo) > 0) return lo;   // already above crossover at floor

	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (diff(mid) < 0) lo = mid;   // crossover is above mid
		else hi = mid;   // crossover is at or below mid
	}
	return Math.round((lo + hi) / 2);
}

function getOrCalcCrossover(ac, perf) {
	const climbing = ac.altFt < ac.targetAltFt - 200;
	const descending = ac.altFt > ac.targetAltFt + 200;

	let ias, mach;

	if (climbing) {
		ias = perf.climbIAS;
		mach = ac.spdMode === 'MACH' && ac.clearedMach != null
			? ac.clearedMach : perf.climbMach;
	} else if (descending) {
		mach = ac.spdMode === 'MACH' && ac.clearedMach != null
			? ac.clearedMach : perf.descMach;
		ias = ac.spdMode === 'IAS' && ac.clearedIas != null
			? ac.clearedIas : perf.descentIAS;
	} else {
		// Level — reuse stored value, never recalculate
		if (ac.crossoverAlt != null) return ac.crossoverAlt;
		// Spawned directly at level (CSV import) — use perf defaults only
		ias = perf.climbIAS;       // ← always perf, never ATC
		mach = perf.cruiseMach;     // ← always perf, never ATC
	}

	ac.crossoverAlt = calcCrossoverAlt(ias, mach);
	return ac.crossoverAlt;
}

function panByPixels(dx, dy) {
	offsetX -= dx / _lastScale;
	offsetY += dy / _lastScale;
	draw();
}

function applyZoomDelta(factor, pivotX, pivotY) {
	const canvas = document.getElementById('radarcanvas');
	const wrap = canvas.parentElement;
	const cx = pivotX !== undefined ? pivotX : wrap.clientWidth / 2;
	const cy = pivotY !== undefined ? pivotY : wrap.clientHeight / 2;
	const { toNM } = getDrawTransform();
	const before = toNM(cx, cy);
	gridSize = Math.min(Math.max(gridSize / factor, ZOOM_MIN), ZOOM_MAX);
	const sl = document.getElementById('zoomslider');
	const lb = document.getElementById('zoomlabel');
	if (sl) sl.value = gridToSlider(gridSize);
	if (lb) lb.textContent = fmtNM(gridSize);
	const { toNM: toNM2 } = getDrawTransform();
	const after = toNM2(cx, cy);
	offsetX += after.x - before.x;
	offsetY += after.y - before.y;
	draw();
}

// ── CRte — display route, toggle off with middle/shift-left on the route ──
function ctxCRte() {
	const id = _ctxAcId;
	_hideCtxMenu();
	if (id === null || id === undefined) return;
	// Toggle: if already showing this ac's route, turn off
	crteAcId = (crteAcId === id) ? null : id;
	modCrteAcId = null;
	closeModCrtePopup();
	draw();

	if (CrteRouteHideTimer) clearTimeout(CrteRouteHideTimer);
	CrteRouteHideTimer = setTimeout(() => {
		crteAcId = null;
		CrteRouteHideTimer = null;
		draw();
	}, 3000);
}

// ── Mod CRte — display route then wait for right-click on map ─────────────
function ctxModCRte() {
	const id = _ctxAcId;
	_hideCtxMenu();
	if (id === null || id === undefined) return;
	const ac = getAcById(id);
	if (!ac || !ac.route || !ac.route.length) {
		alert(`${ac?.callsign ?? '?'} has no route loaded.`);
		return;
	}
	modCrteAcId = id;
	crteAcId = id;    // show route immediately
	closeModCrtePopup();
	draw();
}

// ── Close Mod CRte waypoint popup ─────────────────────────────────────────
function closeModCrtePopup() {
	if (modCrtePopupEl) { modCrtePopupEl.remove(); modCrtePopupEl = null; }
}

function cancelModCrte() {
	if (modCrteRouteHideTimer) {
		clearTimeout(modCrteRouteHideTimer);
		modCrteRouteHideTimer = null;
	}
	modCrteAcId = null;
	crteAcId = null;
	modCrtePreviewRoute = null;     // ← clear preview too
	closeModCrtePopup();
	draw();
}

// Sim control
function startSim() {
	if (simRunning) return;
	simRunning = true;

	// Start or resume sim UTC
	if (simUtcStartMs == null && simUtcFrozenMs == null) {
		// first run: default sim UTC = current real UTC
		const now = getRealUtcMs();
		simUtcStartMs = now;
		realStartMs = now;
	} else {
		resumeSimUtc();
	}

	updateSimButtons();
	physicsTimer = setInterval(physicsTick, 1000);
	radarTimer = setInterval(radarSweep, radarInterval * 1000);
	clockTimer = setInterval(updateSimClock, 1000);
	rebuildFdlState();
	renderFdlPanels();
	rebuildFdlState(); draw();
}

function pauseSim() {
	simRunning = false;
	freezeSimUtc();
	clearInterval(physicsTimer);
	clearInterval(radarTimer);
	clearInterval(clockTimer);
	physicsTimer = null;
	radarTimer = null;
	clockTimer = null;
	updateSimButtons();
	updateSimClock();
}

function resetSim() {
	//if (!initialScenarioSnapshot) return;

	// Stop sim, clear state
	pauseSim();
	simRunning = false;
	simTimeSec = 0;
	selectedAcId = null;

	// Reset sim UTC to frozen snapshot (optional: keep last sim time)
	simUtcStartMs = null;
	realStartMs = null;
	simUtcFrozenMs = null;

	// simUtcFrozenMs stays as last value; or set null if you prefer
	clearInterval(clockTimer);
	clockTimer = null;

	updateSimClock();         // ← refresh display (shows editable input again)
	updateSimButtons();

	// Deep-restore each aircraft from snapshot
	aircraft = initialScenarioSnapshot.map(snap => JSON.parse(JSON.stringify(snap)));
	draw();
}

function updateSimClock() {
	// Old simTimeSec clock (you can keep it or hide its UI)
	const h = String(Math.floor(simTimeSec / 3600)).padStart(2, '0');
	const m = String(Math.floor((simTimeSec % 3600) / 60)).padStart(2, '0');
	const s = String(simTimeSec % 60).padStart(2, '0');
	const el = document.getElementById('simClock');
	if (el) el.textContent = `${h}:${m}:${s}`;

	// Real UTC
	const realEl = document.getElementById('realUtcClock');
	if (realEl) realEl.textContent = formatUtcHMS(getRealUtcMs()).replace('Z', '');

	// Sim UTC
	const simEl = document.getElementById('simUtcClock');
	const simInp = document.getElementById('simUtcInput');
	const ms = getSimUtcMs();

	// Editable only when sim has NEVER been started yet
	const neverStarted = !simRunning && simUtcStartMs === null && simUtcFrozenMs === null;

	if (neverStarted) {
		// Pre-start: show editable input
		if (simEl) simEl.style.display = 'none';
		if (simInp) {
			simInp.style.display = '';
			if (document.activeElement !== simInp) {
				simInp.value = ms !== null ? formatUtcHM(ms) : '';
			}
		}
	} else {
		// Running OR paused: show read-only clock, hide input
		if (simEl) { simEl.style.display = ''; simEl.textContent = formatUtcHMS(ms)?.replace('Z', '') ?? '------'; }
		if (simInp) simInp.style.display = 'none';
	}
}

function updateSimButtons() {
	const btn = document.getElementById('simStartBtn');
	if (btn) btn.textContent = simRunning ? 'PAUSE' : 'START';

	// Hide setup panels while sim is running
	const acPanel = document.getElementById('acPanel');
	const placePanel = document.getElementById('placePanel');
	const scenarioPanel = document.getElementById('ScenarioPanel');
	if (acPanel) acPanel.style.display = simRunning ? 'none' : '';
	if (placePanel) placePanel.style.display = simRunning ? 'none' : '';
	if (scenarioPanel) scenarioPanel.style.display = simRunning ? 'none' : '';
}

function toggleSim() {
	simRunning ? pauseSim() : startSim();
}

function setRadarInterval(val) {
	radarInterval = parseInt(val);
	if (simRunning) {
		clearInterval(radarTimer);
		radarTimer = setInterval(radarSweep, radarInterval * 1000);
	}
}

function updateAtcStatus() {
	const ac = getAcById(selectedAcId);
	const el = document.getElementById('atcStatusLine');
	if (!el || !ac) return;

	const parts = [];

	// Show pending instructions with countdown
	ac.pendingInstrs.forEach(p => {
		const remaining = p.triggerTime - simTimeSec;
		parts.push(`⏳ ${p.label ?? '?'} in ${remaining}s`);
	});

	if (ac.targetHdg !== null)
		parts.push(`HDG → ${String(Math.round(ac.targetHdg)).padStart(3, '0')}°`);
	if (Math.abs(ac.altFt - ac.targetAltFt) > 200)
		parts.push(`${ac.altFt < ac.targetAltFt ? '↑' : '↓'} ${altFtToFl(ac.targetAltFt)}`);
	if (ac.clearedMach != null)
		parts.push(`M${ac.clearedMach.toFixed(2)}`);
	else if (ac.clearedIas != null)
		parts.push(`IAS ${ac.clearedIas} kt`);
	parts.push(`NAV: ${ac.navMode}`);
	el.textContent = parts.join('  |  ');
}

function clamp(v, mn, mx) { return Math.min(mx, Math.max(mn, v)); }
function sliderToGrid(s) { return Math.round(ZOOM_MIN * Math.pow(ZOOM_MAX / ZOOM_MIN, s / 100) * 10) / 10; }
function gridToSlider(g) { return Math.round(Math.log(g / ZOOM_MIN) / Math.log(ZOOM_MAX / ZOOM_MIN) * 100); }
function fmtNM(n) { return n >= 10 ? n.toFixed(0) + ' NM' : n.toFixed(1) + ' NM'; }
function syncZoom(sv) { gridSize = sliderToGrid(parseFloat(sv)); document.getElementById('zoomlabel').textContent = fmtNM(gridSize); draw(); }
function setGridSize(nm) {
	gridSize = clamp(nm, ZOOM_MIN, ZOOM_MAX);
	const sl = document.getElementById('zoomslider');
	const lb = document.getElementById('zoomlabel');
	if (sl) sl.value = gridToSlider(gridSize);
	if (lb) lb.textContent = fmtNM(gridSize);
}
function syncFromSlider(id) { document.getElementById(id + '_n').value = document.getElementById(id).value; if (id === 'hdga') drawCompass('a'); if (id === 'hdgb') drawCompass('b'); draw(); if (typeof refreshUnifiedPanel === 'function') refreshUnifiedPanel(); }
function syncFromNumber(id) {
	const ni = document.getElementById(id + '_n'), sl = document.getElementById(id);
	let v = parseFloat(ni.value); if (isNaN(v)) return;
	v = clamp(v, parseFloat(sl.min), parseFloat(sl.max)); sl.value = v; ni.value = v;
	if (id === 'hdga') drawCompass('a'); if (id === 'hdgb') drawCompass('b');
	draw();
}

function setVal(id, v) { const sl = document.getElementById(id); v = clamp(v, parseFloat(sl.min), parseFloat(sl.max)); sl.value = v; document.getElementById(id + '_n').value = v; if (id === 'hdga') drawCompass('a'); if (id === 'hdgb') drawCompass('b'); }
function g(id) { return parseFloat(document.getElementById(id).value) || 0; }

// ── CPA ENGINE ─────────────────────────────────────────────────────────────
function calcCPA(v) {
	const dx = v.xa - v.xb, dy = v.ya - v.yb, dvx = v.vxa - v.vxb, dvy = v.vya - v.vyb, dv2 = dvx * dvx + dvy * dvy;
	const cursep = Math.sqrt(dx * dx + dy * dy);
	if (dv2 < 1e-10) return { dcpa: cursep, tcpamin: 0, tcpah: 0, cursep, diverging: true };
	const tcpah = -(dx * dvx + dy * dvy) / dv2;
	const axcpa = v.xa + v.vxa * tcpah, aycpa = v.ya + v.vya * tcpah, bxcpa = v.xb + v.vxb * tcpah, bycpa = v.yb + v.vyb * tcpah;
	return { dcpa: Math.sqrt((axcpa - bxcpa) ** 2 + (aycpa - bycpa) ** 2), tcpamin: Math.min(tcpah, 60) * 60, tcpah, cursep, diverging: tcpah < 0, axcpa, aycpa, bxcpa, bycpa };
}
function autoFit() {
	// Always center at ALDOM (0,0)
	setGridSize(50);
	offsetX = 0; offsetY = 0;
}
function rndInt(mn, mx) {
	return Math.round(mn + Math.random() * (mx - mn));
}

// ── DRAWING ─────────────────────────────────────────────────────────────────
function drawAircraftIcon(ctx, px, py, headingDeg, color) {
	ctx.save();
	ctx.translate(px, py);
	ctx.rotate(headingDeg * Math.PI / 180);
	const s = 4;
	ctx.fillStyle = color;
	ctx.beginPath(); ctx.moveTo(0, -s * 1.7); ctx.bezierCurveTo(s * 0.22, -s * 1.5, s * 0.25, s * 0.6, s * 0.18, s * 1.8); ctx.lineTo(0, s * 1.55); ctx.lineTo(-s * 0.18, s * 1.8); ctx.bezierCurveTo(-s * 0.25, s * 0.6, -s * 0.22, -s * 1.5, 0, -s * 1.7); ctx.closePath(); ctx.fill();
	ctx.beginPath(); ctx.moveTo(-s * 0.22, -s * 0.15); ctx.lineTo(-s * 1.8, s * 0.25); ctx.lineTo(-s * 1.6, s * 0.62); ctx.lineTo(-s * 0.22, s * 0.55); ctx.closePath(); ctx.fill();
	ctx.beginPath(); ctx.moveTo(s * 0.22, -s * 0.15); ctx.lineTo(s * 1.8, s * 0.25); ctx.lineTo(s * 1.6, s * 0.62); ctx.lineTo(s * 0.22, s * 0.55); ctx.closePath(); ctx.fill();
	ctx.beginPath(); ctx.moveTo(-s * 0.18, s * 1.25); ctx.lineTo(-s * 0.75, s * 1.58); ctx.lineTo(-s * 0.65, s * 1.78); ctx.lineTo(-s * 0.18, s * 1.55); ctx.closePath(); ctx.fill();
	ctx.beginPath(); ctx.moveTo(s * 0.18, s * 1.25); ctx.lineTo(s * 0.75, s * 1.58); ctx.lineTo(s * 0.65, s * 1.78); ctx.lineTo(s * 0.18, s * 1.55); ctx.closePath(); ctx.fill();
	ctx.restore();
}

function pickSide(acPx, acPy, cpaPx, cpaPy, otherAcPx) {
	const dx = cpaPx - acPx, dy = cpaPy - acPy;
	if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return acPx <= otherAcPx ? 'left' : 'right';
	if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'left' : 'right';
	return acPx <= otherAcPx ? 'left' : 'right';
}

function drawAcData(ctx, px, py, ac, side) {
	const { callsign, hdg, gs, fl, lx, ly } = ac;
	ctx.font = '11px "Cascadia Mono"';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	const cW = ctx.measureText('0').width;   // one character width — all gaps/columns use this

	// ── LINE 2: callsign (max 7) + 1ch gap + type (4) + wtc (1)  ─────────────
	const csDisp = callsign.substring(0, 7);
	const typeDisp = (ac.type ?? 'B738').substring(0, 4);
	const wtcDisp = (ac.wtc ?? 'M').substring(0, 1);
	const line2 = csDisp + ' ' + typeDisp + wtcDisp;   // Max 7+1+4+1 = Max 13 chars

	// ── LINE 3: FL (4) + vmi-gap-or-arrow (1ch) + CFL (4)  ──────────────────
	const vmi = ac.altFt < ac.targetAltFt - 50 ? '↑'
		: ac.altFt > ac.targetAltFt + 50 ? '↓' : ' ';
	const cflStr = ac.cflDisplay ? ac.cflDisplay.padEnd(4, ' ') : '    ';
	const line3 = fl + vmi + cflStr;                      // 4+1+4 = 9 chars

	// ── LINE 4: HDG(3) + CHD(4) + gap(1) + GS2(2) + SPD(5) ─────────────────
	const hdgStr = String(Math.round(hdg)).padStart(3, '0');
	const chdStr = ac.clearedHdgDisplay
		? ac.clearedHdgDisplay.padEnd(4, ' ')
		: '    ';                                  // 4 ch gap when no instruction
	const gsFirst2 = String(Math.round(gs)).substring(0, 2);
	const spdStr = ac.clearedSpdDisplay
		? ac.clearedSpdDisplay.padEnd(5, ' ')
		: '     ';                              // 5 ch gap when no instruction
	const line4 = hdgStr + chdStr + ' ' + gsFirst2 + spdStr; // 3+4+1+2+5 = 15 chars

	// ── LINE 5/6: free text, capped at 14 chars ───────────────────────────────
	const line5 = (ac.freeTextStatic ?? ' ').substring(0, 14);
	const line6 = (ac.freeTextInput ?? ' ').substring(0, 14);

	// Block width = 14 characters (lines 2–4 are slightly wider; use actual measure)
	const blockW = Math.max(
		ctx.measureText(line2).width,
		ctx.measureText(line3).width,
		ctx.measureText(line4).width,
		cW * 14                         // floor at 14ch so short lines still have a hit area
	);
	const maxW = blockW;

	const OFFSET = 10;
	const bx = (side === 'right' ? px + OFFSET : px - OFFSET - maxW) + (lx ?? 0);
	const by = (py - LINE_H) + (ly ?? 0);

	// ── LEADER LINE ──────────────────────────────────────────────────────────
	const lines = [null, line2, line3, line4, line5, line6]
	const line2Y = by + 1 * LINE_H + LINE_H / 2;   // vertical mid of line 2
	const leftD = Math.hypot(bx - px, line2Y - py);
	const rightD = Math.hypot(bx + maxW - px, line2Y - py);
	const anchorX = leftD < rightD ? bx - 2 : bx + ctx.measureText(line2).width + 2;
	ctx.save();
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(px, py);
	ctx.lineTo(anchorX, line2Y);   // was labelCY
	ctx.stroke();
	ctx.restore();

	// ── DRAW LINES ───────────────────────────────────────────────────────────
	lines.forEach((l, i) => {
		if (i === 0 || !l) return;   // skip slot-0 (null) and empty
		ctx.fillStyle = '#ffffff';
		ctx.fillText(l, bx, by + i * LINE_H);
	});

	// ── STORE HIT REGIONS ────────────────────────────────────────────────────
	const HPAD = 0, VPAD = 0;
	ac.dbRect = { x: bx, y: by, w: maxW, h: lines.length * LINE_H };

	// Line 3: CFL zone — starts after "F350↑" (fl + vmi = 5 chars)
	const y3 = by + 2 * LINE_H;
	const cflOffX = ctx.measureText(fl + vmi).width;
	ac.cflRect = {
		x: bx + cflOffX - HPAD,
		y: y3 - VPAD,
		w: Math.max(cW * 4, ctx.measureText(cflStr.trim() || 'F000').width) + HPAD * 2,
		h: LINE_H + VPAD * 2
	};

	// Line 4: CHD zone — starts after HDG (3 chars)
	const y4 = by + 3 * LINE_H;
	const chdOffX = ctx.measureText(hdgStr).width; // HDG is always exactly 3 chars
	ac.chdRect = {
		x: bx + chdOffX - HPAD,
		y: y4 - VPAD,
		w: Math.max(cW * 4, ctx.measureText(chdStr.trim() || 'H000').width) + HPAD * 2,
		h: LINE_H + VPAD * 2
	};

	// Line 4: SPD zone — starts after HDG(3) + CHD(4) + gap(1) + GS2(2) = 10 chars
	const spdOffX = ctx.measureText(hdgStr + chdStr + ' ' + gsFirst2).width;
	ac.spdRect = {
		x: bx + spdOffX - HPAD,
		y: y4 - VPAD,
		w: Math.max(cW * 5, ctx.measureText(spdStr.trim() || 'S.82').width) + HPAD * 2,
		h: LINE_H + VPAD * 2
	};

	// Line 6: free-text input zone
	const y6 = by + 5 * LINE_H;
	ac.ftRect = {
		x: bx - HPAD,
		y: y6 - VPAD,
		w: maxW + HPAD * 2,
		h: LINE_H + VPAD * 2
	};
}

function draw() {
	const canvas = _canvas, wrap = canvas.parentElement;
	canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight;
	const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
	const scale = Math.min(W, H) / 8 / gridSize;
	_lastMidX = 0; _lastMidY = 0; _lastScale = scale; _lastW = W; _lastH = H;
	const cx = W / 2, cy = H / 2;
	const S = (nx, ny) => ({ x: cx + (nx - offsetX) * scale, y: cy - (ny - offsetY) * scale });
	ctx.clearRect(0, 0, W, H);
	ctx.strokeStyle = '#30363d'; ctx.lineWidth = 0.01;
	const o = S(0, 0);
	ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, H); ctx.stroke();
	ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(W, o.y); ctx.stroke();
	drawTMA(ctx, S); drawFIR(ctx, S); drawTRW(ctx, S); drawTRV(ctx, S); drawTRD(ctx, S);
	drawRedLine(ctx, S); drawAirways(ctx, S); drawWaypoints(ctx, S); drawRbls(ctx, S);
	const cpaMap = {};
	aircraft.forEach(a => { cpaMap[a.id] = []; });
	probes.forEach(probe => {
		const a = getAcById(probe.ac1), b = getAcById(probe.ac2);
		if (!a || !b) return;
		const v = acToVals(a, b);
		const pcpa = calcCPA(v);

		const isFutureCPA = !pcpa.diverging && pcpa.tcpah > 0;

		const p1 = S(a.x, a.y), p2 = S(b.x, b.y);

		if (isFutureCPA) {
			// — FUTURE CPA MODE —
			const paC = S(pcpa.axcpa, pcpa.aycpa);
			const pbC = S(pcpa.bxcpa, pcpa.bycpa);

			ctx.setLineDash([5, 4]);
			ctx.strokeStyle = probe.colour;
			ctx.lineWidth = 1.5;
			ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(paC.x, paC.y); ctx.stroke();
			ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(pbC.x, pbC.y); ctx.stroke();
			ctx.setLineDash([]);
			ctx.lineWidth = 2;
			ctx.beginPath(); ctx.arc(paC.x, paC.y, 5, 0, 2 * Math.PI); ctx.stroke();
			ctx.beginPath(); ctx.arc(pbC.x, pbC.y, 5, 0, 2 * Math.PI); ctx.stroke();

			const tsec = Math.max(pcpa.tcpamin * 60, 0);
			const mm = String(Math.floor(tsec / 60)).padStart(2, '0');
			const ss = String(Math.floor(tsec % 60)).padStart(2, '0');
			const lbl = `${pcpa.dcpa.toFixed(1)}NM ${mm}:${ss}`;
			if (cpaMap[probe.ac1]) cpaMap[probe.ac1].push({ text: lbl, colour: probe.colour, id: probe.id });

		} else {
			// — CURRENT NEAREST MODE —
			const dist = Math.hypot(a.x - b.x, a.y - b.y);
			const lbl = `${dist.toFixed(2)}NM --:--`;

			ctx.setLineDash([5, 4]);
			ctx.strokeStyle = probe.colour;
			ctx.lineWidth = 1.5;
			//ctx.globalAlpha = 0.55;
			ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
			ctx.setLineDash([]);
			//ctx.globalAlpha = 1.0;

			if (cpaMap[probe.ac1]) cpaMap[probe.ac1].push({ text: lbl, colour: probe.colour, id: probe.id });
		}
	});
	if (probeMode === 'SELECT_2' && probeBuilding) {
		const pa = getAcById(probeBuilding.ac1);
		if (pa) {
			const p1 = S(pa.x, pa.y); ctx.setLineDash([3, 5]); ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
			ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1.x - 20, p1.y - 20); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
		}
	}

	// ── TRAIL DOTS ──────────────────────────────────────────────────────
	aircraft.forEach(ac => {
		if (!ac.active || !ac.trails || !ac.trails.length) return;
		const trailCount = ac.trails.length;
		ac.trails.forEach((t, i) => {
			const tp = S(t.x, t.y);
			const alpha = ((i + 1) / (trailCount + 1)) * 0.65;
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.fillStyle = '#ffffff';
			ctx.beginPath();
			ctx.arc(tp.x, tp.y, 2, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		});
	});

	// ── CRte route overlay ────────────────────────────────────────────────────
	drawCrteRoute(ctx, S);

	// AIRCRAFT ICONS & DATA BLOCKS
	aircraft.forEach(ac => {
		if (!ac.active) return;
		const p = S(ac.x, ac.y);
		drawAircraftIcon(ctx, p.x, p.y, ac.hdg + MAGVAR, '#ffffff');
		if (ac.id === selectedAcId) {
			const BOX = 12; // half-size of square, adjust to taste
			ctx.save();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 1;
			ctx.strokeRect(p.x - BOX, p.y - BOX, BOX * 2, BOX * 2);
			ctx.restore();
		}

		// ── Sep Probe labels: bottom-right corner of this aircraft's icon ──
		const acProbes = (cpaMap[ac.id] ?? []);
		if (acProbes.length) {
			ctx.save();
			ctx.font = '11px "Cascadia Mono"';
			ctx.textBaseline = 'top';
			const ICON_OFFSET_X = 7;   // px right of icon centre
			const ICON_OFFSET_Y = 7;   // px below icon centre
			acProbes.forEach((cl, i) => {
				ctx.fillStyle = cl.colour;
				ctx.fillText(cl.text, p.x + ICON_OFFSET_X, p.y + ICON_OFFSET_Y + i * LINE_H);
			});
			ctx.restore();
		}

		let otherX = _lastW / 2;
		if (aircraft.length > 1) {
			const oth = aircraft.filter(o => o.id !== ac.id);
			otherX = oth.reduce((s, o) => s + S(o.x, o.y).x, 0) / oth.length;
		}
		const side = p.x > otherX ? 'right' : 'left';
		// Pass null for cpaLabels — probes are no longer drawn inside the data block
		drawAcData(ctx, p.x, p.y, ac, side, null);
	});
	drawFdlOverlays(ctx, S);
}

function drawWaypoints(ctx, S) {
	WAYPOINTS.forEach(wp => {
		const p = S(wp.x, wp.y);
		ctx.save();

		// Dot only
		ctx.fillStyle = '#6e7681';
		ctx.beginPath();
		ctx.arc(p.x, p.y, 1.1, 0, 2 * Math.PI);
		ctx.fill();

		// Name label (togglable)
		if (showWpNames && !wp.dotOnly) {
			ctx.fillStyle = '#6e7681';
			ctx.font = 'bold 8px monospace';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			ctx.fillText(wp.name, p.x, p.y - 4);
		}
		ctx.restore();
	});
}

function drawCrteRoute(ctx, S) {
	if (crteAcId === null || crteAcId === undefined) return;
	const ac = getAcById(crteAcId);
	if (!ac) return;

	// Use preview route (post-Mod CRte click) if available, else real route
	const routeToShow = (modCrtePreviewRoute?.acId === crteAcId)
		? modCrtePreviewRoute.route
		: ac.route;

	if (!routeToShow || !routeToShow.length) return;

	const ROUTE_COLOUR = '#b8860b';   // dark goldenrod / brown
	const LABEL_COLOUR = '#d4a017';
	ctx.save();
	ctx.font = 'bold 9px "Cascadia Mono"';
	ctx.textBaseline = 'middle';

	// Build ordered positions: start from aircraft position
	const pts = [{ x: ac.x, y: ac.y, name: null }];
	let cumDistNM = 0, cumTimeSec = 0;

	routeToShow.forEach(wpName => {       // ← was ac.route.forEach
		const wp = WAYPOINTS.find(w => w.name === wpName);
		if (!wp) return;
		pts.push({ x: wp.x, y: wp.y, name: wpName });
	});

	// Draw connecting lines
	ctx.strokeStyle = ROUTE_COLOUR;
	ctx.lineWidth = 1.2;
	ctx.setLineDash([6, 4]);
	ctx.beginPath();
	pts.forEach((pt, i) => {
		const sp = S(pt.x, pt.y);
		i === 0 ? ctx.moveTo(sp.x, sp.y) : ctx.lineTo(sp.x, sp.y);
	});
	ctx.stroke();
	ctx.setLineDash([]);

	// Draw waypoint dots + labels with estimates
	for (let i = 1; i < pts.length; i++) {
		const prev = pts[i - 1];
		const curr = pts[i];
		const segNM = Math.hypot(curr.x - prev.x, curr.y - prev.y);
		const avgGs = ac.gs;  // simple estimate — use current GS
		cumTimeSec += (segNM / avgGs) * 3600;
		cumDistNM += segNM;

		const sp = S(curr.x, curr.y);
		const mm = String(Math.floor(cumTimeSec / 60)).padStart(2, '0');
		const ss = String(Math.floor(cumTimeSec % 60)).padStart(2, '0');
		const estLabel = `${curr.name} +${mm}:${ss}`;

		// Dot
		ctx.fillStyle = ROUTE_COLOUR;
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 3, 0, 2 * Math.PI);
		ctx.fill();

		// Label (offset right)
		ctx.fillStyle = LABEL_COLOUR;
		ctx.fillText(estLabel, sp.x + 6, sp.y);
	}

	ctx.restore();
}

// ── AIRCRAFT ARRAY MODEL ─────────────────────────────────────────────────
const OPERATORS = [
	'CCA', 'ACA', 'JYH', 'CPA', 'CPA', 'CPA', 'CPA', 'CPA', 'APG', 'AXM', 'AIC', 'AIQ', 'XAX', 'ANA', 'AAR', 'BKP', 'MXD', 'CAL', 'EVA', 'SJX', 'HGB', 'HGB', 'HGB', 'HKE', 'HKE', 'HKE', 'HKE', 'CRK', 'CRK', 'CRK', 'AHK', 'HKC', 'UAE', 'QTR', 'CLX', 'CES', 'CSN', 'ETH', 'GIA', 'CHH', 'CSZ', 'IGO', 'JJA', 'JAL', 'JJP', 'JNA', 'TWB', 'TTW', 'TGW', 'SIN', 'THA', 'HVN', 'KAL', 'MAS', 'APJ', 'RBA', 'CSH', 'CQH', 'UAL', 'VJC', 'VTI', 'CXA', 'BOX', 'AIH', 'GTI', 'ICV', 'GEC', 'CKS', 'ETD', 'KMI', 'ABD', 'CSS', 'HGO', 'RMY', 'AZG', 'PAC', 'TVR', 'UPS', 'KXP', 'TBJ', 'TAX', 'VJT', 'PTA', 'BAV', 'TZP', 'AMU', 'KME', 'ABL', 'TLM', 'CDG', 'SVA', 'THY', 'DHX', 'DHK', 'MPH'];
const FL_LIST = [
	{ v: 'F120', l: 'F120' }, { v: 'F130', l: 'F130' }, { v: 'F140', l: 'F140' },
	{ v: 'F150', l: 'F150' }, { v: 'F160', l: 'F160' }, { v: 'F170', l: 'F170' },
	{ v: 'F180', l: 'F180' }, { v: 'F187', l: 'F187/S0570' }, { v: 'F190', l: 'F190' },
	{ v: 'F197', l: 'F197/S0600' }, { v: 'F200', l: 'F200' }, { v: 'F207', l: 'F207/S0630' },
	{ v: 'F210', l: 'F210' }, { v: 'F217', l: 'F217/S0660' }, { v: 'F220', l: 'F220' },
	{ v: 'F226', l: 'F226/S0690' }, { v: 'F230', l: 'F230' }, { v: 'F236', l: 'F236/S0720' },
	{ v: 'F240', l: 'F240' }, { v: 'F246', l: 'F246/S0750' }, { v: 'F250', l: 'F250' },
	{ v: 'F256', l: 'F256/S0780' }, { v: 'F260', l: 'F260' }, { v: 'F266', l: 'F266/S0810' },
	{ v: 'F270', l: 'F270' }, { v: 'F276', l: 'F276/S0840' }, { v: 'F280', l: 'F280' },
	{ v: 'F290', l: 'F290' }, { v: 'F291', l: 'F291/S0890' }, { v: 'F300', l: 'F300' },
	{ v: 'F301', l: 'F301/S0920' }, { v: 'F310', l: 'F310' }, { v: 'F311', l: 'F311/S0950' },
	{ v: 'F320', l: 'F320' }, { v: 'F321', l: 'F321/S0980' }, { v: 'F330', l: 'F330' },
	{ v: 'F331', l: 'F331/S1010' }, { v: 'F340', l: 'F340' }, { v: 'F341', l: 'F341/S1040' },
	{ v: 'F350', l: 'F350' }, { v: 'F351', l: 'F351/S1070' }, { v: 'F360', l: 'F360' },
	{ v: 'F361', l: 'F361/S1100' }, { v: 'F370', l: 'F370' }, { v: 'F371', l: 'F371/S1130' },
	{ v: 'F380', l: 'F380' }, { v: 'F381', l: 'F381/S1160' }, { v: 'F390', l: 'F390' },
	{ v: 'F391', l: 'F391/S1190' }, { v: 'F400', l: 'F400' }, { v: 'F401', l: 'F401/S1220' },
	{ v: 'F410', l: 'F410' }, { v: 'F411', l: 'F411/S1250' }, { v: 'F430', l: 'F430/S1310' },
	{ v: 'F449', l: 'F449/S1370' }, { v: 'F450', l: 'F450' },
];

// ── FTL CONFIG ─────────────────────────────────────────────────────────
const FTL_LEVELS_BY_WP = {
	SIKOU: ['F197', 'F217', 'F236', 'F256', 'F276', 'F321', 'F341', 'F361', 'F381'],   // example; fill with your real values
	IKELA: ['F280', 'F300', 'F340', 'F380', 'F400', 'F430'],
	EPKAL: ['F280', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
	BEKOL: ['F291', 'F311', 'F331', 'F351', 'F371', 'F391', 'F411'],
	TAMOT: [], // inbound only, no outbound FTL
	// add others as needed
};
function assignInitialFtl(ac) {
	if (!ac.route || !ac.route.length) return;
	// pick first outbound FDL wp on its route
	const wp = ac.route.find(name => FTL_LEVELS_BY_WP[name] && FTL_LEVELS_BY_WP[name].length);
	if (!wp) return;
	const levels = FTL_LEVELS_BY_WP[wp];
	ac.ftl = levels[Math.floor(Math.random() * levels.length)];
}

const AC_TYPE_POOL = [
	// [ICAO type, WTC]
	['B738', 'M'], ['B738', 'M'], ['B738', 'M'], // weighted common types
	['A320', 'M'], ['A320', 'M'],
	['A20N', 'M'], ['A20N', 'M'], ['A20N', 'M'],
	['A321', 'M'], ['A321', 'M'],
	['A21N', 'M'], ['A21N', 'M'],
	['A319', 'M'], ['B737', 'M'],
	['B39M', 'M'], ['B38M', 'M'],
	['A333', 'H'], ['A333', 'H'], ['A339', 'H'],
	['B788', 'H'], ['B78X', 'H'], ['B789', 'H'],
	['B77W', 'H'], ['B77W', 'H'], ['B77L', 'H'],
	['B748', 'H'], ['B744', 'H'],
	['A359', 'H'], ['A35K', 'H'], ['A388', 'J']
];
function randomAcType() {
	return AC_TYPE_POOL[Math.floor(Math.random() * AC_TYPE_POOL.length)];
}

let aircraft = [], _acIdCtr = 0, selectedAcId = null;
let simRunning = false;
let simTimeSec = 0;          // seconds elapsed since START
let radarInterval = 4;         // seconds between radar sweeps
let physicsTimer = null;
let radarTimer = null;
let clockTimer = null;
const MAX_TRAILS = 4;
let activePopup = null; // { type: 'CFL'|'CHD'|'SPD'|'FT', acId, el }

// ── TIME / CLOCKS ─────────────────────────────────────────────────────
let realUtcNowMs = () => Date.now(); // wrapper for testing

// sim UTC base state
let simUtcStartMs = null;    // sim UTC at realStart (ms since epoch)
let realStartMs = null;      // real UTC at sim start/resume (ms since epoch)
let simUtcFrozenMs = null;   // when paused/reset, last sim UTC (ms)

// Display formats
function formatUtcHM(utcMs) {
	if (utcMs == null) return '--:--';
	const d = new Date(utcMs);
	const hh = String(d.getUTCHours()).padStart(2, '0');
	const mm = String(d.getUTCMinutes()).padStart(2, '0');
	return `${hh}:${mm}Z`;
}

function formatUtcHMS(utcMs) {
	if (utcMs == null) return '--:--:--';
	const d = new Date(utcMs);
	const hh = String(d.getUTCHours()).padStart(2, '0');
	const mm = String(d.getUTCMinutes()).padStart(2, '0');
	const ss = String(d.getUTCSeconds()).padStart(2, '0');
	return `${hh}:${mm}:${ss}Z`;
}

// Real UTC clock (always now)
function getRealUtcMs() {
	return realUtcNowMs;
}

// Sim UTC clock (based on simUtcStartMs / realStartMs / frozen)
function getSimUtcMs() {
	if (simUtcFrozenMs != null) return simUtcFrozenMs;
	if (simUtcStartMs == null || realStartMs == null) return null;
	const now = getRealUtcMs();
	return simUtcStartMs + (now - realStartMs);
}

function applySimUtcInput() {
	const inp = document.getElementById('simUtcInput');
	// Only apply if sim has truly never started (not just paused)
	const neverStarted = !simRunning && simUtcStartMs === null && simUtcFrozenMs === null;
	if (!inp || !neverStarted) return;

	const raw = inp.value.trim();
	if (!/^\d{4}$/.test(raw)) return;
	const hh = parseInt(raw.slice(0, 2), 10);
	const mm = parseInt(raw.slice(2, 4), 10);
	if (hh > 23 || mm > 59) return;
	setSimUtcFromHM(hh, mm);
	freezeSimUtc();
}

// Set sim UTC from user (e.g. via input "HH:MM")
function setSimUtcFromHM(hh, mm) {
	const now = getRealUtcMs();
	const d = new Date(now);
	d.setUTCHours(hh, mm, 0, 0);
	simUtcStartMs = d.getTime();
	realStartMs = now;
	simUtcFrozenMs = null;
}

// When sim is paused, freeze sim UTC
function freezeSimUtc() {
	const cur = getSimUtcMs();
	simUtcFrozenMs = cur;
	simUtcStartMs = null;
	realStartMs = null;
}

// When sim resumes, re-anchor sim UTC at current real time
function resumeSimUtc() {
	const now = getRealUtcMs();
	if (simUtcFrozenMs == null) {
		// default: if never set, align sim UTC with real UTC
		simUtcStartMs = now;
	} else {
		simUtcStartMs = simUtcFrozenMs;
	}
	realStartMs = now;
	simUtcFrozenMs = null;
}

//  ────────────────────────────────────────────────────────

function sameRoute(a, b) {
	if (!a || !b || a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

// Returns best matching route entry for the aircraft's current route array.
// Prefers routes whose *suffix* equals acRoute, and breaks ties on:
//   1) Longest canonical route (more information)
//   2) Fewer extra tails beyond the aircraft's last WP (to avoid wrong longer route)
function findBestRouteConstraints(acRoute) {
	if (!acRoute || !acRoute.length) return null;

	let best = null;

	for (const entry of ROUTE_LEVEL_CONSTRAINTS) {
		const full = entry.route;
		if (!full || full.length < acRoute.length) continue;

		// Check if acRoute matches a suffix of full
		let ok = true;
		const offset = full.length - acRoute.length;
		for (let i = 0; i < acRoute.length; i++) {
			if (full[offset + i] !== acRoute[i]) {
				ok = false;
				break;
			}
		}
		if (!ok) continue;

		// Candidate: suffix match found
		const extraTail = full.length - acRoute.length; // how many WPs before our first
		if (!best) {
			best = { entry, extraTail };
			continue;
		}

		const bestFull = best.entry.route;

		// Tie‑breaking:
		// 1) Prefer shorter canonical route (more "pure" arrival definition)
		if (full.length < bestFull.length) {
			best = { entry, extraTail };
			continue;
		}
		if (full.length > bestFull.length) {
			continue;
		}

		// 2) For same length, prefer shorter extraTail
		if (extraTail < best.extraTail) {
			best = { entry, extraTail };
		}
	}
	return best ? best.entry : null;
}

// ── POP-UP SECTION ─────────────────────────────────────────────────
function closeActivePopup() {
	if (!activePopup) return;
	activePopup.el.remove();
	activePopup = null;
}

function makePopup(x, y, acId, content) {
	closeActivePopup();
	const div = document.createElement('div');
	div.id = 'dataBlockPopup';
	Object.assign(div.style, {
		position: 'fixed', zIndex: '9999',
		background: '#3f7196', border: '4px ridge #222',
		textAlign: 'center', width: 'fit-content', maxWidth: '260px',
		boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
		fontFamily: 'Cascadia Mono', fontSize: '12px', color: '#fff'
	});
	div.innerHTML = content;

	// Position — keep inside viewport
	document.body.appendChild(div);
	const rect = div.getBoundingClientRect();
	const vw = window.innerWidth, vh = window.innerHeight;
	div.style.left = Math.min(x, vw - rect.width - 10) + 'px';
	div.style.top = Math.min(y, vh - rect.height - 10) + 'px';

	activePopup = { acId, el: div };
	return div;
}

// CFL Pop-up
function openCflPopup(ac, screenX, screenY) {
	const flOptions = FL_LIST.map(f =>
		`<div onclick="issueCflFromPopup('${f.v}',${ac.id})"
              style="padding:0px 2px;cursor:pointer;
                     ${f.v === ac.fl ? 'background: #fff;color: #3f7196;' : ''};border: 2px solid #3f7196"
              onmouseover="this.style.border='2px solid #ff0'"
              onmouseout="this.style.border='2px solid #3f7196'">
            ${f.l}
         </div>`
	).join('');

	const html = `
        <div style="font-weight:500;color: #fff;margin:10px 0 6px;width:110px;
                    font-size:0.8rem;letter-spacing:1px;text-align:center;">${ac.callsign}</div>
        <div style="font-weight:500;font-size:0.80rem;max-height:100px;overflow-y:auto;margin-bottom:8px;width:110px;
                    border:2px solid #222;padding:2px;text-align:left;">
            ${flOptions}
        </div>
        <input id="cflFreeInput" type="number" maxlength="3"
               style="width:40px;padding:2px 2px;box-sizing:border-box;text-align:center;margin-bottom:12px;"
            oninput="this.value=this.value.replace(/[^0-9]/g,'')"
            onkeydown="handleCflKey(event,${ac.id})">`;

	const popup = makePopup(screenX, screenY, ac.id, html);
	// Scroll list to current FL
	setTimeout(() => {
		const active = popup.querySelector('[style*="#1f6feb"]');
		if (active) active.scrollIntoView({ block: 'center' });
		popup.querySelector('#cflFreeInput')?.focus();
	}, 30);
}

function issueCflFromPopup(flVal, acId) {
	const ac = getAcById(acId);
	if (!ac) return;

	// Display instantly — persists through climb/descent until level
	ac.cflDisplay = flVal;
	ac.cflSteadyCount = 0;
	ac.cflApplied = false;

	const delay = pilotDelay('FL', ac.altFt);
	cancelPendingType(ac, 'FL');
	ac.pendingInstrs.push({
		type: 'FL',
		triggerTime: simTimeSec + delay,
		label: `FL ${flVal}`,
		apply: () => {
			ac.targetAltFt = flToAltFt(flVal);
			ac.cflApplied = true;
			maybeArmLevelConstraint(ac, flVal);
			// Do NOT touch ac.cflDisplay here — let physics clear it naturally
		}
	});
	closeActivePopup();
	updateAtcStatus();
	draw();
}

function handleCflKey(e, acId) {
	if (e.key === 'Escape') { closeActivePopup(); return; }
	if (e.key !== 'Enter') return;
	const raw = e.target.value.trim();
	// Require exactly 3 digits "xxx"
	if (!/^\d\d\d$/.test(raw)) { closeActivePopup(); return; };

	const flVal = 'F' + raw; // e.g. "260" -> "F260"
	issueCflFromPopup(flVal, acId);
}

function maybeArmLevelConstraint(ac, flVal) {
	const routeEntry = findBestRouteConstraints(ac.route);
	if (!routeEntry) {
		ac.lcActive = false;
		ac.lcWp = null;
		ac.lcTargetAltFt = null;
		ac.lcReqVsFpm = null;
		ac.lcIndex = null;
		return;
	}

	const targetAltFt = flToAltFt(flVal);

	// If already at or below required level, no need for constraint logic
	if (ac.altFt <= targetAltFt) {
		ac.lcActive = false;
		ac.lcWp = null;
		ac.lcTargetAltFt = null;
		ac.lcReqVsFpm = null;
		ac.lcIndex = null;
		return;
	}

	// ac.route[0] is next WP; only consider constraints at or after that
	const startIdx = 0;
	let chosen = null;
	let chosenRouteIdx = null;
	let chosenConstraintIdx = null;

	routeEntry.constraints.forEach((c, i) => {
		if (c.fl !== flVal) return;

		const wpIdxInRoute = ac.route.indexOf(c.wp);
		if (wpIdxInRoute === -1) return;
		if (wpIdxInRoute < startIdx) return;

		if (
			!chosen ||
			wpIdxInRoute < chosenRouteIdx
		) {
			chosen = c;
			chosenRouteIdx = wpIdxInRoute;
			chosenConstraintIdx = i;
		}
	});

	if (!chosen) {
		ac.lcActive = false;
		ac.lcWp = null;
		ac.lcTargetAltFt = null;
		ac.lcReqVsFpm = null;
		ac.lcIndex = null;
		return;
	}

	ac.lcActive = true;
	ac.lcWp = chosen.wp;
	ac.lcTargetAltFt = targetAltFt;
	ac.lcReqVsFpm = null;
	ac.lcIndex = chosenConstraintIdx;
}

// Cleared HDG Pop-up
function openChdPopup(ac, screenX, screenY) {
	const html = `<div style="font-weight:500;color: #fff;margin:10px 0 6px;width:70px;
                font-size:0.8rem;letter-spacing:1px;text-align:center;">
                ${ac.callsign}</div>
			<div style="padding:2px">
            <input id="chdFreeInput" type="number" maxlength="3"
				style="width:40px;padding:2px;box-sizing:border-box;text-align:center;margin-bottom:4px;"
                oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                onkeydown="handleChdKey(event,${ac.id})">
			</div>
			<div style="padding:2px">
            <button style="width:40px;padding:2px;cursor:pointer"
				onclick="issueChdCancel(${ac.id})">HDG</button>
			</div>`;
	makePopup(screenX, screenY, ac.id, html);
	setTimeout(() => document.getElementById('chdFreeInput')?.focus(), 30);
}

function issueChdFromPopup(hdgVal, acId) {
	const ac = getAcById(acId);
	if (!ac) return;

	const hdg = clamp(parseInt(hdgVal), 0, 359);

	// Display instantly
	ac.clearedHdgDisplay = `H${String(hdg).padStart(3, '0')}`;

	const delay = pilotDelay('HDG', ac.altFt);
	cancelPendingType(ac, 'HDG');
	ac.pendingInstrs.push({
		type: 'HDG',                         // ← add type
		triggerTime: simTimeSec + delay,
		label: `HDG ${String(hdg).padStart(3, '0')}`,
		apply: () => {
			ac.targetHdg = hdg;
			ac.navMode = 'HDG';
			ac.directWp = null;
		}
	});
	closeActivePopup();
	updateAtcStatus();
	draw();
}

function issueChdCancel(acId) {
	const ac = getAcById(acId);
	if (!ac) return;

	const hasRoute = ac.route && ac.route.length > 0;
	const delay = pilotDelay('HDG', ac.altFt);

	// Display instantly — clear the cleared HDG label
	ac.clearedHdgDisplay = null;
	cancelPendingType(ac, 'HDG');

	if (hasRoute) {
		ac.pendingInstrs.push({
			type: 'HDG',
			triggerTime: simTimeSec + delay,
			label: `RTE ${ac.route[0]}`,
			apply: () => {
				ac.targetHdg = null;
				ac.navMode = 'RTE';
				ac.directWp = null;
				ac.inboundTrack = null;
				ac.inboundSettled = false;
			}
		});
	} else {
		ac.pendingInstrs.push({
			type: 'HDG',
			triggerTime: simTimeSec + delay,
			label: `HDG PRES`,
			apply: () => {
				ac.targetHdg = null;
				ac.navMode = 'HDG';
			}
		});
	}
	closeActivePopup();
	updateAtcStatus();
	draw();
}

function handleChdKey(e, acId) {
	if (e.key === 'Escape') { closeActivePopup(); return; }
	if (e.key !== 'Enter') return;
	const raw = e.target.value.trim();
	// Require exactly 3 digits "xxx"
	if (!/^\d\d\d$/.test(raw)) { closeActivePopup(); return; };

	const val = parseInt(raw, 10);
	if (isNaN(val)) { closeActivePopup(); return; };

	issueChdFromPopup(val, acId);
}

// Cleared Speed Pop-up
let spdPopupMach = true; // local state for M button
let spdPopupSign = null;

function openSpdPopup(ac, screenX, screenY) {
	spdPopupMach = ac.altFt >= 30000;
	spdPopupSign = ac.spdSign ?? null;       // seed from aircraft
	renderSpdPopup(ac, screenX, screenY);
}

function renderSpdPopup(ac, screenX, screenY) {
	const isMach = spdPopupMach;
	const list = isMach
		? [0.75, 0.76, 0.77, 0.78, 0.79, 0.80, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89]
		: [200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350];

	const current = isMach ? (ac.clearedMach ?? ac.mach ?? 0.82)
		: (ac.clearedIas ?? 280);

	const items = list.map(v => {
		const label = isMach ? `${v.toFixed(2).toString().replace(/^0\./, '.')}` : `${v / 10}`;
		const active = Math.abs(v - current) < (isMach ? 0.005 : 0.5);
		return `<div onclick="issueSpdFromPopup(${v},${ac.id})"
                     data-spdval="${v}"
                     style="padding:0 2px;cursor:pointer;text-align:left;
                            ${active ? 'background: #fff;color:#3f7196;border:2px solid #3f7196' : 'border:2px solid #3f7196'}"
                     onmouseover="this.style.border='2px solid #ffff00'"
                     onmouseout="this.style.border='2px solid #3f7196'">
                    ${label}
                </div>`;
	}).join('');

	const plusActive = spdPopupSign === '+';
	const minusActive = spdPopupSign === '-';

	const html = `
    <div style="font-weight:500;color: #fff;margin:10px 0 6px;width:80px;
                  font-size:0.8rem;letter-spacing:1px;padding:0px 8px;text-align:left;">${ac.callsign}</div>
    <div id="spdList" style="font-weight:500;max-height:100px;overflow-y:auto;margin-bottom:2px;width:55px;font-size:0.8rem;
                               border:2px solid #222;text-align:left;padding:2px;justify-content:left;margin-left:6px;">
        ${items}
    </div>
    <div style="display:flex;gap:3px;margin:0 2px 3px 8px;width:55px;">
        <button onclick="toggleSpdSign(${ac.id}, '+')"style="flex:1;"class=${plusActive ? 'active' : ''}>+</button>
        <button onclick="toggleSpdSign(${ac.id}, '-')"style="flex:1;"class=${minusActive ? 'active' : ''}>−</button>
    </div>
	<div style="display:flex;gap:3px;margin:0 2px 3px 8px;width:55px;">
		<button id="spdMBtn" onclick="spdPopupToggleMach(${ac.id},${screenX},${screenY})"style="flex:1"class=${isMach ? 'active' : ''}>M</button>
        <button onclick="issueSpdCancel(${ac.id})"style="flex:1;">✕</button>
	</div>
	<div style="display:flex;margin:0 6px;width:55px;justify-content: center;">
    	<input id="spdFreeInput" type="number" maxlength="3"
		style="width:30px;box-sizing:border-box;text-align:center;"
        onkeydown="handleSpdKey(event,${ac.id})">
	</div>`

	/*const existing = document.getElementById('dataBlockPopup');
	const pos = existing
		? { x: parseInt(existing.style.left), y: parseInt(existing.style.top) }
		: { x: screenX, y: screenY };*/

	makePopup(screenX, screenY, ac.id, html);
	setTimeout(() => {
		const active = document.querySelector('#spdList [style*="#1f6feb"]');
		if (active) active.scrollIntoView({ block: 'center' });
		document.getElementById('spdFreeInput')?.focus();
	}, 30);
}

function toggleSpdSign(acId, sign) {
	// Off ↔ this sign; only one active
	if (spdPopupSign === sign) {
		spdPopupSign = null;
	} else {
		spdPopupSign = sign;
	}
	const ac = getAcById(acId);
	if (!ac) return;
	ac.spdSign = spdPopupSign;     // persist to aircraft for future popups
	// Re‑render buttons with updated highlight
	const rect = activePopup?.el.getBoundingClientRect();
	if (rect) renderSpdPopup(ac, rect.left, rect.top);
}

function issueSpdFromPopup(val, acId) {
	const ac = getAcById(acId);
	if (!ac) return;

	const isMach = spdPopupMach;
	const delay = pilotDelay('SPD', ac.altFt);

	// Store ATC target
	if (isMach) {
		const mach = Number(val);
		ac.spdMode = 'MACH';
		ac.clearedMach = mach;
		ac.clearedIas = null;
		const sign = ac.spdSign ?? spdPopupSign ?? null;
		const suffix = sign ? sign : '';
		ac.clearedSpdDisplay = `S${mach.toFixed(2).toString().replace(/^0\./, '.')}${suffix}`;
		ac.targetGs = null; // autoGs will use clearedMach
	} else {
		const kts = Number(val);
		ac.spdMode = 'IAS';
		ac.clearedIas = kts;
		ac.clearedMach = null;
		const sign = ac.spdSign ?? spdPopupSign ?? null;
		const suffix = sign ? sign : '';
		ac.clearedSpdDisplay = `S${kts / 10}${suffix}`;
		ac.targetGs = null; // autoGs will use clearedIas
	}

	cancelPendingType(ac, 'SPD');

	ac.pendingInstrs.push({
		type: 'SPD',
		triggerTime: simTimeSec + delay,
		label: ac.clearedSpdDisplay,
		apply() {
			// No extra apply logic; autoGs reads clearedMach/IAS
		}
	});

	closeActivePopup();
	updateAtcStatus();
	draw();
}

function issueSpdCancel(acId) {
	const ac = getAcById(acId);
	if (!ac) return;

	// Display instantly — clear the cleared speed label
	ac.clearedSpdDisplay = null;

	const delay = pilotDelay('SPD', ac.altFt);
	cancelPendingType(ac, 'SPD');
	ac.pendingInstrs.push({
		type: 'SPD',
		triggerTime: simTimeSec + delay,
		label: `SPD CANCEL`,
		apply: () => {
			ac.clearedMach = null;
			ac.clearedIas = null;
			ac.spdMode = 'MACH';
			ac.targetGs = null;
			ac.crossoverAlt = null;
		}
	});
	closeActivePopup();
	updateAtcStatus();
	draw();
}

function spdPopupToggleMach(acId, sx, sy) {
	spdPopupMach = !spdPopupMach;
	const ac = getAcById(acId); if (!ac) return;
	renderSpdPopup(ac, sx, sy);
}

function spdPopupAdjust(acId, dir) {
	const ac = getAcById(acId); if (!ac) return;
	const input = document.getElementById('spdFreeInput');
	if (spdPopupMach) {
		const cur = ac.clearedMach ?? ac.mach ?? 0.82;
		const nv = clamp(Math.round((cur + dir * 0.02) * 100) / 100, 0.70, 0.90);
		if (input) input.value = nv.toFixed(2);
		issueSpdFromPopup(nv, acId);
	} else {
		const cur = ac.clearedIas ?? 280;
		const nv = clamp(cur + dir * 10, 230, 350);
		if (input) input.value = nv;
		issueSpdFromPopup(nv, acId);
	}
}

function handleSpdKey(e, acId) {
	if (e.key === 'Escape') { closeActivePopup(); return; }
	if (e.key !== 'Enter') return;
	const raw = e.target.value.trim();
	if (!raw) { closeActivePopup(); return; };
	const isMach = spdPopupMach;
	if (isMach) {
		// Require format ".xx" exactly
		if (!/^\.\d\d$/.test(raw)) { closeActivePopup(); return; };
		const val = parseFloat(raw);
		if (isNaN(val)) { closeActivePopup(); return; };
		issueSpdFromPopup(val, acId);
	} else {
		// IAS: must be 2 digits "xx"
		if (!/^\d\d$/.test(raw)) { closeActivePopup(); return; };
		const val = parseInt(raw, 10);
		if (isNaN(val)) { closeActivePopup(); return; };
		issueSpdFromPopup(val, acId);
	}
}

// Free Text Input Pop-up
function openFtPopup(ac, screenX, screenY) {
	const html = `<input id="ftInput" type="text" maxlength="30"
               value="${ac.freeTextInput ?? ''}"
               style="width:160px;box-sizing:border-box;"
               onkeydown="handleFtKey(event,${ac.id})">`;

	makePopup(screenX, screenY, ac.id, html);
	setTimeout(() => {
		const el = document.getElementById('ftInput');
		if (el) { el.focus(); el.select(); }
	}, 30);
}

function handleFtKey(e, acId) {
	if (e.key === 'Escape') { closeActivePopup(); return; }
	if (e.key !== 'Enter') return;
	const ac = getAcById(acId); if (!ac) return;
	ac.freeTextInput = e.target.value.trim();
	closeActivePopup();
	draw();
}

function openFtlPopup(ac, wpName, screenX, screenY) {
	const allowed = FTL_LEVELS_BY_WP[wpName] || [];
	const listHtml = allowed.map(v => {
		const entry = FL_LIST.find(f => f.v === v);
		const label = entry ? entry.l : v;
		const active = ac.ftl === v;
		const style = active ? 'background: #fff;color: #3f7196;' : '';
		return `<div onclick="issueFtlFromPopup('${v}',${ac.id})"
             style="padding:0px 2px;cursor:pointer;${style};border: 2px solid #3f7196"
             onmouseover="this.style.border='2px solid #ff0';"
             onmouseout="this.style.border='2px solid #3f7196';">
             ${label}
            </div>`;
	}).join('');

	const coRow1 = `
    <div style="display:flex;gap:6px;margin:8px;align-items:center;width:180px;">
      <button style="width:13px;height:13px;" onclick="toggleFtlFlag(${ac.id},'CoReq')"></button>
	  <span style="flex:1;text-align:left;">Co Req</span>
      <button style="width:13px;height:13px;" onclick="toggleFtlFlag(${ac.id},'CoDone')"></button>
	  <span style="flex:1;text-align:left;">Co Done</span>
    </div>`;
	const coRow2 = `
    <div style="display:flex;gap:6px;margin:8px;align-items:center;width:180px;">
      <button style="width:13px;height:13px;" onclick="toggleFtlFlag(${ac.id},'CoPend')"></button>
	  <span style="flex:1;text-align:left;">Co Pend</span>
      <button style="width:13px;height:13px;" onclick="toggleFtlFlag(${ac.id},'CoRej')"></button>
	  <span style="flex:1;text-align:left;">Co Rej</span>
    </div>`;

	const html = `
    ${coRow1}
    ${coRow2}
    <div style="max-height:150px;overflow-y:auto;margin:8px;width:110px;border:2px inset;border-color: #222 #fff #fff #222;padding:2px;text-align:left;">
      ${listHtml || '<div style="color: #ccc;">No outbound levels</div>'}
    </div>
	<div style="display:flex;margin:8px 8px;width:110px;justify-content: center;">
    	<input id="ftlFreeInput" type="number" maxlength="3"
    		style="width:40px;;box-sizing:border-box;"
      		onkeydown="handleFtlKey(event,${ac.id})">
	</div>`

	const popup = makePopup(screenX, screenY, ac.id, html);
	setTimeout(() => {
		popup.querySelector('#ftlFreeInput')?.focus();
	}, 30);
}

function issueFtlFromPopup(flVal, acId) {
	const ac = getAcById(acId);
	if (!ac) return;
	ac.ftl = flVal;
	closeActivePopup();
	rebuildFdlState();
	renderFdlPanels();
	draw();
}

function handleFtlKey(e, acId) {
	if (e.key === 'Escape') {
		closeActivePopup();
		return;
	}
	if (e.key !== 'Enter') return;
	const raw = e.target.value.trim();
	if (!/^\d\d\d$/.test(raw)) return;
	const flVal = 'F' + raw;
	issueFtlFromPopup(flVal, acId);
}

function toggleFtlFlag(acId, flagName) {
	const ac = getAcById(acId);
	if (!ac) return;
	const key = 'ftl' + flagName; // ftlCoReq, ftlCoDone, etc.
	ac[key] = !ac[key];
	// purely visual for now
}

function ftlLabel(flVal) {
	if (!flVal) return '';
	const entry = FL_LIST.find(f => f.v === flVal);
	return entry ? entry.l : flVal;  // fallback to raw value if not found
}

// ── FDL CONFIG ─────────────────────────────────────────────────────────
const FDL_CONFIG = [
	{ id: 'FDL_SIKOU', wps: ['SIKOU'], inbound: true, outbound: true },
	{ id: 'FDL_IKELA', wps: ['IKELA'], inbound: true, outbound: true },
	{ id: 'FDL_EPKAL', wps: ['EPKAL'], inbound: false, outbound: true },
	{ id: 'FDL_DS_SB', wps: ['DOSUT', 'ASOBA'], inbound: true, outbound: false },
	{ id: 'FDL_SULUX', wps: ['SULUX'], inbound: true, outbound: false },
	{
		id: 'FDL_TM_BK', wps: ['TAMOT', 'BEKOL'],   // TAMOT in, BEKOL out
		inbound: null, outbound: null
	}, // per‑WP filter applied below
	{ id: 'FDL_SIERA', wps: ['SIERA'], inbound: true, outbound: false }
];

// special per-WP direction for TAMOT/BEKOL
function fdlAllowsDirectionForWp(fdlId, wpName, inbound, outbound) {
	if (fdlId === 'FDL_TM_BK') {
		if (wpName === 'TAMOT') {
			return inbound && !outbound; // TAMOT inbound only
		}
		if (wpName === 'BEKOL') {
			return outbound && !inbound; // BEKOL outbound only
		}
	}
	const cfg = FDL_CONFIG.find(f => f.id === fdlId);
	if (!cfg) return false;
	if (cfg.inbound === true && inbound) return true;
	if (cfg.outbound === true && outbound) return true;
	return false;
}

const FDL_MIDROUTE_WP = {
	SULUX: {
		outboundIfExitIs: [],      // firExitWp IS SULUX → outbound
		inboundIfExitIs: ['IKELA', 'EPKAL'],  // firExitWp is beyond SULUX → inbound
	},
	// Add other mid-route wps here if needed
};

let FDL_STATE = {}; // { FDL_ID: [ rows... ] }

// shape of a row:
// {
//   fdlId, wpName, acId,
//   callsign, etaSimMs, etaLabel, cfl, ftl, inbound, outbound,
//   arrow, highlight
// }

function rebuildFdlState() {
	FDL_STATE = {};
	const simUtcNow = getSimUtcMs();
	FDL_CONFIG.forEach(cfg => {
		const rows = [];

		aircraft.forEach(ac => {
			if (!ac.active) return;

			cfg.wps.forEach(wpName => {
				const isMidRouteWp = !!FDL_MIDROUTE_WP[wpName];

				// Normal wps need remaining route; mid-route wps use originalRoute
				if (!isMidRouteWp && (!ac.route || !ac.route.length)) return;

				const flow = classifyFlowAtWp(ac, wpName);
				if (!flow) return;

				const { inbound, outbound, arrow } = flow;
				if (!fdlAllowsDirectionForWp(cfg.id, wpName, inbound, outbound)) return;

				const simUtcNow = getSimUtcMs();
				let etaMs = null;
				if (simUtcNow !== null) {
					const est = estimateTimeToWaypoint(ac, wpName);
					if (est !== null) {
						// idxWp === 999 means already passed — back-project to get passage time
						const alreadyPassed = (flow.idxWp === 999) ||
							(ac.route.indexOf(wpName) === -1 && !ac.route.includes(wpName));
						etaMs = alreadyPassed
							? simUtcNow - est.tSec * 1000   // passage time = now minus travel-time-back
							: simUtcNow + est.tSec * 1000;  // future ETA
					}
				}
				const etaLabel = etaMs !== null ? formatUtcHM(etaMs) : '----';

				const cfl = ac.cflDisplay ?? ac.fl ?? '';

				const row = {
					fdlId: cfg.id,
					wpName,
					acId: ac.id,
					callsign: ac.callsign,
					etaSimMs: etaMs ?? Infinity,
					etaLabel: etaLabel.replace(':', ''),
					cfl,
					ftl: ftlLabel(ac.ftl ?? ''),
					inbound,
					outbound,
					arrow,
					highlight: !!ac.fdlHighlight,
					firExitWp: ac.firExitWp ?? null,
				};
				rows.push(row);
			});
		});

		rows.sort((a, b) => b.etaSimMs - a.etaSimMs);
		FDL_STATE[cfg.id] = rows;
	});
}

function fdlInboundLabel(firExitWp) {
	if (!firExitWp) return '';
	const STAR_MAP = {
		'CANTO': 'CANTO3A',
		'BETTY': 'BETTY3A',
		'CHALI': 'CHALI4A',
	};
	return STAR_MAP[firExitWp] ?? firExitWp;
}

function renderFdlPanels() {
	FDL_CONFIG.forEach(cfg => {
		const el = document.getElementById(cfg.id); // e.g. 'fdl_SIKOU' -> 'fdl_sikou'
		if (!el) return;

		const rows = FDL_STATE[cfg.id] || [];
		if (!rows.length) {
			el.textContent = ''; // or 'No traffic'
			return;
		}

		const lines = rows.map(r => {
			const hlPrefix = r.highlight ? '[*] ' : '    ';
			// outbound row: callsign, eta, CFL, FTL, arrow
			// inbound row:  callsign, eta, CFL, inbound text placeholder, arrow
			let mid;
			if (r.outbound && !r.inbound) {
				mid = `${r.callsign.padEnd(8, ' ')} ${r.etaLabel} ${r.cfl.padEnd(4, ' ')} ${String(r.ftl || '').padEnd(4, ' ')} ${r.arrow}`;
			} else {
				mid = `${r.callsign.padEnd(8, ' ')} ${r.etaLabel} ${r.cfl.padEnd(4, ' ')} ${r.firExitWp} ${r.arrow}`;
			}
			return hlPrefix + mid;
		});

		el.textContent = lines.join('\n');
	});
}

function toggleFdlHighlightForAc(acId) {
	const ac = getAcById(acId);
	if (!ac) return;
	ac.fdlHighlight = !ac.fdlHighlight;
	rebuildFdlState();
	renderFdlPanels();
}

// ── FDL OVERLAY STATE ──────────────────────────────────────────────────

// Screen-space geometry for hit-testing
let FDL_OVERLAY = {};
// {
//   FDL_SIKOU: {
//     anchorNM: { x, y },
//     boxRect: { x, y, w, h },
//     titleRect: { x, y, w, h },
//     rows: [
//       { acId, rowRect: {x,y,w,h}, callsignRect: {...}, ftlRect: {...}, wpName }
//     ]
//   },
//   ...
// }

// Initial anchor positions (in NM) relative to 0,0
function ensureFdlOverlayState() {
	const DEFAULT_ANCHORS = {
		FDL_SIKOU: { x: -240, y: 35 },
		FDL_IKELA: { x: -240, y: -25 },
		FDL_EPKAL: { x: -165, y: -110 },
		FDL_DS_SB: { x: 50, y: -95 },
		FDL_SULUX: { x: 25, y: 110 },
		FDL_TM_BK: { x: -120, y: 175 },
		FDL_SIERA: { x: -240, y: 115 },
	};
	FDL_CONFIG.forEach(cfg => {
		if (!FDL_OVERLAY[cfg.id]) {
			FDL_OVERLAY[cfg.id] = {
				anchorNM: { ...(DEFAULT_ANCHORS[cfg.id] || { x: 0, y: 0 }) },
				boxRect: null, titleRect: null, rows: []
			};
		}
	});
}

function pointInRect(px, py, rect) {
	if (!rect) return false;
	return px >= rect.x && px <= rect.x + rect.w &&
		py >= rect.y && py <= rect.y + rect.h;
}

function drawFdlOverlays(ctx, S) {
	ensureFdlOverlayState();
	const titleFont = '12px "Cascadia Mono"';
	const rowFont = '12px "Cascadia Mono"';
	const lineH = 13;
	const paddingX = 4;
	const paddingY = 2;
	const titleH = lineH;

	FDL_CONFIG.forEach(cfg => {
		const overlay = FDL_OVERLAY[cfg.id];
		const rows = FDL_STATE[cfg.id] || [];

		const anchor = overlay.anchorNM || { x: 0, y: 0 };
		const anchorScreen = S(anchor.x, anchor.y);
		const x0 = anchorScreen.x;
		const y0 = anchorScreen.y;

		ctx.save();

		ctx.font = titleFont;
		const titleText = cfg.id.replace('FDL_', '').replace('DS_SB', 'DOSUT/ASOBA').replace('TM_BK', 'TAMOT/BEKOL');
		let width = ctx.measureText(titleText).width + paddingX * 2 + 20;
		ctx.font = rowFont;
		const sampleRow = '   ' +           // 3 prefix spaces
			'XXXXXXXXX' +                    // 9 callsign
			'0000' +                         // 4 eta
			'  ' +                           // 2 spaces
			'000' +                          // 3 level
			'  ' +                           // 2 spaces
			'XXXXXXXXXXX' +                  // 11 ftl/text
			'→';                             // arrow
		const measuredW = ctx.measureText(sampleRow).width + paddingX * 2;
		ctx.font = titleFont;
		const titleW = ctx.measureText(titleText).width + paddingX * 2 + 20;
		const boxW = Math.max(measuredW, titleW);

		if (rows.length > 0) {
			rows.forEach(r => {
				const isOutbound = r.outbound && !r.inbound;
				const mid = isOutbound
					? `${r.callsign} ${r.etaLabel} ${r.cfl} ${r.ftl}`
					: `${r.callsign} ${r.etaLabel} ${r.cfl}`;
				const w = ctx.measureText(mid).width + paddingX * 2;
				if (w > width) width = w;
			});
		}

		const emptyH = rows.length === 0 ? lineH + paddingY * 2 : 0;
		const bodyH = rows.length > 0 ? rows.length * lineH + paddingY * 2 : emptyH;
		const boxH = titleH + bodyH;

		// Title bar
		ctx.fillStyle = '#aaaacc';
		ctx.fillRect(x0, y0, boxW, titleH);
		ctx.font = titleFont;
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ffffff';
		ctx.textBaseline = 'middle';
		ctx.fillText(titleText, x0 + boxW / 2, y0 + titleH / 2);
		ctx.textAlign = 'left';

		overlay.boxRect = { x: x0, y: y0, w: boxW, h: boxH };
		overlay.titleRect = { x: x0, y: y0, w: boxW, h: titleH };
		overlay.rows = [];

		if (rows.length === 0) {
			// Draw a dim "- - -" placeholder row so the box has visible height
			ctx.font = rowFont;
			ctx.fillStyle = '#3a3a4a';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
			ctx.fillText('', x0 + paddingX, y0 + titleH + paddingY + 1);
			ctx.restore();
			return;   // no rows to iterate
		}

		// Rows
		ctx.font = rowFont;
		ctx.textBaseline = 'top';
		let y = y0 + titleH + paddingY;

		rows.forEach(r => {
			const isOutbound = r.outbound && !r.inbound;

			// Row highlight
			if (r.highlight) {
				ctx.fillStyle = 'rgba(255, 251, 0, 0.45)';
				ctx.fillRect(x0 + 1, y, boxW - 2, lineH);
			}

			ctx.textBaseline = 'top';
			let cx = x0 + paddingX;

			// 3 spaces prefix
			const prefixW = ctx.measureText('   ').width;
			cx += prefixW;

			// Callsign — padEnd 9
			const cs = r.callsign.padEnd(9, ' ');
			ctx.fillStyle = '#e6edf3';
			const csW = ctx.measureText(cs).width;
			ctx.fillText(cs, cx, y + 1);
			const callsignRect = { x: cx, y, w: csW, h: lineH };
			cx += csW;

			// ETA hhmm — 4 chars
			const eta = (r.etaLabel ?? '----').substring(0, 4).padEnd(4, ' ');
			ctx.fillStyle = '#e6edf3';
			ctx.fillText(eta, cx, y + 1);
			cx += ctx.measureText(eta).width;

			// 2 spaces
			cx += ctx.measureText('  ').width;

			// Level — 3 chars (strip leading F, e.g. F350 → 350)
			const lvl = (r.cfl || r.fl || '---').replace(/^F/, '').substring(0, 3).padEnd(3, ' ');
			ctx.fillStyle = '#e6edf3';
			ctx.fillText(lvl, cx, y + 1);
			cx += ctx.measureText(lvl).width;

			// 2 spaces
			cx += ctx.measureText('  ').width;

			// FTL or TEXT — padEnd 11
			let ftlRect = null;
			if (isOutbound) {
				const ftlRaw = r.ftl || '           ';
				const ftlStr = ftlRaw.padEnd(11, ' ');
				ctx.fillStyle = '#0ff';
				const ftlW = ctx.measureText(ftlStr).width;
				ctx.fillText(ftlStr, cx, y + 1);
				ftlRect = { x: cx, y, w: ftlW, h: lineH };
				cx += ftlW;
			} else {
				const txtStr = fdlInboundLabel(r.firExitWp).padEnd(11, ' ');
				ctx.fillStyle = '#fff';
				ctx.fillText(txtStr, cx, y + 1);
				cx += ctx.measureText(txtStr).width;
			}

			// Arrow
			ctx.fillStyle = '#e29480';
			ctx.fillText(r.arrow || '', cx, y + 1);

			overlay.rows.push({
				acId: r.acId,
				wpName: r.wpName,
				rowRect: { x: x0, y, w: boxW, h: lineH },
				callsignRect,
				ftlRect
			});

			y += lineH;
		});
		ctx.restore();
	});
}

function handleFdlClick(px, py) {
	ensureFdlOverlayState();

	for (const cfg of FDL_CONFIG) {
		const ov = FDL_OVERLAY[cfg.id];
		if (!ov || !ov.boxRect) continue;
		if (!pointInRect(px, py, ov.boxRect)) continue;

		for (const row of ov.rows) {
			// Callsign region
			if (pointInRect(px, py, row.callsignRect)) {
				const ac = getAcById(row.acId);
				if (!ac) return true;
				selectAircraft(ac.id);   // replaces the old block
				return true;
			}

			// FTL region (outbound only)
			if (row.ftlRect && pointInRect(px, py, row.ftlRect)) {
				const ac = getAcById(row.acId);
				if (!ac) return true;
				const rect = _canvas.getBoundingClientRect();
				const screenX = rect.left + px;
				const screenY = rect.top + py;
				openFtlPopup(ac, row.wpName, screenX, screenY);
				return true;
			}
		}
	}
	return false;
}

function generateCallsign() {
	const used = new Set(aircraft.map(a => a.callsign));
	let cs, tries = 0;
	do {
		const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
		// Weighted digit count: 1→2%, 2→10%, 3→73%, 4→15%
		const r = Math.random() * 100;
		const len = r < 2 ? 1
			: r < 12 ? 2
				: r < 85 ? 3
					: 4;
		// First digit: 1–9 (no leading zero)
		let num = String(Math.floor(Math.random() * 9) + 1);
		// Remaining digits: 0–9
		for (let i = 1; i < len; i++) num += Math.floor(Math.random() * 10);
		cs = op + num;
		tries++;
	} while (used.has(cs) && tries < 300);
	return cs;
}

function createAircraft(nx, ny) {
	if (aircraft.length >= MAX_AC) return null;
	const [type, wtc] = randomAcType();
	const fl = FL_LIST[Math.floor(Math.random() * FL_LIST.length)].v;
	const altFt = flToAltFt(fl);

	const ac = {
		id: _acIdCtr++, callsign: generateCallsign(),
		hdg: rndInt(0, 359), gs: rndInt(280, 550),
		x: parseFloat(nx.toFixed(2)), y: parseFloat(ny.toFixed(2)),
		fl, type, wtc, lx: 0, ly: 0,
		ias: null, mach: null,
		pendingInstrs: [],   // [{ triggerTime, apply: fn }]
		// sim state
		altFt, targetAltFt: altFt,
		// Level-constraint guidance state
		lcActive: false,
		lcWp: null,
		lcTargetAltFt: null,
		lcReqVsFpm: null,
		lcIndex: null,
		targetHdg: null, targetGs: null,
		navMode: 'HDG', route: [], originalRoute: [], directWp: null,
		appearTime: null, active: true, trails: [],
		spdMode: 'MACH', clearedMach: null, clearedIas: null,
		// data block display
		clearedHdgDisplay: null,
		cflDisplay: null,
		clearedSpdDisplay: null,
		freeTextStatic: '',
		freeTextInput: '',
		_cflSteadyCount: 0,
		cflApplied: false,
		crossoverAlt: null,
		// hit regions (set by drawAcData each frame)
		dbRect: null, cflRect: null, chdRect: null,
		spdRect: null, ftRect: null, spdSign: null,
		// Entry Exit WP
		firEntryWp: null,
		firExitWp: null,
		// FDL / FTL state:
		fdlHighlight: false,
		ftl: null, // e.g. 'F260'
		ftlCoReq: false,
		ftlCoDone: false,
		ftlCoPend: false,
		ftlCoRej: false
	};
	aircraft.push(ac);
	return ac;
}

function getAcById(id) { return aircraft.find(a => a.id === id) || null; }

function removeAcById(id) {
	const idx = aircraft.findIndex(a => a.id === id);
	if (idx < 0) return;
	aircraft.splice(idx, 1);

	// clean up probes
	for (let i = probes.length - 1; i >= 0; i--) {
		if (probes[i].ac1 === id || probes[i].ac2 === id) {
			recycleColour(probes[i].colour);
			probes.splice(i, 1);
		}
	}

	// clean up RBLs  ← ADD THESE TWO LINES
	rblList = rblList.filter(r => r.p1.acId !== id && r.p2.acId !== id);
	updateRblUI();

	if (selectedAcId === id) {
		// Clear fdlHighlight on the removed aircraft's entry is moot (already spliced)
		// Just null out selection and clear panel
		selectedAcId = null;
		clearPanelIfDeselected();
	}

	rebuildFdlState(); refreshPanel(); updateProbeUI(); draw();
}

function acToVals(a, b) {
	const r = d => d * Math.PI / 180, tA = a.hdg + MAGVAR, tB = b.hdg + MAGVAR;
	return {
		xa: a.x, ya: a.y, vxa: a.gs * Math.sin(r(tA)), vya: a.gs * Math.cos(r(tA)),
		xb: b.x, yb: b.y, vxb: b.gs * Math.sin(r(tB)), vyb: b.gs * Math.cos(r(tB))
	};
}

// ── SEP PROBE SYSTEM ─────────────────────────────────────────────────────
const PROBE_COLOURS = ['#2dcf43', '#2b81e3', '#fa6bf3', '#9141fa', '#f59953'];
let colourPool = [...PROBE_COLOURS], probes = [], probeMode = null, probeBuilding = null, _probeIdCtr = 0;
function recycleColour(c) { if (!c) return; colourPool.push(c); colourPool.sort((a, b) => PROBE_COLOURS.indexOf(a) - PROBE_COLOURS.indexOf(b)); }
function toggleSepProbe() {
	const wasActive = !!probeMode;
	cancelAllModes();
	if (!wasActive) {
		if (aircraft.length < 2) { alert('Need at least 2 aircraft.'); return; }
		probeMode = 'SELECT_1';
	}
	updatePlaceBtns();
	updateHeadingBtns();
	updateWpBtns();
	updateProbeUI();
	updateRblUI();
	draw();
}
function updateProbeUI() {
	const btn = document.getElementById('sepProbeBtn'), prompt = document.getElementById('probePrompt');
	if (probeMode === 'SELECT_1') {
		btn.classList.add('active')
		prompt.textContent = 'B1 click AC1';
	} else if (probeMode === 'SELECT_2') {
		btn.classList.add('active')
		const a = getAcById(probeBuilding.ac1);
		prompt.innerHTML = '✅ ' + (a ? a.callsign : 'AC1') + ' | B2 / Shift + B1 click AC2';
	} else {
		btn.classList.remove('active')
		prompt.textContent = probes.length ? probes.length + ' PROBE' + (probes.length > 1 ? 's' : '') + ' active' : '';
	}
	_canvas.style.cursor = (probeMode || placeMode || headingMode || addMode) ? 'crosshair' : 'grab';
}
function findClickedAc(e) {
	const rect = _canvas.getBoundingClientRect();
	const px = (e.clientX - rect.left) * (_canvas.width / rect.width), py = (e.clientY - rect.top) * (_canvas.height / rect.height);
	const { toScreen } = getDrawTransform(); let bestId = null, bestD = 18;
	aircraft.forEach(ac => { const p = toScreen(ac.x, ac.y), d = Math.hypot(px - p.x, py - p.y); if (d < bestD) { bestD = d; bestId = ac.id; } });
	return bestId;
}
function handleProbeLeftClick(e) {
	if (!probeMode) return false; const id = findClickedAc(e); if (id === null) return true;
	if (probeMode === 'SELECT_1') { probeBuilding = { ac1: id, colour: null }; probeMode = 'SELECT_2'; }
	else { probeBuilding.ac1 = id; }
	updateProbeUI(); draw(); return true;
}
function handleProbeMiddleClick(e) {
	if (probeMode !== 'SELECT_2') return false; e.preventDefault();
	const id = findClickedAc(e);
	if (id === null) { if (probeBuilding && probeBuilding.colour) recycleColour(probeBuilding.colour); probeBuilding = null; probeMode = null; updateProbeUI(); draw(); return true; }
	if (id === probeBuilding.ac1) return true;
	if (probes.length >= 5) { const old = probes.shift(); recycleColour(old.colour); }
	const colour = colourPool.shift();
	if (!colour) return true;	// pool exhausted, shouldn't happen but safety net
	probes.push({ ac1: probeBuilding.ac1, ac2: id, colour, id: _probeIdCtr++ });
	probeBuilding = null; probeMode = null; updateProbeUI(); draw(); return true;
}
function tryRemoveProbeByDataBlockClick(e) {
	if (!probes.length) return false;
	const rect = _canvas.getBoundingClientRect();
	const mx = (e.clientX - rect.left) * _canvas.width / rect.width;
	const my = (e.clientY - rect.top) * _canvas.height / rect.height;
	const { toScreen } = getDrawTransform();
	const ctx = _canvas.getContext('2d');
	ctx.font = '11px "Cascadia Mono"';

	for (const ac of aircraft) {
		const acProbes = probes.filter(p => p.ac1 === ac.id);
		if (!acProbes.length) continue;

		const p = toScreen(ac.x, ac.y);
		let otherX = _lastW / 2;
		if (aircraft.length > 1) {
			const oth = aircraft.filter(o => o.id !== ac.id);
			otherX = oth.reduce((s, o) => s + toScreen(o.x, o.y).x, 0) / oth.length;
		}
		const side = p.x > otherX ? 'right' : 'left';

		// Measure maxW the same way drawAcData does
		const acType = ac.type ?? 'B738';
		const wtc = ac.wtc ?? 'M';
		const hdgStr = String(Math.round(ac.hdg)).padStart(3, '0');
		const gsStr = String(Math.round(ac.gs / 10)).padStart(2, '0');
		const charW = ctx.measureText('0').width;
		const GAP = charW * 5;
		const line1W = ctx.measureText(`${ac.callsign} ${acType}${wtc}`).width;
		const line2W = ctx.measureText(`${ac.fl}`).width;
		const line3W = ctx.measureText(hdgStr).width + GAP + ctx.measureText(gsStr).width;
		let maxW = Math.max(line1W, line2W, line3W);

		acProbes.forEach(probe => {
			const paired = getAcById(probe.ac2);
			if (!paired) return;
			const v = acToVals(ac, paired);
			const pcpa = calcCPA(v);
			let lbl;
			if (!pcpa.diverging && pcpa.tcpah > 0) {
				const tsec = Math.max(pcpa.tcpamin * 60, 0);
				const mm = String(Math.floor(tsec / 60)).padStart(2, '0');
				const ss = String(Math.floor(tsec % 60)).padStart(2, '0');
				lbl = `${pcpa.dcpa.toFixed(1)}NM ${mm}:${ss}`;
			} else {
				lbl = `${Math.hypot(ac.x - paired.x, ac.y - paired.y).toFixed(2)}NM --:--`;
			}
			maxW = Math.max(maxW, ctx.measureText(lbl).width);
		});

		const OFFSET = 10;
		const bx = (side === 'right' ? p.x + OFFSET : p.x - OFFSET - maxW) + (ac.lx ?? 0);
		const by = (p.y - LINE_H) + (ac.ly ?? 0);

		// NEW — hits on the icon's bottom-right probe label area:
		const ICON_OFFSET_X = 7;
		const ICON_OFFSET_Y = 7;
		acProbes.forEach((probe, i) => {
			const lx = p.x + ICON_OFFSET_X;
			const ly = p.y + ICON_OFFSET_Y + i * LINE_H;
			const tw = ctx.measureText(
				(() => {
					const paired = getAcById(probe.ac2);
					if (!paired) return '';
					const v = acToVals(ac, paired);
					const pcpa = calcCPA(v);
					if (!pcpa.diverging && pcpa.tcpah > 0) {
						const tsec = Math.max(pcpa.tcpamin * 60, 0);
						const mm = String(Math.floor(tsec / 60)).padStart(2, '0');
						const ss = String(Math.floor(tsec % 60)).padStart(2, '0');
						return `${pcpa.dcpa.toFixed(1)}NM ${mm}:${ss}`;
					}
					return `${Math.hypot(ac.x - paired.x, ac.y - paired.y).toFixed(2)}NM ----`;
				})()
			).width;
			if (mx > lx - 3 && mx < lx + tw + 3 && my > ly && my < ly + LINE_H) {
				recycleColour(probe.colour);
				probes = probes.filter(pr => pr.id !== probe.id);
				updateProbeUI();
				draw();
				return;   // inner forEach — exits this probe loop iteration
			}
		});
	}
	return false;
}

// ── RBL SYSTEM ────────────────────────────────────────────────────────────
const MAX_RBLS = 30;
const RBL_COLOUR = '#f5c518';
let rblList = [], rblMode = null, rblBuilding = null, rblIdCtr = 0;
let rblCursorNM = null; // live cursor position in NM during SELECT2

function toggleRbl() {
	const wasActive = !!rblMode;
	cancelAllModes();
	if (!wasActive) rblMode = 'RBL_SELECT1';
	updatePlaceBtns();
	updateHeadingBtns();
	updateWpBtns();
	updateProbeUI();
	updateRblUI();
	draw();
}

function updateRblUI() {
	const btn = document.getElementById('rblBtn');
	const prompt = document.getElementById('rblPrompt');
	if (!btn || !prompt) return;
	if (rblMode === 'RBL_SELECT1') {
		btn.classList.add('active');
		prompt.textContent = 'B1: click point 1 (AC or map)';
	} else if (rblMode === 'RBL_SELECT2') {
		btn.classList.add('active');
		prompt.textContent = 'B2/Shift+B1: click point 2';
	} else {
		btn.classList.remove('active');
		prompt.textContent = rblList.length
			? `${rblList.length} RBL${rblList.length > 1 ? 's' : ''} active`
			: '';
	}
	_canvas.style.cursor = rblMode || probeMode || placeMode || headingMode || addMode ? 'crosshair' : 'grab';
}

function rblNMFromEvent(e) {
	// Returns {x, y, acId} — snaps to aircraft within 18px, else raw NM
	const rect = _canvas.getBoundingClientRect();
	const px = (e.clientX - rect.left) * _canvas.width / rect.width;
	const py = (e.clientY - rect.top) * _canvas.height / rect.height;
	const { toScreen, toNM } = getDrawTransform();
	let bestId = null, bestD = 18;
	aircraft.forEach(ac => {
		const p = toScreen(ac.x, ac.y);
		const d = Math.hypot(px - p.x, py - p.y);
		if (d < bestD) { bestD = d; bestId = ac.id; }
	});
	if (bestId !== null) {
		const ac = getAcById(bestId);
		return { x: ac.x, y: ac.y, acId: bestId };
	}
	const nm = toNM(px, py);
	return { x: nm.x, y: nm.y, acId: null };
}

function calcRblLabel(p1, p2, gs) {
	// p1/p2: {x, y, acId}; gs: knots of the AC with speed (or null)
	const dx = p2.x - p1.x, dy = p2.y - p1.y;
	const dist = Math.hypot(dx, dy);
	// True bearing then apply MAGVAR
	let brg = Math.atan2(dx, dy) * 180 / Math.PI - MAGVAR;
	brg = ((Math.round(brg) % 360) + 360) % 360;
	const brgStr = String(brg).padStart(3, '0');
	const distStr = dist.toFixed(1);
	if (gs && gs > 0) {
		const totalSec = Math.round((dist / gs) * 3600);
		const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
		const ss = String(totalSec % 60).padStart(2, '0');
		return `${brgStr}/${distStr}/${mm}:${ss}`;
	}
	return `${brgStr}/${distStr}`;
}

function getRblGs(p1, p2) {
	// Returns GS of the AC that determines time, or null if neither/both are AC
	const ac1 = p1.acId !== null ? getAcById(p1.acId) : null;
	const ac2 = p2.acId !== null ? getAcById(p2.acId) : null;
	if (ac1 && !ac2) return ac1.gs;
	if (!ac1 && ac2) return ac2.gs;
	return null; // both or neither
}

function handleRblLeftClick(e) {
	if (!rblMode) return false;
	const pt = rblNMFromEvent(e);
	if (rblMode === 'RBL_SELECT1') {
		rblBuilding = { p1: pt };
		rblMode = 'RBL_SELECT2';
	} else if (rblMode === 'RBL_SELECT2') {
		rblBuilding.p1 = pt; // ← overwrite P1 with new click, stay in SELECT2
	}
	updateRblUI();
	draw();
	return true;
}

function handleRblSecondClick(e) {
	if (rblMode !== 'RBL_SELECT2') return false;
	e.preventDefault();
	const pt = rblNMFromEvent(e);
	if (rblList.length >= MAX_RBLS) rblList.shift();
	rblList.push({ id: rblIdCtr++, p1: rblBuilding.p1, p2: pt });
	rblBuilding = null;
	rblMode = null;
	rblCursorNM = null;
	updateRblUI();
	draw();
	return true;
}

function tryRemoveRblByClick(e) {
	if (!rblList.length) return false;
	const rect = _canvas.getBoundingClientRect();
	const mx = (e.clientX - rect.left) * _canvas.width / rect.width;
	const my = (e.clientY - rect.top) * _canvas.height / rect.height;
	const { toScreen } = getDrawTransform();
	const ctx = _canvas.getContext('2d');
	ctx.font = '11px "Cascadia Mono"';
	for (const rbl of rblList) {
		// resolve live positions
		const ac1 = rbl.p1.acId !== null ? getAcById(rbl.p1.acId) : null;
		const ac2 = rbl.p2.acId !== null ? getAcById(rbl.p2.acId) : null;
		const x1 = ac1 ? ac1.x : rbl.p1.x, y1 = ac1 ? ac1.y : rbl.p1.y;
		const sp = toScreen(x1, y1);
		const gs = getRblGs(
			{ x: x1, y: y1, acId: rbl.p1.acId },
			{ x: ac2 ? ac2.x : rbl.p2.x, y: ac2 ? ac2.y : rbl.p2.y, acId: rbl.p2.acId }
		);
		const lbl = calcRblLabel(
			{ x: x1, y: y1 },
			{ x: ac2 ? ac2.x : rbl.p2.x, y: ac2 ? ac2.y : rbl.p2.y },
			gs
		);
		const tw = ctx.measureText(lbl).width;
		const lx = sp.x + 6, ly = sp.y - LINE_H * 1.2;
		if (mx >= lx - 3 && mx <= lx + tw + 3 && my >= ly && my <= ly + LINE_H) {
			rblList = rblList.filter(r => r.id !== rbl.id);
			updateRblUI();
			draw();
			return true;
		}
	}
	return false;
}

function drawRbls(ctx, S) {
	const RBL_C = '#f5c518';
	ctx.font = '11px "Cascadia Mono"';
	ctx.textBaseline = 'top';

	// Draw committed RBLs
	rblList.forEach(rbl => {
		const ac1 = rbl.p1.acId !== null ? getAcById(rbl.p1.acId) : null;
		const ac2 = rbl.p2.acId !== null ? getAcById(rbl.p2.acId) : null;
		const x1 = ac1 ? ac1.x : rbl.p1.x, y1 = ac1 ? ac1.y : rbl.p1.y;
		const x2 = ac2 ? ac2.x : rbl.p2.x, y2 = ac2 ? ac2.y : rbl.p2.y;
		const p1s = S(x1, y1), p2s = S(x2, y2);
		const gs = getRblGs({ x: x1, y: y1, acId: rbl.p1.acId }, { x: x2, y: y2, acId: rbl.p2.acId });
		const lbl = calcRblLabel({ x: x1, y: y1 }, { x: x2, y: y2 }, gs);
		ctx.save();
		ctx.strokeStyle = RBL_C;
		ctx.lineWidth = 1.2;
		ctx.beginPath(); ctx.moveTo(p1s.x, p1s.y); ctx.lineTo(p2s.x, p2s.y); ctx.stroke();
		// dot at each end
		ctx.fillStyle = RBL_C;
		ctx.beginPath(); ctx.arc(p1s.x, p1s.y, 3, 0, 2 * Math.PI); ctx.fill();
		ctx.beginPath(); ctx.arc(p2s.x, p2s.y, 3, 0, 2 * Math.PI); ctx.fill();
		// label top-right of P1
		ctx.fillStyle = RBL_C;
		ctx.fillText(lbl, p1s.x + 10, p1s.y - LINE_H * 1.2);
		ctx.restore();
	});

	// Draw rubber-band during SELECT2
	if (rblMode === 'RBL_SELECT2' && rblBuilding && rblCursorNM) {
		const ac1 = rblBuilding.p1.acId !== null ? getAcById(rblBuilding.p1.acId) : null;
		const x1 = ac1 ? ac1.x : rblBuilding.p1.x, y1 = ac1 ? ac1.y : rblBuilding.p1.y;
		const p1s = S(x1, y1);
		const p2s = S(rblCursorNM.x, rblCursorNM.y);
		const gs = getRblGs({ x: x1, y: y1, acId: rblBuilding.p1.acId }, { ...rblCursorNM, acId: rblCursorNM.acId });
		const lbl = calcRblLabel({ x: x1, y: y1 }, rblCursorNM, gs);
		ctx.save();
		ctx.strokeStyle = RBL_C;
		ctx.lineWidth = 1.2;
		ctx.setLineDash([4, 4]);
		ctx.globalAlpha = 0.7;
		ctx.beginPath(); ctx.moveTo(p1s.x, p1s.y); ctx.lineTo(p2s.x, p2s.y); ctx.stroke();
		ctx.setLineDash([]);
		ctx.globalAlpha = 1;
		ctx.fillStyle = RBL_C;
		ctx.beginPath(); ctx.arc(p1s.x, p1s.y, 3, 0, 2 * Math.PI); ctx.fill();
		ctx.fillText(lbl, p1s.x + 10, p1s.y - LINE_H * 1.2);
		ctx.restore();
	}
	ctx.textBaseline = 'alphabetic';
}

// ── WAYPOINT & AIRWAY DATA ─────────────────────────────────────────────────
const WAYPOINTS = [
	{ name: "72PCA", x: -138.22, y: -316.16, dotOnly: true },
	{ name: 'ABBEY', x: 31.03, y: 146.03 },
	{ name: 'ADBIN', x: -87.65, y: 127.93, dotOnly: true },
	{ name: 'AKOTA', x: 159.88, y: -202.44, dotOnly: true },
	{ name: 'ALDIS', x: 298.55, y: -74.29, dotOnly: true },
	{ name: 'ALDOM', x: 0.0, y: 0.0 },
	{ name: 'ALLEY', x: -33.19, y: 75.03 },
	{ name: "ANDRE", x: 317.09, y: 114.31, dotOnly: true },
	{ name: 'ANPOG', x: 202.08, y: 166.09 },
	{ name: 'APAKA', x: 229.74, y: 241.67, dotOnly: true },
	{ name: 'ASOBA', x: 11.08, y: -147.79 },
	{ name: 'ATBUD', x: 13.76, y: -236.13 },
	{ name: 'AVBEP', x: 93.03, y: 184.76, dotOnly: true },
	{ name: 'AVMUP', x: 258.76, y: -110.56, dotOnly: true },
	{ name: 'BEBEM', x: 112.12, y: 186.84 },
	{ name: 'BEKOL', x: -13.58, y: 162.44 },
	{ name: 'BESDA', x: 135.75, y: 131.9 },
	{ name: 'BETTY', x: 10.43, y: 99.02 },
	{ name: 'BIDIG', x: -35.63, y: 207.69, dotOnly: true },
	{ name: 'BIGEX', x: -19.41, y: 143.02 },
	{ name: 'BIGRO', x: -143.77, y: 104.04 },
	{ name: 'BIMIX', x: 110.49, y: 131.24 },
	{ name: 'BOKAT', x: -77.55, y: 132.11, dotOnly: true },
	{ name: 'BOVMA', x: -5.15, y: 239.09, dotOnly: true },
	{ name: 'BUMDI', x: -3.35, y: 151.5 },
	{ name: "BUNTA", x: -281.02, y: -180.16, dotOnly: true },
	{ name: 'CANTO', x: -37.65, y: 108.89 },
	{ name: 'CARSO', x: 18.99, y: -50.16 },
	{ name: 'CHALI', x: -43.04, y: 87.59 },
	{ name: 'COMBI', x: -51.46, y: 99.46 },
	{ name: 'COMBO', x: 212.23, y: 145.56, dotOnly: true },
	{ name: 'CONGA', x: 136.08, y: 113.89 },
	{ name: 'COTON', x: -67.19, y: 79.25 },
	{ name: 'CYBER', x: 10.1, y: 60.67 },
	{ name: 'CYRUS', x: 234.66, y: 142.79, dotOnly: true },
	{ name: 'DABGI', x: 16.87, y: -339.49, dotOnly: true },
	{ name: 'DADON', x: 204.81, y: 146.42 },
	{ name: 'DAGBU', x: -125.37, y: 42.81 },
	{ name: 'DAKTO', x: 45.92, y: 63.36 },
	{ name: 'DALOL', x: 26.64, y: 114.46 },
	{ name: 'DALRA', x: 120.11, y: -123.49 },
	{ name: 'DASON', x: -84.44, y: 73.23 },
	{ name: 'DONDA', x: -132.76, y: -307.96 },
	{ name: 'DOSUT', x: -39.17, y: -168.16 },
	{ name: 'DOTMI', x: 101.27, y: 172.94 },
	{ name: 'DULOP', x: 9.56, y: -95.96 },
	{ name: 'DUMEP', x: 47.4, y: 114.45 },
	{ name: 'DUMOL', x: 4.1, y: -50.16 },
	{ name: 'EGEMU', x: -118.0, y: -170.16 },
	{ name: 'ELATO', x: 176.43, y: 149.84 },
	{ name: 'ENBOK', x: -49.8, y: -76.76 },
	{ name: 'ENPET', x: 74.28, y: 147.4 },
	{ name: 'ENROM', x: 103.06, y: 103.39 },
	{ name: 'ENVAR', x: 176.43, y: 129.34 },
	{ name: 'EPDOS', x: -46.22, y: -50.16 },
	{ name: 'EPKAL', x: -80.09, y: -118.66 },
	{ name: 'EXOTO', x: -187.61, y: -268.66, dotOnly: true },
	{ name: 'EXTRA', x: 216.81, y: 153.86, dotOnly: true },
	{ name: 'FISHA', x: 54.33, y: 146.81 },
	{ name: 'GAMBA', x: -81.68, y: 88.98 },
	{ name: 'GIVIV', x: -187.31, y: 67.07 },
	{ name: 'GLN', x: -19.23, y: 172.34, dotOnly: true },
	{ name: 'GOBBI', x: -47.79, y: 77.98 },
	{ name: 'HOCKY', x: 11.32, y: 45.67 },
	{ name: 'IDOSI', x: -105.77, y: -50.16 },
	{ name: 'IDUMA', x: -23.83, y: 183.62 },
	{ name: 'IGLEG', x: -109.85, y: -55.9 },
	{ name: 'IKELA', x: -120.16, y: -70.46 },
	{ name: 'ISBAN', x: -4.91, y: 59.42 },
	{ name: 'ISBIG', x: -195.6, y: 48.49 },
	{ name: 'ISLOM', x: -19.96, y: 207.24, dotOnly: true },
	{ name: 'JCS', x: 115.01, y: 225.74, dotOnly: true },
	{ name: "KABAM", x: 310.76, y: 69.84, dotOnly: true },
	{ name: 'KADLO', x: 235.22, y: 187.14, dotOnly: true },
	{ name: 'KAPLI', x: 176.43, y: 79.84 },
	{ name: 'KEVAR', x: -31.83, y: 167.34, dotOnly: true },
	{ name: 'KIBAS', x: -63.91, y: 138.14, dotOnly: true },
	{ name: 'LANDA', x: -75.0, y: 106.63 },
	{ name: 'LAPUG', x: 169.69, y: 189.52 },
	{ name: 'LARIT', x: 50.48, y: 123.53 },
	{ name: 'LAXET', x: -21.03, y: 66.12 },
	{ name: 'LEGOD', x: 29.44, y: 66.37 },
	{ name: 'LEKEN', x: 30.39, y: 122.86 },
	{ name: 'LELIM', x: 165.8, y: 186.24 },
	{ name: 'LENKO', x: -229.94, y: -145.21 },
	{ name: 'LH', x: -228.05, y: 77.94 },
	{ name: 'LIMSU', x: 159.15, y: 174.3 },
	{ name: 'LMN', x: -2.67, y: 228.74, dotOnly: true },
	{ name: 'MADRU', x: 157.43, y: 79.6 },
	{ name: 'MAGOG', x: 81.89, y: 147.61 },
	{ name: 'MALKA', x: 148.87, y: 174.07 },
	{ name: 'MAPLE', x: -72.17, y: 92.29 },
	{ name: 'MEBKI', x: 68.16, y: 114.39 },
	{ name: 'MIGUG', x: -21.11, y: -273.76 },
	{ name: 'MIKIN', x: 210.85, y: -30.05 },
	{ name: 'MIPAG', x: -35.69, y: 185.14, dotOnly: true },
	{ name: "MONBO", x: -53.37, y: -320.16, dotOnly: true },
	{ name: 'MORTU', x: 0.62, y: -7.54 },
	{ name: 'MULET', x: -32.52, y: 104.88 },
	{ name: 'MUMOT', x: 192.79, y: -48.44 },
	{ name: 'MYWAY', x: -93.42, y: 21.62 },
	{ name: 'NEDLE', x: 18.36, y: 153.08 },
	{ name: 'NLG', x: -45.85, y: 161.74 },
	{ name: 'NOBAD', x: 64.08, y: 24.57 },
	{ name: 'NOMAN', x: 129.68, y: 9.84 },
	{ name: 'NOMAR', x: -29.2, y: 220.34, dotOnly: true },
	{ name: 'NOPER', x: 97.45, y: 60.65 },
	{ name: 'NUDPI', x: 70.58, y: 124.16 },
	{ name: 'OLDID', x: 176.43, y: 189.84 },
	{ name: 'OSUMO', x: 65.94, y: 43.07 },
	{ name: 'OVGOT', x: 21.22, y: 176.86, dotOnly: true },
	{ name: 'PECAN', x: -19.14, y: 96.18 },
	{ name: 'PONTI', x: 5.01, y: 152.12 },
	{ name: 'POU', x: -66.82, y: 191.14 },
	{ name: 'POVAM', x: 55.2, y: 84.76 },
	{ name: 'RAGSO', x: -134.98, y: 55.38 },
	{ name: 'RECON', x: 227.68, y: 92.69 },
	{ name: 'RENOT', x: 233.56, y: 163.94, dotOnly: true },
	{ name: 'ROBIN', x: -5.96, y: 72.59 },
	{ name: 'ROCCA', x: -44.76, y: 101.77 },
	{ name: 'RUSBI', x: 74.34, y: 56.8 },
	{ name: 'SABNO', x: 83.02, y: -51.06 },
	{ name: 'SAMAS', x: -218.93, y: 40.14 },
	{ name: 'SAMMI', x: 89.61, y: 157.84 },
	{ name: 'SANKU', x: 111.22, y: 101.2 },
	{ name: 'SAPAX', x: -9.07, y: 109.18 },
	{ name: 'SAREX', x: -50.27, y: 182.74 },
	{ name: 'SHL', x: -29.57, y: 195.34 },
	{ name: 'SIERA', x: -46.32, y: 129.04 },
	{ name: 'SIKOU', x: -162.21, y: 60.44 },
	{ name: 'SKATE', x: 43.48, y: 101.76 },
	{ name: 'SMT', x: -22.12, y: 150.10 },
	{ name: 'SONNY', x: 38.45, y: 70.91 },
	{ name: 'SOUSA', x: 102.55, y: 131.02 },
	{ name: 'SUKER', x: 15.76, y: -9.6 },
	{ name: 'SULUX', x: 58.43, y: 30.75 },
	{ name: 'SUMDO', x: 85.09, y: 183.88, dotOnly: true },
	{ name: 'SURFA', x: -92.42, y: -31.31 },
	{ name: 'SWA', x: 135.04, y: 216.24, dotOnly: true },
	{ name: 'TAMOT', x: -28.63, y: 151.34 },
	{ name: 'TAPPO', x: -7.4, y: 89.19 },
	{ name: 'TEPID', x: -55.82, y: 221.94, dotOnly: true },
	{ name: "TNN", x: 329.17, y: 197.96, dotOnly: true },
	{ name: 'TOFEE', x: 51.93, y: -31.79 },
	{ name: 'TOLAK', x: 176.43, y: 195.31, dotOnly: true },
	{ name: 'TOMUD', x: -103.1, y: 121.29, dotOnly: true },
	{ name: 'TUBBY', x: 129.78, y: 160.27 },
	{ name: 'UNTUL', x: 93.31, y: 28.88 },
	{ name: 'UPRIK', x: -20.48, y: 219.71, dotOnly: true },
	{ name: 'VIBOS', x: -59.05, y: 167.31 },
	{ name: 'VIPAP', x: 8.93, y: 175.53, dotOnly: true },
	{ name: 'XEMEK', x: 35.07, y: 108.11 },
	{ name: 'YIN', x: -54.12, y: 261.24, dotOnly: true },
	{ name: 'ZUH', x: -51.21, y: 143.14 }
];

// ── TMA SOUTHERN BOUNDARY ────────────────────────────────────────────────────
const TMA_SOUTH = [
	[81.42, -54.16],  // 185600N 1154900E
	[-105.77, -50.16],  // 190000N 1122500E
	[-162.21, -20.16],  // 193000N 1113000E
];

function drawTMA(ctx, S) {
	if (TMA_SOUTH.length < 2) return;
	ctx.save();
	ctx.strokeStyle = '#555555';
	ctx.lineWidth = 1.5;
	ctx.globalAlpha = 0.6;
	ctx.setLineDash([6, 4]);
	ctx.beginPath();
	const p0 = S(TMA_SOUTH[0][0], TMA_SOUTH[0][1]);
	ctx.moveTo(p0.x, p0.y);
	for (let i = 1; i < TMA_SOUTH.length; i++) {
		const p = S(TMA_SOUTH[i][0], TMA_SOUTH[i][1]);
		ctx.lineTo(p.x, p.y);
	}
	ctx.stroke();
	ctx.restore();
}

// ── FIR BOUNDARY ─────────────────────────────────────────────────────────────
const FIR_BOUNDARY = [
	[176.43, 189.84],  // 230000N 1173000E  NE corner
	[176.43, 69.84],  // 21°00'N 117°30'E  East side
	[-21.11, -190.14],  // 16°40'N 114°00'E  South tip
	[-162.21, -20.16],  // 19°30'N 111°30'E  SW corner
	[-162.21, 75.84],  // 210600N 1113000E  West side — N boundary begins
	[-75.00, 106.63],  // LANDA
	[-52.25, 121.64],  // 215148N 1132654E
	[-40.24, 136.59],  // 220645N 1133940E
	[-37.76, 138.51],  // 220840N 1134218E
	[-39.84, 143.59],  // 221345N 1134005E
	[-30.70, 154.48],  // 222438N 1134948E
	[0.81, 165.76],  // 223555N 1142318E
	[5.43, 161.34],  // 223130N 1142813E
	[7.11, 154.16],  // 222419N 1143000E
	[21.76, 160],  // 222711N 1144723E
	[84.54, 161.95],  // 223048N 1155219E
	[96.32, 175.84],  // 224600N 1160450E
	[101.27, 172.94],  // DOTMI
	[165.80, 186.24],  // LELIM
	[176.43, 189.84],  // close loop
];
const TRW_BOUNDARY = [
	[-39.45, 66.85],	// arcend in drawTRW()
	[-64.65, 25.85],
	[-74.65, 25.75],
	[-90, -8],
	[-162.21, -20.16],
	[-162.21, 75.84],
	[-75.00, 106.63],
	[-52.25, 121.64],
	[-40.24, 136.59],
	[-37.76, 138.51],
	[-39.84, 143.59],
	[-30.70, 154.48],
	[0.81, 165.76],
	[5.43, 161.34],
	[7.11, 154.16],
	[17.87, 158.41],
	[19.01, 112.28],
	[-0.5, 111],
	[6.6, 60.15]	// arcstart in drawTRW()
]
const TRV_BOUNDARY = [
	[-9.11, 59.54],	// ref to arc TRW, arcstart in drawTRV()
	[-12.85, 9.54],
	[-21.12, -0.2],
	[-21.32, -50.16],
	[-60.54, -50.15],
	[-99.86, -95.24],
	[-162.21, -20.16],	// TRW Point
	[-90, -8],	// TRW Point
	[-74.65, 25.75],	// TRW Point
	[-64.65, 25.85],	// TRW Point
	[-39.45, 66.85]	// ref to arc TRW, arcend in drawTRV()
]
const TRD_BOUNDARY = [
	[-21.32, -50.16],	// TRV Point
	[57.91, -50.83],
	[65.78, -75.78],
	[-21.11, -190.14],	// 16°40'N 114°00'E  South tip
	[-99.86, -95.24],	// TRV Point
	[-60.54, -50.15],
	[-21.32, -50.16]	// TRV Point
]
const TRS_BOUNDARY = [
	[19.01, 112.28],
	[-0.5, 111],
	[6.6, 60.15]	// arcend in drawTRW() 
]

function drawFIR(ctx, S) {
	if (FIR_BOUNDARY.length < 2) return;
	ctx.save();
	ctx.strokeStyle = '#555555';
	ctx.lineWidth = 1.5;
	ctx.globalAlpha = 0.6;
	ctx.setLineDash([]);
	ctx.beginPath();
	const p0 = S(FIR_BOUNDARY[0][0], FIR_BOUNDARY[0][1]);
	ctx.moveTo(p0.x, p0.y);
	for (let i = 1; i < FIR_BOUNDARY.length; i++) {
		const p = S(FIR_BOUNDARY[i][0], FIR_BOUNDARY[i][1]);
		ctx.lineTo(p.x, p.y);
	}
	ctx.stroke();
	ctx.restore();
}

function drawTRW(ctx, S) {
	if (TRW_BOUNDARY.length < 2) return;
	ctx.save();
	ctx.strokeStyle = '#999999'
	if (mapVisibility['TRW']) { ctx.lineWidth = 1; }
	else { ctx.lineWidth = 0.5; }
	// straight line
	ctx.beginPath();
	const p0 = S(TRW_BOUNDARY[0][0], TRW_BOUNDARY[0][1]);
	ctx.moveTo(p0.x, p0.y);
	for (let i = 1; i < TRW_BOUNDARY.length; i++) {
		const p = S(TRW_BOUNDARY[i][0], TRW_BOUNDARY[i][1]);
		ctx.lineTo(p.x, p.y);
	}
	ctx.stroke();
	// arc
	ctx.beginPath();
	// Centre in screen pixels
	const c = S(TMarc_centreNM.x, TMarc_centreNM.y);
	// Radius in pixels — use two screen points to derive scale
	const arc_p0 = S(0, 0);
	const arc_p1 = S(1, 0);
	const pxPerNM = Math.hypot(arc_p1.x - arc_p0.x, arc_p1.y - arc_p0.y);
	const rPx = TMarc_radiusNM * pxPerNM;
	// Arc points
	const arcstart = Math.atan2(-(60.15 - TMarc_centreNM.y), 6.6 - TMarc_centreNM.x)	// ref to TRW point
	const arcend = Math.atan2(-(66.85 - TMarc_centreNM.y), -39.45 - TMarc_centreNM.x)	// ref to TRW point
	ctx.arc(c.x, c.y, rPx, arcstart, arcend, false);
	ctx.stroke();
	ctx.restore();
}

function drawTRV(ctx, S) {
	if (TRV_BOUNDARY.length < 2) return;
	ctx.save();
	ctx.strokeStyle = '#999999';
	if (mapVisibility['TRV']) { ctx.lineWidth = 1; }
	else { ctx.lineWidth = 0.5; }
	// straight line
	ctx.beginPath();
	const p0 = S(TRV_BOUNDARY[0][0], TRV_BOUNDARY[0][1]);
	ctx.moveTo(p0.x, p0.y);
	for (let i = 1; i < TRV_BOUNDARY.length; i++) {
		const p = S(TRV_BOUNDARY[i][0], TRV_BOUNDARY[i][1]);
		ctx.lineTo(p.x, p.y);
	}
	ctx.stroke();
	// arc
	ctx.beginPath();
	// Centre in screen pixels
	const c = S(TMarc_centreNM.x, TMarc_centreNM.y);
	// Radius in pixels — use two screen points to derive scale
	const arc_p0 = S(0, 0);
	const arc_p1 = S(1, 0);
	const pxPerNM = Math.hypot(arc_p1.x - arc_p0.x, arc_p1.y - arc_p0.y);
	const rPx = TMarc_radiusNM * pxPerNM;
	// Arc points
	const arcstart = Math.atan2(-(59.54 - TMarc_centreNM.y), -9.11 - TMarc_centreNM.x)	// ref to TRV point
	const arcend = Math.atan2(-(66.85 - TMarc_centreNM.y), -39.45 - TMarc_centreNM.x)	// ref to TRV point
	ctx.arc(c.x, c.y, rPx, arcstart, arcend, false);
	ctx.stroke();
	ctx.restore();
}

function drawTRD(ctx, S) {
	if (TRD_BOUNDARY.length < 2) return;
	ctx.save();
	ctx.strokeStyle = '#999999';
	if (mapVisibility['TRD']) { ctx.lineWidth = 1; }
	else { ctx.lineWidth = 0.5; }
	ctx.beginPath();
	const p0 = S(TRD_BOUNDARY[0][0], TRD_BOUNDARY[0][1]);
	ctx.moveTo(p0.x, p0.y);
	for (let i = 1; i < TRD_BOUNDARY.length; i++) {
		const p = S(TRD_BOUNDARY[i][0], TRD_BOUNDARY[i][1]);
		ctx.lineTo(p.x, p.y);
	}
	ctx.stroke();
	ctx.restore();
}

const mapVisibility = { TRW: true, TRV: true, TRD: true };
function toggleMap(group) {
	mapVisibility[group] = !mapVisibility[group];
	const btn = document.getElementById('btn-map-' + group);
	btn.classList.toggle('place-active', mapVisibility[group]);
	draw();
}

// ── AIRWAYS ───────────────────────────────────────────────────────────────────
const AIRWAYS = [
	// Magenta lines (OVF)
	// ZGGG DEPARTURE
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'MULET', 'ALLEY', 'DAGBU', 'SIKOU'] },	// ZGGG-SI
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'MULET', 'ALLEY', 'SURFA', 'IDOSI', 'IKELA'] },	// ZGGG-IK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'MULET', 'ALLEY', 'EPDOS', 'ENBOK', 'EPKAL'] },	// ZGGG-EK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'MULET', 'SKATE', 'POVAM', 'RUSBI', 'UNTUL', 'SABNO'] },	// ZGGG-SN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'MULET', 'SKATE', 'NOPER', 'NOMAN'] },	// ZGGG-NN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'MULET', 'SKATE', 'CONGA', 'ENVAR'] },	// ZGGG-EN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'MULET', 'SKATE', 'CONGA', 'ELATO'] },	// ZGGG-EL
	// ZGSZ DEPARTURE
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'ROCCA', 'ALLEY', 'DAGBU', 'SIKOU'] },	// ZGSZ-SI
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'ROCCA', 'ALLEY', 'SURFA', 'IDOSI', 'IKELA'] },	// ZGSZ-IK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'ROCCA', 'ALLEY', 'EPDOS', 'ENBOK', 'EPKAL'] },	// ZGSZ-EK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'ROCCA', 'SKATE', 'POVAM', 'RUSBI', 'UNTUL', 'SABNO'] },	// ZGSZ-SN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'ROCCA', 'SKATE', 'NOPER', 'NOMAN'] },	// ZGSZ-NN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'ROCCA', 'SKATE', 'CONGA', 'ENVAR'] },	// ZGSZ-EN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIERA', 'ROCCA', 'SKATE', 'CONGA', 'ELATO'] },	// ZGSZ-EL
	// SI
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIKOU', 'DAGBU', 'IDOSI', 'IKELA'] },	// SI-IK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIKOU', 'DAGBU', 'EPDOS', 'ENBOK', 'EPKAL'] },	// SI-EK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'POVAM', 'RUSBI', 'UNTUL', 'SABNO'] },	// SI-SN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'POVAM', 'NOPER', 'NOMAN'] },	// SI-NN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'KAPLI'] },	// SI-KA
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'BEKOL'] },	// SI-BK
	// IK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['IKELA', 'IDOSI', 'DAGBU', 'SIKOU'] },	// IK-SI
	{ color: '#ff66cc', group: 'OVF', waypoints: ['IKELA', 'MORTU', 'NOBAD', 'KAPLI'] },	// IK-KA
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['IKELA', 'MORTU', 'NOBAD', 'ENVAR'] },	// IK-EN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['IKELA', 'MORTU', 'NOBAD', 'ELATO'] },	// IK-EL
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['IKELA', 'MORTU', 'NOBAD', 'SANKU', 'BIMIX', 'DOTMI'] },	// IK-DT
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['IKELA', 'IDOSI', 'BIGEX', 'BEKOL'] },	// IK-BK
	// DS
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOSUT', 'DULOP', 'DUMOL', 'DAGBU', 'SIKOU'] },	// DS-SI
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOSUT', 'DULOP', 'CARSO', 'NOBAD', 'SANKU', 'BIMIX', 'DOTMI'] },	// DS-DT
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOSUT', 'DULOP', 'DUMOL', 'MORTU', 'ALDOM', 'ISBAN', 'ROBIN', 'TAPPO', 'SAPAX', 'BEKOL'] },	// DS-BK
	// SB
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['ASOBA', 'DULOP', 'CARSO', 'NOBAD', 'SANKU', 'BIMIX', 'DOTMI'] },	// SB-DT
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['ASOBA', 'DULOP', 'DUMOL', 'MORTU', 'ALDOM', 'ISBAN', 'ROBIN', 'TAPPO', 'SAPAX', 'BEKOL'] },	// SB-BK
	// SN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SABNO', 'SIKOU'] },	// SN-SI
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['SABNO', 'LEGOD', 'BEKOL'] },	// SN-BK
	// NN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['NOMAN', 'SANKU', 'BIMIX', 'DOTMI'] },	// NN-DT
	// KA
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['KAPLI', 'ALLEY', 'DAGBU', 'SIKOU'] },	// KA-SI
	{ color: '#ff66cc', group: 'OVF', waypoints: ['KAPLI', 'MADRU', 'SULUX', 'IGLEG', 'IKELA'] },	// KA-IK
	// EL
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['ELATO', 'MAGOG', 'DOTMI'] },	// EL-DT
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['ELATO', 'TUBBY', 'SAMMI', 'NEDLE', 'PONTI', 'BEKOL'] },	// EL-BK
	// DT
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOTMI', 'ENROM', 'ALLEY', 'DAGBU', 'SIKOU'] },	// DT-SI
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOTMI', 'ENROM', 'RUSBI', 'SULUX', 'IGLEG', 'IKELA'] },	// DT-IK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOTMI', 'ENROM', 'RUSBI', 'SULUX', 'EPKAL'] },	// DT-EK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOTMI', 'ENROM', 'NOPER', 'UNTUL', 'SABNO'] },	// DT-SN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOTMI', 'ENROM', 'NOMAN'] },	// DT-NN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOTMI', 'SOUSA', 'CONGA', 'ENVAR'] },	// DT-EN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['DOTMI', 'SOUSA', 'CONGA', 'ELATO'] },	// DT-EL
	// TM
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['TAMOT', 'ALLEY', 'DAGBU', 'SIKOU'] },	// TM-SI
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['TAMOT', 'ALLEY', 'SURFA', 'IDOSI', 'IKELA'] },	// TM-IK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['TAMOT', 'ALLEY', 'EPDOS', 'ENBOK', 'EPKAL'] }, 	// TM-EK
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['TAMOT', 'BIGEX', 'POVAM', 'RUSBI', 'UNTUL', 'SABNO'] },	// TM-SN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['TAMOT', 'BIGEX', 'POVAM', 'NOPER', 'NOMAN'] },	// TM-NN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['TAMOT', 'BIGEX', 'DALOL', 'DUMEP', 'MEBKI', 'CONGA', 'ENVAR'] },	//TM-EN
	{ color: '#ff66cc', group: 'OVF_OTHER', dashed: true, waypoints: ['TAMOT', 'DALOL', 'DUMEP', 'MEBKI', 'CONGA', 'ELATO'] },	// TM-EL
	// Cyan lines (INBOUND)
	// VHHH
	{ color: '#00e5ff', group: 'TRW', waypoints: ['SIKOU', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO'] },	// SI V571 VHHH
	{ color: '#00e5ff', group: 'TRW', waypoints: ['IKELA', 'IDOSI', 'MYWAY', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO'] },	// IK V561 VHHH
	{ color: '#00e5ff', group: 'TRW', waypoints: ['DOSUT', 'DULOP', 'CARSO'] },	// M771 Q1 PORTION VHHH
	{ color: '#00e5ff', group: 'TRW', waypoints: ['ASOBA', 'DULOP', 'CARSO'] },	// M772 Q1 PORTION VHHH
	{ color: '#00e5ff', group: 'TRS', waypoints: ['CARSO', 'SUKER', 'HOCKY', 'CYBER', 'BETTY'] },	// V551 VHHH
	{ color: '#00e5ff', group: 'TRS', waypoints: ['SABNO', 'TOFEE', 'SUKER', 'HOCKY', 'CYBER', 'BETTY'] },	// V542 VHHH
	{ color: '#00e5ff', group: 'TRS', waypoints: ['NOMAN', 'UNTUL', 'OSUMO', 'DAKTO', 'SONNY', 'BETTY'] },	// V533 VHHH
	{ color: '#00e5ff', group: 'TRE', waypoints: ['ELATO', 'MAGOG', 'ENPET', 'FISHA', 'ABBEY'] },	// V522 VHHH
	{ color: '#00e5ff', group: 'TRE', waypoints: ['LELIM', 'MALKA', 'MAGOG', 'ENPET', 'FISHA', 'ABBEY'] },	// V591 VHHH
	{ color: '#00e5ff', group: 'TRE', waypoints: ['DOTMI', 'MAGOG', 'ENPET', 'FISHA', 'ABBEY'] },	// V512 VHHH
	// VMMC
	{ color: '#00e5ff', group: 'TRW', waypoints: ['SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI'] },	// SI-VMMC
	{ color: '#00e5ff', group: 'TRW', waypoints: ['IKELA', 'IDOSI', 'DASON', 'COTON', 'CHALI'] },	// IK-VMMC
	{ color: '#00e5ff', group: 'TRW', waypoints: ['DOSUT', 'DULOP', 'DUMOL'] },	// M771 PORTION DS-VMMC
	{ color: '#00e5ff', group: 'TRW', waypoints: ['ASOBA', 'DULOP', 'DUMOL'] },	// M772 M771 PORTION SB-VMMC
	{ color: '#00e5ff', group: 'TRS', waypoints: ['DUMOL', 'MORTU', 'ALDOM', 'ISBAN'] },	// J103 PORTION DS/SB-VMMC
	{ color: '#00e5ff', group: 'TRW', waypoints: ['ISBAN', 'ROBIN', 'CHALI'] },	// DS/SB-VMMC
	{ color: '#00e5ff', group: 'TRS', waypoints: ['SABNO', 'TOFEE', 'SUKER', 'ALDOM', 'ISBAN',] },	// SN-VMMC
	{ color: '#00e5ff', group: 'TRE', waypoints: ['ELATO', 'TUBBY', 'SAMMI', 'NEDLE', 'PONTI', 'BUMDI', 'SMT'] },	// J101 EL-VMMC
	{ color: '#00e5ff', group: 'TRE', waypoints: ['DOTMI', 'SAMMI', 'NEDLE', 'PONTI', 'BUMDI', 'SMT'] },	// DT-VMMC
	// Yellow lines (OUTBOUND)
	// VHHH
	{ color: '#ffea00', group: 'TRW', waypoints: ['PECAN', 'ALLEY', 'DAGBU', 'SIKOU'] },	// V10
	{ color: '#ffea00', group: 'TRW', waypoints: ['PECAN', 'LAXET', 'SURFA', 'IDOSI', 'IKELA'] },	// V11 A1/P901
	{ color: '#ffea00', group: 'TRW', waypoints: ['PECAN', 'LAXET', 'EPDOS', 'ENBOK', 'EPKAL'] },	// V12 L642
	{ color: '#ffea00', group: 'TRS', waypoints: ['DALOL', 'XEMEK', 'SKATE', 'POVAM', 'RUSBI', 'UNTUL', 'SABNO'] },	// V652
	{ color: '#ffea00', group: 'TRS', waypoints: ['DALOL', 'XEMEK', 'SKATE', 'NOPER', 'NOMAN'] },	// V642
	{ color: '#ffea00', group: 'TRS', waypoints: ['DALOL', 'XEMEK', 'SKATE', 'KAPLI'] },	// V642 KA
	{ color: '#ffea00', group: 'TRE', waypoints: ['DALOL', 'DUMEP', 'MEBKI', 'CONGA', 'ENVAR'] },	// V631
	{ color: '#ffea00', group: 'TRE', waypoints: ['DALOL', 'DUMEP', 'MEBKI', 'CONGA', 'ELATO'] },	// V621
	{ color: '#ffea00', group: 'TRE', waypoints: ['LEKEN', 'LARIT', 'NUDPI', 'SOUSA', 'BESDA', 'LIMSU', 'LELIM'] },	// V611
	{ color: '#ffea00', group: 'TRE', waypoints: ['LEKEN', 'LARIT', 'NUDPI', 'SOUSA', 'DOTMI'] },	// V601
	// VMMC
	{ color: '#ffea00', group: 'TRW', waypoints: ['ALLEY', 'DAGBU', 'SIKOU'] },	// VMMC-SI
	{ color: '#ffea00', group: 'TRW', waypoints: ['ALLEY', 'SURFA', 'IDOSI', 'IKELA'] },	// VMMC-IK V31 A1/P901
	{ color: '#ffea00', group: 'TRW', waypoints: ['ALLEY', 'EPDOS', 'ENBOK', 'EPKAL'] },	// VMMC-EK V32 L642
	{ color: '#ffea00', group: 'TRS', waypoints: ['SKATE', 'POVAM', 'RUSBI', 'UNTUL', 'SABNO'] },	// VMMC-SN
	{ color: '#ffea00', group: 'TRS', waypoints: ['SKATE', 'NOPER', 'NOMAN'] },	// VMMC-NN
	{ color: '#ffea00', group: 'TRS', waypoints: ['SKATE', 'KAPLI'] },	// VMMC-KA
	{ color: '#ffea00', group: 'TRE', waypoints: ['CONGA', 'ENVAR'] },	// VMMC-EN
	{ color: '#ffea00', group: 'TRE', waypoints: ['CONGA', 'ELATO'] },	// VMMC-EL
	{ color: '#ffea00', group: 'TRE', waypoints: ['NUDPI', 'SOUSA', 'BESDA', 'LIMSU', 'LELIM'] },	// VMMC-LL
	{ color: '#ffea00', group: 'TRE', waypoints: ['NUDPI', 'SOUSA', 'DOTMI'] },	// VMMC-DT

	// EXTERNAL ROUTE
	{ color: '#888888', group: 'EX_RTE', waypoints: ['SIKOU', 'GIVIV', 'LH'] },	// A202
	{ color: '#888888', group: 'EX_RTE', waypoints: ['SIKOU', 'ISBIG', 'SAMAS'] },	// R339
	{ color: '#888888', group: 'EX_RTE', waypoints: ['IKELA', 'LENKO', 'BUNTA'] },	// A1(W)
	{ color: '#888888', group: 'EX_RTE', waypoints: ['EPKAL', 'EGEMU', 'EXOTO'] },	// L642
	{ color: '#888888', group: 'EX_RTE', waypoints: ['72PCA', 'DONDA', 'DOSUT'] },	// M771
	{ color: '#888888', group: 'EX_RTE', waypoints: ['DABGI', 'ATBUD', 'ASOBA'] },	// M772
	{ color: '#888888', group: 'EX_RTE', waypoints: ['SABNO', 'DALRA', 'AKOTA'] },	// A583
	{ color: '#888888', group: 'EX_RTE', waypoints: ['NOMAN', 'MUMOT', 'AVMUP'] },	// A461
	{ color: '#888888', group: 'EX_RTE', waypoints: ['NOMAN', 'MIKIN', 'ALDIS'] },	// M501
	{ color: '#888888', group: 'EX_RTE', waypoints: ['KAPLI', 'RECON', 'ANDRE'] },	// G86
	{ color: '#888888', group: 'EX_RTE', waypoints: ['ENVAR', 'DADON', 'EXTRA', 'RENOT'] },	// M750
	{ color: '#888888', group: 'EX_RTE', waypoints: ['KADLO', 'ANPOG', 'ELATO'] },	// A1(E)
	{ color: '#888888', group: 'EX_RTE', waypoints: ['CYRUS', 'COMBO', 'DADON', 'ELATO'] },	// G581
	{ color: '#888888', group: 'EX_RTE', waypoints: ['LELIM', 'LAPUG', 'TOLAK', 'APAKA'] },	// M503
	{ color: '#888888', group: 'EX_RTE', waypoints: ['DOTMI', 'BEBEM', 'SWA'] },	// A470
	{ color: '#888888', group: 'EX_RTE', waypoints: ['SHL', 'ISLOM', 'LMN'] },	// G471
	{ color: '#888888', group: 'EX_RTE', waypoints: ['SHL', 'UPRIK', 'BOVMA'] },	// W26
	{ color: '#888888', group: 'EX_RTE', waypoints: ['BEKOL', 'IDUMA', 'SHL', 'YIN'] },	// A461
	{ color: '#888888', group: 'EX_RTE', waypoints: ['SHL', 'TEPID'] },	// W22
	{ color: '#888888', group: 'EX_RTE', waypoints: ['POU', 'TAMOT'] },	// B330
	{ color: '#888888', group: 'EX_RTE', waypoints: ['TAMOT', 'IDUMA'] },	// W68
	{ color: '#888888', group: 'EX_RTE', waypoints: ['NOMAR', 'NLG', 'TAMOT'] },	// W18
	{ color: '#888888', group: 'EX_RTE', waypoints: ['POU', 'VIBOS', 'ZUH', 'SIERA'] },	// R473
	{ color: '#888888', group: 'EX_RTE', waypoints: ['KABAM', 'MIKIN', 'MUMOT', 'DALRA', 'ATBUD', 'MIGUG', 'MONBO'] },	// N892
	{ color: '#888888', group: 'EX_RTE', waypoints: ['KAPLI', 'TNN'] },	// J1
	{ color: '#888888', group: 'EX_RTE', waypoints: ['KADLO', 'EXTRA', 'COMBO', 'KAPLI'] },	// T1
	{ color: '#888888', group: 'EX_RTE', waypoints: ['DADON', 'KADLO'] },	// L1
	{ color: '#888888', group: 'EX_RTE', waypoints: ['CYRUS', 'EXTRA', 'ANPOG', 'OLDID', 'LAPUG', 'BEBEM', 'AVBEP', 'SUMDO', 'OVGOT', 'VIPAP', 'GLN', 'ZUH', 'KIBAS', 'BOKAT', 'ADBIN', 'TOMUD', 'BIGRO', 'LH'] },	// R200
	{ color: '#888888', group: 'EX_RTE', waypoints: ['BIGRO', 'GIVIV', 'SAMAS'] },	// R221
	{ color: '#888888', group: 'EX_RTE', waypoints: ['DOTMI', 'JCS'] },	// V35
	{ color: '#888888', group: 'EX_RTE', waypoints: ['GLN', 'MIPAG', 'BIDIG', 'TEPID'] },	// W21
	{ color: '#888888', group: 'EX_RTE', waypoints: ['ISLOM', 'UPRIK'] },	// W41
	{ color: '#888888', group: 'EX_RTE', waypoints: ['POU', 'SAREX', 'ZUH'] }	// W7
];

const SCENARIO_ROUTES = [
	// OUTBOUND VHHH
	{
		group: 'ALLEY_DEP',
		waypoints: ['PECAN', 'ALLEY', 'DAGBU', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F250'],
		minAc: 1, maxAc: 3, acSegments: [0, 2], segFrac: { 1: [0.01, 0.15] },
		firEntryWp: 'PECAN', firExitWp: 'SIKOU'
	},
	{
		group: 'ALLEY_DEP',
		waypoints: ['PECAN', 'ALLEY', 'DAGBU', 'SIKOU', 'GIVIV', 'LH'],
		fls: ['F250'],
		minAc: 1, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.01, 0.15] },
		firEntryWp: 'PECAN', firExitWp: 'SIKOU'
	},
	{
		group: 'LAXET_DEP',
		waypoints: ['PECAN', 'LAXET', 'SURFA', 'IDOSI', 'IKELA', 'LENKO', 'BUNTA'],
		fls: ['F230'],
		minAc: 1, maxAc: 3, acSegments: [0, 2], segFrac: { 1: [0.01, 0.15] },
		firEntryWp: 'PECAN', firExitWp: 'IKELA'
	},
	{
		group: 'LAXET_DEP',
		waypoints: ['PECAN', 'LAXET', 'EPDOS', 'ENBOK', 'EPKAL', 'EGEMU'],
		fls: ['F230'],
		minAc: 1, maxAc: 3, acSegments: [0, 2], segFrac: { 1: [0.01, 0.15] },
		firEntryWp: 'PECAN', firExitWp: 'EPKAL'
	},
	// OUTBOUND VMMC
	{
		group: 'ALLEY_DEP',
		waypoints: ['PECAN', 'ALLEY', 'DAGBU', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F250'],
		minAc: 0, maxAc: 1, acSegments: [0, 2], segFrac: { 1: [0.01, 0.1] },
		firEntryWp: 'ALLEY', firExitWp: 'SIKOU'
	},
	{
		group: 'ALLEY_DEP',
		waypoints: ['PECAN', 'ALLEY', 'DAGBU', 'SIKOU', 'GIVIV', 'LH'],
		fls: ['F250'],
		minAc: 0, maxAc: 1, acSegments: [0, 2], segFrac: { 1: [0.01, 0.1] },
		firEntryWp: 'ALLEY', firExitWp: 'SIKOU'
	},
	{
		group: 'ALLEY_DEP',
		waypoints: ['PECAN', 'ALLEY', 'SURFA', 'IDOSI', 'IKELA', 'LENKO', 'BUNTA'],
		fls: ['F250'],
		minAc: 0, maxAc: 1, acSegments: [0, 2], segFrac: { 1: [0.01, 0.1] },
		firEntryWp: 'ALLEY', firExitWp: 'IKELA'
	},
	{
		group: 'ALLEY_DEP',
		waypoints: ['PECAN', 'ALLEY', 'EPDOS', 'ENBOK', 'EPKAL', 'EGEMU'],
		fls: ['F250'],
		minAc: 1, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.01, 0.1] },
		firEntryWp: 'ALLEY', firExitWp: 'EPKAL'
	},
	// INBOUND LANDING VHHH
	{
		group: 'SI_IN',
		waypoints: ['SAMAS', 'ISBIG', 'SIKOU', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO', 'BIGEX'],
		fls: ['F187', 'F266', 'F291', 'F331', 'F351', 'F371', 'F391'],
		minAc: 1, maxAc: 3, acSegments: [0, 3], segFrac: { 2: [0.05, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'CANTO', label: '07L SIK'
	},
	{
		group: 'SI_IN',
		waypoints: ['LH', 'GIVIV', 'SIKOU', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO', 'BIGEX'],
		fls: ['F187', 'F331', 'F351', 'F371', 'F391'],
		minAc: 1, maxAc: 3, acSegments: [0, 3], segFrac: { 2: [0.05, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'CANTO', label: '07L SIK'
	},
	{
		group: 'IK_IN',
		waypoints: ['BUNTA', 'LENKO', 'IKELA', 'IDOSI', 'MYWAY', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO', 'BIGEX'],
		fls: ['F270', 'F290', 'F330', 'F370', 'F410'],
		minAc: 1, maxAc: 4, acSegments: [1, 4], segFrac: { 0: [0.5, 0.95], 2: [0.05, 0.3] },
		firEntryWp: 'IKELA', firExitWp: 'CANTO', label: '07L IDO'
	},
	{
		group: 'DS_IN',
		waypoints: ['72PCA', 'DONDA', 'DOSUT', 'DULOP', 'CARSO', 'SUKER', 'HOCKY', 'CYBER', 'BETTY', 'BIGEX'],
		fls: ['F270', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
		minAc: 2, maxAc: 4, acSegments: [1, 3], segFrac: { 1: [0.5, 0.99], 2: [0.01, 0.3] },
		firEntryWp: 'DOSUT', firExitWp: 'BETTY', label: '07L CAR'
	},
	{
		group: 'SB_IN',
		waypoints: ['ATBUD', 'ASOBA', 'DULOP', 'CARSO', 'SUKER', 'HOCKY', 'CYBER', 'BETTY', 'BIGEX'],
		fls: ['F300', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.01, 0.6] },
		firEntryWp: 'ASOBA', firExitWp: 'BETTY', label: '07L CAR'
	},
	// INBOUND LANDING VMMC
	{
		group: 'SI_IN',
		waypoints: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI'],
		fls: ['F187', 'F266', 'F291', 'F331', 'F351', 'F371', 'F391'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.05, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'CHALI', label: '34'
	},
	{
		group: 'IK_IN',
		waypoints: ['LENKO', 'IKELA', 'IDOSI', 'DASON', 'COTON', 'CHALI'],
		fls: ['F270', 'F290', 'F330', 'F370', 'F390', 'F410'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.05, 0.2] },
		firEntryWp: 'IKELA', firExitWp: 'CHALI', label: '34'
	},
	{
		group: 'DS_IN',
		waypoints: ['72PCA', 'DONDA', 'DOSUT', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'CHALI'],
		fls: ['F270', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
		minAc: 0, maxAc: 2, acSegments: [1, 3], segFrac: { 1: [0.4, 0.99], 2: [0.01, 0.3] },
		firEntryWp: 'DOSUT', firExitWp: 'CHALI', label: '34'
	},
	{
		group: 'SB_IN',
		waypoints: ['ATBUD', 'ASOBA', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'CHALI'],
		fls: ['F300', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.05, 0.3] },
		firEntryWp: 'ASOBA', firExitWp: 'CHALI', label: '34'
	},
	// ZGGG DEPARTURE
	{
		group: 'ZGGG_DEP',
		waypoints: ['POU', 'VIBOS', 'ZUH', 'SIERA', 'MULET', 'ALLEY', 'DAGBU', 'SIKOU', 'GIVIV', 'LH'],
		fls: ['F250'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.05, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'SIKOU'
	},
	{
		group: 'ZGGG_DEP',
		waypoints: ['POU', 'VIBOS', 'ZUH', 'SIERA', 'MULET', 'ALLEY', 'DAGBU', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F250'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.05, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'SIKOU'
	},
	{
		group: 'ZGGG_DEP',
		waypoints: ['POU', 'VIBOS', 'ZUH', 'SIERA', 'MULET', 'ALLEY', 'SURFA', 'IDOSI', 'IKELA', 'LENKO'],
		fls: ['F250'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.05, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'IKELA'
	},
	{
		group: 'ZGGG_DEP',
		waypoints: ['POU', 'VIBOS', 'ZUH', 'SIERA', 'MULET', 'ALLEY', 'EPDOS', 'ENBOK', 'EPKAL', 'EGEMU'],
		fls: ['F250'],
		minAc: 1, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.05, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'EPKAL'
	},
	// ZGSZ DEPARTURE
	{
		group: 'ZGSZ_DEP',
		waypoints: ['NLG', 'ZUH', 'SIERA', 'ROCCA', 'ALLEY', 'DAGBU', 'SIKOU', 'GIVIV', 'LH'],
		fls: ['F120'],
		minAc: 0, maxAc: 2, acSegments: [0, 3], segFrac: { 2: [0.05, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'SIKOU'
	},
	{
		group: 'ZGSZ_DEP',
		waypoints: ['NLG', 'ZUH', 'SIERA', 'ROCCA', 'ALLEY', 'DAGBU', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F120'],
		minAc: 0, maxAc: 2, acSegments: [0, 3], segFrac: { 2: [0.01, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'SIKOU'
	},
	{
		group: 'ZGSZ_DEP',
		waypoints: ['NLG', 'ZUH', 'SIERA', 'ROCCA', 'ALLEY', 'SURFA', 'IDOSI', 'IKELA', 'LENKO'],
		fls: ['F120'],
		minAc: 0, maxAc: 2, acSegments: [0, 3], segFrac: { 2: [0.01, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'IKELA'
	},
	{
		group: 'ZGSZ_DEP',
		waypoints: ['NLG', 'ZUH', 'SIERA', 'ROCCA', 'ALLEY', 'EPDOS', 'ENBOK', 'EPKAL', 'EGEMU'],
		fls: ['F120'],
		minAc: 0, maxAc: 2, acSegments: [0, 3], segFrac: { 2: [0.01, 0.3] },
		firEntryWp: 'SIERA', firExitWp: 'EPKAL'
	},
	// ZGGG ARRIVAL
	{
		group: 'SI_IN',
		waypoints: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'SAPAX', 'BIGEX', 'TAMOT', 'IDUMA'],
		fls: ['F331', 'F351', 'F371', 'F391', 'F411'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.01, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'TAMOT'
	},
	{
		group: 'IK_IN',
		waypoints: ['LENKO', 'IKELA', 'MORTU', 'ISBAN', 'ROBIN', 'TAPPO', 'SAPAX', 'BIGEX', 'TAMOT', 'IDUMA'],
		fls: ['F270', 'F290', 'F330', 'F370', 'F390', 'F410'],
		minAc: 0, maxAc: 2, acSegments: [0, 3],
		firEntryWp: 'IKELA', firExitWp: 'TAMOT'
	},
	{
		group: 'DS_IN',
		waypoints: ['72PCA', 'DONDA', 'DOSUT', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'TAPPO', 'SAPAX', 'BIGEX', 'TAMOT', 'IDUMA'],
		fls: ['F270', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
		minAc: 0, maxAc: 2, acSegments: [1, 3], segFrac: { 1: [0.5, 0.99], 2: [0.01, 0.3] },
		firEntryWp: 'DOSUT', firExitWp: 'TAMOT'
	},
	{
		group: 'SB_IN',
		waypoints: ['ATBUD', 'ASOBA', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'TAPPO', 'SAPAX', 'BIGEX', 'TAMOT', 'IDUMA'],
		fls: ['F300', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.01, 0.3] },
		firEntryWp: 'ASOBA', firExitWp: 'TAMOT'
	},
	// ZGSZ ARRIVAL
	{
		group: 'SI_IN',
		waypoints: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'LANDA'],
		fls: ['F331', 'F351', 'F371', 'F391', 'F411'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.01, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'LANDA', label: '15'
	},
	{
		group: 'IK_IN',
		waypoints: ['LENKO', 'IKELA', 'IDOSI', 'DASON', 'COTON', 'LANDA'],
		fls: ['F270', 'F290', 'F330', 'F370', 'F390', 'F410'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 13: [0.01, 0.2] },
		firEntryWp: 'IKELA', firExitWp: 'LANDA', label: '15'
	},
	{
		group: 'DS_IN',
		waypoints: ['72PCA', 'DONDA', 'DOSUT', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'ALLEY', 'GOBBI', 'LANDA'],
		fls: ['F270', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
		minAc: 0, maxAc: 2, acSegments: [1, 3], segFrac: { 1: [0.5, 0.99], 2: [0.01, 0.3] },
		firEntryWp: 'DOSUT', firExitWp: 'LANDA', label: '15'
	},
	{
		group: 'SB_IN',
		waypoints: ['ATBUD', 'ASOBA', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'ALLEY', 'GOBBI', 'LANDA'],
		fls: ['F300', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.01, 0.3] },
		firEntryWp: 'ASOBA', firExitWp: 'LANDA', label: '15'
	},
	// OVF
	// SI - KA
	{
		group: 'SI_IN',
		waypoints: ['LH', 'GIVIV', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'KAPLI', 'RECON', 'ANDRE'],
		fls: ['F331', 'F351', 'F371', 'F391', 'F411'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.01, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'KAPLI'
	},
	{
		group: 'SI_IN',
		waypoints: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'KAPLI', 'RECON', 'ANDRE'],
		fls: ['F187', 'F266', 'F291', 'F331', 'F351', 'F371', 'F391', 'F411'],
		minAc: 0, maxAc: 1, acSegments: [0, 4], segFrac: { 3: [0.01, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'KAPLI'
	},
	// SI - BK
	{
		group: 'SI_IN',
		waypoints: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'BEKOL', 'IDUMA', 'SHL'],
		fls: ['F187', 'F266', 'F291'],
		minAc: 0, maxAc: 2, acSegments: [0, 4], segFrac: { 3: [0.01, 0.2] },
		firEntryWp: 'SIKOU', firExitWp: 'BEKOL'
	},
	// IK - KA
	{
		group: 'IK_IN',
		waypoints: ['LENKO', 'IKELA', 'MORTU', 'NOBAD', 'KAPLI', 'RECON', 'ANDRE'],
		fls: ['F270', 'F290', 'F330', 'F370', 'F410'],
		minAc: 3, maxAc: 10, acSegments: [0, 2], segFrac: { 0: [0.5, 0.99], 1: [0.01, 0.3] },
		firEntryWp: 'IKELA', firExitWp: 'KAPLI'
	},
	// IK - BK
	{
		group: 'IK_IN',
		waypoints: ['LENKO', 'IKELA', 'IDOSI', 'BIGEX', 'BEKOL', 'IDUMA', 'SHL'],
		fls: ['F270', 'F290', 'F330', 'F370', 'F390', 'F410'],
		minAc: 0, maxAc: 3, acSegments: [0, 3], segFrac: { 0: [0.5, 0.99], 2: [0.01, 0.2] },
		firEntryWp: 'IKELA', firExitWp: 'BEKOL'
	},
	// DS - DT
	{
		group: 'DS_IN',
		waypoints: ['72PCA', 'DONDA', 'DOSUT', 'DULOP', 'CARSO', 'NOBAD', 'SANKU', 'BIMIX', 'DOTMI', 'BEBEM'],
		fls: ['F270', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
		minAc: 0, maxAc: 2, acSegments: [1, 3], segFrac: { 1: [0.5, 0.99], 2: [0.01, 0.2] },
		firEntryWp: 'DOSUT', firExitWp: 'DOTMI'
	},
	// DS - BK
	{
		group: 'DS_IN',
		waypoints: ['72PCA', 'DONDA', 'DOSUT', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'TAPPO', 'SAPAX', 'BEKOL', 'IDUMA', 'SHL'],
		fls: ['F270', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
		minAc: 0, maxAc: 2, acSegments: [1, 3], segFrac: { 1: [0.5, 0.99], 2: [0.01, 0.2] },
		firEntryWp: 'DOSUT', firExitWp: 'BEKOL'
	},
	// SB - DT
	{
		group: 'SB_IN',
		waypoints: ['ATBUD', 'ASOBA', 'DULOP', 'CARSO', 'NOBAD', 'SANKU', 'BIMIX', 'DOTMI', 'BEBEM'],
		fls: ['F300', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.4, 0.99], 2: [0.01, 0.2] },
		firEntryWp: 'ASOBA', firExitWp: 'DOTMI'
	},
	// SB - BK
	{
		group: 'SB_IN',
		waypoints: ['ATBUD', 'ASOBA', 'DULOP', 'DUMOL', 'MORTU', 'ISBAN', 'ROBIN', 'TAPPO', 'SAPAX', 'BEKOL', 'IDUMA', 'SHL'],
		fls: ['F300', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 0: [0.4, 0.99], 1: [0.01, 0.2] },
		firEntryWp: 'ASOBA', firExitWp: 'BEKOL'
	},
	// SN - SI
	{
		group: 'SN_IN',
		waypoints: ['DALRA', 'SABNO', 'SIKOU', 'GIVIV', 'LH'],
		fls: ['F300', 'F340', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.01, 0.3] },
		firEntryWp: 'SABNO', firExitWp: 'SIKOU'
	},
	{
		group: 'SN_IN',
		waypoints: ['DALRA', 'SABNO', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F300', 'F340', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2], segFrac: { 1: [0.01, 0.3] },
		firEntryWp: 'SABNO', firExitWp: 'SIKOU'
	},
	// SN - BK
	{
		group: 'SN_IN',
		waypoints: ['DALRA', 'SABNO', 'LEGOD', 'BEKOL', 'IDUMA', 'SHL'],
		fls: ['F300', 'F340', 'F380'],
		minAc: 0, maxAc: 2, acSegments: [0, 2],
		firEntryWp: 'SABNO', firExitWp: 'BEKOL'
	},
	// KA - SI
	{
		group: 'KA_IN',
		waypoints: ['EXTRA', 'COMBO', 'KAPLI', 'ALLEY', 'DAGBU', 'SIKOU', 'GIVIV', 'LH'],
		fls: ['F280', 'F300', 'F320', 'F340', 'F360', 'F380', 'F400'],
		minAc: 0, maxAc: 1, acSegments: [2, 3], segFrac: { 2: [0.01, 0.5] },
		firEntryWp: 'KAPLI', firExitWp: 'SIKOU'
	},
	{
		group: 'KA_IN',
		waypoints: ['EXTRA', 'COMBO', 'KAPLI', 'ALLEY', 'DAGBU', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F280', 'F300', 'F340', 'F380', 'F400'],
		minAc: 0, maxAc: 1, acSegments: [2, 3], segFrac: { 2: [0.01, 0.5] },
		firEntryWp: 'KAPLI', firExitWp: 'SIKOU'
	},
	// KA - IK
	{
		group: 'KA_IN',
		waypoints: ['EXTRA', 'COMBO', 'KAPLI', 'MADRU', 'SULUX', 'IGLEG', 'IKELA', 'LENKO'],
		fls: ['F280', 'F300', 'F340', 'F380', 'F400'],
		minAc: 5, maxAc: 10, acSegments: [2, 5], segFrac: { 4: [0.01, 0.5] },
		firEntryWp: 'KAPLI', firExitWp: 'IKELA'
	},
	// EL - BK
	{
		group: 'EL_IN',
		waypoints: ['KADLO', 'ANPOG', 'ELATO', 'TUBBY', 'SAMMI', 'NEDLE', 'PONTI', 'BEKOL', 'IDUMA', 'SHL'],
		fls: ['F280', 'F300', 'F320', 'F340', 'F360', 'F380', 'F400'],
		minAc: 0, maxAc: 1, acSegments: [3, 5], segFrac: { 4: [0.01, 0.7] },
		firEntryWp: 'ELATO', firExitWp: 'BEKOL'
	},
	// DT - SI
	{
		group: 'DT_IN',
		waypoints: ['BEBEM', 'DOTMI', 'ENROM', 'ALLEY', 'DAGBU', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F280', 'F300', 'F340', 'F380', 'F400'],
		minAc: 0, maxAc: 2, acSegments: [1, 3], segFrac: { 2: [0.01, 0.5] },
		firEntryWp: 'DOTMI', firExitWp: 'SIKOU'
	},
	// DT - IK
	{
		group: 'DT_IN',
		waypoints: ['BEBEM', 'DOTMI', 'ENROM', 'RUSBI', 'SULUX', 'IGLEG', 'IKELA', 'LENKO'],
		fls: ['F280', 'F300', 'F340', 'F380', 'F400'],
		minAc: 0, maxAc: 2, acSegments: [2, 5], segFrac: { 2: [0.5, 0.99], 4: [0.01, 0.5] },
		firEntryWp: 'DOTMI', firExitWp: 'IKELA'
	},
	// DT - EK
	{
		group: 'DT_IN',
		waypoints: ['BEBEM', 'DOTMI', 'ENROM', 'RUSBI', 'SULUX', 'EPKAL', 'EGEMU'],
		fls: ['F280', 'F310', 'F320', 'F350', 'F360', 'F390', 'F400'],
		minAc: 1, maxAc: 3, acSegments: [2, 5], segFrac: { 2: [0.5, 0.99], 4: [0.01, 0.3] },
		firEntryWp: 'DOTMI', firExitWp: 'EPKAL'
	},
	// TM - SI
	{
		group: 'TM_IN',
		waypoints: ['POU', 'TAMOT', 'ALLEY', 'DAGBU', 'SIKOU', 'ISBIG', 'SAMAS'],
		fls: ['F276', 'F301', 'F321', 'F341', 'F361', 'F381', 'F401'],
		minAc: 0, maxAc: 2, acSegments: [0, 2],
		firEntryWp: 'TAMOT', firExitWp: 'SIKOU'
	},
	// TM - IK
	{
		group: 'TM_IN',
		waypoints: ['POU', 'TAMOT', 'ALLEY', 'SURFA', 'IDOSI', 'IKELA', 'LENKO'],
		fls: ['F276', 'F301', 'F321', 'F341', 'F361', 'F381', 'F401'],
		minAc: 0, maxAc: 2, acSegments: [0, 2],
		firEntryWp: 'TAMOT', firExitWp: 'IKELA'
	},
	// TM - EK
	{
		group: 'TM_IN',
		waypoints: ['POU', 'TAMOT', 'ALLEY', 'EPDOS', 'ENBOK', 'EPKAL', 'EGEMU'],
		fls: ['F276', 'F301', 'F321', 'F341', 'F361', 'F381', 'F401'],
		minAc: 1, maxAc: 3, acSegments: [0, 2],
		firEntryWp: 'TAMOT', firExitWp: 'EPKAL'
	},
];

const SCENARIO_GROUPS = [
	{ group: 'ALLEY_DEP', min: 2, max: 7, minSpacingNM: 10 },
	{ group: 'LAXET_DEP', min: 2, max: 7, minSpacingNM: 10 },
	{ group: 'ZGGG_DEP', min: 1, max: 4, minSpacingNM: 60 },
	{ group: 'ZGSZ_DEP', min: 0, max: 4, minSpacingNM: 20 },
	{ group: 'SI_IN', min: 3, max: 10, minSpacingNM: 20 },
	{ group: 'IK_IN', min: 6, max: 12, minSpacingNM: 20 },
	{ group: 'DS_IN', min: 2, max: 6, minSpacingNM: 20 },
	{ group: 'SB_IN', min: 1, max: 2, minSpacingNM: 80 },
	{ group: 'SN_IN', min: 0, max: 2, minSpacingNM: 5 },
	{ group: 'KA_IN', min: 6, max: 12, minSpacingNM: 20 },
	{ group: 'EL_IN', min: 0, max: 1, minSpacingNM: 5 },
	{ group: 'DT_IN', min: 1, max: 6, minSpacingNM: 30 },
	{ group: 'TM_IN', min: 1, max: 5, minSpacingNM: 30 },
];

// Multiple level constraints per route
const ROUTE_LEVEL_CONSTRAINTS = [
	{
		route: ['SAMAS', 'ISBIG', 'SIKOU', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO', 'BIGEX'],
		constraints: [
			// Example: you can add more later
			// { wp: 'SIKOU', fl: 'F300' },
			{ wp: 'MAPLE', fl: 'F260' }
		]
	},
	{
		route: ['LH', 'GIVIV', 'SIKOU', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO', 'BIGEX'],
		constraints: [
			{ wp: 'MAPLE', fl: 'F260' }
		]
	},
	{
		route: ['BUNTA', 'LENKO', 'IKELA', 'IDOSI', 'MYWAY', 'GAMBA', 'MAPLE', 'COMBI', 'ROCCA', 'CANTO', 'BIGEX'],
		constraints: [
			{ wp: 'MAPLE', fl: 'F260' }
		]
	},
	{
		route: ['72PCA', 'DONDA', 'DOSUT', 'DULOP', 'CARSO', 'SUKER', 'HOCKY', 'CYBER', 'BETTY', 'BIGEX'],
		constraints: [
			{ wp: 'CARSO', fl: 'F310' }
		]
	},
	{
		route: ['ATBUD', 'ASOBA', 'DULOP', 'CARSO', 'SUKER', 'HOCKY', 'CYBER', 'BETTY', 'BIGEX'],
		constraints: [
			{ wp: 'CARSO', fl: 'F310' }
		]
	},
	{
		route: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI'],
		constraints: [
			{ wp: 'COTON', fl: 'F120' }, { wp: 'CHALI', fl: 'F110' }
		]
	},
	{
		route: ['LENKO', 'IKELA', 'IDOSI', 'DASON', 'COTON', 'CHALI'],
		constraints: [
			{ wp: 'COTON', fl: 'F120' }, { wp: 'CHALI', fl: 'F110' }
		]
	},
	{
		route: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'CHALI', 'SAPAX', 'BIGEX', 'TAMOT', 'IDUMA'],
		constraints: [
			{ wp: 'CHALI', fl: 'F260' }
		]
	},
	{
		route: ['SAMAS', 'ISBIG', 'SIKOU', 'RAGSO', 'DASON', 'COTON', 'LANDA'],
		constraints: [
			{ wp: 'COTON', fl: 'F120' }, { wp: 'LANDA', fl: 'F110' }
		]
	},
	{
		route: ['LENKO', 'IKELA', 'IDOSI', 'DASON', 'COTON', 'LANDA'],
		constraints: [
			{ wp: 'COTON', fl: 'F120' }, { wp: 'LANDA', fl: 'F110' }
		]
	}
];

const routeVisibility = { TRE: true, TRS: true, TRW: true, OVF: true, OVF_OTHER: false, EX_RTE: true };
function toggleRoute(group) {
	routeVisibility[group] = !routeVisibility[group];
	const btn = document.getElementById('btn-route-' + group);
	if (!btn) return;   // ← add this guard as a safety net
	btn.classList.toggle('place-active', routeVisibility[group]);
	draw();
}

// Colour priority: cyan > yellow > magenta
const COLOR_PRIORITY = ['#00e5ff', '#ffea00', '#ff66cc'];

const RED_LINE = [
	[-190.36, 21.11],
	[-148.22, 30.74],
	[-139.51, -7.99],
	[-181.52, -17.61],
	[-190.36, 21.11],
];
function drawRedLine(ctx, S) {
	if (RED_LINE.length < 2) return;
	ctx.save(); ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
	ctx.beginPath();
	const p0 = S(RED_LINE[0][0], RED_LINE[0][1]); ctx.moveTo(p0.x, p0.y);
	for (let i = 1; i < RED_LINE.length; i++) { const p = S(RED_LINE[i][0], RED_LINE[i][1]); ctx.lineTo(p.x, p.y); }
	ctx.stroke();
	// Label at center, rotated to align with northern edge, scales with zoom
	const ctr = S(-164.9025, 6.5625);
	const dx = S(RED_LINE[3][0], RED_LINE[3][1]).x - S(RED_LINE[0][0], RED_LINE[0][1]).x;
	const dy = S(RED_LINE[3][0], RED_LINE[3][1]).y - S(RED_LINE[0][0], RED_LINE[0][1]).y;
	const angle = Math.atan2(dy, dx);
	const fontSize = Math.max(4, 5 * _lastScale);
	ctx.save();
	ctx.translate(ctr.x, ctr.y);
	ctx.rotate(angle - Math.PI / 2);
	ctx.font = `${fontSize}px 'Cascadia Mono', monospace`;
	ctx.fillStyle = '#FF0000';
	ctx.globalAlpha = 0.5;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('ZJ(D)208', 0, 0);
	ctx.restore();
	ctx.restore();
}

function drawAirways(ctx, S) {
	// Step 1: build segment map keyed by canonical "WP1|WP2"
	const segMap = new Map();
	AIRWAYS.forEach(airway => {
		for (let i = 0; i < airway.waypoints.length - 1; i++) {
			const a = airway.waypoints[i], b = airway.waypoints[i + 1];
			const key = a < b ? a + '|' + b : b + '|' + a;
			if (!segMap.has(key)) segMap.set(key, []);
			segMap.get(key).push(airway);
		}
	});

	// Step 2: for each unique segment, resolve winning airway
	segMap.forEach((claimants, key) => {
		// Filter to visible groups only
		const visible = claimants.filter(aw => routeVisibility[aw.group]);
		if (visible.length === 0) return;

		// Pick highest priority colour among visible claimants
		let winner = null;
		for (const col of COLOR_PRIORITY) {
			const match = visible.find(aw => aw.color === col);
			if (match) { winner = match; break; }
		}
		if (!winner) winner = visible[0];

		// Step 3: get actual waypoint coords (original order from winner)
		const [wa, wb] = key.split('|');
		// Find original order from winner's waypoints
		const idxA = winner.waypoints.indexOf(wa);
		const idxB = winner.waypoints.indexOf(wb);
		const nameA = idxA < idxB ? wa : wb;
		const nameB = idxA < idxB ? wb : wa;
		const wpA = WAYPOINTS.find(w => w.name === nameA);
		const wpB = WAYPOINTS.find(w => w.name === nameB);
		if (!wpA || !wpB) return;

		const pA = S(wpA.x, wpA.y), pB = S(wpB.x, wpB.y);

		// Step 4: draw once
		ctx.save();
		ctx.strokeStyle = winner.color;
		ctx.lineWidth = winner.group === 'EX_RTE' ? 1 : (winner.lineWidth || 1);
		ctx.globalAlpha = winner.group === 'EX_RTE' ? 0.5 : (winner.color === '#00e5ff' || winner.color === '#ffea00') ? 0.25 : 0.4;
		ctx.setLineDash(winner.dashed ? [6, 4] : []);
		ctx.beginPath();
		ctx.moveTo(pA.x, pA.y);
		ctx.lineTo(pB.x, pB.y);
		ctx.stroke();
		ctx.restore();
	});
}

// ── INTERACTION / PLACEMENT ──────────────────────────────────────────────
let placeMode = null, headingMode = null, addMode = false;
function getDrawTransform() {
	const cx = _lastW / 2, cy = _lastH / 2, scale = _lastScale;
	const toScreen = (nx, ny) => ({ x: cx + (nx - offsetX) * scale, y: cy - (ny - offsetY) * scale });
	const toNM = (px, py) => ({ x: (px - cx) / scale + offsetX, y: -(py - cy) / scale + offsetY });
	return { scale, toScreen, toNM };
}
function canvasClickPlace(e) {
	if (!placeMode && !headingMode && !addMode) return;
	const rect = _canvas.getBoundingClientRect();
	const px = (e.clientX - rect.left) * (_canvas.width / rect.width), py = (e.clientY - rect.top) * (_canvas.height / rect.height);
	const { toScreen, toNM } = getDrawTransform();
	let { x: nx, y: ny } = toNM(px, py);
	let snapD = Infinity, snapWP = null;
	WAYPOINTS.forEach(wp => { const sp = toScreen(wp.x, wp.y), d = Math.hypot(px - sp.x, py - sp.y); if (d < 20 && d < snapD) { snapD = d; snapWP = wp; } });
	if (snapWP) { nx = snapWP.x; ny = snapWP.y; }
	if (addMode) {
		openAddAcPopup(nx, ny);
		return;
	}
	const ac = getAcById(selectedAcId); if (!ac) return;
	if (headingMode === 'SEL') {
		const dx = nx - ac.x, dy = ny - ac.y; let hdg = Math.atan2(dx, dy) * 180 / Math.PI;
		if (hdg < 0) hdg += 360; hdg = Math.round(hdg) - MAGVAR; if (hdg < 0) hdg += 360; if (hdg >= 360) hdg -= 360;
		ac.hdg = hdg; headingMode = null; updateHeadingBtns(); updateWpBtns(); _canvas.style.cursor = 'grab'; refreshPanelFields(); draw(); return;
	}
	if (placeMode === 'SEL') {
		ac.x = parseFloat(nx.toFixed(2)); ac.y = parseFloat(ny.toFixed(2));
		placeMode = null; updatePlaceBtns(); updateWpBtns(); _canvas.style.cursor = 'grab'; refreshPanelFields(); draw();
	}
}
function placeAtWaypoint(name) {
	const wp = WAYPOINTS.find(w => w.name === name); if (!wp) return;
	if (headingMode === 'SEL') {
		const ac = getAcById(selectedAcId); if (!ac) return;
		const dx = wp.x - ac.x, dy = wp.y - ac.y; let hdg = Math.atan2(dx, dy) * 180 / Math.PI;
		if (hdg < 0) hdg += 360; hdg = Math.round(hdg) - MAGVAR; if (hdg < 0) hdg += 360; if (hdg >= 360) hdg -= 360;
		ac.hdg = hdg; headingMode = null; updateHeadingBtns(); updateWpBtns(); refreshPanelFields(); draw(); return;
	}
	if (addMode) {
		openAddAcPopup(wp.x, wp.y);
		return;
	}
	if (!placeMode) return;
	const ac = getAcById(selectedAcId); if (!ac) return;
	ac.x = wp.x; ac.y = wp.y; placeMode = null; updatePlaceBtns(); updateWpBtns(); _canvas.style.cursor = 'grab'; refreshPanelFields(); draw();
}
function setPlaceMode(m) {
	const wasActive = placeMode === m;
	cancelAllModes();
	if (!wasActive) placeMode = m;
	updatePlaceBtns();
	updateHeadingBtns();
	updateAddBtn();
	updateWpBtns();
	updateProbeUI();
	updateRblUI();
	_canvas.style.cursor = placeMode ? 'crosshair' : 'grab';
}
function setHeadingMode(m) {
	const wasActive = headingMode === m;
	cancelAllModes();
	if (!wasActive) headingMode = m;
	updatePlaceBtns();
	updateHeadingBtns();
	updateAddBtn();
	updateWpBtns();
	updateProbeUI();
	updateRblUI();
	_canvas.style.cursor = headingMode ? 'crosshair' : 'grab';
}
function setGlobalSpdMode(mode) {
	globalSpdMode = mode;
	document.getElementById('spdModeBtn').textContent = `SPD ${mode}`;

	// Sync ATC speed panel to match (atcInstrPanel may be hidden but still in DOM)
	const atcSel = document.getElementById('atcSpdMode');
	if (atcSel) { atcSel.value = mode; onAtcSpdModeChange(); }

	// Refresh panel if aircraft selected
	refreshPanelFields();
}
function updatePlaceBtns() {
	const hasAc = selectedAcId !== null;
	const b = document.getElementById('placeBtnSel');
	if (!b) return;
	b.disabled = !hasAc;
	b.style.opacity = hasAc ? '1' : '0.35';
	b.style.cursor = hasAc ? 'pointer' : 'not-allowed';
	b.classList.toggle('place-active', placeMode === 'SEL');
	b.textContent = placeMode === 'SEL' ? '✈︎ Placing…' : '✈︎ Place Selected';
}
function updateHeadingBtns() {
	const hasAc = selectedAcId !== null;
	const b = document.getElementById('hdgBtnSel');
	if (!b) return; b.disabled = !hasAc; b.style.opacity = hasAc ? '1' : '0.35';
	b.style.cursor = hasAc ? 'pointer' : 'not-allowed';
	b.classList.toggle('place-active', headingMode === 'SEL');
	b.textContent = headingMode === 'SEL' ? '𖦏 Aiming…' : '𖦏 Aim Selected';
}
let showWpNames = false;
function toggleWpNames() {
	showWpNames = !showWpNames;
	const b = document.getElementById('wpNamesBtn');
	if (b) b.classList.toggle('place-active', showWpNames);
	draw();
}
function updateWpBtns() {
	const active = placeMode || headingMode || addMode;
	document.querySelectorAll('.wp-btn').forEach(b => {
		b.disabled = !active;
	});
}
let draggingLabelAc = null, labelDragStartX = 0, labelDragStartY = 0, labelDragOriginX = 0, labelDragOriginY = 0;
// FDL drag state
let fdlDrag = null; // { id, startPx: {x,y}, startAnchorNM: {x,y} }
const LABEL_MAX_DIST = 120;

function cancelAllModes() {
	placeMode = null;
	headingMode = null;
	addMode = false;
	if (probeMode) { probeMode = null; probeBuilding = null; }
	if (rblMode) { rblBuilding = null; rblMode = null; rblCursorNM = null; updateRblUI(); }
	updatePlaceBtns(); updateHeadingBtns(); updateWpBtns();
	updateAddBtn(); updateProbeUI(); updateRblUI();
	_canvas.style.cursor = 'grab';
}

// ── SCENARIO GENERATION ────────────────────────────────────────────────── 
function generateAcOnRoute(airway, groupCfg = null) {
	const { waypoints, fls, acSegments, segFrac } = airway;

	if (!fls || !fls.length) return [];

	const segStart = acSegments ? acSegments[0] : 0;
	const segEnd = acSegments ? acSegments[1] - 1 : waypoints.length - 2;
	if (segStart > segEnd) return [];

	const segs = [];
	let cum = 0;
	for (let i = segStart; i <= segEnd; i++) {
		const n1 = waypoints[i];
		const n2 = waypoints[i + 1];
		const w1 = WAYPOINTS.find(w => w.name === n1);
		const w2 = WAYPOINTS.find(w => w.name === n2);
		if (!w1 || !w2) continue;
		const dx = w2.x - w1.x;
		const dy = w2.y - w1.y;
		const len = Math.hypot(dx, dy);
		if (len < 1e-3) continue;

		segs.push({
			w1,
			w2,
			dx,
			dy,
			len,
			start: cum,
			end: cum + len,
			wpIndex: i + 1,
			segIndex: i
		});
		cum += len;
	}
	if (!segs.length) return [];

	const totalLen = cum;

	// HARD per‑route caps
	const routeMin = airway.minAc ?? 0;
	const routeMax = airway.maxAc ?? 1;

	let desired = rndInt(routeMin, routeMax);
	desired = Math.max(routeMin, Math.min(routeMax, desired));
	if (desired <= 0) return [];

	const maxByFls = fls.length;
	let finalCount = Math.min(desired, maxByFls);
	finalCount = Math.max(Math.min(routeMin, maxByFls), finalCount);
	if (finalCount <= 0) return [];

	const positions = [];
	for (let i = 0; i < finalCount; i++) {
		positions.push(Math.random() * totalLen);
	}

	const flPool = [...fls].sort(() => Math.random() - 0.5);

	const out = [];

	for (let i = 0; i < positions.length; i++) {
		const dist = positions[i];
		const seg =
			segs.find(s => dist >= s.start && dist <= s.end) ||
			segs[segs.length - 1];

		const rawLocal = (dist - seg.start) / seg.len;

		const thisSegIndex = seg.segIndex;
		const fr = segFrac?.[thisSegIndex];
		const range = fr ?? [0.0, 1.0];
		const clampedLocal = Math.min(1, Math.max(0, rawLocal));
		const local = range[0] + (range[1] - range[0]) * clampedLocal;

		const trackPos = seg.start + local * seg.len;

		let x = seg.w1.x + local * seg.dx;
		let y = seg.w1.y + local * seg.dy;

		const nx = -seg.dy / seg.len;
		const ny = seg.dx / seg.len;
		const jitterNM = 0.3;
		const offset = (Math.random() * 2 - 1) * jitterNM;
		x += nx * offset;
		y += ny * offset;

		x = parseFloat(x.toFixed(2));
		y = parseFloat(y.toFixed(2));

		const truHdg = Math.atan2(seg.dx, seg.dy) * 180 / Math.PI;
		const hdg = Math.round((truHdg - MAGVAR + 360) % 360);

		const segIdx = seg.wpIndex;
		const route = waypoints.slice(segIdx);
		const originalRoute = [...waypoints];

		const fl = airway.forceFl ?? flPool[i % flPool.length];
		const [type, wtc] = AC_TYPE_POOL[rndInt(0, AC_TYPE_POOL.length - 1)];

		const candidate = {
			type,
			wtc,
			fl,
			hdg,
			x,
			y,
			route,
			originalRoute,
			scenarioGroup: groupCfg?.group ?? null,
			//group: airway.group ?? null,
			trackPos,
			routeLabel: airway.label ?? null,
			firEntryWp: airway.firEntryWp ?? null,   // ← must be here
			firExitWp: airway.firExitWp ?? null   // ← must be here
		};
		out.push(candidate);
	}
	return out;
}

function getScenarioTargetCount() {
	const el = document.getElementById('scenGenCount');
	let v = el ? parseInt(el.value, 10) : NaN;
	if (isNaN(v) || v <= 0) v = 30;            // default if blank/invalid
	return Math.min(v, MAX_AC);               // never exceed MAX_AC
}

function generateScenario() {
	// Clear existing aircraft & probes, reset sim state
	aircraft = [];
	probes = [];
	selectedAcId = null;
	simTimeSec = 0;
	simRunning = false;
	updateSimClock();
	updateSimButtons();

	const groupMap = {};
	SCENARIO_ROUTES.forEach(r => {
		if (!r.group) return;
		if (!groupMap[r.group]) groupMap[r.group] = [];
		groupMap[r.group].push(r);
	});

	const committed = []; // accumulated generated candidates

	// For each scenario group (ALLEY_DEP, KA_IN, etc.)
	SCENARIO_GROUPS.forEach(groupCfg => {
		const routes = groupMap[groupCfg.group] || [];
		if (!routes.length) return;

		const minTotal = groupCfg.min ?? 0;
		const maxTotal = groupCfg.max ?? minTotal;
		let groupTarget = rndInt(minTotal, maxTotal);
		groupTarget = Math.max(minTotal, Math.min(maxTotal, groupTarget));
		if (groupTarget <= 0) return;

		let groupCount = 0;

		// Loop each route, letting generateAcOnRoute respect per‑route minAc/maxAc
		routes.forEach(airway => {
			if (groupCount >= groupTarget) return;

			const cand = generateAcOnRoute(airway, groupCfg, committed);
			if (!cand || !cand.length) return;

			cand.forEach(c => {
				if (groupCount >= groupTarget) return; // enforce per‑group max
				committed.push({
					group: groupCfg.group,
					minSpacingNM: groupCfg.minSpacingNM ?? 0,
					...c
				});
				groupCount++;
			});
		});
	});

	// Now we have "overflow" candidates: respect spacing and scenGenCount here
	commitScenarioAircraft(committed);

	initialScenarioSnapshot = aircraft.map(a => JSON.parse(JSON.stringify(a)));
	rebuildFdlState();
	renderFdlPanels();
	draw();
}

// NEW: bridge from candidate objects → aircraft[] using spacing + spawner
function commitScenarioAircraft(candidates) {
	if (!candidates || !candidates.length) return;

	const targetTotal = getScenarioTargetCount();

	// 1) Apply spacing rules
	const pruned = pruneBySpacing(candidates);

	// 2) Hard trim to scenGenCount (and safety MAX_AC)
	const hardCap = Math.min(targetTotal, MAX_AC);
	const finalList = pruned.slice(0, hardCap);

	// 3) Spawn each into aircraft[]
	finalList.forEach(c => {
		if (aircraft.length >= MAX_AC) return; // extra safety
		spawnGeneratedAc(c);
	});

	refreshPanel();
}

function spawnGeneratedAc(ac) {
	const perf = getPerf(ac.type);
	const altFt = flToAltFt(ac.fl);
	const xover = calcCrossoverAlt(perf.climbIAS, perf.cruiseMach);

	let spdMode, clearedMach, clearedIas, gs, ias, mach;
	if (altFt >= xover) {
		spdMode = 'MACH';
		clearedMach = null;
		clearedIas = null;
		mach = perf.cruiseMach;
		ias = null;
		const T = isaTemp(altFt);
		gs = clamp(Math.round(perf.cruiseMach * 38.967 * Math.sqrt(T)), 280, 550);
	} else {
		spdMode = 'IAS';
		clearedMach = null;
		clearedIas = null;
		mach = null;
		ias = perf.climbIAS;
		gs = clamp(iasToTas(perf.climbIAS, altFt), 200, 550);
	}

	const [type, wtc] = AC_TYPE_POOL.find(t => t[0] === ac.type) ?? randomAcType();

	aircraft.push({
		id: _acIdCtr++,
		callsign: generateCallsign(),
		type,
		wtc,
		hdg: ac.hdg,
		gs,
		ias,
		mach,
		x: parseFloat(ac.x.toFixed(2)),
		y: parseFloat(ac.y.toFixed(2)),
		fl: ac.fl,
		lx: (Math.random() - 0.5) * 18,
		ly: (Math.random() - 0.5) * 30,
		altFt,
		targetAltFt: altFt,
		// Level-constraint guidance state
		lcActive: false,
		lcWp: null,
		lcTargetAltFt: null,
		lcReqVsFpm: null,
		lcIndex: null,
		targetHdg: null,
		targetGs: null,
		navMode: ac.route.length > 0 ? 'RTE' : 'HDG',
		route: [...ac.route],
		originalRoute: [...ac.originalRoute],
		directWp: null,
		appearTime: null,
		active: true,
		trails: [],
		spdMode,
		clearedMach,
		clearedIas,
		spdSign: null,
		clearedHdgDisplay: null,
		cflDisplay: null,
		clearedSpdDisplay: null,
		freeTextStatic: ac.routeLabel ?? '',
		freeTextInput: '',
		inboundTrack: null,
		inboundSettled: false,
		cflSteadyCount: 0,
		cflApplied: false,
		crossoverAlt: xover,
		dbRect: null,
		cflRect: null,
		chdRect: null,
		spdRect: null,
		ftRect: null,
		pendingInstrs: [],
		scenarioGroup: ac.group ?? ac.scenarioGroup ?? null,   // ← ensure group flag
		// Entry Exit WP
		firEntryWp: ac.firEntryWp ?? null,
		firExitWp: ac.firExitWp ?? null,
		// FDL / FTL state:
		fdlHighlight: false,
		ftl: null,          // e.g. 'F260'
		ftlCoReq: false,
		ftlCoDone: false,
		ftlCoPend: false,
		ftlCoRej: false
	});
	assignInitialFtl(aircraft[aircraft.length - 1]);
}

function isTooCloseInGroup(newAc, groupName, minSpacingNM) {
	return aircraft.some(ac => {
		// Only check aircraft in the same group
		if (ac.scenarioGroup !== groupName) return false;

		// Same level (within 3 FL)?
		const sameLevel = Math.abs(ac.altFt - newAc.altFt) < 300;
		if (!sameLevel) return false;

		// Distance check (works across different routes in the same group)
		const distNM = Math.hypot(ac.x - newAc.x, ac.y - newAc.y);
		return distNM < minSpacingNM;
	});
}

function sameLevelBand(altFt) {
	// Same-level band: treat aircraft within ~1000 ft as "same level"
	return Math.round(altFt / 1000);
}

function spacingGroupKey(groupName) {
	if (!groupName) return '__none';

	// Optional: merge ALLEY_DEP + LAXET_DEP for group-specific spacing
	if (groupName === 'ALLEY_DEP' || groupName === 'LAXET_DEP') {
		return 'HK_DEP';
	}

	return groupName;
}

function pruneBySpacing(pool) {
	if (!pool.length) return [];

	const groupCfgMap = new Map();
	SCENARIO_GROUPS.forEach(g => groupCfgMap.set(g.group, g));

	// Sort once for deterministic behaviour: by trackPos if present, else x
	const sorted = [...pool].sort((a, b) => {
		if (a.trackPos != null && b.trackPos != null) {
			return a.trackPos - b.trackPos;
		}
		return a.x - b.x;
	});

	const kept = [];

	for (const cand of sorted) {
		const candAltFt = flToAltFt(cand.fl);
		const candBand = sameLevelBand(candAltFt);
		const rawGroup = cand.scenarioGroup ?? '__none';
		const spacingKey = spacingGroupKey(rawGroup);
		const groupCfg = groupCfgMap.get(rawGroup) || null;
		const groupMinSep = groupCfg?.minSpacingNM ?? 0;

		let tooClose = false;

		for (const other of kept) {
			const otherAltFt = flToAltFt(other.fl);
			const otherBand = sameLevelBand(otherAltFt);

			// Only apply horizontal spacing rules when "same level"
			if (candBand !== otherBand) continue;

			const distNM = Math.hypot(cand.x - other.x, cand.y - other.y);

			// 1) Global minimum 7 NM for all same-level pairs
			if (distNM < 7) {
				tooClose = true;
				break;
			}

			// 2) Per-group extra spacing when both belong to same spacing group
			const otherRawGroup = other.scenarioGroup ?? '__none';
			const otherSpacingKey = spacingGroupKey(otherRawGroup);

			if (groupMinSep > 0 && spacingKey === otherSpacingKey) {
				if (distNM < groupMinSep) {
					tooClose = true;
					break;
				}
			}
		}

		if (!tooClose) {
			kept.push(cand);
		}
	}

	return kept;
}

// ── UI SYNC ──────────────────────────────────────────────────────────────
function populateFlDropdown() {
	const flSel = document.getElementById('fl_sel');
	if (!flSel) return;
	flSel.innerHTML = '';
	FL_LIST.forEach(f => {
		const opt = document.createElement('option');
		opt.value = f.v;
		opt.textContent = f.l;
		flSel.appendChild(opt);
	});
}
function refreshPanel() {
	const dd = document.getElementById('acSelect');
	const badge = document.getElementById('acBadge');
	const hint = document.getElementById('noAcHint');
	const fields = document.getElementById('acFields');
	if (badge) badge.textContent = aircraft.length + ' / ' + MAX_AC;
	if (dd) {
		dd.innerHTML = '';
		if (!aircraft.length) {
			dd.innerHTML = '<option value="">— no aircraft —</option>';
		} else {
			// Sort callsigns A→Z
			aircraft.sort((a, b) => a.callsign.localeCompare(b.callsign));
			aircraft.forEach(ac => {
				const o = document.createElement('option');
				o.value = ac.id;
				o.textContent = `${ac.callsign} (${ac.type ?? 'B738'}${ac.wtc ?? 'M'})`;
				dd.appendChild(o);
			});

			if (!aircraft.find(a => a.id === selectedAcId))
				selectedAcId = aircraft[aircraft.length - 1].id;
			dd.value = selectedAcId;
		}
	}

	if (!aircraft.length) {
		if (hint) hint.style.display = '';
		if (fields) fields.style.display = 'none';
	} else {
		if (hint) hint.style.display = 'none';
		if (fields) fields.style.display = '';
		refreshPanelFields();
	}
	updateAddBtn();
	updatePlaceBtns();
	updateHeadingBtns();
}
function onAcSelectChange() {
	const sel = document.getElementById('acSelect');
	if (!sel) return;
	const id = parseInt(sel.value);
	if (!isNaN(id)) {
		selectedAcId = id;
		refreshPanelFields();
		refreshPanel();
		updatePlaceBtns();
		updateHeadingBtns();
		drawCompass('_sel');
		draw();
	}
}

function refreshPanelFields() {
	const ac = getAcById(selectedAcId); if (!ac) return;
	const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };

	// Core fields
	set('hdg_sel', ac.hdg);
	set('x_sl', ac.x); set('x_n', ac.x);
	set('y_sl', ac.y); set('y_n', ac.y);
	set('fl_sel', ac.fl);

	// ── SPEED PANEL (globalSpdMode driven) ───────────────────────────
	const sl = document.getElementById('machsl');
	const n = document.getElementById('machn');
	const spdLbl = document.querySelector('[data-spd-lbl]');
	const spdUnit = document.querySelector('[data-spd-unit]');

	if (globalSpdMode === 'MACH') {
		if (spdLbl) spdLbl.textContent = 'MACH NUMBER';
		if (spdUnit) spdUnit.textContent = 'RANGE 0.70 – 0.90';
		if (sl) { sl.min = '0.70'; sl.max = '0.90'; sl.step = '0.01'; }
		if (n) { n.min = '0.70'; n.max = '0.90'; n.step = '0.01'; }
		const mach = ac.clearedMach ?? ac.mach ?? 0.82;
		if (sl) sl.value = mach;
		if (n) n.value = mach;
		const { tas, ias } = machToSpeeds(mach, ac.fl);
		document.getElementById('tasDisplay').textContent = `${tas} kt`;
		document.getElementById('iasDisplay').textContent = `${ias} kt`;
	} else {
		if (spdLbl) spdLbl.textContent = 'IAS';
		if (spdUnit) spdUnit.textContent = 'RANGE 230 – 350 kt';
		if (sl) { sl.min = '230'; sl.max = '350'; sl.step = '1'; }
		if (n) { n.min = '230'; n.max = '350'; n.step = '1'; }
		const ias = ac.clearedIas ?? ac.ias ?? 280;
		if (sl) sl.value = ias;
		if (n) n.value = ias;
		const tas = iasToTas(ias, ac.altFt);
		document.getElementById('tasDisplay').textContent = `${tas} kt`;
		document.getElementById('iasDisplay').textContent = `${ias} kt`;
	}

	// ── NAV INSTRUCTION FIELD ─────────────────────────────────────────
	const navField = document.getElementById('navInstrField');
	const directSel = document.getElementById('directWpSel');
	const navDisp = document.getElementById('navModeDisplay');
	if (navField) navField.style.display = simRunning ? 'block' : 'none';
	if (directSel) {
		const wpList = ac.route.length ? ac.route : WAYPOINTS.map(w => w.name);
		directSel.innerHTML = wpList.map(w => `<option value="${w}">${w}</option>`).join('');
	}
	if (navDisp) {
		const rtePart = ac.route.length ? ` | RTE: ${ac.route.join(' → ')}` : '';
		const dirPart = ac.directWp ? ` → ${ac.directWp}` : '';
		navDisp.textContent = `Mode: ${ac.navMode}${dirPart}${rtePart}`;
	}

	// ── ATC INSTRUCTIONS PANEL ────────────────────────────────────────
	const atcPanel = document.getElementById('atcInstrPanel');
	if (atcPanel) atcPanel.style.display = simRunning ? 'block' : 'none';

	// ATC FL dropdown
	const atcFlSel = document.getElementById('atcFlSel');
	if (atcFlSel) {
		atcFlSel.innerHTML = FL_LIST.map(f => `<option value="${f.v}">${f.l}</option>`).join('');
		atcFlSel.value = ac.fl;
	}

	// ATC heading sync to current ac heading
	set('atcHdgSl', Math.round(ac.hdg));
	set('atcHdgN', Math.round(ac.hdg));

	// ATC speed mode — follow globalSpdMode, but auto-switch by altitude
	const atcSpdMode = document.getElementById('atcSpdMode');
	if (atcSpdMode) {
		atcSpdMode.value = globalSpdMode;
		onAtcSpdModeChange();
	}

	// ── after the MACH/IAS speed block ───────────────────────────────────
	const gsSlEl = document.getElementById('gssl');
	const gsNEl = document.getElementById('gsn');
	if (gsSlEl) gsSlEl.value = Math.round(ac.gs);
	if (gsNEl) gsNEl.value = Math.round(ac.gs);
	const gsEl = document.getElementById('gsDisplay');
	if (gsEl) gsEl.textContent = Math.round(ac.gs) + ' kt';

	updateAtcSpdDisplay();
	updateAtcStatus();
	drawCompass('_sel');
}

function clearPanelIfDeselected() {
	if (selectedAcId !== null) return;
	const hint = document.getElementById('noAcHint');
	const fields = document.getElementById('acFields');
	const dd = document.getElementById('acSelect');
	if (hint) hint.style.display = '';
	if (fields) fields.style.display = 'none';
	if (dd) dd.value = '';
	const atcPanel = document.getElementById('atcInstrPanel');
	if (atcPanel && !simRunning) atcPanel.style.display = 'none';
	updateAtcStatus();
	updatePlaceBtns();
	updateHeadingBtns();
}

function selectAircraft(newId) {
	// Toggle off if clicking the same aircraft
	if (selectedAcId === newId) {
		const old = getAcById(selectedAcId);
		if (old) old.fdlHighlight = false;
		selectedAcId = null;
		rebuildFdlState();
		renderFdlPanels();
		clearPanelIfDeselected();
		draw();
		return;
	}

	// Deselect old
	const old = getAcById(selectedAcId);
	if (old) old.fdlHighlight = false;

	// Select new
	selectedAcId = newId;
	const ac = getAcById(newId);
	if (ac) ac.fdlHighlight = true;

	// Show panel explicitly
	const hint = document.getElementById('noAcHint');
	const fields = document.getElementById('acFields');
	if (hint) hint.style.display = 'none';
	if (fields) fields.style.display = '';

	// Sync dropdown + panel
	const dd = document.getElementById('acSelect');
	if (dd) dd.value = newId;
	onAcSelectChange();
	updatePlaceBtns();    // ← re-enable placement buttons
	updateHeadingBtns();

	rebuildFdlState();
	renderFdlPanels();
	draw();
}

function updateAc(field, val) {
	const ac = getAcById(selectedAcId);
	if (!ac) return;
	if (field === 'fl') {
		ac.fl = val;
		ac.altFt = flToAltFt(val);       // ← sync altFt immediately so refreshSpdDisplay uses new alt
		ac.targetAltFt = ac.altFt;       // ← also level the aircraft at new FL
		console.log('FL change:', val, 'altFt:', ac.altFt, 'mach:', ac.mach, 'ias:', ac.ias, 'spdMode:', ac.spdMode);
		const perf = getPerf(ac.type);
		ac.gs = autoGs(ac, perf);
		refreshSpdDisplay();
	} else {
		const v = parseFloat(val);
		ac[field] = (field === 'x' || field === 'y') ? parseFloat(v.toFixed(2)) : Math.round(v);
		const mirror = { gs: 'gs_n', x: 'x_n', y: 'y_n' }; if (mirror[field]) {
			const el = document.getElementById(mirror[field]);
			if (el) el.value = ac[field];
		}
		if (field === 'hdg') drawCompass('_sel');
		if (field === 'gs') {
			ac.mach = null;
			document.getElementById('tasDisplay').textContent = '--- kt';
			document.getElementById('iasDisplay').textContent = '--- kt';
		}
	}
	draw();
}
function updateAcN(field, val, mn, mx, def) {
	const ac = getAcById(selectedAcId);
	if (!ac) return;
	const v = Math.max(mn, Math.min(mx, parseFloat(val) || def));
	ac[field] = (field === 'x' || field === 'y') ? parseFloat(v.toFixed(2)) : Math.round(v);
	const mirror = { gs: 'gs_sl', x: 'x_sl', y: 'y_sl' };
	if (mirror[field]) {
		const el = document.getElementById(mirror[field]);
		if (el) el.value = ac[field];
	}
	if (field === 'hdg') drawCompass('_sel');
	if (field === 'gs') {
		document.getElementById('tasDisplay').textContent = '--- kt';
		document.getElementById('iasDisplay').textContent = '--- kt';
	}
	draw();
}
function refreshSpdDisplay() {
	const ac = getAcById(selectedAcId);
	if (!ac) return;

	const sl = document.getElementById('machsl');
	const n = document.getElementById('machn');
	const spdLbl = document.querySelector('[data-spd-lbl]');
	const spdUnit = document.querySelector('[data-spd-unit]');
	const gsEl = document.getElementById('gsDisplay');
	const tasEl = document.getElementById('tasDisplay');
	const iasEl = document.getElementById('iasDisplay');
	globalSpdMode = ac.spdMode || globalSpdMode;
	if (!sl || !n) return;

	// GS is always the live ac.gs
	if (gsEl) gsEl.textContent = Math.round(ac.gs) + ' kt';

	if (ac.spdMode === 'MACH') {
		const mach = ac.mach ?? 0.82;
		if (sl) { sl.min = 0.70; sl.max = 0.90; sl.step = 0.01; sl.value = mach; }
		if (n) { n.min = 0.70; n.max = 0.90; n.step = 0.01; n.value = mach; }
		if (spdLbl) spdLbl.textContent = 'Mach';
		if (spdUnit) spdUnit.textContent = '';
		const { tas, ias } = machToSpeeds(mach, ac.fl);
		if (tasEl) tasEl.textContent = tas + ' kt';
		if (iasEl) iasEl.textContent = ias + ' kt';
	} else {
		const ias = ac.ias ?? 280;
		if (sl) { sl.min = 230; sl.max = 350; sl.step = 1; sl.value = ias; }
		if (n) { n.min = 230; n.max = 350; n.step = 1; n.value = ias; }
		if (spdLbl) spdLbl.textContent = 'IAS';
		if (spdUnit) spdUnit.textContent = 'kt';
		const tas = iasToTas(ias, ac.altFt);
		if (tasEl) tasEl.textContent = tas + ' kt';
		if (iasEl) iasEl.textContent = ias + ' kt';
	}
}
function updateAcSpd(val) {
	const ac = getAcById(selectedAcId); if (!ac) return;
	const v = parseFloat(val);
	if (isNaN(v)) return;

	let tas, ias, gsVal;

	if (globalSpdMode === 'MACH') {
		const mach = clamp(v, 0.70, 0.90);
		document.getElementById('machsl').value = mach;
		document.getElementById('machn').value = mach;
		ac.mach = mach;
		ac.spdMode = 'MACH';
		ac.clearedMach = mach;
		ac.clearedIas = null;
		({ tas, ias } = machToSpeeds(mach, ac.fl));
		gsVal = clamp(tas, 280, 550);
	} else {
		const iasIn = clamp(v, 230, 350);
		document.getElementById('machsl').value = iasIn;
		document.getElementById('machn').value = iasIn;
		ac.mach = null;
		ac.spdMode = 'IAS';
		ac.clearedIas = iasIn;
		ac.clearedMach = null;
		(tas = iasToTas(iasIn, ac.altFt));
		ias = iasIn;
		gsVal = clamp(tas, 200, 550);
	}

	ac.gs = gsVal;

	// ── push to ALL speed display fields ─────────────────────────────
	const tasEl = document.getElementById('tasDisplay');
	const iasEl = document.getElementById('iasDisplay');
	const gsEl = document.getElementById('gsDisplay');
	if (tasEl) tasEl.textContent = `${tas} kt`;
	if (iasEl) iasEl.textContent = `${ias} kt`;
	if (gsEl) gsEl.textContent = `${Math.round(gsVal)} kt`;

	draw();
}

function updateAcSpdN(val) {
	const mode = globalSpdMode;
	const clamped = mode === 'MACH' ? clamp(parseFloat(val), 0.70, 0.90)
		: clamp(parseFloat(val), 230, 350);
	updateAcSpd(clamped);
}

function onAtcSpdModeChange() {
	const mode = document.getElementById('atcSpdMode').value;
	const sl = document.getElementById('atcSpdSl');
	const n = document.getElementById('atcSpdN');
	const unit = document.getElementById('atcSpdUnit');
	if (mode === 'MACH') {
		sl.min = '0.70'; sl.max = '0.90'; sl.step = '0.01';
		n.min = '0.70'; n.max = '0.90'; n.step = '0.01';
		sl.value = '0.82'; n.value = '0.82';
		if (unit) unit.textContent = 'Mach  0.70 – 0.90';
	} else {
		sl.min = '230'; sl.max = '350'; sl.step = '1';
		n.min = '230'; n.max = '350'; n.step = '1';
		sl.value = '280'; n.value = '280';
		if (unit) unit.textContent = 'kt IAS  230 – 350';
	}
	updateAtcSpdDisplay();
}

function onAtcSpdSlider(val) {
	document.getElementById('atcSpdN').value = val;
	updateAtcSpdDisplay();
}

function onAtcSpdNumber(val) {
	const mode = document.getElementById('atcSpdMode').value;
	const clamped = mode === 'MACH' ? clamp(parseFloat(val), 0.70, 0.90)
		: clamp(parseFloat(val), 230, 350);
	document.getElementById('atcSpdSl').value = clamped;
	document.getElementById('atcSpdN').value = clamped;
	updateAtcSpdDisplay();
}

function updateAtcSpdDisplay() {
	const ac = getAcById(selectedAcId); if (!ac) return;
	const mode = document.getElementById('atcSpdMode')?.value ?? 'MACH';
	const val = parseFloat(document.getElementById('atcSpdN')?.value);
	if (isNaN(val)) return;

	let tas, ias;
	if (mode === 'MACH') {
		({ tas, ias } = machToSpeeds(val, ac.fl));
	} else {
		ias = Math.round(val);
		(tas = iasToTas(val, ac.altFt));
	}
	document.getElementById('atcSpdTas').textContent = `${tas} kt`;
	document.getElementById('atcSpdIas').textContent = `${ias} kt`;
}

function toggleAddMode() {
	const wasActive = addMode;
	cancelAllModes();
	if (!wasActive) {
		if (aircraft.length >= MAX_AC) { alert('Maximum 50 aircraft on map.'); return; }
		addMode = true;
	}
	updateAddBtn();
	updatePlaceBtns();
	updateHeadingBtns();
	updateWpBtns();
	updateProbeUI();
	updateRblUI();
	_canvas.style.cursor = addMode ? 'crosshair' : 'grab';
}

function updateAddBtn() {
	const btn = document.getElementById('addAcBtn'); if (!btn) return;
	if (addMode) { btn.classList.add('active'); btn.textContent = '+ Adding…'; }
	else if (aircraft.length >= MAX_AC) { btn.classList.remove('active'); btn.textContent = '+ Add Aircraft (' + MAX_AC + '/' + MAX_AC + ' full)'; }
	else { btn.classList.remove('active'); btn.textContent = '+ Add Aircraft'; }
}

function resetAll() {
	if (!confirm('Confirm reset to default? All aircrafts will be removed.')) return;
	aircraft = []; selectedAcId = null; probes = []; colourPool = [...PROBE_COLOURS];
	probeMode = null; probeBuilding = null; placeMode = null; headingMode = null; addMode = false;
	offsetX = 0; offsetY = 0; rblList = [];
	rblBuilding = null; rblMode = null; rblCursorNM = null; initialScenarioSnapshot = null;
	// ← add these
	simTimeSec = 0; simRunning = false; simUtcStartMs = null; realStartMs = null; simUtcFrozenMs = null;
	clearInterval(physicsTimer); clearInterval(radarTimer); clearInterval(clockTimer);
	physicsTimer = null; radarTimer = null; clockTimer = null;
	updateRblUI(); setGridSize(50); refreshPanel(); updateProbeUI();
	updatePlaceBtns(); updateHeadingBtns(); updateAddBtn(); updateWpBtns();
	updateSimClock(); updateSimButtons(); draw(); resetSim()
}

// ── CANVAS INTERACTION ──────────────────────────────────
const canvasEl = _canvas;
const activePointers = new Map(); // pointerId → {x, y}
let isDragging_click = false, _mouseDownX = 0, _mouseDownY = 0;

// Canvas Click Handler for Data Block Zones
function handleDataBlockClick(e) {
	if (e.button !== 0) return false;
	const rect = _canvas.getBoundingClientRect();
	const mx = (e.clientX - rect.left) * _canvas.width / rect.width;
	const my = (e.clientY - rect.top) * _canvas.height / rect.height;
	const sx = e.clientX, sy = e.clientY;

	for (const ac of aircraft) {
		if (!ac.active || !ac.dbRect) continue;
		const hit = (r) => r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
		if (hit(ac.cflRect)) { openCflPopup(ac, sx, sy); return true; }
		if (hit(ac.chdRect)) { openChdPopup(ac, sx, sy); return true; }
		if (hit(ac.spdRect)) { openSpdPopup(ac, sx, sy); return true; }
		if (hit(ac.ftRect)) { openFtPopup(ac, sx, sy); return true; }
	}
	return false;
}

canvasEl.addEventListener('pointerdown', e => {
	const isSpecialClick = (e.button === 1) || (e.button === 0 && e.shiftKey);
	const rect = _canvas.getBoundingClientRect();
	const px = (e.clientX - rect.left) * (_canvas.width / rect.width);
	const py = (e.clientY - rect.top) * (_canvas.height / rect.height);

	const isFdlDragButton =
		e.button === 1 ||                      // middle button
		(e.button === 0 && e.shiftKey);       // Shift+left for touchpad

	if (isFdlDragButton) {
		ensureFdlOverlayState();

		for (const cfg of FDL_CONFIG) {
			const ov = FDL_OVERLAY[cfg.id];
			if (!ov || !ov.titleRect) continue;
			if (!pointInRect(px, py, ov.titleRect)) continue;

			fdlDrag = {
				id: cfg.id,
				startPx: { x: px, y: py },
				startAnchorNM: { x: ov.anchorNM.x, y: ov.anchorNM.y }
			};
			e.preventDefault();
			e.stopPropagation();
			return;  // don't start map-pan if we grabbed an FDL
		}
	}

	// FDL clicks (plain left click)  
	if (e.button === 0 && !e.shiftKey) {
		if (handleFdlClick(px, py)) {
			e.preventDefault();
			e.stopPropagation();
			return;  // click consumed by FDL, don't hit map/aircraft
		}
	}

	// Data block zone clicks — highest priority on left click
	if (e.button === 0 && !isSpecialClick) {
		if (handleDataBlockClick(e)) return;


		// ── Click on aircraft icon OR callsign line → select in panel ──
		if (!placeMode && !headingMode && !addMode && !probeMode && !rblMode) {
			const _mx = (e.clientX - rect.left) * _canvas.width / rect.width;
			const _my = (e.clientY - rect.top) * _canvas.height / rect.height;
			const { toScreen } = getDrawTransform();
			for (const ac of aircraft) {
				if (!ac.active) continue;
				const _p = toScreen(ac.x, ac.y);
				// Hit: aircraft icon (12px radius)
				const _iconHit = Math.hypot(_mx - _p.x, _my - _p.y) <= 12;
				// Hit: callsign row = line 2 of data block (by + LINE_H to by + 2*LINE_H)
				let _csHit = false;
				if (ac.dbRect) {
					const _r = ac.dbRect;
					_csHit = _mx >= _r.x && _mx <= _r.x + _r.w &&
						_my >= _r.y + LINE_H && _my <= _r.y + LINE_H * 2;
				}
				if (_iconHit || _csHit) {
					selectAircraft(ac.id);   // replaces the old block
					return;
				}
			}
		}
	}

	// ── MIDDLE / Shift+LEFT — label drag OR probe removal ──────────────
	if (isSpecialClick) {
		e.preventDefault();

		// Only allow label drag when no other pointer is active (prevent conflict with pinch)
		if (activePointers.size === 0) {
			const rect = _canvas.getBoundingClientRect();
			const mx = (e.clientX - rect.left) * _canvas.width / rect.width;
			const my = (e.clientY - rect.top) * _canvas.height / rect.height;
			const { toScreen } = getDrawTransform();
			const ctx = _canvas.getContext('2d');
			ctx.font = '11px "Cascadia Mono"'; // must match drawAcData

			for (const ac of aircraft) {
				const p = toScreen(ac.x, ac.y);
				let otherX = _lastW / 2;
				if (aircraft.length > 1) {
					const oth = aircraft.filter(o => o.id !== ac.id);
					otherX = oth.reduce((s, o) => s + toScreen(o.x, o.y).x, 0) / oth.length;
				}
				const side = p.x > otherX ? 'right' : 'left';
				const hdgStr = String(Math.round(ac.hdg)).padStart(3, '0');
				const gsStr = String(Math.round(ac.gs / 10)).padStart(2, '0');
				const charW = ctx.measureText('0').width;
				const GAP = charW * 5;
				const line1W = ctx.measureText(`${ac.callsign} ${ac.type}${ac.wtc}`).width;
				const line2W = ctx.measureText(`${ac.fl}`).width;
				const line3W = ctx.measureText(hdgStr).width + GAP + ctx.measureText(gsStr).width;
				const probeLabels = probes.filter(pr => pr.ac1 === ac.id);
				let maxW = Math.max(line1W, line2W, line3W);
				probeLabels.forEach(pr => {
					const paired = getAcById(pr.ac2);
					if (paired) maxW = Math.max(maxW, ctx.measureText(
						`${Math.hypot(ac.x - paired.x, ac.y - paired.y).toFixed(2)}NM --:--`).width);
				});
				const OFFSET = 10; // must match drawAcData
				const bx = (side === 'right' ? p.x + OFFSET : p.x - OFFSET - maxW) + (ac.lx ?? 0);
				const by = (p.y - LINE_H) + (ac.ly ?? 0);
				const totalH = LINE_H * 6;

				if (mx >= bx && mx <= bx + maxW && my >= by && my <= by + totalH) {
					// Hit inside data block — start label drag
					draggingLabelAc = ac;
					labelDragStartX = e.clientX;
					labelDragStartY = e.clientY;
					labelDragOriginX = ac.lx;
					labelDragOriginY = ac.ly;
					isDragging = false;
					canvasEl.setPointerCapture(e.pointerId);
					activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
					return; // label drag started — stop here
				}
			}
		}

		// Only dismiss CRte on a deliberate blank-canvas left click
		// Never dismiss if we came from a context menu button click
		if (crteAcId !== null && !modCrteAcId) {
			// Only cancel plain CRte display, don't touch modCrte
			crteAcId = null;
			draw();
			return;
		}
		if (modCrteAcId !== null) {
			// Blank canvas left-click during ModCRte = cancel the whole thing
			cancelModCrte();
			return;
		}

		// Missed all data blocks (or activePointers > 0) — try probe actions
		if (rblMode === 'RBL_SELECT2') {
			handleRblSecondClick(e);
		} else if (probeMode === 'SELECT_2') {
			handleProbeMiddleClick(e);
		} else {
			tryRemoveProbeByDataBlockClick(e);
			tryRemoveRblByClick(e);
		}
	}

	// ── NORMAL LEFT CLICK — pan / add / place / probe ─────────────────────
	e.preventDefault();
	canvasEl.setPointerCapture(e.pointerId);
	activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
	_mouseDownX = e.clientX;
	_mouseDownY = e.clientY;
	_isDraggingClick = false;

	const count = activePointers.size;
	if (count === 1) {
		// ↓ Only pan on left button — NOT middle (1) or right (2)
		if (e.button === 0) {
			isDragging = true;
			lastMouseX = e.clientX;
			lastMouseY = e.clientY;
		} else {
			isDragging = false;   // middle/right: no pan
		}
		lastTouchDist = null;
	} else if (count === 2) {
		isDragging = false;
		const pts = [...activePointers.values()];
		lastTouchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
	}
}, { passive: false });

canvasEl.addEventListener('pointermove', e => {
	// ── Cursor: pointer over data block hit zones ─────────────────────────
	// Add this block at the TOP of the existing pointermove listener:
	{
		const rect = _canvas.getBoundingClientRect();
		const mx = (e.clientX - rect.left) * _canvas.width / rect.width;
		const my = (e.clientY - rect.top) * _canvas.height / rect.height;
		const px = e.clientX - rect.left;
		const py = e.clientY - rect.top;

		if (fdlDrag) {
			const dxPx = px - fdlDrag.startPx.x;
			const dyPx = py - fdlDrag.startPx.y;

			const dxNm = dxPx / _lastScale;
			const dyNm = -dyPx / _lastScale; // invert Y

			const ov = FDL_OVERLAY[fdlDrag.id];
			if (ov) {
				ov.anchorNM.x = fdlDrag.startAnchorNM.x + dxNm;
				ov.anchorNM.y = fdlDrag.startAnchorNM.y + dyNm;
				draw();
			}

			e.preventDefault();
			e.stopPropagation();
			return; // don't treat as map pan while dragging FDL
		}

		let overHit = false;
		if (!draggingLabelAc && !isDragging) {
			for (const ac of aircraft) {
				if (!ac.active) continue;
				const hit = (r) => r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
				if (hit(ac.cflRect) || hit(ac.chdRect) || hit(ac.spdRect) || hit(ac.ftRect)) {
					overHit = true;
					break;
				}
			}
			// ← ADD: also check FDL ftlRects
			if (!overHit) {
				ensureFdlOverlayState();
				outer: for (const cfg of FDL_CONFIG) {
					const ov = FDL_OVERLAY[cfg.id];
					if (!ov) continue;
					for (const row of ov.rows) {
						if (row.ftlRect && pointInRect(mx, my, row.ftlRect)) {
							overHit = true;
							break outer;
						}
					}
				}
			}
		}

		// Only override cursor if no other mode is active
		if (!placeMode && !headingMode && !addMode && !probeMode && !rblMode) {
			_canvas.style.cursor = overHit ? 'pointer' : 'grab';
		}
	}

	// At the very top of pointermove, before label drag check:
	if (rblMode === 'RBL_SELECT2') {
		const rect = _canvas.getBoundingClientRect();
		const px = (e.clientX - rect.left) * _canvas.width / rect.width;
		const py = (e.clientY - rect.top) * _canvas.height / rect.height;
		const { toScreen, toNM } = getDrawTransform();
		let bestId = null, bestD = 18;
		aircraft.forEach(ac => {
			const p = toScreen(ac.x, ac.y);
			const d = Math.hypot(px - p.x, py - p.y);
			if (d < bestD) { bestD = d; bestId = ac.id; }
		});
		if (bestId !== null) {
			const ac = getAcById(bestId);
			rblCursorNM = { x: ac.x, y: ac.y, acId: bestId };
		} else {
			const nm = toNM(px, py);
			rblCursorNM = { x: nm.x, y: nm.y, acId: null };
		}
		draw();
	}

	// Label drag
	if (draggingLabelAc) {
		const dx = e.clientX - labelDragStartX;
		const dy = e.clientY - labelDragStartY;
		const dist = Math.hypot(dx, dy);
		const scale = dist > LABEL_MAX_DIST ? LABEL_MAX_DIST / dist : 1;
		draggingLabelAc.lx = labelDragOriginX + dx * scale;
		draggingLabelAc.ly = labelDragOriginY + dy * scale;
		draw();
		return;
	}

	if (!activePointers.has(e.pointerId)) return;
	activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

	// Mark as a drag if moved more than 5px
	if (Math.hypot(e.clientX - _mouseDownX, e.clientY - _mouseDownY) > 5) {
		isDragging_click = true;
	}

	const count = activePointers.size;
	if (count === 1 && isDragging) {
		panByPixels(e.clientX - lastMouseX, e.clientY - lastMouseY);
		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
		return;
	}
	if (count === 2) {
		const pts = [...activePointers.values()];
		const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
		if (lastTouchDist) applyZoomDelta(dist / lastTouchDist,
			(pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
		lastTouchDist = dist;
	}
});

canvasEl.addEventListener('pointerup', e => {
	if (fdlDrag) {
		fdlDrag = null;
		e.preventDefault();
		e.stopPropagation();
		// no return needed; your existing mouseup logic can still run
	}

	// Label drag release
	if (draggingLabelAc) {
		draggingLabelAc = null;
		activePointers.delete(e.pointerId);
		isDragging = false;
		return;
	}

	// Middle mouse release — probe removal on data block
	if (e.pointerType === 'mouse' && e.button === 1) {
		activePointers.delete(e.pointerId);
		if (probeMode !== 'SELECT_2') tryRemoveProbeByDataBlockClick(e);
		return;
	}

	// Shift+left — probe AC2 select OR probe removal (no drag guard needed)
	if (e.button === 0 && e.shiftKey) {
		activePointers.delete(e.pointerId);
		if (activePointers.size === 0) { isDragging = false; lastTouchDist = null; }
		if (probeMode === 'SELECT_2') {
			handleProbeMiddleClick(e);
		} else {
			tryRemoveProbeByDataBlockClick(e);
		}
		return;
	}

	// Plain left — apply drag guard
	const moved = Math.hypot(e.clientX - _mouseDownX, e.clientY - _mouseDownY);
	activePointers.delete(e.pointerId);
	if (activePointers.size === 0) { isDragging = false; lastTouchDist = null; }
	if (moved >= 5) return; // was a pan drag

	if (e.button === 0) {
		if (handleRblLeftClick(e)) return;
		if (handleProbeLeftClick(e)) return; // consumed by probe flow
		canvasClickPlace(e);                 // add aircraft / place / aim heading
	}
});

canvasEl.addEventListener('pointercancel', e => {
	if (fdlDrag) {
		fdlDrag = null;
	}
	draggingLabelAc = null;
	activePointers.delete(e.pointerId);
	if (activePointers.size === 0) { isDragging = false; lastTouchDist = null; }
});

canvasEl.addEventListener('wheel', e => {
	e.preventDefault();
	applyZoomDelta(e.deltaY < 0 ? 1.1 : 1 / 1.1);
}, { passive: false });

canvasEl.addEventListener('contextmenu', e => e.preventDefault());
canvasEl.addEventListener('dblclick', e => e.preventDefault());

document.addEventListener('visibilitychange', () => {
	if (document.hidden) { isDragging = false; isDragging_click = false; }
});

// ── COMPASS WIDGET ─────────────────────────────────────────────────────────
function drawCompass(ac) {
	const canvas = document.getElementById('compass' + ac);
	if (!canvas) return;
	const dpr = window.devicePixelRatio || 1;
	const SIZE = 216;
	canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
	canvas.style.width = SIZE + 'px'; canvas.style.height = SIZE + 'px';
	const ctx = canvas.getContext('2d');
	ctx.scale(dpr, dpr);
	const W = SIZE, H = SIZE, cx = W / 2, cy = H / 2, r = W / 2 - 2;
	const hdgEl = document.getElementById('hdg' + ac);
	const hdg = hdgEl ? (parseFloat(hdgEl.value) || 0) : 0;
	ctx.clearRect(0, 0, W, H);
	// Background
	ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fillStyle = '#0d1117'; ctx.fill();
	ctx.strokeStyle = '#30363d'; ctx.lineWidth = 1; ctx.stroke();
	// Tick marks
	for (let i = 0; i < 360; i += 10) {
		const a = (i - 90) * Math.PI / 180;
		const isMaj = i % 90 === 0, isMid = i % 30 === 0;
		const inn = isMaj ? r - 16 : isMid ? r - 12 : r - 6;
		ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
		ctx.lineTo(cx + Math.cos(a) * inn, cy + Math.sin(a) * inn);
		ctx.strokeStyle = isMaj ? '#58a6ff' : isMid ? '#555' : '#333';
		ctx.lineWidth = isMaj ? 2.5 : 1.2; ctx.stroke();
	}
	// Cardinal labels
	[['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([l, d]) => {
		const a = (d - 90) * Math.PI / 180, tr = r - 24;
		ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		ctx.fillStyle = l === 'N' ? '#f78166' : '#777';
		ctx.fillText(l, cx + Math.cos(a) * tr, cy + Math.sin(a) * tr);
	});
	// Needle
	const na = (hdg - 90) * Math.PI / 180, nl = r - 18;
	ctx.beginPath();
	ctx.moveTo(cx, cy);
	ctx.lineTo(cx + Math.cos(na) * nl, cy + Math.sin(na) * nl);
	ctx.strokeStyle = ac === 'a' ? '#58a6ff' : '#f78166';
	ctx.lineWidth = 4;
	ctx.lineCap = 'round';
	ctx.stroke();
	// Centre dot
	ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();

}

let _cDrag = null;
function compassAngleFromEvent(e, cvs) {
	const rect = cvs.getBoundingClientRect();
	const cx = rect.width / 2, cy = rect.height / 2;
	const x = (e.clientX - rect.left) - cx;
	const y = (e.clientY - rect.top) - cy;
	let h = Math.round(Math.atan2(y, x) * 180 / Math.PI + 90);
	if (h < 0) h += 360;
	if (h >= 360) h -= 360;
	return h;
}

function compassSetHdg(e, ac) {
	const cvs = document.getElementById('compass' + ac);
	if (!cvs) return;
	const h = compassAngleFromEvent(e, cvs);
	const numEl = document.getElementById('hdg' + ac);
	if (numEl) numEl.value = h;
	updateAc('hdg', h);
}

function compassDown(e, ac) {
	e.stopPropagation();
	e.preventDefault();
	_cDrag = ac;
	compassSetHdg(e, ac);
}

// Mouse drag
document.addEventListener('mousemove', e => {
	if (!_cDrag) return;
	e.preventDefault();
	compassSetHdg(e, _cDrag);
});

document.addEventListener('mouseup', () => {
	_cDrag = null;
});

// Touch drag (mobile)
document.addEventListener('touchmove', e => {
	if (!_cDrag) return;
	if (e.touches.length !== 1) return;
	e.preventDefault();
	const t = e.touches[0];
	compassSetHdg({ clientX: t.clientX, clientY: t.clientY }, _cDrag);
}, { passive: false });

document.addEventListener('touchend', () => {
	_cDrag = null;
});
document.addEventListener('touchcancel', () => {
	_cDrag = null;
});

// ─── Right-click context menu ────────────────────────────────────────────────

let _ctxAcIndex = null; // 0 = A, 1 = B

// ── CONTEXT MENU ─────────────────────────────────────────────────────────
let _ctxAcId = null;
function _hideCtxMenu() { const m = document.getElementById('acContextMenu'); if (m) m.style.display = 'none'; _ctxAcId = null; }
function removeContextAc() { const id = _ctxAcId; _hideCtxMenu(); if (id !== null) removeAcById(id); }
_canvas.addEventListener('contextmenu', e => {
	e.preventDefault();
	e.stopPropagation();

	// ── Mod CRte mode: right-click → waypoint selector ───────────────
	if (modCrteAcId !== null) {
		const ac = getAcById(modCrteAcId);
		if (ac && ac.route && ac.route.length) {
			openModCrteWpPopup(ac, e.clientX, e.clientY);
		} else {
			cancelModCrte()
		}
		return;   // don't open the normal aircraft context menu
	}

	// ── Normal right-click: aircraft context menu ────────────────────
	const rect = _canvas.getBoundingClientRect();
	const px = (e.clientX - rect.left) * _canvas.width / rect.width;
	const py = (e.clientY - rect.top) * _canvas.height / rect.height;
	const { toScreen } = getDrawTransform();
	let bestId = null, bestD = 18;
	aircraft.forEach(ac => {
		const p = toScreen(ac.x, ac.y);
		const d = Math.hypot(px - p.x, py - p.y);
		if (d < bestD) { bestD = d; bestId = ac.id; }
	});
	if (bestId === null) { _hideCtxMenu(); return; }
	_ctxAcId = bestId;
	const ac = getAcById(bestId);
	document.getElementById('acContextLabel').textContent = ac?.callsign ?? '';
	const menu = document.getElementById('acContextMenu');
	menu.style.display = 'block';
	let mx = e.clientX + 6, my = e.clientY + 6;
	if (mx + 210 > window.innerWidth) mx = e.clientX - 210;
	if (my + 130 > window.innerHeight) my = e.clientY - 130;
	menu.style.left = mx + 'px';
	menu.style.top = my + 'px';
});

function openModCrteWpPopup(ac, sx, sy) {
	closeModCrtePopup();
	const futureRoute = ac.route; // already trimmed to future wps by the sim

	const items = futureRoute.map((wpName, i) =>
		`<div onclick="issueModCrteDirect(${ac.id},'${wpName}')"
              style="padding:5px 10px;cursor:pointer;font-family:"Cascadia Mono";
                     font-size:0.80rem;border-radius:4px;color:#d4a017;"
              onmouseover="this.style.background='#2d2a1a'"
              onmouseout="this.style.background=''">
            ${String(i + 1).padStart(2, '0')} ${wpName}
         </div>`
	).join('');

	const div = document.createElement('div');
	Object.assign(div.style, {
		position: 'fixed', zIndex: '10000',
		background: '#161b22', border: '2px solid #222',
		padding: '8px 6px',
		boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
		fontFamily: '"Cascadia Mono", monospace',
		minWidth: '140px',
	});
	div.innerHTML = `
        <div style="font-size:0.80rem;color: #fff;font-weight:700;
                    padding:0 6px 6px;border-bottom:1px solid #2d2a1a;
                    margin-bottom:4px;letter-spacing:1px;">
            ${ac.callsign} — Mod CRte
        </div>
        <div style="font-size:0.8rem;max-height:200px;overflow-y:auto;">${items}</div>`;

	document.body.appendChild(div);
	modCrtePopupEl = div;

	// Keep inside viewport
	const rect = div.getBoundingClientRect();
	const vw = window.innerWidth, vh = window.innerHeight;
	div.style.left = Math.min(sx + 8, vw - rect.width - 8) + 'px';
	div.style.top = Math.min(sy + 8, vh - rect.height - 8) + 'px';
}

function issueModCrteDirect(acId, wpName) {
	const ac = getAcById(acId);
	if (!ac) return;

	const idx = ac.route.indexOf(wpName);
	if (idx < 0) return;

	const delay = pilotDelay('HDG', ac.altFt);
	const label = `MOD ${wpName}`;

	// ── ACTION: queued with pilot delay ─────────────────────────────
	ac.clearedHdgDisplay = null;
	cancelPendingType(ac, 'HDG');
	ac.pendingInstrs.push({
		type: 'HDG',
		triggerTime: simTimeSec + delay,
		label,
		apply: () => {
			const i = ac.route.indexOf(wpName);
			if (i < 0) return;
			ac.route = ac.route.slice(i);
			ac.navMode = 'RTE';
			ac.directWp = null;
			ac.targetHdg = null;
			ac.inboundTrack = null;
			ac.inboundSettled = false;
			// Clear preview once action fires — real route takes over
			if (modCrtePreviewRoute?.acId === acId) modCrtePreviewRoute = null;
		}
	});
	recomputeLevelConstraintForAc(ac);

	// ── DISPLAY: instant — show trimmed route from chosen WP ────────
	modCrtePreviewRoute = { acId, route: ac.route.slice(idx) };
	crteAcId = acId;     // keep route line visible
	modCrteAcId = null;     // exit Mod CRte interaction mode
	closeModCrtePopup();

	// Auto-hide after 3 seconds if action hasn't fired yet
	if (modCrteRouteHideTimer) clearTimeout(modCrteRouteHideTimer);
	modCrteRouteHideTimer = setTimeout(() => {
		crteAcId = null;
		modCrtePreviewRoute = null;
		modCrteRouteHideTimer = null;
		draw();
	}, 3000);

	draw();
	updateAtcStatus();
}

function recomputeLevelConstraintForAc(ac) {
	// If there is no current CFL, nothing to arm
	if (!ac.cflDisplay || !ac.targetAltFt) {
		ac.lcActive = false;
		ac.lcWp = null;
		ac.lcTargetAltFt = null;
		ac.lcReqVsFpm = null;
		ac.lcIndex = null;
		return;
	}

	// Re-run selection using current route and cleared FL
	maybeArmLevelConstraint(ac, ac.cflDisplay);
}

// ── Add Aircraft Model ───────────────────────────────────────────
let _addAcPendingX = 0, _addAcPendingY = 0;

function openAddAcPopup(nx, ny) {
	_addAcPendingX = nx;
	_addAcPendingY = ny;

	// Generate a preview callsign
	const cs = generateCallsign();

	// Populate type dropdown
	const typeSel = document.getElementById('aaType');
	typeSel.innerHTML = Object.keys(AC_PERF).map(t =>
		`<option value="${t}">${t}</option>`
	).join('');
	// Pick a random default type
	const [defType] = randomAcType();
	typeSel.value = defType;

	// Populate FL dropdown
	const flSel = document.getElementById('aaFl');
	flSel.innerHTML = FL_LIST.map(f => `<option value="${f.v}">${f.l}</option>`).join('');
	flSel.value = FL_LIST[Math.floor(Math.random() * FL_LIST.length)].v;

	// Reset fields
	document.getElementById('aaCallsign').value = '';
	document.getElementById('aaCallsignDisplay').textContent = cs;
	document.getElementById('aaHdg').value = '';
	document.getElementById('aaSpd').value = '';

	// Populate route dropdown from SCENARIO_ROUTES
	const routeSel = document.getElementById('aaRoute');
	routeSel.innerHTML = '<option value="">-- HDG mode (no route) --</option>';
	SCENARIO_ROUTES.forEach(r => {
		const label = r.label ? `${r.label}  (${r.waypoints.join(' ')})` : r.waypoints.join(' ');
		const opt = document.createElement('option');
		opt.value = JSON.stringify({
			waypoints: r.waypoints,
			firEntryWp: r.firEntryWp ?? null,
			firExitWp: r.firExitWp ?? null,
			label: r.label ?? null,
		});
		opt.textContent = label;
		routeSel.appendChild(opt);
	});
	routeSel.value = '';
	document.getElementById('aaRouteHint').textContent = '';

	// Update hint when user changes selection
	routeSel.onchange = function () {
		const hint = document.getElementById('aaRouteHint');
		if (!this.value) { hint.textContent = ''; return; }
		const d = JSON.parse(this.value);
		const parts = [];
		if (d.firEntryWp) parts.push(`Entry: ${d.firEntryWp}`);
		if (d.firExitWp) parts.push(`Exit: ${d.firExitWp}`);
		if (d.label) parts.push(`Label: ${d.label}`);
		hint.textContent = parts.join('  ');
	};

	document.getElementById('aaFt').value = '';

	// Live-update callsign display as user types
	document.getElementById('aaCallsign').oninput = function () {
		const v = this.value.trim().toUpperCase();
		document.getElementById('aaCallsignDisplay').textContent = v || cs;
	};

	document.getElementById('addAcModel').classList.add('open');
	setTimeout(() => document.getElementById('aaCallsign').focus(), 60);
}

function closeaddAcModel() {
	document.getElementById('addAcModel').classList.remove('open');
}

function closeaddAcModelCancel() {
	closeaddAcModel();
	addMode = false;
	updateAddBtn();
	updateWpBtns();
	_canvas.style.cursor = 'grab';
	refreshPanel();
	draw();
}

function confirmAddAc() {
	if (aircraft.length >= MAX_AC) { alert(`Maximum ${MAX_AC} aircraft on map.`); return; }

	// ── Callsign ──────────────────────────────────────────────────
	const csRaw = document.getElementById('aaCallsign').value.trim().toUpperCase();
	const callsign = csRaw || document.getElementById('aaCallsignDisplay').textContent;

	// ── Type / WTC ────────────────────────────────────────────────
	const type = document.getElementById('aaType').value;
	// Derive WTC from AC_TYPE_POOL or default to 'M'
	const poolEntry = AC_TYPE_POOL.find(([t]) => t === type);
	const wtc = poolEntry ? poolEntry[1] : 'M';

	// ── FL ────────────────────────────────────────────────────────
	const fl = document.getElementById('aaFl').value;
	const altFt = flToAltFt(fl);

	// ── Heading ───────────────────────────────────────────────────
	const hdgRaw = document.getElementById('aaHdg').value.trim();
	let hdg;

	// ── Speed ─────────────────────────────────────────────────────
	const perf = AC_PERF[type] || AC_PERF_DEFAULT;
	const xover = calcCrossoverAlt(perf.climbIAS, perf.cruiseMach);
	let spdMode = 'MACH'

	const spdRaw = document.getElementById('aaSpd').value.trim();
	if (spdRaw !== '') {
		const spdVal = parseFloat(spdRaw);
		if (spdVal < 2) {
			spdMode = 'MACH';
		} else {
			spdMode = 'IAS';
		}
	} else {
		// No ATC speed — use perf default mode, no clearance
		spdMode = altFt >= xover ? 'MACH' : 'IAS';
	}

	// Initial GS always from perf table (what the aircraft is currently flying)
	let gs;
	if (altFt >= xover) {
		const { tas } = machToSpeeds(perf.cruiseMach, fl);
		gs = clamp(tas, 280, 550);
	} else {
		gs = clamp(iasToTas(perf.climbIAS, altFt), 200, 550);
	}

	// ── Route ─────────────────────────────────────────────────────────
	const routeSelVal = document.getElementById('aaRoute').value;
	let route = [], firEntryWp = null, firExitWp = null, routeLabel = null;
	if (routeSelVal) {
		const d = JSON.parse(routeSelVal);
		route = d.waypoints ?? [];
		firEntryWp = d.firEntryWp ?? null;
		firExitWp = d.firExitWp ?? null;
		routeLabel = d.label ?? null;
	}

	const directWp = route.length ? route[0] : null;
	const navMode = route.length ? 'RTE' : 'HDG';

	// ── Compute heading: explicit > auto-aim at first WP > random ──
	if (hdgRaw !== '') {
		hdg = Math.max(0, Math.min(359, parseInt(hdgRaw) || 0));
	} else if (route.length > 0) {
		const _fw = WAYPOINTS.find(w => w.name === route[0]);
		if (_fw) {
			const _dx = _fw.x - _addAcPendingX;
			const _dy = _fw.y - _addAcPendingY;
			const _truHdg = Math.atan2(_dx, _dy) * 180 / Math.PI;
			hdg = Math.round(((_truHdg - MAGVAR) % 360 + 360) % 360);
		} else {
			hdg = rndInt(0, 359);
		}
	} else {
		hdg = rndInt(0, 359);
	}

	// ── 5th Line ──────────────────────────────────────────────────
	const freeTextInput = document.getElementById('aaFt').value.trim();

	// ── Build ac object ───────────────────────────────────────────
	const ac = {
		id: _acIdCtr++,
		callsign, type, wtc,
		hdg, gs,
		x: parseFloat(_addAcPendingX.toFixed(2)),
		y: parseFloat(_addAcPendingY.toFixed(2)),
		fl, lx: 0, ly: 0,
		ias: null, mach: null,
		pendingInstrs: [],
		altFt, targetAltFt: altFt,
		// Level-constraint guidance state
		lcActive: false,
		lcWp: null,
		lcTargetAltFt: null,
		lcReqVsFpm: null,
		lcIndex: null,
		targetHdg: null, targetGs: null,
		navMode,          // ← from variable above
		route,            // ← from variable above
		originalRoute: [...route],
		directWp,         // ← from variable above, same object reference as route[0]
		firEntryWp: firEntryWp ?? (route.length ? route[0] : null),
		firExitWp: firExitWp ?? (route.length ? route[route.length - 1] : null),
		appearTime: null, active: true, trails: [],
		spdMode, clearedMach: null, clearedIas: null, spdSign: null,
		clearedHdgDisplay: null,
		cflDisplay: null,
		clearedSpdDisplay: null,
		freeTextStatic: routeLabel,
		freeTextInput: '',
		_cflSteadyCount: 0, cflApplied: false, crossoverAlt: null,
		dbRect: null, cflRect: null, chdRect: null, spdRect: null, ftRect: null
	};

	aircraft.push(ac);
	initialScenarioSnapshot = aircraft.map(a => JSON.parse(JSON.stringify(a)));
	assignInitialFtl(ac);
	selectedAcId = ac.id;
	addMode = false;
	closeaddAcModel();
	updateAddBtn();
	updateWpBtns();
	refreshPanel();
	rebuildFdlState();
	draw();
}

// Close model on backdrop click
document.getElementById('addAcModel').addEventListener('click', function (e) {
	if (e.target === this) {
		closeaddAcModel();
		e.stopPropagation();   // ← ADD THIS — prevent bubbling to canvas/document
	}
});

// Close on Escape
document.addEventListener('keydown', function (e) {
	if (e.key === 'Escape') {
		if (document.getElementById('addAcModel').classList.contains('open')) {
			closeaddAcModelCancel();   // ← use cancel variant
			return;                    // ← stop here, don't cascade
		}
		if (activePopup) { closeActivePopup(); return; }
		if (modCrtePopupEl || modCrteAcId) { cancelModCrte(); return; }
		if (crteAcId) { crteAcId = null; draw(); return; }
		_hideCtxMenu();
		if (rblMode) { rblBuilding = null; rblMode = null; rblCursorNM = null; updateRblUI(); draw(); }
	}
});

document.addEventListener('mousedown', e => {
	const m = document.getElementById('acContextMenu');
	if (m && m.style.display === 'block' && !m.contains(e.target)) _hideCtxMenu();
});

window.addEventListener('load', function () {
	populateFlDropdown();
	refreshPanel();
	autoFit();
	document.fonts.load('11px "Cascadia Mono"').then(() => {
		draw();
		autoFit();
	});
});
window.addEventListener('resize', draw);

setInterval(() => {
	realUtcNowMs = Date.now();
	updateSimClock();        // ← ADD THIS LINE
}, 500);

// ── CSV EXPORT ───────────────────────────────────────────
function exportScenarioCSV() {
	if (!aircraft.length) { alert('No aircraft on map.'); return; }

	const header = 'callsign,type,wtc,fl,speedmode,speedval,hdg,x,y,appeartime,route,5th_line,entry/sid,exit/star';
	const rows = aircraft.map(ac => {
		let speedMode = '', speedVal = '';
		if (ac.spdMode === 'MACH' && ac.clearedMach !== null) {
			speedMode = 'M';
			speedVal = ac.clearedMach.toFixed(2);
		} else if (ac.spdMode === 'IAS' && ac.clearedIas !== null) {
			speedMode = 'IAS';
			speedVal = ac.clearedIas;
		} else {
			speedMode = '';
			speedVal = '';
		}
		const appearStr = ac.appearTime != null
			? [Math.floor(ac.appearTime / 3600),
			Math.floor(ac.appearTime % 3600 / 60),
			ac.appearTime % 60]
				.map(n => String(n).padStart(2, '0')).join(':')
			: '';
		const routeStr = (ac.route ?? []).join(' ');
		return `${ac.callsign},${ac.type},${ac.wtc},${ac.fl},${speedMode},${speedVal},${ac.hdg},${ac.x},${ac.y},${appearStr},${routeStr},${ac.freeTextStatic},${ac.firEntryWp},${ac.firExitWp}`;
	});

	const csv = [header, ...rows].join('\n');
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `atc_sim_scenario_${Date.now()}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}


// ── CSV IMPORT ───────────────────────────────────────────
function importScenarioCSV() {
	document.getElementById('csvFileInput').value = '';
	document.getElementById('csvFileInput').click();
}

function handleCSVFile(event) {

	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function (e) {
		const lines = e.target.result.trim().split('\n').map(l => l.trim()).filter(Boolean);
		if (!lines.length) { alert('Empty CSV file.'); return; }

		const dataLines = lines[0].toLowerCase().startsWith('callsign') ? lines.slice(1) : lines;
		if (!dataLines.length) { alert('No data rows found.'); return; }

		const errors = [];
		const newAircraft = [];
		const VALID_WTC = ['L', 'M', 'H', 'J'];
		_acIdCtr = 0

		dataLines.forEach((line, i) => {
			const parts = line.split(',').map(s => s.trim());

			// Format: callsign, type, wtc, fl, speedmode, speedval, hdg, x, y [, appeartime [, route [, freetext]]]
			if (parts.length < 9) { errors.push(`Row ${i + 2}: not enough columns`); return; }

			const callsign = parts[0];
			let csvType = parts[1];
			let csvWtc = parts[2];
			const fl = parts[3];
			const speedModeRaw = parts[4]?.trim() ?? '';
			const speedValRaw = parts[5]?.trim() ?? '';
			const hdg = parts[6];
			const x = parts[7];
			const y = parts[8];

			// ── Resolve type/wtc FIRST ────────────────────────────────────────────
			[csvType, csvWtc] = (csvType && csvWtc && VALID_WTC.includes(csvWtc.toUpperCase()))
				? [csvType, csvWtc.toUpperCase()]
				: randomAcType();

			const speedMode = speedModeRaw.toUpperCase();
			const speedVal = parseFloat(speedValRaw);

			let gs, ias, mach, spdMode, clearedMach, clearedIas, freePerf = false;

			if (speedMode === 'M' && speedValRaw !== '') {
				// Explicit Mach restriction
				mach = clamp(speedVal, 0.70, 0.90);
				spdMode = 'MACH';
				clearedMach = mach;
				clearedIas = null;
				ias = null;
				const { tas } = machToSpeeds(mach, fl);
				gs = clamp(tas, 200, 550);

			} else if (speedMode === 'IAS' && speedValRaw !== '') {
				// Explicit IAS restriction
				const ias = clamp(Math.round(speedVal), 180, 350);
				spdMode = 'IAS';
				clearedIas = ias;
				clearedMach = null;
				ias = clamp(ias, 180, 350);
				mach = null;
				const tas = iasToTas(ias, flToAltFt(fl));
				gs = clamp(tas, 200, 550);

			} else {
				// Blank speedmode/speedval — derive from perf + crossover
				const perf = getPerf(csvType);
				const altFtEst = flToAltFt(fl);
				const xover = calcCrossoverAlt(perf.climbIAS, perf.climbMach);

				if (altFtEst >= xover) {
					// Above crossover — Mach regime
					spdMode = 'MACH';
					clearedMach = null;
					clearedIas = null;
					ias = null;
					mach = perf.cruiseMach;
					const T = isaTemp(altFtEst);
					gs = clamp(Math.round(perf.cruiseMach * 38.967 * Math.sqrt(T)), 280, 550);
				} else {
					// Below crossover — IAS regime
					spdMode = 'IAS';
					clearedIas = null;
					clearedMach = null;
					mach = null;
					ias = perf.climbIAS;
					gs = clamp(iasToTas(perf.climbIAS, altFtEst), 200, 550);
				}
				crossoverAlt = xover;   // pre-cache so no recalc needed on first tick
			}

			// ── Validate parsed values ──────────────────────────────────────────
			const hdgN = parseFloat(hdg);
			const gsN = parseFloat(gs);
			const xN = parseFloat(x);
			const yN = parseFloat(y);

			if (!callsign) { errors.push(`Row ${i + 2}: missing callsign`); return; }
			if (isNaN(hdgN) || hdgN < 0 || hdgN > 359) { errors.push(`Row ${i + 2}: invalid hdg "${hdg}"`); return; }
			if (isNaN(gsN) || gsN < 200 || gsN > 600) { errors.push(`Row ${i + 2}: invalid derived gs "${gsN}"`); return; }
			if (isNaN(xN) || xN < -350 || xN > 350) { errors.push(`Row ${i + 2}: invalid x "${x}"`); return; }
			if (isNaN(yN) || yN < -350 || yN > 350) { errors.push(`Row ${i + 2}: invalid y "${y}"`); return; }
			if (!fl || !fl.startsWith('F')) { errors.push(`Row ${i + 2}: invalid fl "${fl}"`); return; }
			if (newAircraft.length >= MAX_AC) { errors.push(`Row ${i + 2}: max ${MAX_AC} aircraft exceeded`); return; }

			// Speed-specific validation (only when explicitly set, not free perf)
			if (!freePerf) {
				if (spdMode === 'MACH' && clearedMach != null)
					if (clearedMach < 0.70 || clearedMach > 0.90) { errors.push(`Row ${i + 2}: Mach "${clearedMach}" out of range 0.70–0.90`); return; }
				if (spdMode === 'IAS' && clearedIas != null)
					if (clearedIas < 230 || clearedIas > 350) { errors.push(`Row ${i + 2}: IAS "${clearedIas}" out of range 230–350`); return; }
			}

			// ── appear_time (col 9), route (col 10), freeTextStatic (col 11) ───
			const appearTimeStr = parts[9]?.trim() ?? '';
			const routeStr = parts[10]?.trim() ?? '';
			const freeTextStatic = parts[11]?.trim() ?? '';
			const firEntryWp = parts[12]?.trim() ?? '';
			const firExitWp = parts[13]?.trim() ?? '';

			let appearTime = null;
			if (appearTimeStr) {
				const [hh, mm, ss] = appearTimeStr.split(':').map(Number);
				if (!isNaN(hh)) appearTime = (hh * 3600) + ((mm || 0) * 60) + (ss || 0);
			}

			const route = routeStr ? routeStr.split(' ').filter(Boolean) : [];

			// ── Build clearedSpdDisplay for data block ──────────────────────────
			let clearedSpdDisplay = null;
			if (!freePerf) {
				if (spdMode === 'MACH' && clearedMach != null)
					clearedSpdDisplay = `S${clearedMach.toFixed(2)}`;
				else if (spdMode === 'IAS' && clearedIas != null)
					clearedSpdDisplay = `S${String(clearedIas).substring(0, 2)}`;
			}

			newAircraft.push({
				id: _acIdCtr++, callsign,
				hdg: hdgN, gs: gsN, mach, ias,
				x: xN, y: yN, fl,
				type: csvType, wtc: csvWtc,
				lx: (Math.random() - 0.5) * 18,
				ly: (Math.random() - 0.5) * 30,
				altFt: flToAltFt(fl), targetAltFt: flToAltFt(fl),
				// Level-constraint guidance state
				lcActive: false,
				lcWp: null,
				lcTargetAltFt: null,
				lcReqVsFpm: null,
				lcIndex: null,
				targetHdg: null, targetGs: null,
				navMode: route.length ? 'RTE' : 'HDG',
				route,
				originalRoute: [...route],
				directWp: null,
				appearTime, active: appearTime === null,
				trails: [],
				spdMode, clearedMach, clearedIas, spdSign: null,
				clearedHdgDisplay: null,
				cflDisplay: null,
				clearedSpdDisplay,
				freeTextStatic,
				freeTextInput: '',
				_cflSteadyCount: 0,
				cflApplied: false,
				crossoverAlt: null,
				dbRect: null, cflRect: null, chdRect: null,
				spdRect: null, ftRect: null,
				pendingInstrs: [],   // [{ triggerTime, apply: fn }]
				firEntryWp: firEntryWp ?? (route.length ? route[0] : null),
				firExitWp: firExitWp ?? (route.length ? route[route.length - 1] : null),
				fdlHighlight: false,
				ftl: null,
				ftlCoReq: false,
				ftlCoDone: false,
				ftlCoPend: false,
				ftlCoRej: false,
			});
			assignInitialFtl(newAircraft[newAircraft.length - 1]);
		});

		if (errors.length) {
			const proceed = newAircraft.length &&
				confirm(`${errors.length} row(s) had errors and were skipped:\n\n` +
					`${errors.slice(0, 5).join('\n')}` +
					`${errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''}` +
					`\n\nImport ${newAircraft.length} valid aircraft?`);
			if (!proceed) return;
		}

		if (!newAircraft.length) { alert('No valid aircraft found in CSV.'); return; }

		// ── Clear and load ──────────────────────────────────────────────────────
		aircraft.length = 0;
		probes.length = 0;
		colourPool = [...PROBE_COLOURS];
		probeBuilding = null; probeMode = null;
		selectedAcId = null;
		rblList = []; rblBuilding = null;
		rblMode = null; rblCursorNM = null;
		aircraft.push(...newAircraft);
		initialScenarioSnapshot = aircraft.map(a => JSON.parse(JSON.stringify(a)));
		updateRblUI(); refreshPanel(); updateProbeUI(); rebuildFdlState(); renderFdlPanels();
		draw();
		alert(`✓ Imported ${newAircraft.length} aircraft.`);
	};
	reader.readAsText(file);
}