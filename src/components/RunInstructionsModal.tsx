import React, { useState } from 'react';
import {
  Laptop,
  Smartphone,
  Server,
  Database,
  Terminal,
  FolderTree,
  Check,
  Copy,
  X,
  FileCode,
} from 'lucide-react';

interface RunInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunInstructionsModal: React.FC<RunInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0F1420] border border-amber-500/40 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                How to Run TireGuard AI Locally & on Mobile
              </h3>
              <p className="text-xs text-slate-400">
                Complete deployment manual, folder architecture, and local network guide.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Running on Laptop / Desktop */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Laptop className="w-4 h-4" />
            <span>1. Running on Your Laptop / PC</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono space-y-3">
            <div>
              <span className="text-slate-400"># Step 1: Clone or extract project repository</span>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded mt-1 text-slate-100">
                <code>cd terrahaul-operations</code>
                <button
                  onClick={() => copyToClipboard('cd terrahaul-operations', 1)}
                  className="text-slate-400 hover:text-amber-400"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400"># Step 2: Install dependencies</span>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded mt-1 text-slate-100">
                <code>npm install</code>
                <button
                  onClick={() => copyToClipboard('npm install', 2)}
                  className="text-slate-400 hover:text-amber-400"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400"># Step 3: Start full-stack server (Express backend + Vite)</span>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded mt-1 text-slate-100">
                <code>npm run dev</code>
                <button
                  onClick={() => copyToClipboard('npm run dev', 3)}
                  className="text-slate-400 hover:text-amber-400"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400"># Step 4: Open your browser</span>
              <div className="text-emerald-400 p-2 bg-slate-900 rounded mt-1">
                http://localhost:3000
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Accessing from Mobile Phone */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
            <Smartphone className="w-4 h-4" />
            <span>2. Testing on Your Mobile Phone (Same Wi-Fi)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Because TerraHaul runs with <code>--host=0.0.0.0</code> on port 3000, you can instantly test the mobile responsive UI on your smartphone:
          </p>

          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <li>Ensure your mobile phone and laptop are connected to the <strong>same Wi-Fi network</strong>.</li>
            <li>
              Find your laptop&apos;s local IP address:
              <ul className="list-disc list-inside ml-4 mt-1 font-mono text-amber-300">
                <li>Windows: <code>ipconfig</code> (look for IPv4, e.g., <code>192.168.1.45</code>)</li>
                <li>macOS / Linux: <code>ifconfig</code> or <code>ip a</code></li>
              </ul>
            </li>
            <li>
              Open mobile browser (Chrome/Safari) and navigate to:
              <div className="font-mono text-emerald-400 bg-slate-900 p-2 rounded mt-1">
                http://&lt;YOUR_LAPTOP_IP&gt;:3000 (e.g. http://192.168.1.45:3000)
              </div>
            </li>
            <li>Enjoy full responsive mobile touch controls, live telematics cards, and dispatch controls!</li>
          </ol>
        </div>

        {/* Section 3: Architecture & Database Details */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Database className="w-4 h-4" />
            <span>3. Database & Backend Architecture</span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p>
              • <strong>Backend:</strong> Node.js + Express REST API running on port 3000 in <code>server.ts</code>.
            </p>
            <p>
              • <strong>Database:</strong> Persistent JSON / SQLite schema engine in <code>src/backend/db.ts</code> with atomic disk writes to <code>data/terradb.json</code>, plus complete SQL tables script in <code>src/backend/schema.sql</code>.
            </p>
            <p>
              • <strong>Pre-seeded Data:</strong> Includes realistic ultra-class dump trucks (CAT 797F, Komatsu 930E, Liebherr T 284), pit shovel locations, live safety alerts, and demonstration accounts.
            </p>
          </div>
        </div>

        {/* Section 4: Folder Structure */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>4. Complete Project Directory Structure</span>
          </div>

          <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
{`terrahaul-operations/
├── server.ts                    # Full-Stack Express Server & Vite dev middlewares
├── package.json                 # Dependencies & full-stack scripts
├── tsconfig.json                # TypeScript compilation config
├── vite.config.ts               # Vite configuration
├── index.html                   # HTML entry point with fonts & metadata
├── data/
│   └── terradb.json             # Persistent file database store
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # Application routing & page lifecycle
│   ├── types.ts                 # Dumper truck, telematics & user domain interfaces
│   ├── index.css                # Tailwind CSS v4 custom theme styles
│   ├── assets/
│   │   └── dumper-truck-bg.svg  # High-res mining dumper truck visual asset
│   ├── backend/
│   │   ├── db.ts                # Database manager (Users, Trucks, Alerts, Dispatches)
│   │   └── schema.sql           # SQLite / PostgreSQL standard schema
│   ├── services/
│   │   └── api.ts               # Frontend API client with CRUD endpoints
│   └── components/
│       ├── Navbar.tsx           # Industrial 3-zone top navigation bar
│       ├── DumperBackground.tsx # Heavy CSS blurred dumper truck backdrop
│       ├── LandingPage.tsx      # Demo & interactive haul cycle simulator
│       ├── AuthPage.tsx         # Personnel registration & sign in console
│       ├── Dashboard.tsx        # Main operations dashboard with telemetry
│       └── RunInstructionsModal.tsx # Setup manual & mobile guide`}
          </pre>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
