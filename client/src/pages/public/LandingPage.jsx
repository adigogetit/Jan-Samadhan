import { useEffect, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";

const styles = String.raw`
* { box-sizing: border-box; }
body { margin: 0; color: #123f6d; background: #f8fcfb; font-family: "Trebuchet MS", "Segoe UI", sans-serif; }
button, a { font: inherit; }
a { text-decoration: none; }
 .hero-section { min-height: clamp(680px, calc(100vh - 76px), 760px); position: relative; overflow: hidden; background: #f5fbfa url("https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2200&q=82") center bottom / cover no-repeat; }.hero-wash { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(250,254,253,.98) 0%, rgba(250,254,253,.9) 37%, rgba(238,251,251,.54) 72%, rgba(226,247,247,.34)); }.hero-content { position: relative; z-index: 1; max-width: 1440px; margin: 0 auto; min-height: 610px; padding: 47px 5.5% 0; display: grid; grid-template-columns: 46% 54%; }.hero-copy { padding-top: 2px; }.location-pill { color: #087f61; background: rgba(226,247,240,.85); display: inline-flex; align-items: center; gap: 8px; padding: 7px 13px; border-radius: 20px; font-size: 11px; font-weight: 700; }.location-pill span { font-size: 14px; }.location-pill b { color: #93b6aa; }
.hero-copy h1 { color: #0e3f70; margin: 15px 0 12px; font-size: clamp(42px, 4.15vw, 63px); line-height: 1.1; letter-spacing: -1.8px; }.hero-copy h1 span { color: #078e5c; }.hero-copy > p { max-width: 465px; color: #356285; line-height: 1.55; font-size: 15px; margin: 0; }.hero-actions { display: flex; gap: 16px; margin-top: 24px; }.button { display: inline-block; border: 0; cursor: pointer; border-radius: 25px; padding: 12px 25px; font-size: 12px; font-weight: 700; transition: transform .2s, box-shadow .2s; }.button:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(0,100,80,.15); }.button-primary { color: #fff; background: #06975d; }.button-outline { color: #087f61; background: rgba(255,255,255,.72); border: 1px solid #0b9c6a; }.button span { margin-left: 10px; font-size: 16px; }.play-icon { margin-right: 8px; margin-left: 0 !important; font-size: 11px !important; }
.stakeholders { display: flex; gap: 17px; margin-top: 25px; }.stakeholders > div { display: grid; grid-template-columns: 36px auto; column-gap: 7px; align-items: center; min-width: 106px; }.stakeholder-icon { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; grid-row: span 2; font-size: 17px; }.citizen { color: #0870b2; background: #dcefff; }.government { color: #11995f; background: #dff6e5; }.university { color: #8d4ac5; background: #f0e3ff; }.industry { color: #e89a14; background: #fff0d8; }.stakeholders strong { color: #124579; font-size: 10px; }.stakeholders small { color: #17729b; font-size: 8px; }
.map-stage { min-height: 610px; position: relative; width: 100%; }.map-glow { display: none; } .map-frame { position: absolute; top: 0; left: 0; width: 100%; height: 500px; overflow: visible; background: transparent; }.jharkhand-map-shell { position: relative; width: 100%; height: 100%; }.jharkhand-map { width: 100%; height: 100%; background: transparent; }.jharkhand-map .leaflet-control-container { display: none; }.district-label { border: 0; box-shadow: none; background: transparent; color: #fff; font-size: 8px; line-height: 1; font-weight: 700; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,45,28,.85); padding: 0; pointer-events: none; }.district-label::before { display: none; }.ranchi-marker { border: 0; box-shadow: none; background: transparent; color: #fff; font-size: 10px; font-weight: 800; padding: 0; }.ranchi-marker::before { display: none; }
 .district-card { position: absolute; right: -35px; top: 135px; z-index: 20; width: 165px; padding: 15px 16px; background: rgba(255,255,255,.96); border-radius: 16px; box-shadow: 0 8px 20px rgba(30,110,100,.14); color: #2b6383; font-size: 10px; }.district-card h3 { color: #156081; font-size: 12px; margin: 0 0 12px; }.district-card h3 span { color: #078e61; margin-right: 7px; }.district-card div { display: flex; align-items: center; gap: 7px; padding: 7px 0; border-bottom: 1px solid #e2f0ed; }.district-card div b { margin-left: auto; color: #164a78; }.dot { width: 8px; height: 8px; border-radius: 50%; }.blue { background: #44b9ed; }.orange { background: #f3a01a; }.green { background: #10ab58; }.lime { background: #45c74e; }.district-card a { display: block; color: #078e61; font-size: 9px; font-weight: 700; margin-top: 13px; }.district-card a span { margin-left: 4px; }
 .map-compass { position: absolute; right: -30px; top: 390px; z-index: 15; width: 155px; display: flex; flex-direction: column; align-items: center; color: #087d70; }.compass-direction { font-size: 9px; font-weight: 700; }.compass-needle { width: 31px; height: 31px; margin-top: 3px; border: 1px solid #087d70; border-radius: 50%; display: grid; place-items: center; font-size: 24px; line-height: 1; transform: rotate(45deg); }.compass-caption { margin-top: 13px; text-align: center; font-size: 9px; line-height: 1.7; letter-spacing: 1px; white-space: nowrap; }.compass-caption b { padding: 0 4px; font-weight: 400; }
 .hero-stats { position: absolute; z-index: 2; bottom: 24px; left: 5.5%; display: flex; gap: 0; padding: 12px 20px; border: 1px solid rgba(255,255,255,.45); border-radius: 17px; background: rgba(26,133,126,.58); backdrop-filter: blur(8px); color: white; }.hero-stats > div { display: grid; grid-template-columns: 32px auto; column-gap: 7px; min-width: 135px; align-items: center; padding: 0 17px; border-right: 1px solid rgba(255,255,255,.3); }.hero-stats > div:last-child { border: 0; }.hero-stats span { grid-row: span 2; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.93); color: #0c9b67; }.hero-stats strong { font-size: 17px; line-height: 1; }.hero-stats small { font-size: 9px; }
.focus-section { padding: 25px 5.5% 35px; background: #fff; }.section-heading { display: flex; align-items: center; justify-content: center; gap: 16px; color: #164b7d; }.section-heading i { width: 35px; height: 1px; background: #079766; }.section-heading h2 { font-size: 17px; margin: 0; }.focus-grid { max-width: 1260px; margin: 14px auto 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 13px; }.focus-card { display: flex; align-items: center; gap: 12px; padding: 9px 13px; border: 1px solid #d5ebe6; border-radius: 10px; color: #16517b; min-height: 60px; }.focus-icon { width: 36px; height: 36px; flex: 0 0 36px; border-radius: 50%; display: grid; place-items: center; background: #e5f6ef; color: #07955e; font-size: 18px; }.focus-card strong { display: block; font-size: 10px; white-space: nowrap; }.focus-card small { display: block; color: #078c62; font-size: 9px; margin-top: 6px; }.focus-card small b { margin-left: 4px; }
.how-section, .flow-section { padding: 36px 5.5%; background: #f8fcfb; }.how-grid, .flowchart { max-width: 1260px; margin: 18px auto 0; display: grid; gap: 13px; }.how-grid { grid-template-columns: repeat(4, 1fr); }
.flow-intro { max-width: 720px; margin: 10px auto 0; text-align: center; color: #50738b; font-size: 11px; line-height: 1.65; }
.flowchart { grid-template-columns: repeat(5, 1fr); align-items: stretch; }
.flow-step-wrap { position: relative; display: flex; align-items: center; min-width: 0; }
.flow-step { position: relative; width: 100%; min-height: 190px; padding: 20px 15px 16px; border: 1px solid #d5ebe6; border-radius: 14px; background: rgba(255,255,255,.94); box-shadow: 0 8px 22px rgba(18,63,109,.045); transition: transform .2s, box-shadow .2s; }
.flow-step:hover { transform: translateY(-4px); box-shadow: 0 14px 28px rgba(18,63,109,.08); }
.flow-number { position: absolute; top: 10px; right: 12px; color: #a0c8bb; font-size: 9px; font-weight: 800; }
.flow-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; background: #e5f6ef; color: #078e61; font-size: 16px; }
.flow-step h3 { margin: 13px 0 7px; color: #164b7d; font-size: 13px; }
.flow-step p { margin: 0; color: #50738b; font-size: 10px; line-height: 1.6; }
.flow-arrow { position: absolute; z-index: 2; right: -12px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: #fff; border: 1px solid #cfe8df; color: #079766; font-size: 13px; box-shadow: 0 4px 10px rgba(18,63,109,.06); }
.impact-flow { max-width: 1260px; margin: 20px auto 0; padding: 20px 22px; display: grid; grid-template-columns: .9fr 1.7fr; gap: 28px; align-items: center; border: 1px solid #d5ebe6; border-radius: 15px; background: #fff; }
.flow-kicker { color: #079766; font-size: 9px; font-weight: 800; letter-spacing: 1.3px; }
.impact-flow-copy h3 { margin: 7px 0 7px; color: #164b7d; font-size: 17px; }
.impact-flow-copy p { margin: 0; color: #50738b; font-size: 10px; line-height: 1.65; }
.ecosystem-flow { display: flex; align-items: center; justify-content: center; gap: 8px; }
.ecosystem-flow > div { min-width: 88px; padding: 9px 7px; text-align: center; border: 1px solid #d9eee8; border-radius: 10px; background: #f8fcfb; }
.ecosystem-flow > div span { display: grid; place-items: center; width: 28px; height: 28px; margin: 0 auto 5px; border-radius: 50%; background: #e5f6ef; color: #078e61; }
.ecosystem-flow strong { display: block; color: #16517b; font-size: 9px; }
.ecosystem-flow small { display: block; margin-top: 3px; color: #078c62; font-size: 8px; }
.ecosystem-flow > b { color: #079766; font-size: 16px; }
.ecosystem-result { background: #eaf9f2 !important; border-color: #a9dec9 !important; }


.live-flow-section { padding: 38px 5.5% 45px; background: #f8fcfb; }
.live-flow-intro { max-width: 700px; margin: 9px auto 20px; text-align: center; color: #50738b; font-size: 11px; line-height: 1.65; }
.pipeline { max-width: 1260px; margin: 0 auto; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; }
.pipeline-stage { position: relative; min-height: 145px; padding: 17px 15px 14px; border: 1px solid #d7ebe5; border-radius: 13px; background: #fff; text-align: left; cursor: pointer; color: #123f6d; box-shadow: 0 6px 18px rgba(18,63,109,.035); transition: .2s; }
.pipeline-stage + .pipeline-stage { margin-left: 8px; }
.pipeline-stage:hover, .pipeline-stage.active { transform: translateY(-3px); border-color: var(--stage-accent); box-shadow: 0 12px 25px rgba(18,63,109,.08); }
.pipeline-index { position: absolute; top: 10px; right: 11px; color: #b0cec4; font-size: 8px; font-weight: 800; }
.pipeline-icon { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--stage-accent) 13%, white); color: var(--stage-accent); font-size: 13px; }
.pipeline-stage strong { display: block; margin-top: 10px; font-size: 11px; }
.pipeline-stage > b { display: block; margin-top: 4px; color: var(--stage-accent); font-size: 21px; line-height: 1; }
.pipeline-stage small { display: block; margin-top: 7px; max-width: 150px; color: #668296; font-size: 8px; line-height: 1.45; }
.pipeline-arrow { position: absolute; z-index: 3; top: 61px; right: -17px; width: 25px; height: 25px; display: grid; place-items: center; border: 1px solid #d7ebe5; border-radius: 50%; background: #fff; color: #079766; font-size: 12px; }
.live-flow-dashboard { max-width: 1260px; margin: 16px auto 0; display: grid; grid-template-columns: 1.15fr 1fr 1fr; gap: 13px; }
.stage-detail, .live-panel { min-height: 190px; padding: 18px; border: 1px solid #d7ebe5; border-radius: 14px; background: #fff; box-shadow: 0 7px 20px rgba(18,63,109,.035); }
.stage-detail { position: relative; overflow: hidden; }
.stage-detail::after { content: ""; position: absolute; right: -35px; bottom: -50px; width: 145px; height: 145px; border-radius: 50%; background: var(--stage-accent); opacity: .08; }
.stage-detail-head { display: flex; align-items: center; justify-content: space-between; }
.stage-detail-head div { display: flex; align-items: center; gap: 6px; color: #078e61; font-size: 8px; font-weight: 800; letter-spacing: .8px; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #0bb16a; box-shadow: 0 0 0 4px #e4f8ef; }
.stage-detail-head > strong { color: #164b7d; font-size: 11px; }
.stage-detail h3 { margin: 18px 0 5px; color: #164b7d; font-size: 18px; }
.stage-detail p { max-width: 360px; margin: 0; color: #648196; font-size: 9px; line-height: 1.55; }
.stage-progress { margin-top: 20px; }
.stage-progress > div:first-child { display: flex; justify-content: space-between; color: #6b8596; font-size: 8px; }
.stage-progress b { color: #164b7d; }
.progress-track { height: 6px; margin-top: 7px; overflow: hidden; border-radius: 10px; background: #eaf2ef; }
.progress-track span { display: block; height: 100%; border-radius: inherit; transition: width .3s ease; }
.live-panel-title { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.live-panel-title span { color: #164b7d; font-size: 12px; font-weight: 800; }
.live-panel-title small { color: #7b929f; font-size: 8px; }
.district-mini-list > div { display: grid; grid-template-columns: 76px 1fr 30px; align-items: center; gap: 7px; margin: 10px 0; }
.district-mini-list span { overflow: hidden; color: #527087; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.mini-bar { height: 5px; overflow: hidden; border-radius: 8px; background: #edf5f2; }
.mini-bar i { display: block; height: 100%; border-radius: inherit; background: #0ba36d; }
.district-mini-list b { color: #164b7d; font-size: 9px; text-align: right; }
.category-mini-list > div { display: grid; grid-template-columns: 22px 1fr 32px; align-items: center; gap: 7px; padding: 8px 0; border-bottom: 1px solid #edf3f1; }
.category-rank { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 50%; background: #e8f7f1; color: #078e61; font-size: 8px; font-weight: 800; }
.category-mini-list strong { overflow: hidden; color: #527087; font-size: 8px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.category-mini-list b { color: #164b7d; font-size: 9px; text-align: right; }
.empty-live { grid-column: 1 / -1 !important; color: #7b929f !important; font-size: 9px !important; }

.site-footer { padding: 23px 5.5%; color: #50738b; background: #fff; border-top: 1px solid #dcefe8; text-align: center; font-size: 10px; }
@media (max-width: 1100px) {
  .pipeline { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .pipeline-stage + .pipeline-stage { margin-left: 0; }
  .pipeline-stage:nth-child(3) .pipeline-arrow { display: none; }
  .live-flow-dashboard { grid-template-columns: 1fr 1fr; }
  .stage-detail { grid-column: 1 / -1; }
}
@media (max-width: 1100px) { .hero-content { grid-template-columns: 1fr; }.hero-section { min-height: 980px; }.map-stage { min-height: 520px; max-width: 900px; width: 100%; margin: 0 auto; }.map-frame { left: 0; width: 100%; height: 450px; }.district-card { right: 12px; top: 360px; }.map-compass { right: 12px; top: 500px; }.hero-stats { left: 5%; }.focus-grid { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 1100px) {
  .flowchart { grid-template-columns: repeat(3, 1fr); }
  .flow-step-wrap:nth-child(3) .flow-arrow { display: none; }
  .impact-flow { grid-template-columns: 1fr; }
}
@media (max-width: 620px) {
  .flowchart { grid-template-columns: 1fr; }
  .flow-step-wrap { display: block; }
  .flow-step { min-height: 0; }
  .flow-arrow { position: static; margin: -1px auto; transform: rotate(90deg); }
  .ecosystem-flow { flex-direction: column; }
  .ecosystem-flow > b { transform: rotate(90deg); }
  .impact-flow { padding: 17px; }
}

@media (max-width: 620px) { .hero-content { padding: 30px 20px 0; }.hero-copy h1 { font-size: 42px; }.hero-copy > p { font-size: 13px; }.hero-actions { flex-wrap: wrap; }.stakeholders { display: grid; grid-template-columns: 1fr 1fr; }.map-stage { min-height: 640px; }.map-frame { top: 18px; width: 100%; height: 330px; }.district-card { top: 355px; right: 5%; width: 180px; }.map-compass { top: 555px; right: 5%; width: 180px; }.compass-caption { white-space: normal; }.hero-stats { bottom: 24px; left: 20px; right: 20px; padding: 10px 3px; justify-content: space-between; }.hero-stats > div { min-width: 0; padding: 0 8px; grid-template-columns: 25px auto; }.hero-stats span { width: 25px; height: 25px; }.hero-stats strong { font-size: 14px; }.hero-stats small { font-size: 8px; }.focus-section, .how-section, .flow-section { padding: 24px 20px; }.focus-grid, .how-grid { grid-template-columns: 1fr; }.focus-card strong { white-space: normal; } }

@media (max-width: 620px) {
  .live-flow-section { padding: 30px 18px 35px; }
  .live-flow-track { grid-template-columns: 1fr; }
  .live-flow-arrow { display: none; }
  .live-flow-node { min-height: 0; }
  .live-flow-details { grid-template-columns: 1fr; }
  .live-flow-rankings { grid-template-columns: 1fr; }
}
`;

const GEOJSON_URL = "https://raw.githubusercontent.com/udit-001/india-maps-data/master/geojson/states/jharkhand.geojson";
const DISTRICT_COLORS = ["#07946b", "#0b7e61", "#12a978", "#20b982", "#08664f", "#39c596"];
const FOCUS_AREAS = [
  ["▣", "Education & Research", "Learn"],
  ["♥", "Healthcare & Wellbeing", "Support"],
  ["⌁", "Environment & Sustainability", "Protect"],
  ["▥", "Infrastructure & Development", "Build"],
  ["✦", "Digital & Innovation", "Advance"],
];
function getPublicDistrictStats(district, districts) {
  const liveStats = districts?.find(
    (item) => item.district?.trim().toLowerCase() === district.trim().toLowerCase()
  );

  return {
    total: liveStats?.total || 0,
    pending: liveStats?.pending || 0,
    validated: liveStats?.validated || 0,
    completed: liveStats?.resolved || 0,
  };
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatDate(value) {
  if (!value) return "Recently reported";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getDistrictColor(name) {
  const score = name.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return DISTRICT_COLORS[score % DISTRICT_COLORS.length];
}

function districtStyle(feature, activeDistrict) {
  const name = feature.properties.district || "";
  const isActive = name === activeDistrict;
  return {
    color: isActive ? "#ffffff" : "#c8e78f",
    weight: isActive ? 2.5 : 1,
    fillColor: isActive ? "#20d98e" : getDistrictColor(name),
    fillOpacity: 0.96,
  };
}

function FitJharkhand({ data }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.geoJSON(data).getBounds();
    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [4, 4], maxZoom: 9 });
    });
    return () => cancelAnimationFrame(frame);
  }, [data, map]);

  return null;
}

function JharkhandMap({ districts }) {
  const [data, setData] = useState(null);
  const [activeDistrict, setActiveDistrict] = useState("Ranchi");
  const stats = getPublicDistrictStats(activeDistrict, districts);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((response) => response.json())
      .then(setData)
      .catch(() => setData({ type: "FeatureCollection", features: [] }));
  }, []);

  return (
    <div className="jharkhand-map-shell">
      <MapContainer center={[23.6, 85.3]} zoom={7} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} className="jharkhand-map">
        {data?.features.length > 0 && (
          <>
            <FitJharkhand data={data} />
            <GeoJSON
              key={activeDistrict}
              data={data}
              style={(feature) => districtStyle(feature, activeDistrict)}
              onEachFeature={(feature, layer) => {
                const districtName = feature.properties.district;
                layer.bindTooltip(districtName, { permanent: true, direction: "center", className: "district-label" });
                layer.on({ click: () => setActiveDistrict(districtName) });
              }}
            />
            <CircleMarker center={[23.3441, 85.3096]} radius={8} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#087c58", fillOpacity: 1 }}>
              <Tooltip permanent direction="center" className="ranchi-marker">●</Tooltip>
            </CircleMarker>
          </>
        )}
      </MapContainer>
      <div className="district-card">
        <h3><span>●</span>{activeDistrict} District</h3>
        <div><span className="dot blue" />Total Cases <b>{formatCount(stats.total)}</b></div>
        <div><span className="dot orange" />Pending <b>{formatCount(stats.pending)}</b></div>
        <div><span className="dot green" />Validated <b>{formatCount(stats.validated)}</b></div>
        <div><span className="dot lime" />Completed <b>{formatCount(stats.completed)}</b></div>
        <a href="#focus">View Details <span>→</span></a>
      </div>
      <div className="map-compass" aria-label="Connected communities, stronger Jharkhand">
        <span className="compass-direction">N</span>
        <span className="compass-needle">◈</span>
        <span className="compass-caption"><b>—</b> CONNECTED COMMUNITIES <b>—</b><br />STRONGER JHARKHAND</span>
      </div>
    </div>
  );
}

function Navbar() {
  const navItems = [
    ["#top", "Home"],
    ["#live-flow", "Live Flow"],
    ["#focus", "Focus Areas"],
    ["#impact", "Impact"],
    ["#about", "About"],
  ];

  return (
    <nav className="sticky top-0 z-[1000] flex h-[76px] items-center justify-between border-b border-[#e5f1ed] bg-white/[0.97] px-[5.5%] shadow-[0_4px_18px_rgba(18,63,109,.04)] backdrop-blur-xl max-[620px]:h-[68px] max-[620px]:px-[18px]">
      <a href="#top" className="flex items-center gap-3 text-[#123f6d] no-underline">
        <div className="relative h-[42px] w-[42px]">
          <span className="absolute left-[13px] top-0 text-[29px] leading-none text-[#075b80]">●</span>
          <i className="absolute left-[3px] top-[15px] h-[20px] w-[34px] -rotate-[28deg] rounded-[100%_0_100%_0] bg-[#13a957]" />
        </div>
        <div>
          <h2 className="m-0 text-[20px] font-semibold tracking-[-.5px] max-[620px]:text-[15px]">JAN-SAMADHAN</h2>
          <p className="m-0 mt-[2px] text-[11px] text-[#1876a0] max-[620px]:hidden">From Problems to Progress</p>
        </div>
      </a>

      <div className="hidden items-center gap-7 min-[900px]:flex">
        {navItems.map(([href, label], index) => (
          <a
            key={label}
            href={href}
            className={`relative py-[27px] text-[12px] font-medium no-underline transition-all ${
              index === 0
                ? "border-b-2 border-[#008b57] text-[#008b57]"
                : "text-[#123f6d] hover:-translate-y-[1px] hover:text-[#008b57]"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <a
          href="/login"
          className="hidden rounded-[22px] border border-[#0a9c68] px-[18px] py-[9px] text-[11px] font-bold text-[#087a55] no-underline transition-all hover:bg-[#effaf5] min-[621px]:inline-flex"
        >
          Login
        </a>
        <a
          href="/login"
          className="rounded-[22px] bg-[#06a35e] px-[19px] py-[10px] text-[11px] font-bold text-white no-underline shadow-[0_6px_16px_rgba(6,163,94,.16)] transition-all hover:-translate-y-[1px] hover:bg-[#078d5d] max-[620px]:px-[14px] max-[620px]:py-2"
        >
          Sign Up
        </a>
      </div>
    </nav>
  );
}

function Home() {
  const [overview, setOverview] = useState(null);
  const [activeStage, setActiveStage] = useState("pending");

  useEffect(() => {
    let active = true;
    const loadOverview = () => {
      api.get("/problems/public")
        .then((response) => {
          if (active && response.data?.success) {
            setOverview(response.data);
          }
        })
        .catch(() => {
          // Keep the reference design's fallback figures when the API is offline.
        });
    };

    loadOverview();
    const refreshTimer = window.setInterval(loadOverview, 30000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const liveStats = overview?.stats;
  const liveDistrictCount = overview ? overview.districts?.length || 0 : null;
  const liveProblemCount = overview ? liveStats?.total || 0 : null;
  const liveResolvedCount = overview ? liveStats?.resolved || 0 : null;

  const pipelineStages = [
    ["pending", "Reported", "pending", "Issues waiting for government review", "#f3a01a"],
    ["underReview", "Under Review", "underReview", "Issues currently being reviewed", "#44b9ed"],
    ["validated", "Validated", "validated", "Verified problems ready for action", "#10ab58"],
    ["inProgress", "In Progress", "inProgress", "Solutions currently being implemented", "#7c65d8"],
    ["resolved", "Resolved", "resolved", "Problems with a completed solution", "#45c74e"],
  ];

  const activeStageData = pipelineStages.find(([key]) => key === activeStage) || pipelineStages[0];
  const activeStageCount = liveStats?.[activeStageData[2]] ?? 0;

  const topDistricts = [...(overview?.districts || [])]
    .sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
    .slice(0, 4);

  const topCategories = [...(overview?.categories || [])]
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .slice(0, 4);

  return (
    <div className="site-shell" id="top">
      <Navbar />
      <main>
        <section className="hero-section">
          <div className="hero-wash" />
          <div className="hero-content">
            <div className="hero-copy">
              <div className="location-pill"><span>●</span> Jharkhand <b>|</b> Connected. Empowered. Progressing.</div>
              <h1>Real Problems.<br /><span>Student-Led Solutions.</span><br />A Stronger Jharkhand.</h1>
              <p>JAN-SAMADHAN transforms community problems into research projects, connects citizens with institutions, and drives real impact through collaboration.</p>
              <div className="hero-actions">
                <a href="/login" className="button button-primary">Report a Problem <span>→</span></a>
                <a href="#live-flow" className="button button-outline"><span className="play-icon">▶</span> View Live Flow</a>
              </div>
              <div className="stakeholders">
                <div><span className="stakeholder-icon citizen">●</span><strong>Citizens</strong><small>Report Problems</small></div>
                <div><span className="stakeholder-icon government">▥</span><strong>Government</strong><small>Validate &amp; Approve</small></div>
                <div><span className="stakeholder-icon university">◆</span><strong>Universities &amp;<br /> Students</strong><small>Build Solutions</small></div>
                <div><span className="stakeholder-icon industry">✦</span><strong>Industry/Investors</strong><small>Provide Support</small></div>
              </div>
            </div>
            <div className="map-stage" id="jharkhand-map"><div className="map-glow" /><div className="map-frame"><JharkhandMap districts={overview?.districts} /></div></div>
          </div>
          <div className="hero-stats">
            <div><span>●</span><strong>{liveDistrictCount === null ? "—" : `${formatCount(liveDistrictCount)}+`}</strong><small>Districts</small></div>
            <div><span>◆</span><strong>{liveProblemCount === null ? "—" : `${formatCount(liveProblemCount)}+`}</strong><small>Projects</small></div>
            <div><span>⌁</span><strong>{liveResolvedCount === null ? "—" : `${formatCount(liveResolvedCount)}+`}</strong><small>People Impacted</small></div>
          </div>
        </section>
        <section className="focus-section" id="focus">
          <div className="section-heading"><i /><h2>Key Focus Areas</h2><i /></div>
          <div className="focus-grid">
            {FOCUS_AREAS.map(([icon, title, action]) => (
              <a className="focus-card" href="#focus" key={title}><span className="focus-icon">{icon}</span><span><strong>{title}</strong><small>{action} <b>→</b></small></span></a>
            ))}
          </div>
        </section>

        <section className="live-flow-section" id="live-flow">
          <div className="section-heading"><i /><h2>Live Civic Problem Flow</h2><i /></div>
          <p className="live-flow-intro">
            Follow the real-time journey of problems reported across Jharkhand. Select any stage to see
            how many cases are currently there and where the activity is concentrated.
          </p>

          <div className="pipeline">
            {pipelineStages.map(([key, title, statKey, description, accent], index) => {
              const count = Number(liveStats?.[statKey] || 0);
              const isActive = activeStage === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveStage(key)}
                  className={`pipeline-stage ${isActive ? "active" : ""}`}
                  style={{ "--stage-accent": accent }}
                >
                  <span className="pipeline-index">0{index + 1}</span>
                  <span className="pipeline-icon">
                    {index === 0 ? "●" : index === 1 ? "◌" : index === 2 ? "✓" : index === 3 ? "⚙" : "★"}
                  </span>
                  <strong>{title}</strong>
                  <b>{overview ? formatCount(count) : "—"}</b>
                  <small>{description}</small>
                  {index < pipelineStages.length - 1 && <span className="pipeline-arrow">→</span>}
                </button>
              );
            })}
          </div>

          <div className="live-flow-dashboard">
            <div className="stage-detail">
              <div className="stage-detail-head">
                <div>
                  <span className="live-dot" />
                  <span>LIVE BACKEND DATA</span>
                </div>
                <strong>{overview ? `${formatCount(activeStageCount)} cases` : "Loading…"}</strong>
              </div>
              <h3>{activeStageData[1]} Cases</h3>
              <p>{activeStageData[3]}</p>

              <div className="stage-progress">
                <div>
                  <span>Share of all reported problems</span>
                  <b>
                    {overview && liveProblemCount
                      ? `${Math.round((Number(activeStageCount) / Number(liveProblemCount)) * 100)}%`
                      : "—"}
                  </b>
                </div>
                <div className="progress-track">
                  <span
                    style={{
                      width: overview && liveProblemCount
                        ? `${Math.min(100, (Number(activeStageCount) / Number(liveProblemCount)) * 100)}%`
                        : "0%",
                      background: activeStageData[4],
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="live-panel">
              <div className="live-panel-title">
                <span>District activity</span>
                <small>Top reported areas</small>
              </div>

              <div className="district-mini-list">
                {topDistricts.length ? topDistricts.map((district) => (
                  <div key={district.district}>
                    <span>{district.district}</span>
                    <div className="mini-bar">
                      <i style={{ width: `${Math.min(100, (Number(district.total || 0) / Math.max(1, Number(topDistricts[0]?.total || 1))) * 100)}%
/* Focus / Impact / About sections */
.focus-section,
.impact-section,
.about-section {
  padding: 90px 5.5%;
  scroll-margin-top: 80px;
}
.focus-section {
  background: #f7fbfc;
}
.impact-section {
  background: #ffffff;
}
.about-section {
  background: #eef7f7;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 70px;
  align-items: center;
}
.section-heading {
  max-width: 700px;
  margin: 0 auto 38px;
  text-align: center;
}
.section-heading h2,
.about-copy h2 {
  margin: 8px 0 12px;
  color: #103f5d;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.05;
  letter-spacing: -.8px;
}
.section-heading p,
.about-copy p {
  color: #63808a;
  font-size: 13px;
  line-height: 1.8;
}
.eyebrow {
  color: #0aa568;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.8px;
}
.focus-grid {
  max-width: 1260px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.focus-card {
  padding: 24px 20px;
  border: 1px solid #dcebed;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(16,63,93,.05);
  transition: .25s;
}
.focus-card:hover {
  transform: translateY(-5px);
  border-color: #a9dcd0;
  box-shadow: 0 14px 30px rgba(16,63,93,.09);
}
.focus-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #e8f7f1;
  font-size: 20px;
  margin-bottom: 15px;
}
.focus-card h3 {
  margin: 0 0 8px;
  color: #174c67;
  font-size: 14px;
}
.focus-card p {
  margin: 0;
  color: #718b94;
  font-size: 10px;
  line-height: 1.65;
}
.impact-grid {
  max-width: 1260px;
  margin: 0 auto 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.impact-card {
  padding: 27px 22px;
  border-radius: 16px;
  background: #f7fbfc;
  border: 1px solid #dcebed;
}
.impact-card strong {
  display: block;
  color: #0aa568;
  font-size: 34px;
  line-height: 1;
  margin-bottom: 10px;
}
.impact-card span {
  display: block;
  color: #174c67;
  font-size: 13px;
  font-weight: 800;
}
.impact-card small {
  display: block;
  color: #718b94;
  margin-top: 7px;
  font-size: 9px;
  line-height: 1.5;
}
.impact-banner {
  max-width: 1260px;
  margin: 0 auto;
  padding: 28px 32px;
  border-radius: 18px;
  background: #0d3f61;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
}
.impact-banner h3 {
  margin: 8px 0 0;
  color: #fff;
  font-size: 20px;
}
.about-copy {
  max-width: 570px;
}
.about-copy h2 {
  margin-bottom: 18px;
}
.about-copy p {
  margin: 0 0 14px;
}
.about-copy .button {
  margin-top: 12px;
}
.about-points {
  display: grid;
  gap: 14px;
}
.about-points > div {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  align-items: start;
  padding: 18px;
  background: #fff;
  border: 1px solid #dcebed;
  border-radius: 14px;
}
.about-points b {
  color: #0aa568;
  font-size: 11px;
}
.about-points span {
  color: #718b94;
  font-size: 10px;
  line-height: 1.6;
}
.about-points strong {
  display: block;
  color: #174c67;
  font-size: 12px;
  margin-bottom: 4px;
}
@media (max-width: 900px) {
  .focus-grid,
  .impact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .about-section {
    grid-template-columns: 1fr;
    gap: 35px;
  }
}
@media (max-width: 560px) {
  .focus-section,
  .impact-section,
  .about-section {
    padding: 65px 20px;
  }
  .focus-grid,
  .impact-grid {
    grid-template-columns: 1fr;
  }
  .impact-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
  .section-heading h2,
  .about-copy h2 {
    font-size: 30px;
  }
}


` }} />
                    </div>
                    <b>{formatCount(district.total || 0)}</b>
                  </div>
                )) : (
                  <div className="empty-live">District data will appear here.</div>
                )}
              </div>
            </div>

            <div className="live-panel category-panel">
              <div className="live-panel-title">
                <span>Problem categories</span>
                <small>Live distribution</small>
              </div>

              <div className="category-mini-list">
                {topCategories.length ? topCategories.map((category, index) => (
                  <div key={category.category || index}>
                    <span className="category-rank">{index + 1}</span>
                    <strong>{category.category}</strong>
                    <b>{formatCount(category.count || 0)}</b>
                  </div>
                )) : (
                  <div className="empty-live">Category data will appear here.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">JAN-SAMADHAN · From Problems to Progress · Connected communities, stronger Jharkhand</footer>
    </div>
  );
}

function App() {
  return (
    <>
      <style>{styles}
</style>
      <Home />
    </>
  );
}

export default App;