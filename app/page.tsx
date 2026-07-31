"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import type { Exoplanet, ExoplanetResponse } from "../lib/exoplanets";

const scenes = [
  { eyebrow: "I · The archive opens", title: "A sky written in discoveries.", text: "Every point is a confirmed world recorded by the NASA Exoplanet Archive. Move through the atlas by the year it entered our story." },
  { eyebrow: "II · Many sizes", title: "Worlds, compared honestly.", text: "Here, a planet’s radius shapes its presence. Missing measurements stay missing—no guesswork in the margins." },
  { eyebrow: "III · How we know", title: "Different instruments. Same wonder.", text: "Detection methods gather into constellations: transit, radial velocity, imaging, and more." },
  { eyebrow: "IV · A system in focus", title: "Choose one star to orbit.", text: "Select a world to read its measured facts, then follow its host system through the atlas." },
];

const colors: Record<string, number> = { Transit: 0xf4b860, "Radial Velocity": 0x77c8c1, Imaging: 0xe88c9a, Microlensing: 0xa894d8 };

function format(value: number | null, unit: string) { return value === null ? "Not recorded" : `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`; }

function AtlasCanvas({ planets, scene, selected, onSelect, paused }: { planets: Exoplanet[]; scene: number; selected: Exoplanet | null; onSelect: (planet: Exoplanet) => void; paused: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const state = useRef({ planets, scene, selected, onSelect, paused });
  useEffect(() => { state.current = { planets, scene, selected, onSelect, paused }; }, [planets, scene, selected, onSelect, paused]);
  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 18);
    const scene = new THREE.Scene();
    const group = new THREE.Group(); scene.add(group);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.02, 32, 32), new THREE.MeshBasicMaterial({ color: 0xf6c971 })); group.add(sun);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 32), new THREE.MeshBasicMaterial({ color: 0xd98558, transparent: true, opacity: 0.12 })); group.add(glow);
    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    const resize = () => { const rect = host.getBoundingClientRect(); renderer.setSize(rect.width, rect.height, false); camera.aspect = rect.width / Math.max(rect.height, 1); camera.updateProjectionMatrix(); };
    const click = (event: MouseEvent) => { const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(group.children.filter((item) => item.userData.planet)); if (hit[0]) state.current.onSelect(hit[0].object.userData.planet); };
    renderer.domElement.addEventListener("click", click); const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let animation = 0; const tick = (time: number) => { const current = state.current; group.children.filter((item) => item.userData.planet).forEach((mesh, index) => { const planet = mesh.userData.planet as Exoplanet; const methodIndex = Object.keys(colors).indexOf(planet.discoveryMethod); const orbit = current.scene === 0 ? 2.3 + ((planet.discoveryYear ?? 2000) - 1990) * 0.055 : current.scene === 2 ? 2.2 + Math.max(methodIndex, 0) * 0.65 : 2.2 + (index % 5) * 0.62; const angle = (index / Math.max(current.planets.length, 1)) * Math.PI * 2 + (current.paused ? 0 : time * 0.00012 * (index % 2 ? 1 : -1)); mesh.position.set(Math.cos(angle) * orbit, Math.sin(angle) * orbit * 0.58, (index % 3 - 1) * 0.22); mesh.scale.setScalar(current.scene === 1 ? 0.11 + Math.min(planet.radius ?? 1, 4) * 0.055 : 0.13); const material = mesh.material as THREE.MeshBasicMaterial; material.color.setHex(planet.id === current.selected?.id ? 0xffffff : colors[planet.discoveryMethod] ?? 0xc4a7e7); material.opacity = planet.id === current.selected?.id ? 1 : 0.86; }); sun.rotation.y += 0.001; renderer.render(scene, camera); animation = requestAnimationFrame(tick); }; animation = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(animation); observer.disconnect(); renderer.domElement.removeEventListener("click", click); renderer.dispose(); host.removeChild(renderer.domElement); };
  }, []);
  useEffect(() => { const host = mount.current; if (!host) return; const group = (host.firstElementChild as HTMLCanvasElement | null); if (group) group.setAttribute("aria-label", "Interactive animated exoplanet atlas. Use the planet list below to select a world."); }, []);
  return <div ref={mount} className="atlas-canvas" role="img" aria-label="Interactive animated exoplanet atlas" />;
}

export default function Home() {
  const [data, setData] = useState<ExoplanetResponse | null>(null); const [scene, setScene] = useState(0); const [selected, setSelected] = useState<Exoplanet | null>(null); const [method, setMethod] = useState("All methods"); const [year, setYear] = useState(2020); const [paused, setPaused] = useState(false);
  useEffect(() => { fetch("/api/exoplanets").then((response) => response.json()).then((payload: ExoplanetResponse) => { setData(payload); setSelected(payload.items[0] ?? null); }).catch(() => setData(null)); }, []);
  const planets = useMemo(() => data?.items ?? [], [data]); const methods = useMemo(() => ["All methods", ...Array.from(new Set(planets.map((planet) => planet.discoveryMethod))).sort()], [planets]);
  const filtered = useMemo(() => planets.filter((planet) => (method === "All methods" || planet.discoveryMethod === method) && (planet.discoveryYear === null || planet.discoveryYear <= year)), [planets, method, year]);
  const activeSelected = selected && filtered.some((planet) => planet.id === selected.id) ? selected : filtered[0] ?? null;
  const activeScene = scenes[scene];
  return <main className="atlas-shell"><header className="topbar"><Link className="brand" href="/" aria-label="Astraea Atlas home"><span className="brand-mark">✦</span><span>ASTRAEA <em>ATLAS</em></span></Link><div className="topbar-note"><span className={`status-dot ${data?.source === "fallback" ? "stale" : ""}`} />{data ? data.source === "live" ? "LIVE ARCHIVE" : "OFFLINE SET" : "CONNECTING"}<span className="topbar-divider" />NASA EXOPLANET ARCHIVE</div></header>
    <section className="hero"><div className="story-copy"><p className="kicker">{activeScene.eyebrow}</p><h1>{activeScene.title}</h1><p className="lede">{activeScene.text}</p><div className="scene-nav" aria-label="Story scenes">{scenes.map((item, index) => <button key={item.eyebrow} className={index === scene ? "active" : ""} onClick={() => setScene(index)} aria-label={`Scene ${index + 1}: ${item.title}`} aria-current={index === scene ? "step" : undefined}><span>0{index + 1}</span>{item.title}</button>)}</div></div><div className="hero-visual"><div className="visual-caption"><span>THE CELESTIAL INDEX</span><span>{filtered.length} WORLDS IN VIEW</span></div><AtlasCanvas planets={filtered} scene={scene} selected={activeSelected} onSelect={setSelected} paused={paused} /><div className="legend"><span><i className="legend-dot transit" />Transit</span><span><i className="legend-dot radial" />Radial velocity</span><span><i className="legend-dot other" />Other methods</span></div></div></section>
    <section className="controls"><div className="control-group"><label htmlFor="method">Detection method</label><select id="method" value={method} onChange={(event) => setMethod(event.target.value)}>{methods.map((item) => <option key={item}>{item}</option>)}</select></div><div className="control-group year-control"><label htmlFor="year">Discovered by <strong>{year}</strong></label><input id="year" type="range" min="1990" max="2025" value={year} onChange={(event) => setYear(Number(event.target.value))} /></div><button className="pause-button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "▶ Resume motion" : "Ⅱ Pause motion"}</button></section>
    <section className="detail-grid"><div className="planet-index"><div className="section-heading"><p className="kicker">THE INDEX</p><span>{filtered.length.toString().padStart(2, "0")} / {planets.length.toString().padStart(2, "0")}</span></div><div className="planet-list" role="listbox" aria-label="Planets in the atlas">{filtered.slice(0, 16).map((planet) => <button key={planet.id} className={activeSelected?.id === planet.id ? "planet-row selected" : "planet-row"} onClick={() => setSelected(planet)} role="option" aria-selected={activeSelected?.id === planet.id}><span className="row-orb" style={{ background: `#${(colors[planet.discoveryMethod] ?? 0xc4a7e7).toString(16)}` }} /><span><strong>{planet.name}</strong><small>{planet.hostStar}</small></span><time>{planet.discoveryYear ?? "—"}</time></button>)}</div></div><aside className="detail-card" aria-live="polite"><div className="card-top"><p className="kicker">SELECTED WORLD</p><span className="card-index">{activeSelected ? activeSelected.name : "—"}</span></div>{activeSelected ? <><h2>{activeSelected.name}</h2><p className="host">orbiting <strong>{activeSelected.hostStar}</strong></p><dl className="facts"><div><dt>Discovery</dt><dd>{activeSelected.discoveryYear ?? "Not recorded"}</dd></div><div><dt>Method</dt><dd>{activeSelected.discoveryMethod}</dd></div><div><dt>Orbital period</dt><dd>{format(activeSelected.orbitalPeriod, "days")}</dd></div><div><dt>Radius</dt><dd>{format(activeSelected.radius, "R⊕")}</dd></div><div><dt>Mass</dt><dd>{format(activeSelected.mass, "M⊕")}</dd></div><div><dt>Distance</dt><dd>{format(activeSelected.distance, "pc")}</dd></div></dl><p className="fact-note">Measured archive values only. A blank field means the archive does not record that measurement for this world.</p></> : <p>Select a world from the index.</p>}</aside></section>
    <footer><span>ASTRAEA ATLAS · AN EDUCATIONAL VIEW OF CONFIRMED EXOPLANETS</span><span>DATA: NASA EXOPLANET ARCHIVE · {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleDateString() : "—"}</span></footer>{data?.stale && <div className="offline-banner" role="status">{data.message}</div>}</main>;
}
