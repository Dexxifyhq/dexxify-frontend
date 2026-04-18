import { Shield, Lock, Link2, FileSearch, AlertTriangle, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SecurityFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const SECURITY_FEATURES: SecurityFeature[] = [
  { icon: Shield, title: "Data Privacy First", desc: "All user data processed following global privacy standards including GDPR and Nigerian NDPR." },
  { icon: Lock, title: "Secure by Default", desc: "AES-256 encryption, TLS 1.3 and OAuth 2.0 on every endpoint. No exceptions." },
  { icon: Link2, title: "On-Chain Proof", desc: "Every settlement is verifiable directly on the blockchain. Full transparency, no trust required." },
  { icon: FileSearch, title: "Compliance", desc: "Built-in AML screening on every transaction. We handle the compliance burden so you don't have to." },
  { icon: AlertTriangle, title: "Fraud Detection", desc: "Real-time anomaly detection and transaction monitoring flags suspicious activity before it causes damage." },
  { icon: Activity, title: "Continuous Monitoring", desc: "24/7 automated threat detection with full audit logs and incident response procedures." },
];

const STATUS_ITEMS = [
  { label: "API Gateway", status: "Active" },
  { label: "Webhook Delivery", status: "Active" },
  { label: "Transaction Screen", status: "Active" },
  { label: "Fraud Engine", status: "Active" },
];

export default function TrustSecurity() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-border bg-card text-xs text-muted px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            Security
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            A payment engine you can trust.
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
            Enterprise-grade security built into every transaction. AML, fraud detection and compliance — handled.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {SECURITY_FEATURES.map((f) => (
            <div
              key={f.title}
              className="security-card bg-card border border-border rounded-xl p-6 hover:border-success/15 transition-colors duration-300 group"
            >
              <div className="w-9 h-9 rounded-lg bg-deeper border border-border flex items-center justify-center mb-4 group-hover:border-success/20 transition-colors duration-300">
                <f.icon size={16} className="text-success" />
              </div>
              <h3 className="text-foreground font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Status widget */}
        <div className="max-w-lg mx-auto">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted">System Status</span>
              <span className="text-xs text-success">All systems operational</span>
            </div>
            <div className="p-4 space-y-3">
              {STATUS_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
                    <span className="text-xs text-success">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
