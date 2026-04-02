"use client";

import { useState, useEffect } from "react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string) => void;
    initialMode?: "signin" | "signup";
}

const COUNTRY_CODES = [
    { code: "+1", country: "US/CA" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "IN" },
    { code: "+61", country: "AU" },
    { code: "+86", country: "CN" },
    { code: "+49", country: "DE" },
    { code: "+33", country: "FR" },
    { code: "+81", country: "JP" },
    { code: "+55", country: "BR" },
    { code: "+7", country: "RU" },
    { code: "+971", country: "AE" },
    { code: "+966", country: "SA" },
    { code: "+27", country: "ZA" },
    { code: "+82", country: "KR" },
    { code: "+39", country: "IT" },
    { code: "+34", country: "ES" },
    { code: "+52", country: "MX" },
    { code: "+62", country: "ID" },
    { code: "+60", country: "MY" },
    { code: "+65", country: "SG" },
    { code: "+63", country: "PH" },
    { code: "+64", country: "NZ" },
];

const MOCK_GOOGLE_ACCOUNTS = [
    { name: "John Doe", email: "johndoe@gmail.com", avatar: "J" },
    { name: "Jane Smith", email: "janesmith@googlemail.com", avatar: "J" },
    { name: "Design Agency", email: "hello@designagency.co", avatar: "D" },
];

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "signin" }: AuthModalProps) {
    const [step, setStep] = useState<"options" | "email" | "phone" | "google" | "google_add_account">("options");
    const [mode, setMode] = useState<"signin" | "signup">(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [googleEmail, setGoogleEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep("options");
            setMode(initialMode);
            setGoogleEmail("");
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onSuccess(email);
            onClose();
        }, 1500);
    };

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onSuccess(`${countryCode} ${phoneNumber}`);
            onClose();
        }, 1500);
    };

    const handleGoogleAccountSelect = (selectedEmail: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onSuccess(selectedEmail);
            onClose();
        }, 1500);
    };

    const handleGoogleAddAccountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onSuccess(googleEmail);
            onClose();
        }, 1500);
    };

    const handleBackClick = () => {
        if (step === "google_add_account") {
            setStep("google");
        } else {
            setStep("options");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div
                className="glass-card w-full max-w-md overflow-hidden relative border-red-100 shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {step !== "options" && (
                    <button
                        onClick={handleBackClick}
                        className="absolute top-4 left-4 p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors z-10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div
                            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #dc2626, #ef4444)",
                                boxShadow: "0 4px 15px rgba(220, 38, 38, 0.3)",
                            }}
                        >
                            {step === "google" || step === "google_add_account" ? (
                                <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.06c-.22-.66-.35-1.36-.35-2.06s.13-1.4.35-2.06V7.1H2.18C1.43 8.6 1 10.25 1 12s.43 3.4 1.18 4.9l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.84c.87-2.6 3.3-4.56 6.16-4.56z" fill="#EA4335" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold gradient-text">
                            {step === "options" ? "Welcome" : step === "email" ? (mode === "signin" ? "Sign In" : "Create Account") : step === "google" || step === "google_add_account" ? "Sign in with Google" : "Continue with Phone"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {step === "options"
                                ? "Choose how you would like to continue"
                                : step === "email"
                                    ? (mode === "signin" ? "Sign in to access your summaries" : "Join us to save and manage your summaries")
                                    : step === "google"
                                        ? "Choose an account to continue"
                                        : step === "google_add_account"
                                            ? "Enter your Google email to continue"
                                            : "Enter your phone number to receive a code"}
                        </p>
                    </div>

                    {step === "options" && (
                        <div className="space-y-3.5 animate-fade-in">
                            <button
                                onClick={() => setStep("phone")}
                                disabled={isLoading}
                                className="w-full relative flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700 font-semibold"
                            >
                                <svg className="w-5 h-5 absolute left-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Continue with Phone Number
                            </button>

                            <button
                                onClick={() => setStep("google")}
                                disabled={isLoading}
                                className="w-full relative flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700 font-semibold"
                            >
                                <svg className="w-5 h-5 absolute left-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.06c-.22-.66-.35-1.36-.35-2.06s.13-1.4.35-2.06V7.1H2.18C1.43 8.6 1 10.25 1 12s.43 3.4 1.18 4.9l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.84c.87-2.6 3.3-4.56 6.16-4.56z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                onClick={() => setStep("email")}
                                disabled={isLoading}
                                className="w-full relative flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700 font-semibold"
                            >
                                <svg className="w-5 h-5 absolute left-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Continue with Email
                            </button>

                            {isLoading && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                                    <div className="spinner border-red-500/30 border-t-red-500" />
                                </div>
                            )}
                        </div>
                    )}

                    {step === "google" && (
                        <div className="space-y-3 animate-fade-in">
                            {MOCK_GOOGLE_ACCOUNTS.map((account, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleGoogleAccountSelect(account.email)}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                                        {account.avatar}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-semibold text-gray-800 truncate">{account.name}</div>
                                        <div className="text-sm text-gray-500 truncate">{account.email}</div>
                                    </div>
                                </button>
                            ))}

                            <div className="pt-2 border-t border-gray-100 mt-4">
                                <button
                                    onClick={() => setStep("google_add_account")}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div className="font-medium text-gray-700">Add another account</div>
                                </button>
                            </div>

                            {isLoading && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                                    <div className="spinner border-red-500/30 border-t-red-500" />
                                </div>
                            )}
                        </div>
                    )}

                    {step === "google_add_account" && (
                        <form onSubmit={handleGoogleAddAccountSubmit} className="space-y-5 animate-fade-in">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Email or phone</label>
                                <input
                                    type="text"
                                    required
                                    value={googleEmail}
                                    onChange={(e) => setGoogleEmail(e.target.value)}
                                    placeholder="Email or phone"
                                    className="input-area"
                                />
                            </div>
                            <div className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                                Forgot email?
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !googleEmail}
                                className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
                                style={{
                                    background: "linear-gradient(135deg, #1a73e8, #4285f4)",
                                    boxShadow: "0 4px 15px rgba(26, 115, 232, 0.3)",
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="spinner border-white/30 border-t-white" />
                                        Please wait...
                                    </>
                                ) : (
                                    "Next"
                                )}
                            </button>
                        </form>
                    )}

                    {step === "phone" && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-5 animate-fade-in">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Phone Number</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="input-area sm:w-1/3 appearance-none bg-white cursor-pointer"
                                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}
                                    >
                                        {COUNTRY_CODES.map((item) => (
                                            <option key={item.country + item.code} value={item.code}>
                                                {item.country} ({item.code})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="000-0000-000"
                                        className="input-area sm:w-2/3"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !phoneNumber}
                                className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="spinner border-white/30 border-t-white" />
                                        Please wait...
                                    </>
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </form>
                    )}

                    {step === "email" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-5 animate-fade-in">
                            {mode === "signup" && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="input-area"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-area"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-area"
                                />
                            </div>

                            {mode === "signin" && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-xs font-medium text-red-500 hover:text-red-600">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="spinner border-white/30 border-t-white" />
                                        Please wait...
                                    </>
                                ) : (
                                    mode === "signin" ? "Sign In" : "Sign Up"
                                )}
                            </button>

                            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
                                    <button
                                        type="button"
                                        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                                        className="ml-1.5 font-bold text-red-500 hover:text-red-700 underline-offset-4 hover:underline"
                                    >
                                        {mode === "signin" ? "Create Account" : "Sign In"}
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
