import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
    id: string;
    label: string;
    icon: LucideIcon;
};

export type NavigationGroup = {
    title: string;
    items: NavigationItem[];
};

type Props = {
    children: ReactNode;
    groups: NavigationGroup[];
    activePage: string;
    onNavigate: (page: string) => void;
    userName: string;
    roleName: string;
    onLogout: () => void;
    pageTitle: string;
};

export default function MainLayout({ children, groups, activePage, onNavigate, userName, roleName, onLogout, pageTitle }: Props) {
    return (
        <div className="access-layout">
            <aside className="access-sidebar">
                <div className="login-brand"><span>✦</span><div><b>Sunrise Laundry</b><small>MANAGEMENT SYSTEM</small></div></div>
                {groups.map(group => (
                    <div className="access-nav-group" key={group.title}>
                        <div className="access-nav-title">{group.title}</div>
                        {group.items.map(item => {
                            const Icon = item.icon;
                            return (
                                <button key={item.id} className={activePage === item.id ? "access-nav active" : "access-nav"} onClick={() => onNavigate(item.id)}>
                                    <Icon size={18} strokeWidth={1.9} /><span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                ))}
                <div className="access-user"><b>{userName}</b><small>{roleName}</small><button onClick={onLogout}>Keluar</button></div>
            </aside>
            <main className="access-main">
                <header className="access-topbar"><span>Beranda / <b>{pageTitle}</b></span><span>Sunrise Laundry</span></header>
                <section className="access-content">{children}</section>
            </main>
        </div>
    );
}
