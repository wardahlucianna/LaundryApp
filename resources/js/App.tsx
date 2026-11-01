import { useState } from "react";
import CIcon from "@coreui/icons-react";
import {
    cilMenu,
    cilSpeedometer,
    cilPeople,
    cilBasket,
    cilCash,
    cilChart,
    cilSettings,
    cilBell,
    cilSearch,
    cilChevronRight,
} from "@coreui/icons";
import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CHeader,
    CHeaderToggler,
    CProgress,
    CRow,
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CNavItem,
    CNavTitle,
    CWidgetStatsA,
} from "@coreui/react";

type PageKey = "dashboard" | "customers" | "services" | "transactions" | "reports" | "settings";

const navigation: { key: PageKey; label: string; icon: typeof cilSpeedometer }[] = [
    { key: "dashboard", label: "Dashboard", icon: cilSpeedometer },
    { key: "customers", label: "Pelanggan", icon: cilPeople },
    { key: "services", label: "Layanan Laundry", icon: cilBasket },
    { key: "transactions", label: "Transaksi", icon: cilCash },
    { key: "reports", label: "Laporan", icon: cilChart },
    { key: "settings", label: "Pengaturan", icon: cilSettings },
];

const pageTitles: Record<PageKey, string> = {
    dashboard: "Dashboard",
    customers: "Pelanggan",
    services: "Layanan Laundry",
    transactions: "Transaksi",
    reports: "Laporan",
    settings: "Pengaturan",
};

function Dashboard() {
    return (
        <>
            <div className="page-heading">
                <div>
                    <div className="eyebrow">RINGKASAN OPERASIONAL</div>
                    <h1>Dashboard</h1>
                    <p>Selamat datang kembali. Berikut ringkasan aktivitas laundry hari ini.</p>
                </div>
                <CBadge color="success" shape="rounded-pill">Sistem aktif</CBadge>
            </div>

            <CRow className="g-3 mb-4">
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA className="dashboard-stat" color="primary" value="128" title="Total pelanggan" />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA className="dashboard-stat" color="info" value="46" title="Pesanan hari ini" />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA className="dashboard-stat" color="success" value="Rp 3,8 jt" title="Pendapatan hari ini" />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA className="dashboard-stat" color="warning" value="18" title="Dalam proses" />
                </CCol>
            </CRow>

            <CRow className="g-3">
                <CCol xl={8}>
                    <CCard className="content-card h-100">
                        <CCardBody>
                            <div className="card-heading">
                                <div><h2>Aktivitas pesanan</h2><p>Ringkasan status pekerjaan laundry</p></div>
                                <CButton color="light" size="sm">Lihat semua</CButton>
                            </div>
                            {[
                                { label: "Menunggu", count: 8, percent: 18, color: "secondary" as const },
                                { label: "Dicuci", count: 12, percent: 27, color: "info" as const },
                                { label: "Dikeringkan", count: 9, percent: 20, color: "warning" as const },
                                { label: "Siap diambil", count: 17, percent: 38, color: "success" as const },
                            ].map(item => (
                                <div className="activity-row" key={item.label}>
                                    <div className="activity-meta"><span>{item.label}</span><strong>{item.count} pesanan</strong></div>
                                    <CProgress height={8} value={item.percent} color={item.color} />
                                </div>
                            ))}
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol xl={4}>
                    <CCard className="content-card h-100">
                        <CCardBody>
                            <div className="card-heading"><div><h2>Akses cepat</h2><p>Menu yang sering digunakan</p></div></div>
                            {[
                                ["Buat transaksi baru", "Mulai pesanan pelanggan"],
                                ["Tambah pelanggan", "Daftarkan pelanggan baru"],
                                ["Lihat laporan", "Pantau hasil operasional"],
                            ].map(([title, desc]) => (
                                <button className="quick-link" key={title} type="button">
                                    <span><strong>{title}</strong><small>{desc}</small></span>
                                    <CIcon icon={cilChevronRight} />
                                </button>
                            ))}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    );
}

export default function App() {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [activePage, setActivePage] = useState<PageKey>("dashboard");

    return (
        <div className="app-shell">
            <CSidebar className="app-sidebar" position="fixed" visible={sidebarVisible} onVisibleChange={setSidebarVisible}>
                <CSidebarBrand className="brand">
                    <span className="brand-mark">S</span>
                    <span><strong>Sunrise Laundry</strong><small>MANAGEMENT SYSTEM</small></span>
                </CSidebarBrand>
                <CSidebarNav>
                    <CNavTitle>MENU UTAMA</CNavTitle>
                    {navigation.map(item => (
                        <CNavItem key={item.key}>
                            <button type="button" className={activePage === item.key ? "sidebar-link active" : "sidebar-link"} onClick={() => setActivePage(item.key)}>
                                <CIcon icon={item.icon} />
                                <span>{item.label}</span>
                            </button>
                        </CNavItem>
                    ))}
                </CSidebarNav>
                <div className="sidebar-bottom">
                    <div className="profile-avatar">A</div>
                    <span><strong>Administrator</strong><small>Super Admin</small></span>
                    <CButton color="light" size="sm" className="ms-auto">•••</CButton>
                </div>
            </CSidebar>

            <div className="app-wrapper">
                <CHeader className="app-header">
                    <CContainer fluid>
                        <CHeaderToggler onClick={() => setSidebarVisible(value => !value)}><CIcon icon={cilMenu} size="lg" /></CHeaderToggler>
                        <div className="header-title">{pageTitles[activePage]}</div>
                        <div className="header-actions">
                            <button type="button" className="header-icon" aria-label="Cari"><CIcon icon={cilSearch} /></button>
                            <button type="button" className="header-icon notification" aria-label="Notifikasi"><CIcon icon={cilBell} /><i /></button>
                            <div className="header-profile"><div className="profile-avatar">A</div><span><strong>Administrator</strong><small>Super Admin</small></span></div>
                        </div>
                    </CContainer>
                </CHeader>
                <main className="app-content">
                    <CContainer fluid>
                        {activePage === "dashboard" ? <Dashboard /> : (
                            <div className="page-heading">
                                <div><div className="eyebrow">SUNRISE LAUNDRY</div><h1>{pageTitles[activePage]}</h1><p>Halaman ini siap dikembangkan pada tahap berikutnya.</p></div>
                            </div>
                        )}
                    </CContainer>
                </main>
                <footer className="app-footer">© {new Date().getFullYear()} Sunrise Laundry. All rights reserved.</footer>
            </div>
        </div>
    );
}
