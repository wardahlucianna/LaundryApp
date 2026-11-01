import { useState } from "react";
import CIcon from "@coreui/icons-react";
import {
  cilMenu, cilSpeedometer, cilPeople, cilBasket, cilCash, cilChart,
  cilSettings, cilBell, cilSearch, cilEnvelopeOpen, cilList, cilSun,
  cilChevronRight, cilHome, cilGlobe, cilCalendar, cilFile, cilLayers,
} from "@coreui/icons";
import {
  CBadge, CButton, CCard, CCardBody, CCol, CContainer, CHeader,
  CHeaderToggler, CProgress, CRow, CSidebar, CSidebarBrand,
  CSidebarNav, CNavItem, CNavTitle,
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
const titles: Record<PageKey, string> = {
  dashboard: "Dashboard", customers: "Pelanggan", services: "Layanan Laundry",
  transactions: "Transaksi", reports: "Laporan", settings: "Pengaturan",
};
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const traffic = [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98];

function SalesChart() {
  return <svg className="sales-chart" viewBox="0 0 420 190" role="img" aria-label="Grafik penjualan">
    <defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3399ff" stopOpacity=".18"/><stop offset="100%" stopColor="#3399ff" stopOpacity=".02"/></linearGradient></defs>
    <path d="M0 55 C45 49 65 50 100 45 S145 80 170 110 S220 125 255 145 S310 170 345 150 S390 120 420 105 L420 190 L0 190Z" fill="url(#salesFill)"/>
    <path d="M0 55 C45 49 65 50 100 45 S145 80 170 110 S220 125 255 145 S310 170 345 150 S390 120 420 105" fill="none" stroke="#3399ff" strokeWidth="3.5" strokeLinecap="round"/>
  </svg>;
}
function TrafficChart() {
  return <div className="traffic-chart">
    <div className="traffic-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
    <div className="traffic-plot">
      {[100,75,50,25,0].map(v => <div className="traffic-grid" key={v} style={{ bottom: `${v}%` }} />)}
      <div className="traffic-bars">{traffic.map((v,i) => <div className="traffic-month" key={months[i]}>
        <div className="bar-pair"><i style={{height:`${v}%`}}/><i style={{height:`${Math.max(8,v-2)}%`}}/></div><span>{months[i]}</span>
      </div>)}</div>
    </div>
  </div>;
}
function Dashboard() {
  return <>
    <div className="page-heading"><div><h1>Dashboard</h1><div className="breadcrumbs"><a>Home</a><span>/</span><span>Dashboard</span></div></div></div>
    <CRow className="g-4 dashboard-grid">
      <CCol xl={4} lg={5}>
        <CCard className="chart-card sales-card"><CCardBody>
          <div className="chart-title"><div><h2>Penjualan</h2><p>Desember 2025 - April 2026</p></div><strong>Rp 613.200</strong></div>
          <SalesChart/>
        </CCardBody></CCard>
        <CRow className="g-3 mt-1">
          <CCol sm={6}><CCard className="mini-stat"><CCardBody><div className="mini-head"><span>Pelanggan</span><i><CIcon icon={cilPeople}/></i></div><strong>44.725</strong><small className="negative">(-12,4% ↓)</small></CCardBody></CCard></CCol>
          <CCol sm={6}><CCard className="mini-stat"><CCardBody><div className="mini-head"><span>Pesanan</span><i><CIcon icon={cilBasket}/></i></div><strong>385</strong><small className="positive">(17,2% ↑)</small></CCardBody></CCard></CCol>
        </CRow>
      </CCol>
      <CCol xl={8} lg={7}><CCard className="chart-card traffic-card"><CCardBody>
        <div className="chart-title"><div><h2>Traffic Pesanan</h2><p>Mei 1, 2025 - April 30, 2026</p></div></div><TrafficChart/>
      </CCardBody></CCard></CCol>
    </CRow>
    <CRow className="g-4 mt-1">
      <CCol xl={8}><CCard className="lower-card"><CCardBody><div className="section-title"><div><h2>Aktivitas Pesanan</h2><p>Ringkasan status pekerjaan laundry</p></div><CButton color="light" size="sm">Lihat semua</CButton></div>
        {[["Menunggu",8,18,"secondary"],["Dicuci",12,27,"info"],["Dikeringkan",9,20,"warning"],["Siap diambil",17,38,"success"]].map(([label,count,percent,color])=><div className="activity-row" key={String(label)}><div className="activity-meta"><span>{label}</span><strong>{count} pesanan</strong></div><CProgress height={7} value={Number(percent)} color={color as "info"}/></div>)}
      </CCardBody></CCard></CCol>
      <CCol xl={4}><CCard className="lower-card"><CCardBody><div className="section-title"><div><h2>Akses Cepat</h2><p>Menu yang sering digunakan</p></div></div>
        {[["Buat transaksi baru","Mulai pesanan pelanggan"],["Tambah pelanggan","Daftarkan pelanggan baru"],["Lihat laporan","Pantau hasil operasional"]].map(([t,d])=><button className="quick-link" key={t}><span><b>{t}</b><small>{d}</small></span><CIcon icon={cilChevronRight}/></button>)}
      </CCardBody></CCard></CCol>
    </CRow>
  </>;
}
export default function App() {
  const [sidebarVisible,setSidebarVisible] = useState(true);
  const [activePage,setActivePage] = useState<PageKey>("dashboard");
  return <div className="app-shell">
    <CSidebar className="app-sidebar" position="fixed" visible={sidebarVisible} onVisibleChange={setSidebarVisible}>
      <CSidebarBrand className="brand"><span className="brand-mark">S</span><span className="brand-name">SUNRISE <b>LAUNDRY</b><small>MANAGEMENT SYSTEM</small></span></CSidebarBrand>
      <CSidebarNav>
        <CNavTitle>MENU UTAMA</CNavTitle>
        {navigation.map(item=><CNavItem key={item.key}><button type="button" className={activePage===item.key?"sidebar-link active":"sidebar-link"} onClick={()=>setActivePage(item.key)}><CIcon icon={item.icon}/><span>{item.label}</span>{activePage===item.key&&<CBadge color="info" className="ms-auto">NEW</CBadge>}</button></CNavItem>)}
        <CNavTitle className="extras-title">LAINNYA</CNavTitle>
        <CNavItem><button className="sidebar-link" type="button"><CIcon icon={cilFile}/><span>Dokumentasi</span></button></CNavItem>
        <CNavItem><button className="sidebar-link" type="button"><CIcon icon={cilLayers}/><span>Komponen</span></button></CNavItem>
      </CSidebarNav>
      <div className="sidebar-bottom"><div className="profile-avatar">A</div><span><strong>Administrator</strong><small>Super Admin</small></span><button type="button" className="profile-more">•••</button></div>
    </CSidebar>
    <div className="app-wrapper">
      <CHeader className="app-header"><CContainer fluid>
        <CHeaderToggler className="mobile-toggle" onClick={()=>setSidebarVisible(v=>!v)}><CIcon icon={cilMenu}/></CHeaderToggler>
        <label className="global-search"><CIcon icon={cilSearch}/><input placeholder="Search"/><kbd>Ctrl</kbd><kbd>/</kbd></label>
        <div className="header-actions"><button aria-label="Notifikasi"><CIcon icon={cilBell}/><i/></button><button aria-label="Aktivitas"><CIcon icon={cilList}/></button><button aria-label="Pesan"><CIcon icon={cilEnvelopeOpen}/><i/></button><span className="header-divider"/><button aria-label="Bahasa"><CIcon icon={cilGlobe}/></button><button aria-label="Tema"><CIcon icon={cilSun}/></button><div className="header-profile"><div className="profile-avatar">A</div><span className="online-dot"/></div></div>
      </CContainer></CHeader>
      <main className="app-content"><CContainer fluid>{activePage==="dashboard"?<Dashboard/>:<div className="page-heading"><div><h1>{titles[activePage]}</h1><div className="breadcrumbs"><a>Home</a><span>/</span><span>{titles[activePage]}</span></div></div></div>}</CContainer></main>
      <footer className="app-footer">© {new Date().getFullYear()} Sunrise Laundry. All rights reserved.</footer>
    </div>
  </div>;
}
