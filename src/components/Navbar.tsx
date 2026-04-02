"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";
import EditProfileModal from "./EditProfileModal";

interface NavbarProps {
    isLoggedIn: boolean;
    onLoginSuccess: (email: string) => void;
    onLogout: () => void;
}

export default function Navbar({ isLoggedIn, onLoginSuccess, onLogout }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [userName, setUserName] = useState("User");
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const openAuth = (mode: "signin" | "signup") => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    return (
        <nav className="header-gradient sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{
                                background: "linear-gradient(135deg, #dc2626, #ef4444)",
                                boxShadow: "0 2px 12px rgba(220, 38, 38, 0.3)",
                            }}
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold gradient-text">AI Text Summarizer</h1>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Powered by 🤗 Transformers
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/history" className="btn-secondary flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Dashboard
                        </Link>

                        <Link href="#team" className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors px-2">
                            Team
                        </Link>

                        <div className="h-6 w-px bg-red-200 mx-2" />

                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                                        {userPhoto ? (
                                            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            userName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isProfileMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                                            <div className="px-4 py-2 border-b border-gray-50">
                                                <p className="text-sm font-medium text-gray-900 truncate">My Account</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsProfileMenuOpen(false);
                                                    setIsEditProfileOpen(true);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Settings
                                            </button>
                                            <div className="border-t border-gray-50 mt-1 pt-1">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileMenuOpen(false);
                                                        onLogout();
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Log Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => openAuth("signin")} className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>Log In</button>
                        )}

                        <span className="word-badge">
                            <span className="status-dot" />
                            Ready
                        </span>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <span className="word-badge">
                            <span className="status-dot" />
                            Ready
                        </span>
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 border border-red-100"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 animate-fade-in glass-card p-4 space-y-3 bg-white/90 backdrop-blur-md">
                        <Link
                            href="/history"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-gray-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Dashboard
                        </Link>

                        <Link
                            href="#team"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-gray-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Team
                        </Link>

                        <div className="h-px bg-red-100 my-2" />

                        {isLoggedIn ? (
                            <div className="space-y-1">
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsEditProfileOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Settings
                                </button>
                                <div className="h-px bg-red-100 my-2" />
                                <button
                                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600"
                                >
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2">
                                <button
                                    onClick={() => { openAuth("signin"); setIsMobileMenuOpen(false); }}
                                    className="btn-primary w-full"
                                    style={{ padding: "10px", fontSize: "0.85rem" }}
                                >
                                    Log In
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
                onSuccess={onLoginSuccess}
            />

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                currentName={userName}
                onSave={(newName, newPhoto) => {
                    setUserName(newName);
                    setUserPhoto(newPhoto);
                }}
            />
        </nav>
    );
}
