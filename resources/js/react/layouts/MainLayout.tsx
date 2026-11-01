import { useState, type ReactNode } from "react";
import { ChevronDown, CircleUserRound, LogOut, UserRound, X } from "lucide-react";
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
    const initials = userName.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
    const openProfile = () => { setUserMenuOpen(false); setProfileOpen(true); };

    return (
        <div className="access-layout">
            <aside className="access-sidebar">
                <div className="login-brand"><span>✦</span><div><b>Sunrise Laundry</b><small>MANAGEMENT SYSTEM</small></div></div>
                {groups.map(group => (
                    <div className="access-nav-group" key={group.title}>
                        <div className="access-nav-title">{group.title}</div>
                        {group.items.map(item => {
                            const Icon = item.icon;
                            return <button key={item.id} className={activePage === item.id ? "access-nav active" : "access-nav"} onClick={() => onNavigate(item.id)}><Icon size={18} strokeWidth={1.9} /><span>{item.label}</span></button>;
                        })}
                    </div>
                ))}
                <div className="access-user"><b>{userName}</b><small>{roleName}</small></div>
            </aside>

            <main className="access-main">
                <header className="access-topbar">
                    <span>Beranda / <b>{pageTitle}</b></span>
                    <div className="topbar-user-menu">
                        <button type="button" className="topbar-user-trigger" aria-haspopup="menu" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen(value => !value)}>
                            <span className="topbar-user-avatar">{initials || <CircleUserRound size={18} />}</span>
                            <span className="topbar-user-copy"><b>{userName}</b><small>{roleName}</small></span>
                            <ChevronDown size={16} className={userMenuOpen ? "user-menu-chevron open" : "user-menu-chevron"} />
                        </button>
                        {userMenuOpen && <>
                            <button type="button" className="user-menu-dismiss" aria-label="Tutup menu pengguna" onClick={() => setUserMenuOpen(false)} />
                            <div className="user-dropdown" role="menu">
                                <div className="user-dropdown-heading">
                                    <span className="topbar-user-avatar">{initials || <CircleUserRound size={18} />}</span>
                                    <span><b>{userName}</b><small>{username}</small></span>
                                </div>
                                <button type="button" role="menuitem" onClick={openProfile}><UserRound size={17} /><span>Profil</span></button>
                                <div className="user-dropdown-divider" />
                                <button type="button" role="menuitem" className="user-dropdown-logout" onClick={onLogout}><LogOut size={17} /><span>Keluar</span></button>
                            </div>
                        </>}
                    </div>
                </header>
                <section className="access-content">{children}</section>
            </main>

            {profileOpen && <div className="profile-modal-backdrop" onClick={() => setProfileOpen(false)}>
                <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" onClick={event => event.stopPropagation()}>
                    <div className="profile-modal-heading">
                        <div><small>AKUN PENGGUNA</small><h2 id="profile-modal-title">Profil</h2></div>
                        <button type="button" aria-label="Tutup profil" onClick={() => setProfileOpen(false)}><X size={18} /></button>
                    </div>
                    <div className="profile-modal-avatar">{initials || <CircleUserRound size={26} />}</div>
                    <h3>{userName}</h3>
                    <p className="profile-modal-role">{roleName}</p>
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
