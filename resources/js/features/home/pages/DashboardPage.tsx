import React from "react";
import { ArrowRight, ShieldCheck, PanelsTopLeft, KeyRound } from "lucide-react";

type DashboardPageProps = {
    userName: string;
    onNavigate: (page: "roles" | "features" | "access") => void;
};

const shortcuts = [
    {
        title: "Manajemen Role",
        description: "Atur kelompok pengguna dan perannya di aplikasi.",
        page: "roles" as const,
        icon: ShieldCheck,
        label: "Kelola role",
    },
    {
        title: "Manajemen Fitur",
        description: "Kelola daftar fitur yang tersedia untuk diberikan ke role.",
        page: "features" as const,
        icon: PanelsTopLeft,
        label: "Kelola fitur",
    },
    {
        title: "Hak Akses",
        description: "Tentukan fitur yang dapat diakses oleh setiap role.",
        page: "access" as const,
        icon: KeyRound,
        label: "Atur hak akses",
    },
];

export default function DashboardPage({ userName, onNavigate }: DashboardPageProps) {
    return (
        <div className="home-page">
            <section className="home-welcome">
                <div>
                    <span>OVERVIEW</span>
                    <h2>Selamat datang, {userName}</h2>
                    <p>Kelola operasional Sunrise Laundry melalui menu yang tersedia.</p>
                </div>
                <div className="home-welcome-mark" aria-hidden="true">✦</div>
            </section>

            <div className="home-section-heading">
                <div>
                    <h2>Menu Utama</h2>
                    <p>Pilih halaman yang ingin kamu kelola.</p>
                </div>
            </div>

            <section className="home-shortcut-grid">
                {shortcuts.map(({ title, description, page, icon: Icon, label }) => (
                    <button
                        type="button"
                        className="home-shortcut-card"
                        key={page}
                        onClick={() => onNavigate(page)}
                    >
                        <span className="home-shortcut-icon"><Icon size={20} strokeWidth={1.8} /></span>
                        <span className="home-shortcut-copy">
                            <strong>{title}</strong>
                            <small>{description}</small>
                            <span className="home-shortcut-link">{label}<ArrowRight size={14} /></span>
                        </span>
                    </button>
                ))}
            </section>
        </div>
    );
}
