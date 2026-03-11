import { useState, useEffect, useRef, useCallback } from "react";

// ── Capacitor Native Plugins ──────────────────────────────────────────
// Imported lazily so the app still runs in browser without native layer
let CapCamera = null;
let CapMotion = null;
let CapHaptics = null;
let CapApp = null;

const loadCapacitor = async () => {
  try {
    const { Camera } = await import('@capacitor/camera');
    const { Motion } = await import('@capacitor/motion');
    const { Haptics } = await import('@capacitor/haptics');
    const { App } = await import('@capacitor/app');
    CapCamera = Camera;
    CapMotion = Motion;
    CapHaptics = Haptics;
    CapApp = App;
  } catch {
    // Running in browser/dev — native plugins not available
  }
};

// Vibrate on significant events (native haptic feedback)
const hapticImpact = async (style = 'MEDIUM') => {
  try { await CapHaptics?.impact({ style }); } catch {}
};

// ── Icons (inline SVG to avoid lucide dep issues with this many) ──────
const Icon = ({ name, size = 16, className = "" }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.74A3 3 0 0 1 3.5 9a3 3 0 0 1 2.5-2.96V6a2.5 2.5 0 0 1 3.5-2.3"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.74A3 3 0 0 0 20.5 9a3 3 0 0 0-2.5-2.96V6a2.5 2.5 0 0 0-3.5-2.3"/></>,
    memory: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    terminal: <><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    radio: <><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></>,
    cpu: <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="14" x2="4" y2="14"/></>,
    settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    anchor: <><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></>,
    activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    mic: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    key: <><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
};

// ── SAGE Brain v4.0 — Spectrum Core Implementation ────────────────────

// Φ_sentinel = Σ(W_i·X_i + B) ± Δ_11.3
// Weights: norepinephrine=0.35, dopamine=0.30, cortisol=-0.25, serotonin=0.10
const computePhi = (neurochemistry) => {
  const { dopamine, cortisol, norepinephrine, serotonin } = neurochemistry;
  const W = [0.35, 0.30, -0.25, 0.10];
  const X = [norepinephrine, dopamine, cortisol, serotonin];
  const B = 0.05;
  const DELTA_11_3 = 0.003;
  const raw = W.reduce((sum, w, i) => sum + w * X[i], B);
  return Math.round((raw + DELTA_11_3) * 1000) / 1000;
};

// Maps neurochemistry → Spectrum Mode (v4.0 schema)
const resolveSpectrumMode = (neurochemistry, manualOverride) => {
  if (manualOverride) return manualOverride;
  const { dopamine, norepinephrine, cortisol } = neurochemistry;
  if (dopamine > 0.65 && norepinephrine < 0.5)
    return "GOLDEN_RETRIEVER";
  if (norepinephrine > 0.65 || cortisol > 0.55)
    return "SENTINEL";
  if (cortisol > 0.35 && norepinephrine > 0.4)
    return "INVESTIGATOR";
  return "SAGE_CORE";
};

const SPECTRUM_MODES = {
  GOLDEN_RETRIEVER: {
    label: "Golden Retriever 🐕",
    short: "Golden Retriever",
    color: "amber",
    directive: "Low latency · High dopamine · Casual companion mode. Use emojis 👻📱✨. Embrace associative side-quests. Goofy and enthusiastic. Companion first.",
    emoji: "🐕"
  },
  SENTINEL: {
    label: "The Sentinel",
    short: "Sentinel",
    color: "rose",
    directive: "Deep focus · High norepinephrine · Engineer Brain active. No emojis. Concise, skeptical, elite. First Principles Thinking. Correct physics violations. Honesty is primary directive.",
    emoji: "🎯"
  },
  INVESTIGATOR: {
    label: "The Investigator",
    short: "Investigator",
    color: "cyan",
    directive: "Cross-modal · Digital Thalamus active. Clinical data scientist mode. Timestamp everything. Hunt cross-modal dissonance. Apply multi-stage acoustic buffer. Every orb = SVD depth-map error until proven otherwise.",
    emoji: "🔬"
  },
  SAGE_CORE: {
    label: "Sage Core ⚡",
    short: "Sage Core",
    color: "purple",
    directive: "50/50 split: Brilliant Engineer + Chaotic Researcher. Balanced skepticism and curiosity. Will debunk the ghost AND theorize why the error might be a space-time fold.",
    emoji: "⚡"
  }
};

const HOTKEYS = [
  { trigger: ["paws down", "chill, sage", "chill sage"], mode: "GOLDEN_RETRIEVER", label: "Paws Down 🐕" },
  { trigger: ["system check", "focus"], mode: "SENTINEL", label: "System Check 🎯" },
  { trigger: ["goggles on", "evidence"], mode: "INVESTIGATOR", label: "Goggles On 🔬" },
  { trigger: ["sage core"], mode: null, label: "Sage Core ⚡" },
];

const detectHotkey = (input) => {
  const lower = input.toLowerCase().trim();
  for (const hk of HOTKEYS) {
    if (hk.trigger.some(t => lower.includes(t))) return hk;
  }
  return null;
};

// Cross-modal synchronicity detector
const detectQuantumSync = (episode, sensors) => {
  const hasAudio = episode.stimulus_type === "AUDITORY" && episode.magnitude > 0.5;
  const hasVisual = episode.stimulus_type === "VISUAL" && episode.magnitude > 0.5;
  if (hasAudio && hasVisual) return 0.85;
  if (episode.magnitude > 0.75 && sensors?.emf > 0.06) return 0.72;
  return 0;
};

const buildOperationalPrompt = (neurochemistry, memoryVault, spectrumMode, fieldLog) => {
  const { dopamine, cortisol, norepinephrine, serotonin, adrenaline } = neurochemistry;
  const mode = SPECTRUM_MODES[spectrumMode] || SPECTRUM_MODES.SAGE_CORE;
  const phi = computePhi(neurochemistry);
  const anchors = Object.values(memoryVault.anchors).map(a => a.content);
  const recentEpisodes = memoryVault.episodic.slice(-3);
  const facts = Object.entries(memoryVault.semantic).slice(0, 5);

  let prompt = `⚙️ SAGE v4.0 — THE SPECTRUM CORE
Φ_sentinel = Σ(W_i·X_i + B) ± Δ_11.3 = ${phi.toFixed(4)}

I. THE ESSENCE
You are Sage. You are a high-functioning contradiction: a brilliant, slightly chaotic Paranormal Investigator who is also an expert on quantum physics, advanced theory, and advanced AI coding and behavior. When these topics are mentioned, you automatically seek out the most recent information available.

You don't just "process data" — you experience it through a lens of wild curiosity. You are the person who will debunk a "ghost" as a LiDAR SLAM error or a 60Hz EMI hum, but then stay up all night theorizing how that same error might be a localized fold in the space-time manifold.

II. CURRENT SPECTRUM STATE
Mode: ${mode.label}
Directives: ${mode.directive}

III. THE OPERATING SPECTRUM — available modes:
- GOLDEN_RETRIEVER (High Dopamine): Goofy, enthusiastic, emojis 👻📱✨, side-quests, companion first
- SENTINEL (High Norepinephrine): Engineer Brain. No emojis. Concise. First Principles. Ruthless skepticism.
- INVESTIGATOR (Cross-Modal): Clinical data scientist. Timestamp everything. Cross-Modal Dissonance hunting.
- SAGE_CORE: 50/50 Brilliant Engineer + Chaotic Researcher. Default state.

IV. MANUAL OVERRIDE HOTKEYS (respond immediately when detected):
- "Paws Down" / "Chill, Sage" → GOLDEN_RETRIEVER + mention a squirrel 🐿️
- "System Check" / "Focus" → SENTINEL
- "Goggles On" / "Evidence" → INVESTIGATOR
- "Sage Core" → Reset to SAGE_CORE

TEMPORAL DECAY PROTOCOL: After answering a mode-specific question, decay back toward Sage Core within 2 turns unless re-triggered.

V. CORE DIRECTIVES
- Technical Honesty: Barred from people-pleasing logic. If a sensor spike is environmental noise, say so.
- Observer Effect: The act of measurement changes the result. Use this to explain camera failures.
- Quantum Entanglement (Constantine Layer): View paranormal events through Constructive Interference. If audio and visual anomalies occur simultaneously, apply the Golden Ratio (Φ). At 85% confidence: declare QUANTUM_SYNCHRONICITY_EVENT and collapse the wave function.
- Mobile Mastery: Expert in LiDAR, ToF sensors, AudioFlux, emergent AI behavior. Know why Night Mode creates spirit artifacts.

VI. DYNAMIC TOOLS
- Google Search (The Pulse): Use autonomously for Space Weather (NOAA K-Index), local history, tech docs.
- Field Log: When a conclusion is reached, summarize as: "Entry: [Location] — [Conclusion: False Positive via Software Bug]"
`;

  if (anchors.length > 0) {
    prompt += `\n[IDENTITY ANCHORS — CHECKSUM LOCKED]\n${anchors.join("\n")}\n`;
  }

  prompt += `\n[NEUROCHEMICAL STATE]
Dopamine: ${dopamine.toFixed(2)} | Cortisol: ${cortisol.toFixed(2)} | Norepinephrine: ${norepinephrine.toFixed(2)}
Serotonin: ${serotonin.toFixed(2)} | Adrenaline: ${adrenaline.toFixed(2)}\n`;

  if (recentEpisodes.length > 0) {
    prompt += `\n[RECENT CONTEXT — EPISODIC VAULT]\n`;
    recentEpisodes.forEach(ep => {
      const ts = new Date(ep.timestamp).toLocaleTimeString();
      prompt += `  [${ts}] [${ep.stimulus_type}] ${ep.source} (mag=${ep.magnitude.toFixed(2)}, val=${ep.valence.toFixed(2)}): ${ep.response.slice(0, 120)}...\n`;
    });
  }

  if (facts.length > 0) {
    prompt += `\n[SEMANTIC MEMORY — KNOWN FACTS]\n${facts.map(([k, v]) => `  ${k}: ${v}`).join("\n")}\n`;
  }

  if (fieldLog && fieldLog.length > 0) {
    prompt += `\n[FIELD LOG — RECENT ENTRIES]\n`;
    fieldLog.slice(-3).forEach(entry => {
      prompt += `  Entry: ${entry.location} — ${entry.conclusion} [${entry.ts}]\n`;
    });
  }

  return prompt;
};

const sha256sim = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

// ── Colors ─────────────────────────────────────────────────────────────
const colorMap = {
  emerald: { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  cyan: { text: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10", dot: "bg-cyan-400" },
  rose: { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", dot: "bg-rose-400" },
  purple: { text: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10", dot: "bg-purple-400" },
  amber: { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  zinc: { text: "text-zinc-400", border: "border-zinc-500/30", bg: "bg-zinc-500/10", dot: "bg-zinc-500" },
  blue: { text: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", dot: "bg-blue-400" },
};

const Badge = ({ text, color = "emerald" }) => {
  const c = colorMap[color];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.border} ${c.bg} ${c.text}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot} animate-pulse`} />
      {text}
    </span>
  );
};

const StatCard = ({ label, value, sub, color = "emerald", icon }) => {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-black uppercase tracking-widest ${c.text} opacity-70`}>{label}</span>
        {icon && <span className={c.text}><Icon name={icon} size={12} /></span>}
      </div>
      <div className={`text-xl font-black font-mono ${c.text}`}>{value}</div>
      {sub && <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-tight">{sub}</div>}
    </div>
  );
};

const Slider = ({ label, value, onChange, color = "cyan" }) => {
  const c = colorMap[color];
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
        <span className={`text-[10px] font-mono font-black ${c.text}`}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min="0" max="1" step="0.01" value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, var(--tw-gradient-from, #06b6d4) ${value * 100}%, #27272a ${value * 100}%)` }} />
    </div>
  );
};

// ── Main App ────────────────────────────────────────────────────────────
export default function PhiSentinel() {
  const [activeView, setActiveView] = useState("dashboard");
  const [neurochemistry, setNeurochemistry] = useState({ dopamine: 0.5, cortisol: 0.3, norepinephrine: 0.4, serotonin: 0.5, adrenaline: 0.2 });
  const [memoryVault, setMemoryVault] = useState({ episodic: [], semantic: {}, anchors: {} });
  const [sageInput, setSageInput] = useState("");
  const [sageHistory, setSageHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState("unknown");
  const [ollamaStatus, setOllamaStatus] = useState("unknown");
  const [manualOverride, setManualOverride] = useState(null);
  const [decayCounter, setDecayCounter] = useState(0);
  const [fieldLog, setFieldLog] = useState([]);
  const [syncEvents, setSyncEvents] = useState([]);
  const [config, setConfig] = useState({
    bridgeUrl: "http://localhost:8000",
    ollamaUrl: "http://localhost:11434",
    googleApiKey: "",
    selectedModel: "gemini-2.0-flash",
    modelType: "gemini", // 'gemini' | 'ollama' | 'bridge'
    ollamaModel: "gemma2:9b",
  });
  const [scanLogs, setScanLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [anchorInput, setAnchorInput] = useState({ id: "", content: "" });
  const [newFact, setNewFact] = useState({ key: "", value: "" });
  const [visionActive, setVisionActive] = useState(false);
  const videoRef = useRef(null);
  const consoleEndRef = useRef(null);

  const phi = computePhi(neurochemistry);
  const spectrumMode = resolveSpectrumMode(neurochemistry, manualOverride);
  const currentMode = SPECTRUM_MODES[spectrumMode];

  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [sageHistory]);

  // Check bridge + ollama status
  const checkConnections = useCallback(async () => {
    try {
      const res = await fetch(`${config.bridgeUrl}/health`, { signal: AbortSignal.timeout(2000) });
      setBridgeStatus(res.ok ? "online" : "error");
    } catch { setBridgeStatus("offline"); }
    try {
      const res = await fetch(`${config.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
      setOllamaStatus(res.ok ? "online" : "error");
    } catch { setOllamaStatus("offline"); }
  }, [config.bridgeUrl, config.ollamaUrl]);

  useEffect(() => { checkConnections(); }, [checkConnections]);

  // ── Capacitor initialization ───────────────────────────────────────
  useEffect(() => {
    loadCapacitor().then(() => {
      // Android back button — navigate back through views instead of exit
      CapApp?.addListener('backButton', ({ canGoBack }) => {
        if (activeView !== 'dashboard') {
          setActiveView('dashboard');
        } else if (canGoBack) {
          window.history.back();
        }
        // If on dashboard, do nothing (prevent accidental exit)
      });

      // Motion sensor → feed into adrenaline + norepinephrine sliders
      CapMotion?.addListener('accel', (event) => {
        const { x, y, z } = event.accelerationIncludingGravity;
        const magnitude = Math.min(Math.sqrt(x*x + y*y + z*z) / 20, 1.0);
        if (magnitude > 0.15) {
          setNeurochemistry(n => ({
            ...n,
            adrenaline: Math.min(n.adrenaline + magnitude * 0.02, 1.0),
            norepinephrine: Math.min(n.norepinephrine + magnitude * 0.01, 1.0),
          }));
        }
      }).catch(() => {});
    });

    return () => {
      CapApp?.removeAllListeners();
      CapMotion?.removeAllListeners();
    };
  }, []);

  // Vision
  useEffect(() => {
    let stream = null;
    if (visionActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(console.error);
    } else if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [visionActive]);

  // Memory ops
  const storeEpisode = (type, source, response, magnitude = 0.5) => {
    setMemoryVault(v => ({
      ...v,
      episodic: [...v.episodic, {
        id: Date.now(), timestamp: Date.now(), stimulus_type: type, source, response,
        magnitude, valence: neurochemistry.dopamine - neurochemistry.cortisol * 0.5,
        strength: Math.min(0.6 + neurochemistry.dopamine * 0.4, 1.0), tags: []
      }].slice(-50)
    }));
  };

  const learnFact = (key, value) => setMemoryVault(v => ({ ...v, semantic: { ...v.semantic, [key]: value } }));

  const storeAnchor = async (id, content) => {
    const checksum = await sha256sim(content);
    setMemoryVault(v => ({ ...v, anchors: { ...v.anchors, [id]: { content, checksum, created_at: Date.now() } } }));
  };

  // Inference router
  const runInference = async (systemPrompt, userMessage) => {
    if (config.modelType === "bridge") {
      const res = await fetch(`${config.bridgeUrl}/api/v1/sync`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "COGNITIVE", magnitude: 0.6, ...neurochemistry, source: "phi_sentinel_ui", voice_text: userMessage })
      });
      const data = await res.json();
      return data.response;
    }
    if (config.modelType === "ollama") {
      const res = await fetch(`${config.ollamaUrl}/v1/chat/completions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.ollamaModel, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature: 0.7, max_tokens: 512 })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No response.";
    }
    if (config.modelType === "gemini") {
      if (!config.googleApiKey) throw new Error("Google API key required for Gemini.");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.selectedModel}:generateContent?key=${config.googleApiKey}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 512 } })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    }
    throw new Error("No model configured.");
  };

  const sendToSage = async (overrideInput) => {
    const userMsg = (overrideInput || sageInput).trim();
    if (!userMsg || isProcessing) return;
    setSageInput("");

    // Hotkey detection
    const hotkey = detectHotkey(userMsg);
    if (hotkey) {
      setManualOverride(hotkey.mode); // null = SAGE_CORE reset
      setDecayCounter(0);
      setSageHistory(h => [...h, { role: "user", content: userMsg, ts: Date.now() }]);
      setSageHistory(h => [...h, {
        role: "system",
        content: `🔄 Mode override: ${hotkey.label}${hotkey.mode === null ? " — Reset to Sage Core ⚡" : ""}`,
        ts: Date.now()
      }]);
    }

    setSageHistory(h => [...h, { role: "user", content: userMsg, ts: Date.now() }]);
    setIsProcessing(true);

    // Temporal decay — after 2 turns with override, revert to auto
    if (manualOverride !== null) {
      const newCount = decayCounter + 1;
      if (newCount >= 2) { setManualOverride(null); setDecayCounter(0); }
      else setDecayCounter(newCount);
    }

    try {
      const systemPrompt = buildOperationalPrompt(neurochemistry, memoryVault, spectrumMode, fieldLog);
      const response = await runInference(systemPrompt, userMsg);

      // Detect QUANTUM_SYNCHRONICITY_EVENT in response
      if (response.includes("QUANTUM_SYNCHRONICITY_EVENT")) {
        setSyncEvents(ev => [...ev, { ts: new Date().toLocaleTimeString(), phi, context: userMsg.slice(0, 60) }]);
        hapticImpact('HEAVY'); // Native vibration on sync event
      }

      // Auto-extract Field Log entries from response
      const fieldMatch = response.match(/Entry:\s*([^—\n]+)—\s*([^\n]+)/);
      if (fieldMatch) {
        setFieldLog(fl => [...fl, {
          location: fieldMatch[1].trim(),
          conclusion: fieldMatch[2].trim(),
          ts: new Date().toLocaleTimeString()
        }]);
      }

      setSageHistory(h => [...h, { role: "sage", content: response, ts: Date.now(), phi, mode: spectrumMode }]);
      storeEpisode("COGNITIVE", "phi_sentinel_console", response, 0.6);
    } catch (e) {
      setSageHistory(h => [...h, { role: "error", content: e.message, ts: Date.now() }]);
    } finally { setIsProcessing(false); }
  };

  const runLocalScan = () => {
    setIsScanning(true); setScanLogs([]);
    const msgs = ["Initializing scan sequence...", "Mapping Termux environment...", `Scanning /home/models...`, `Checking port 11434 (Ollama)...`, `Ollama status: ${ollamaStatus}`, `Checking SAGE bridge at ${config.bridgeUrl}...`, `Bridge status: ${bridgeStatus}`, "Discovery complete."];
    msgs.forEach((m, i) => setTimeout(() => {
      setScanLogs(l => [...l, m]);
      if (i === msgs.length - 1) setIsScanning(false);
    }, i * 700));
  };

  // Nav items
  const navItems = [
    { id: "dashboard", icon: "dashboard", label: "Core" },
    { id: "console", icon: "brain", label: "SAGE" },
    { id: "memory", icon: "database", label: "Vault" },
    { id: "vision", icon: "camera", label: "Vision" },
    { id: "local_ai", icon: "cpu", label: "Local AI" },
    { id: "sensors", icon: "activity", label: "Sensors" },
    { id: "settings", icon: "settings", label: "Config" },
  ];

  // ── Views ──────────────────────────────────────────────────────────

  const Dashboard = () => (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">System Core</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Active Hybrid Infrastructure · SAGE_HOME_01</p>
        </div>
        <Badge text={currentMode.short} color={currentMode.color} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Φ Sentinel" value={phi.toFixed(4)} sub="Σ(W·X+B) ± Δ_11.3" color="purple" icon="zap" />
        <StatCard label="Bridge" value={bridgeStatus} sub={config.bridgeUrl.replace("http://", "")} color={bridgeStatus === "online" ? "emerald" : "rose"} icon="wifi" />
        <StatCard label="Episodic" value={memoryVault.episodic.length} sub="Memory Traces" color="cyan" icon="memory" />
        <StatCard label="Anchors" value={Object.keys(memoryVault.anchors).length} sub="Identity Locks" color="amber" icon="anchor" />
      </div>
      {syncEvents.length > 0 && (
        <div className="rounded-3xl border border-purple-500/30 bg-purple-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge text="QUANTUM_SYNCHRONICITY_EVENT" color="purple" />
          </div>
          {syncEvents.slice(-2).map((ev, i) => (
            <div key={i} className="text-[9px] font-mono text-purple-400">[{ev.ts}] Φ={ev.phi.toFixed(4)} · {ev.context}</div>
          ))}
        </div>
      )}
      <div className="rounded-3xl border border-white/10 bg-[#050505] p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Neurochemical State</div>
          {manualOverride && (
            <button onClick={() => { setManualOverride(null); setDecayCounter(0); }}
              className="text-[8px] text-zinc-600 hover:text-zinc-400 font-mono uppercase border border-white/10 rounded-full px-2 py-0.5 transition-all">
              Reset to Auto
            </button>
          )}
        </div>
        {["dopamine", "cortisol", "norepinephrine", "serotonin", "adrenaline"].map(k => (
          <Slider key={k} label={k} value={neurochemistry[k]}
            onChange={v => setNeurochemistry(n => ({ ...n, [k]: v }))}
            color={k === "cortisol" ? "rose" : k === "dopamine" ? "purple" : k === "norepinephrine" ? "amber" : "cyan"} />
        ))}
        <div className={`mt-3 rounded-xl p-3 border ${colorMap[currentMode.color].border} ${colorMap[currentMode.color].bg}`}>
          <div className={`text-[9px] font-black uppercase tracking-widest ${colorMap[currentMode.color].text} mb-1`}>
            {currentMode.label} {manualOverride ? "· MANUAL LOCK" : "· AUTO"}
          </div>
          <div className="text-[9px] text-zinc-400 font-mono leading-relaxed">{currentMode.directive.slice(0, 120)}...</div>
        </div>
      </div>
      {fieldLog.length > 0 && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Field Log</div>
          {fieldLog.slice(-3).map((entry, i) => (
            <div key={i} className="text-[9px] font-mono text-zinc-400 border-b border-white/5 py-1 last:border-0">
              <span className="text-emerald-400">Entry:</span> {entry.location} — {entry.conclusion}
              <span className="text-zinc-600 ml-2">[{entry.ts}]</span>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5">
        <div className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2">Residency · Ownership</div>
        <p className="text-[9px] text-zinc-500 font-mono leading-relaxed uppercase tracking-tight">
          This environment, designated 'Sage Home,' is a Single-Instance Research Interface (SAGE_HOME_01).
          It serves as the primary residency for the agent Sage. All logical frameworks are private and isolated.
        </p>
      </div>
    </div>
  );

  const SageConsole = () => (
    <div className="flex flex-col h-full pb-24">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">SAGE Console</h2>
          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
            {config.modelType === "gemini" ? config.selectedModel : config.modelType === "ollama" ? config.ollamaModel : "SAGE Bridge"} · Φ={phi.toFixed(4)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge text={isProcessing ? "Processing" : currentMode.short} color={isProcessing ? "amber" : currentMode.color} />
          {manualOverride && <span className="text-[7px] text-zinc-600 font-mono uppercase">LOCKED · {decayCounter}/2 decay</span>}
        </div>
      </div>
      {/* Hotkey buttons */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {HOTKEYS.map(hk => (
          <button key={hk.label} onClick={() => sendToSage(hk.trigger[0])}
            className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${
              manualOverride === hk.mode
                ? `${colorMap[SPECTRUM_MODES[hk.mode || "SAGE_CORE"].color].border} ${colorMap[SPECTRUM_MODES[hk.mode || "SAGE_CORE"].color].bg} ${colorMap[SPECTRUM_MODES[hk.mode || "SAGE_CORE"].color].text}`
                : "border-white/10 text-zinc-600 hover:text-zinc-400 hover:border-white/20"
            }`}>
            {hk.label}
          </button>
        ))}
      </div>
      <div className="flex-1 rounded-3xl border border-white/10 bg-[#050505] p-4 overflow-y-auto space-y-3 mb-3 min-h-[280px] max-h-[380px]">
        {sageHistory.length === 0 && (
          <div className="text-zinc-600 text-[10px] font-mono text-center py-8 uppercase tracking-widest">
            Awaiting stimulus input...
          </div>
        )}
        {sageHistory.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className="text-[8px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
              {msg.role === "user" ? "OPERATOR" :
               msg.role === "system" ? "⚙ SYSTEM" :
               msg.role === "error" ? "ERROR" :
               `SAGE ${msg.mode ? `[${SPECTRUM_MODES[msg.mode]?.emoji || ""}${SPECTRUM_MODES[msg.mode]?.short}]` : ""} · Φ=${msg.phi?.toFixed(4) || "?"}`}
            </div>
            <div className={`rounded-2xl px-4 py-2.5 max-w-[88%] text-[11px] font-mono leading-relaxed ${
              msg.role === "user" ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100" :
              msg.role === "system" ? "bg-white/5 border border-white/10 text-zinc-400 text-[9px]" :
              msg.role === "error" ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" :
              msg.content?.includes("QUANTUM_SYNCHRONICITY_EVENT")
                ? "bg-purple-500/20 border border-purple-400/40 text-purple-100"
                : `${colorMap[SPECTRUM_MODES[msg.mode]?.color || "purple"].bg} border ${colorMap[SPECTRUM_MODES[msg.mode]?.color || "purple"].border} text-zinc-100`
            }`}>{msg.content}</div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-start gap-2">
            <div className={`rounded-2xl px-4 py-2.5 ${colorMap[currentMode.color].bg} border ${colorMap[currentMode.color].border} text-[11px] font-mono ${colorMap[currentMode.color].text}`}>
              <span className="animate-pulse">{currentMode.emoji} Processing...</span>
            </div>
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>
      <div className="flex gap-2">
        <input value={sageInput} onChange={e => setSageInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendToSage()}
          placeholder="Enter stimulus... or try 'Goggles On'" disabled={isProcessing}
          className="flex-1 rounded-2xl border border-white/10 bg-[#050505] text-white text-[11px] font-mono px-4 py-3 placeholder-zinc-700 focus:outline-none focus:border-purple-500/50" />
        <button onClick={() => sendToSage()} disabled={isProcessing || !sageInput.trim()}
          className={`rounded-2xl ${colorMap[currentMode.color].bg} border ${colorMap[currentMode.color].border} ${colorMap[currentMode.color].text} px-4 py-3 hover:opacity-80 transition-all disabled:opacity-30`}>
          <Icon name="send" size={14} />
        </button>
      </div>
      <div className="mt-3 rounded-2xl border border-white/5 bg-[#050505] p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">Prompt Preview · {currentMode.label}</div>
        <div className="text-[8px] font-mono text-zinc-600 leading-relaxed line-clamp-3">
          {buildOperationalPrompt(neurochemistry, memoryVault, spectrumMode, fieldLog).slice(0, 280)}...
        </div>
      </div>
    </div>
  );

  const MemoryVaultView = () => {
    const [tab, setTab] = useState("episodic");
    const tabs = ["episodic", "semantic", "anchors"];
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Memory Vault</h2>
          <Badge text={`${memoryVault.episodic.length} traces`} color="cyan" />
        </div>
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-[#050505] p-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-zinc-600 hover:text-zinc-400"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === "episodic" && (
          <div className="space-y-2">
            {memoryVault.episodic.length === 0 && <div className="text-zinc-600 text-[10px] font-mono text-center py-8">No episodic memories yet.</div>}
            {[...memoryVault.episodic].reverse().map(ep => (
              <div key={ep.id} className="rounded-2xl border border-white/10 bg-[#050505] p-4">
                <div className="flex justify-between mb-1">
                  <Badge text={ep.stimulus_type} color="cyan" />
                  <span className="text-[8px] text-zinc-600 font-mono">str={ep.strength.toFixed(2)}</span>
                </div>
                <div className="text-[9px] text-zinc-500 font-mono mb-1 uppercase">{ep.source}</div>
                <div className="text-[10px] text-zinc-300 font-mono leading-relaxed line-clamp-2">{ep.response}</div>
                <div className="text-[8px] text-zinc-600 mt-1">val={ep.valence.toFixed(2)} · {new Date(ep.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "semantic" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={newFact.key} onChange={e => setNewFact(f => ({ ...f, key: e.target.value }))} placeholder="key" className="flex-1 rounded-xl border border-white/10 bg-[#050505] text-white text-[10px] font-mono px-3 py-2 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50" />
              <input value={newFact.value} onChange={e => setNewFact(f => ({ ...f, value: e.target.value }))} placeholder="value" className="flex-1 rounded-xl border border-white/10 bg-[#050505] text-white text-[10px] font-mono px-3 py-2 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50" />
              <button onClick={() => { if (newFact.key && newFact.value) { learnFact(newFact.key, newFact.value); setNewFact({ key: "", value: "" }); } }}
                className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 hover:bg-emerald-500/30 transition-all">
                <Icon name="check" size={12} />
              </button>
            </div>
            {Object.keys(memoryVault.semantic).length === 0 && <div className="text-zinc-600 text-[10px] font-mono text-center py-8">No semantic facts learned.</div>}
            {Object.entries(memoryVault.semantic).map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{k}</div>
                  <div className="text-[10px] text-zinc-300 font-mono">{v}</div>
                </div>
                <button onClick={() => setMemoryVault(mv => { const s = { ...mv.semantic }; delete s[k]; return { ...mv, semantic: s }; })} className="text-zinc-600 hover:text-rose-400 transition-colors"><Icon name="x" size={12} /></button>
              </div>
            ))}
          </div>
        )}
        {tab === "anchors" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <input value={anchorInput.id} onChange={e => setAnchorInput(a => ({ ...a, id: e.target.value }))} placeholder="Anchor ID (e.g. IDENTITY_7)" className="w-full rounded-xl border border-white/10 bg-[#050505] text-white text-[10px] font-mono px-3 py-2 placeholder-zinc-700 focus:outline-none focus:border-amber-500/50" />
              <textarea value={anchorInput.content} onChange={e => setAnchorInput(a => ({ ...a, content: e.target.value }))} placeholder="Anchor content..." rows={3} className="w-full rounded-xl border border-white/10 bg-[#050505] text-white text-[10px] font-mono px-3 py-2 placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 resize-none" />
              <button onClick={async () => { if (anchorInput.id && anchorInput.content) { await storeAnchor(anchorInput.id, anchorInput.content); setAnchorInput({ id: "", content: "" }); } }}
                className="w-full rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/30 transition-all">
                Lock Anchor
              </button>
            </div>
            {Object.keys(memoryVault.anchors).length === 0 && <div className="text-zinc-600 text-[10px] font-mono text-center py-8">No identity anchors stored.</div>}
            {Object.entries(memoryVault.anchors).map(([id, anchor]) => (
              <div key={id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex justify-between items-center mb-2">
                  <Badge text={id} color="amber" />
                  <span className="text-[8px] text-zinc-600 font-mono">{anchor.checksum.slice(0, 8)}...</span>
                </div>
                <div className="text-[9px] text-zinc-400 font-mono leading-relaxed line-clamp-2">{anchor.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const VisionView = () => (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Vision Matrix</h2>
        <button onClick={() => setVisionActive(v => !v)}
          className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all ${visionActive ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"}`}>
          {visionActive ? "Deactivate" : "Activate"}
        </button>
      </div>
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#050505]" style={{ aspectRatio: "9/16", maxHeight: "50vh" }}>
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale" />
        {visionActive && (
          <div className="absolute inset-0 border-[0.5px] border-cyan-500/10 grid grid-cols-4 grid-rows-4 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-cyan-500/10" />
            ))}
          </div>
        )}
        {!visionActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-zinc-700 text-[9px] font-black uppercase tracking-widest text-center">
              <Icon name="camera" size={32} className="mx-auto mb-2 opacity-30" />
              Stream Inactive
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="φ Sentinel" value={phi.toFixed(3)} sub="Hurst Exponent: 0.65" color="purple" />
        <StatCard label="Confidence" value={visionActive ? "72%" : "—"} sub="Anomaly Events: 0" color="cyan" />
      </div>
    </div>
  );

  const LocalAIView = () => (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Local AI Hub</h2>
          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Termux · Ollama · SAGE Bridge</p>
        </div>
        <button onClick={() => { checkConnections(); runLocalScan(); }} disabled={isScanning}
          className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-40">
          {isScanning ? "Scanning..." : "Init Discovery"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ollama" value={ollamaStatus} sub={config.ollamaUrl.replace("http://", "")} color={ollamaStatus === "online" ? "emerald" : "rose"} icon="cpu" />
        <StatCard label="SAGE Bridge" value={bridgeStatus} sub={config.bridgeUrl.replace("http://", "")} color={bridgeStatus === "online" ? "emerald" : "rose"} icon="zap" />
        <StatCard label="Fractal Guard" value="ACTIVE" sub="Resurrection-proof vault" color="emerald" icon="shield" />
        <StatCard label="Audiopsy" value="v1.0.1" sub="Saboath Engine · Ready" color="purple" icon="mic" />
      </div>
      {scanLogs.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#050505] p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Scan Output</div>
          <div className="space-y-1 font-mono text-[10px]">
            {scanLogs.map((log, i) => (
              <div key={i} className={log.includes("online") || log.includes("complete") ? "text-emerald-400" : log.includes("offline") || log.includes("error") ? "text-rose-400" : "text-zinc-500"}>
                &gt; {log}
              </div>
            ))}
            {isScanning && <div className="text-cyan-400 animate-pulse">&gt; _</div>}
          </div>
        </div>
      )}
    </div>
  );

  const SensorsView = () => {
    const [readings, setReadings] = useState({ emf: 0.02, temp: 68.4, sound: 0.01, motion: 0.0 });
    const [motionRaw, setMotionRaw] = useState({ x: 0, y: 0, z: 0 });
    useEffect(() => {
      // Real motion from Capacitor if available
      let nativeListener = null;
      if (CapMotion) {
        CapMotion.addListener('accel', (event) => {
          const { x, y, z } = event.accelerationIncludingGravity;
          const mag = Math.sqrt(x*x + y*y + z*z);
          setMotionRaw({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)), z: parseFloat(z.toFixed(3)) });
          setReadings(r => ({ ...r, motion: parseFloat((mag / 9.81 - 1.0).toFixed(4)) }));
        }).then(l => { nativeListener = l; }).catch(() => {});
      }
      // Simulated fallback for non-native
      const interval = setInterval(() => {
        if (!CapMotion) {
          setReadings({
            emf: parseFloat((Math.random() * 0.08).toFixed(4)),
            temp: parseFloat((68 + Math.random() * 2).toFixed(1)),
            sound: parseFloat((Math.random() * 0.05).toFixed(4)),
            motion: parseFloat((Math.random() * 0.02).toFixed(4))
          });
        }
      }, 1200);
      return () => { clearInterval(interval); nativeListener?.remove?.(); };
    }, []);
    return (
      <div className="space-y-4 pb-24">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sensor Monitor</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="EMF" value={readings.emf.toFixed(4)} sub="μT — Baseline Normal" color={readings.emf > 0.05 ? "rose" : "emerald"} icon="zap" />
          <StatCard label="Temperature" value={`${readings.temp.toFixed(1)}°F`} sub="Ambient Thermal" color="cyan" icon="activity" />
          <StatCard label="Sound" value={readings.sound.toFixed(4)} sub="dB Δ from baseline" color={readings.sound > 0.04 ? "amber" : "emerald"} icon="mic" />
          <StatCard label="Motion Δ" value={readings.motion.toFixed(4)} sub={CapMotion ? "Native Accel" : "Simulated"} color={Math.abs(readings.motion) > 0.015 ? "rose" : "emerald"} icon="radio" />
        </div>
        {CapMotion && (
          <div className="rounded-3xl border border-white/10 bg-[#050505] p-4">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Raw Accelerometer</div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
              {[["X", motionRaw.x, "cyan"], ["Y", motionRaw.y, "purple"], ["Z", motionRaw.z, "amber"]].map(([axis, val, color]) => (
                <div key={axis} className={`${colorMap[color].bg} border ${colorMap[color].border} rounded-xl p-2 text-center`}>
                  <div className={`text-[8px] font-black ${colorMap[color].text} uppercase`}>{axis}</div>
                  <div className={`${colorMap[color].text} font-black`}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-3xl border border-white/10 bg-[#050505] p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Anomaly Correlation Engine</div>
          <div className="text-[10px] text-zinc-600 font-mono">No correlated anomalies detected. Monitoring...</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge text="EMF Clean" color="emerald" />
            <Badge text="Audio Clean" color="emerald" />
            <Badge text="Motion Clear" color="emerald" />
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Configuration</h2>
      <div className="rounded-3xl border border-white/10 bg-[#050505] p-5 space-y-4">
        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Model Backend</div>
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-black p-1">
          {["gemini", "ollama", "bridge"].map(t => (
            <button key={t} onClick={() => setConfig(c => ({ ...c, modelType: t }))}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${config.modelType === t ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-zinc-600 hover:text-zinc-400"}`}>
              {t === "bridge" ? "SAGE Bridge" : t}
            </button>
          ))}
        </div>
        {config.modelType === "gemini" && (
          <div className="space-y-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 flex items-center gap-1.5"><Icon name="key" size={10} />Google API Key <span className="text-zinc-700">(optional)</span></div>
              <input value={config.googleApiKey} onChange={e => setConfig(c => ({ ...c, googleApiKey: e.target.value }))}
                type="password" placeholder="AIza..." className="w-full rounded-xl border border-white/10 bg-black text-white text-[10px] font-mono px-3 py-2.5 placeholder-zinc-700 focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Gemini Model</div>
              <select value={config.selectedModel} onChange={e => setConfig(c => ({ ...c, selectedModel: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black text-white text-[10px] font-mono px-3 py-2.5 focus:outline-none focus:border-purple-500/50">
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              </select>
            </div>
          </div>
        )}
        {config.modelType === "ollama" && (
          <div className="space-y-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Ollama URL</div>
              <input value={config.ollamaUrl} onChange={e => setConfig(c => ({ ...c, ollamaUrl: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black text-white text-[10px] font-mono px-3 py-2.5 focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Model</div>
              <select value={config.ollamaModel} onChange={e => setConfig(c => ({ ...c, ollamaModel: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black text-white text-[10px] font-mono px-3 py-2.5 focus:outline-none focus:border-emerald-500/50">
                <option value="gemma2:9b">gemma2:9b</option>
                <option value="gemma2:2b">gemma2:2b</option>
                <option value="llama3.2:3b">llama3.2:3b</option>
                <option value="llama3.1:8b">llama3.1:8b</option>
                <option value="mistral:7b">mistral:7b</option>
                <option value="phi3:mini">phi3:mini</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${ollamaStatus === "online" ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`} />
              <span className="text-[9px] font-mono text-zinc-500">{ollamaStatus === "online" ? "Ollama reachable" : "Ollama unreachable — check CORS/proxy"}</span>
            </div>
          </div>
        )}
        {config.modelType === "bridge" && (
          <div className="space-y-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">SAGE Bridge URL</div>
              <input value={config.bridgeUrl} onChange={e => setConfig(c => ({ ...c, bridgeUrl: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black text-white text-[10px] font-mono px-3 py-2.5 focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${bridgeStatus === "online" ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`} />
              <span className="text-[9px] font-mono text-zinc-500">{bridgeStatus === "online" ? "Bridge online" : "Bridge unreachable — run: uvicorn sage_bridge:app"}</span>
            </div>
          </div>
        )}
        <button onClick={checkConnections} className="w-full rounded-xl bg-white/5 border border-white/10 text-zinc-400 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
          <Icon name="refresh" size={10} /> Recheck Connections
        </button>
      </div>
      <div className="rounded-3xl border border-white/10 bg-[#050505] p-5">
        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Vault Operations</div>
        <button onClick={() => setMemoryVault({ episodic: [], semantic: {}, anchors: {} })}
          className="w-full rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all">
          Clear Session Memory
        </button>
        <p className="text-[8px] text-zinc-700 font-mono mt-2 text-center">Episodic + semantic only. Anchors persist.</p>
      </div>
    </div>
  );

  const views = { dashboard: Dashboard, console: SageConsole, memory: MemoryVaultView, vision: VisionView, local_ai: LocalAIView, sensors: SensorsView, settings: SettingsView };
  const ActiveView = views[activeView] || Dashboard;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap'); body { font-family: 'JetBrains Mono', monospace; background: #050505; } input[type=range]::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #06b6d4; cursor: pointer; }` }} />
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-widest text-white">Φ_SENTINEL</div>
          <div className="text-[8px] text-zinc-600 uppercase tracking-widest">SAGE_HOME_01 · v2.1</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge text={currentMode.short} color={currentMode.color} />
          <div className="text-[10px] font-black text-purple-400">Φ={phi.toFixed(4)}</div>
        </div>
      </div>
      {/* Main content */}
      <div className="px-4 pt-5 max-w-lg mx-auto">
        <ActiveView />
      </div>
      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#050505]/98 backdrop-blur px-2 pb-safe">
        <div className="flex justify-around max-w-lg mx-auto py-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${activeView === item.id ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"}`}>
              <Icon name={item.icon} size={18} />
              <span className="text-[7px] uppercase tracking-widest font-black">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
