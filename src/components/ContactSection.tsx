"use client";

import { useState } from "react";
import { apiSendContactMessage } from "../lib/api";

const CATEGORIES = [
    { value: "idea", label: "💡 Share an Idea", desc: "Suggest a new feature" },
    { value: "bug", label: "🐛 Report a Bug", desc: "Something's not working" },
    { value: "feedback", label: "⭐ Give Feedback", desc: "Tell me what you think" },
    { value: "other", label: "💬 Just Say Hi", desc: "General message" },
];

export default function ContactSection() {
    const [form, setForm] = useState({ name: "", email: "", category: "idea", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setError(null);

        try {
            const result = await apiSendContactMessage(form);
            
            if (result.success) {
                setStatus("success");
                setTimeout(() => {
                    setStatus("idle");
                    setForm({ name: "", email: "", category: "idea", subject: "", message: "" });
                }, 5000);
            } else {
                setError(result.error || "Failed to send message.");
                setStatus("error");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setStatus("error");
        }
    };

    const inputClass = (field: string) =>
        `w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-300 border-2
    ${focusedField === field
            ? "border-red-400 bg-white shadow-[0_0_0_4px_rgba(220,38,38,0.1)]"
            : "border-red-100 bg-red-50 hover:border-red-200"
        }`;

    return (
        <section className="py-16 px-4" id="contact">
            {/* ── Background decorations ── */}
            <div className="relative max-w-6xl mx-auto">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

                {/* ── Section Header ── */}
                <div className="text-center mb-12 relative">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                        style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--border)" }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Get in Touch
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
                        💬 We&rsquo;d Love to{" "}
                        <span className="gradient-text">Hear From You</span>
                    </h2>
                    <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
                        Have an idea to improve the summarizer? Found a bug? Or just want to say hi?
                        Drop us a message below!
                    </p>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">

                    {/* ── Left: Info cards ── */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {[
                            {
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                ),
                                title: "Share Ideas",
                                desc: "Your feature ideas help shape the future of this app. Every suggestion counts!"
                            },
                            {
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: "Report Issues",
                                desc: "Spotted a bug? Let us know and we'll squash it fast!"
                            },
                            {
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                ),
                                title: "Give Feedback",
                                desc: "Tell us what you love, and what we can do better for you."
                            }
                        ].map((item, i) => (
                            <div key={i} className="glass-card p-5 flex items-start gap-4 hover:scale-[1.01] transition-transform">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}

                        {/* Social / contact info blurb */}
                        <div className="glass-card p-5 mt-auto">
                            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Typically responds within</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>24 hours ⚡</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Form ── */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-6 sm:p-8">
                            {status === "success" ? (
                                /* ── Success State ── */
                                <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                                        style={{ background: "var(--accent-soft)" }}>
                                        <svg className="w-10 h-10" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                        Thank you for reaching out. We&rsquo;ll get back to you as soon as possible!
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {status === "error" && (
                                        <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 text-sm font-medium animate-fade-in">
                                            {error}
                                        </div>
                                    )}
                                    {/* Name + Email */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>
                                                Your Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Sachin"
                                                value={form.name}
                                                onChange={(e) => update("name", e.target.value)}
                                                onFocus={() => setFocusedField("name")}
                                                onBlur={() => setFocusedField(null)}
                                                className={inputClass("name")}
                                                style={{ color: "var(--text-primary)" }}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>
                                                Email Address <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="you@example.com"
                                                value={form.email}
                                                onChange={(e) => update("email", e.target.value)}
                                                onFocus={() => setFocusedField("email")}
                                                onBlur={() => setFocusedField(null)}
                                                className={inputClass("email")}
                                                style={{ color: "var(--text-primary)" }}
                                            />
                                        </div>
                                    </div>

                                    {/* Category selector */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>
                                            What&rsquo;s this about?
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => update("category", cat.value)}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${form.category === cat.value
                                                            ? "border-red-400 bg-red-50 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                                                            : "border-red-100 bg-red-50/50 hover:border-red-200"
                                                        }`}
                                                >
                                                    <div className="text-sm font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                                                        {cat.label}
                                                    </div>
                                                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                        {cat.desc}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Brief title for your message..."
                                            value={form.subject}
                                            onChange={(e) => update("subject", e.target.value)}
                                            onFocus={() => setFocusedField("subject")}
                                            onBlur={() => setFocusedField(null)}
                                            className={inputClass("subject")}
                                            style={{ color: "var(--text-primary)" }}
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>
                                            Your Message <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="Tell us your idea, report a bug, or just say hello! We love hearing from our users..."
                                            value={form.message}
                                            onChange={(e) => update("message", e.target.value)}
                                            onFocus={() => setFocusedField("message")}
                                            onBlur={() => setFocusedField(null)}
                                            className={`${inputClass("message")} resize-none`}
                                            style={{ color: "var(--text-primary)" }}
                                        />
                                        <div className="text-right text-xs" style={{ color: "var(--text-muted)" }}>
                                            {form.message.length} characters
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5 text-base"
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <div className="spinner" />
                                                Sending Message...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Send Message
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                                        We respect your privacy. Your information is never shared with third parties.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
