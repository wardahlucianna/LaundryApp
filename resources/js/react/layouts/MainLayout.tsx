import { useState, type ReactNode } from "react";
import { ChevronDown, CircleUserRound, LogOut, Menu, UserRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationItem = { id: string; label: string; icon: LucideIcon };
export type NavigationGroup = { title: string; items: NavigationItem[] };

type Props = {
    children: ReactNode;
    groups: NavigationGroup[];
    activePage: string;
    onNavigate: (page: string) => void;
    userName: string;
    username: string;
    roleName: string;
    onLogout: () => void;
    pageTitle: string;
};

export default function MainLayout({
    children, groups, activePage, onNavigate, userName, username, roleName, onLogout, pageTitle,
}: Props) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const initials = userName.trim().split(/\\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();

    const navigate = (page: string) => {
        onNavigate(page);
        setMobileMenuOpen(false);
        setOpenGroup(null);
    };

    const openProfile = () => {
        setUserMenuOpen(false);
        setProfileOpen(true);
    };

    return (
        <div className="coreui-app-shell">
            <header className="coreui-header navbar navbar-expand-lg">
                <div className="coreui-header-brand">
                    <span className="coreui-brand-mark">✦</span>
                    <span><b>Sunrise Laundry</b><small>MANAGEMENT SYSTEM</small></span>
                </div>

                <button type="button" className="coreui-mobile-toggle" aria-label="Buka navigasi" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(value => !value)}>
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <nav className={mobileMenuOpen ? "coreui-top-navigation is-open" : "coreui-top-navigation"} aria-label="Navigasi utama">
                    {groups.map(group => (
                        <div className={openGroup === group.title ? "coreui-nav-group is-open" : "coreui-nav-group"} key={group.title}>
                            <button type="button" className="coreui-nav-group-trigger" aria-expanded={openGroup === group.title} onClick={() => setOpenGroup(current => current === group.title ? null : group.title)}>
                                {group.title}<ChevronDown size={14} />
                            </button>
                            <div className="coreui-nav-dropdown">
                                {group.items.map(item => {
                                    const Icon = item.icon;
                                    return <button type="button" key={item.id} className={activePage === item.id ? "coreui-nav-link active" : "coreui-nav-link"} onClick={() => navigate(item.id)}>
                                        <Icon size={17} /><span>{item.label}</span>
                                    </button>;
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="coreui-user-area">
                    <button type="button" className="coreui-user-trigger" aria-haspopup="menu" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen(value => !value)}>
                        <span className="coreui-user-avatar">{initials || <CircleUserRound size={18} />}</span>
                        <span className="coreui-user-copy"><b>{userName}</b><small>{roleName}</small></span>
                        <ChevronDown size={15} />
                    </button>
                    {userMenuOpen && <>
                        <button type="button" className="coreui-dismiss" aria-label="Tutup menu pengguna" onClick={() => setUserMenuOpen(false)} />
                        <div className="coreui-user-dropdown" role="menu">
                            <div className="coreui-user-dropdown-heading"><b>{userName}</b><small>{username}</small></div>
                            <button type="button" role="menuitem" onClick={openProfile}><UserRound size={16} />Profil</button>
                            <button type="button" role="menuitem" className="logout" onClick={onLogout}><LogOut size={16} />Keluar</button>
                        </div>
                    </>}
                </div>
            </header>

            <main className="coreui-main">
                <div className="coreui-breadcrumb"><span>Beranda</span><span>/</span><b>{pageTitle}</b></div>
                <section className="coreui-content">{children}</section>
            </main>

            {profileOpen && <div className="profile-modal-backdrop" onClick={() => setProfileOpen(false)}>
                <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" onClick={event => event.stopPropagation()}>
                    <div className="profile-modal-heading">
                        <div><small>AKUN PENGGUNA</small><h2 id="profile-modal-title">Profil</h2></div>
                        <button type="button" aria-label="Tutup profil" onClick={() => setProfileOpen(false)}><X size={18} /></button>
                    </div>
                    <div className="profile-modal-avatar">{initials || <CircleUserRound size={26} />}</div>
                    <h3>{userName}</h3><p className="profile-modal-role">{roleName}</p>
                    <dl className="profile-details">
                        <div><dt>Nama Pengguna</dt><dd>{username || "-"}</dd></div>
                        <div><dt>Peran</dt><dd>{roleName}</dd></div>
                    </dl>
                    <div className="profile-modal-actions"><button type="button" className="btn-primary" onClick={() => setProfileOpen(false)}>Tutup</button></div>
                </section>
            </div>}
        </div>
    );
}
