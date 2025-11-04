'use client';
import { useEffect, useState } from "react";

const nav = [
    {
        name: "Inicio",
        href: "/",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        name: "Sobre Mi",
        href: "#sobre-mi",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    },
    {
        name: "Proyectos",
        href: "/projects",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        )
    },
    {
        name: "Contacto",
        href: "/contact",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        )
    },
];

export default function Menu() {
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScroll(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const offset = targetElement.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }
    };

    return (
        <>
            {/* Desktop Header */}
            <header
                className={`hidden md:flex fixed left-1/4 w-[45%] items-center justify-center rounded-2xl z-50 px-6 py-3
                transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                ${scroll
                        ? "top-3 bg-gradient-to-r from-[#1F3C68]/95 to-[#9C2D32]/95 backdrop-blur-[20px] border border-[#1F3C68]/30 hover:border-[#9C2D32]/30 hover:shadow-[0_0_25px_rgba(156,45,50,0.25)]"
                        : "top-6 bg-transparent border border-transparent"
                    }`}
            >
                <nav className="flex items-center justify-center w-full">
                    {/* Logo */}
                    <div className="flex-shrink-0 mr-10">
                        <a
                            href="/"
                            className="text-2xl font-bold bg-gradient-to-r from-[#1F3C68] to-[#9C2D32] bg-clip-text text-transparent"
                        >
                            LOREL
                        </a>
                    </div>

                    {/* Links */}
                    <div className="flex items-center space-x-6">
                        {nav.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={(e) => handleSmoothScroll(e, item.href)}
                                className="relative px-4 py-2 rounded-xl text-lg font-semibold tracking-wide text-white/90
                                    transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                                    hover:text-[#9C2D32] hover:scale-[1.05]
                                    hover:shadow-[0_0_20px_rgba(156,45,50,0.4)]
                                    before:absolute before:inset-0 before:rounded-xl
                                    before:bg-[rgba(255,255,255,0.05)] before:backdrop-blur-[10px]
                                    before:opacity-0 hover:before:opacity-100
                                    before:transition-all before:duration-500"
                            >
                                <span className="relative z-10">{item.name}</span>
                            </a>
                        ))}
                    </div>
                </nav>
            </header>

            {/* Mobile Header */}
            <header className="md:hidden fixed left-2 right-2 w-auto rounded-2xl z-50 top-1.5 px-4 py-3 bg-transparent">
                <div className="flex justify-center">
                    <a href="/" className="text-xl font-bold bg-gradient-to-r from-[#1F3C68] to-[#9C2D32] bg-clip-text text-transparent">
                        LOREL
                    </a>
                </div>
            </header>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
                <div className="bg-[#1F3C68]/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#9C2D32]/40">
                    <div className="flex justify-around items-center py-3">
                        {nav.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={(e) => handleSmoothScroll(e, item.href)}
                                className="flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-[#9C2D32]/40 active:scale-95"
                            >
                                <div className="text-white/80 hover:text-[#9C2D32] transition-colors duration-300">
                                    {item.icon}
                                </div>
                                <span className="text-xs text-white/80 hover:text-[#9C2D32] font-medium">
                                    {item.name}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
}
