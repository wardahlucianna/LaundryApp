import { useState, type ReactNode } from "react";
import {
    CBadge,
    CBreadcrumb,
    CBreadcrumbItem,
    CButton,
    CContainer,
    CHeader,
    CHeaderToggler,
    CNav,
    CNavItem,
    CSidebar,
    CSidebarBrand,
    CSidebarHeader,
    CSidebarNav,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilMenu, cilSpeedometer, cilShieldAlt, cilSettings, cilAccountLogout, cilUser } from "@coreui/icons";
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

const coreIcon = (id: string) => {
    if (id === "dashboard") return cilSpeedometer;
    if (id === "roles" || id === "features") return cilShieldAlt;
    return cilSettings;
};

export default function MainLayout({
    children, groups, activePage, onNavigate, userName, username, roleName, onLogout, pageTitle,
}: Props) {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const initials = userName.trim().split(/\\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();

    return (
        <div className="coreui-shell">
            <CSidebar className="coreui-laundry-sidebar border-end" colorScheme="light" position="fixed" visible={sidebarVisible} onVisibleChange={setSidebarVisible}>
                <CSidebarHeader className="border-bottom px-3 py-3">
                    <CSidebarBrand className="d-flex align-items-center gap-2 text-decoration-none">
                        <span className="coreui-laundry-brand-mark">✦</span>
                        <span className="d-flex flex-column text-start">
                            <strong className="coreui-laundry-brand-title">Sunrise Laundry</strong>
                            <small className="coreui-laundry-brand-caption">MANAGEMENT SYSTEM</small>
                        </span>
                    </CSidebarBrand>
                </CSidebarHeader>
                <CSidebarNav className="px-2 py-3">
                    {groups.map(group => (
                        <div className="coreui-laundry-nav-group" key={group.title}>
                            <div className="coreui-laundry-nav-title">{group.title}</div>
                            {group.items.map(item => (
                                <button type="button" key={item.id} className={activePage === item.id ? "coreui-laundry-nav-link active" : "coreui-laundry-nav-link"} onClick={() => onNavigate(item.id)}>
                                    <CIcon icon={coreIcon(item.id)} size="lg" />
                                    <span>{item.label}</span>
                                    {activePage === item.id && <CBadge color="primary" shape="rounded-pill" className="ms-auto"> </CBadge>}
                                </button>
                            ))}
                        </div>
                    ))}
                </CSidebarNav>
                <div className="coreui-laundry-sidebar-footer border-top p-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="coreui-laundry-avatar">{initials || "U"}</span>
                        <span className="d-flex flex-column overflow-hidden">
                            <strong className="text-truncate">{userName}</strong>
                            <small className="text-body-secondary">{roleName}</small>
                        </span>
                    </div>
                </div>
            </CSidebar>

            <div className="wrapper d-flex flex-column min-vh-100">
                <CHeader position="sticky" className="coreui-laundry-header px-3 px-lg-4">
                    <CContainer fluid className="d-flex align-items-center gap-3 p-0">
                        <CHeaderToggler className="border-0" onClick={() => setSidebarVisible(value => !value)}>
                            <CIcon icon={cilMenu} size="lg" />
                        </CHeaderToggler>
                        <div className="coreui-laundry-header-title d-none d-sm-block">{pageTitle}</div>
                        <CNav className="ms-auto align-items-center">
                            <CNavItem className="position-relative">
                                <CButton color="light" variant="ghost" className="d-flex align-items-center gap-2" onClick={() => setProfileMenuOpen(value => !value)} aria-expanded={profileMenuOpen}>
                                    <span className="coreui-laundry-avatar">{initials || "U"}</span>
                                    <span className="d-none d-md-flex flex-column text-start">
                                        <strong className="coreui-laundry-user-name">{userName}</strong>
                                        <small className="text-body-secondary">{roleName}</small>
                                    </span>
                                </CButton>
                                {profileMenuOpen && <div className="coreui-laundry-profile-menu shadow">
                                    <div className="px-3 py-2 border-bottom">
                                        <strong className="d-block">{userName}</strong>
                                        <small className="text-body-secondary">{username}</small>
                                    </div>
                                    <div className="px-3 py-2 d-flex align-items-center gap-2 text-body-secondary small"><CIcon icon={cilUser} />{roleName}</div>
                                    <button type="button" className="coreui-laundry-logout" onClick={onLogout}><CIcon icon={cilAccountLogout} /> Keluar</button>
                                </div>}
                            </CNavItem>
                        </CNav>
                    </CContainer>
                </CHeader>

                <div className="body flex-grow-1">
                    <CContainer fluid className="px-3 px-lg-4 pt-3">
                        <CBreadcrumb className="mb-3">
                            <CBreadcrumbItem>Beranda</CBreadcrumbItem>
                            <CBreadcrumbItem active>{pageTitle}</CBreadcrumbItem>
                        </CBreadcrumb>
                    </CContainer>
                    <main className="coreui-laundry-content px-3 px-lg-4 pb-4">{children}</main>
                </div>
                <footer className="footer border-top px-4 py-3 text-body-secondary small">© {new Date().getFullYear()} Sunrise Laundry</footer>
            </div>
            {profileMenuOpen && <button type="button" aria-label="Tutup menu profil" className="coreui-laundry-dismiss" onClick={() => setProfileMenuOpen(false)} />}
        </div>
    );
}
