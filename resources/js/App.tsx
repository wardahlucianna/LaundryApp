import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Home, ShieldCheck, PanelsTopLeft, KeyRound } from "lucide-react";
import DashboardPage from "./features/home/pages/DashboardPage";
import { request } from "./lib/api/request";
import type { Role } from "./features/master/akses/role/types/role";
import MainLayout, { type NavigationGroup } from "./react/layouts/MainLayout";
import RolePage from "./react/pages/Master/Access/Role/Role";
import PermissionPage from "./react/pages/Master/Access/Permission/Permission";
import AccessPage from "./react/pages/Master/Access/Access/Access";

type User = { id: string; full_name: string; username: string; role?: Role };
type PageId = "dashboard" | "roles" | "features" | "access";

export default function App() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("sunrise_token"));
    const [user, setUser] = useState<User | null>(null);
    const [permissionCodes, setPermissionCodes] = useState<string[]>([]);
    const [page, setPage] = useState<PageId>("dashboard");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const can = useCallback((code: string) =>
        permissionCodes.includes(code) || user?.role?.code === "SUPERADMIN",
    [permissionCodes, user]);

    const loadIdentity = useCallback(async (authToken: string) => {
        const result = await request<{ user: User; permissions: string[] }>("/auth/me", authToken);
        setUser(result.user);
        setPermissionCodes(result.permissions);
    }, []);

    useEffect(() => {
        if (!token) {
            setUser(null);
            setPermissionCodes([]);
            return;
        }
        loadIdentity(token).catch(() => {
            localStorage.removeItem("sunrise_token");
            setToken(null);
            setUser(null);
            setPermissionCodes([]);
        });
    }, [token, loadIdentity]);

    const login = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
            const result = await request<{ token: string; user: User; permissions: string[] }>("/auth/login", null, {
                method: "POST",
                body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
            });
            localStorage.setItem("sunrise_token", result.token);
            setUser(result.user);
            setPermissionCodes(result.permissions);
            setToken(result.token);
            setNotice("Berhasil masuk.");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const logout = async () => {
        try {
            if (token) await request("/auth/logout", token, { method: "POST" });
        } catch {
            // The local session is cleared even if the logout endpoint is unavailable.
        }
        localStorage.removeItem("sunrise_token");
        setToken(null);
        setUser(null);
        setPermissionCodes([]);
        setPage("dashboard");
    };

    const navGroups = useMemo<NavigationGroup[]>(() => [
        {
            title: "BERANDA",
            items: [{ id: "dashboard", label: "Home", icon: Home }],
        },
        {
            title: "MASTER DATA",
            items: [
                ...(can("ROLE_VIEW") ? [{ id: "roles", label: "Manajemen Role", icon: ShieldCheck }] : []),
                ...(can("FEATURE_VIEW") ? [{ id: "features", label: "Manajemen Fitur", icon: PanelsTopLeft }] : []),
            ],
        },
        {
            title: "PENGATURAN",
            items: can("ACCESS_MANAGE") ? [{ id: "access", label: "Hak Akses", icon: KeyRound }] : [],
        },
    ].filter(group => group.items.length > 0), [can]);

    const currentTitle = navGroups.flatMap(group => group.items).find(item => item.id === page)?.label || "Home";

    if (!token || !user) {
        return (
            <div className="login-shell">
                <form className="login-card" onSubmit={login}>
                    <div className="login-brand"><span>✦</span><div><b>Sunrise Laundry</b><small>MANAGEMENT SYSTEM</small></div></div>
                    <h1>Selamat datang</h1>
                    <p>Masuk untuk mengelola aplikasi Sunrise Laundry.</p>
                    {error && <div className="alert error">{error}</div>}
                    <label>Username<input name="username" autoComplete="username" required placeholder="Masukkan username" /></label>
                    <label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Masukkan password" /></label>
                    <button className="btn-primary full" disabled={busy}>{busy ? "Memproses..." : "Masuk"}</button>
                </form>
            </div>
        );
    }

    return (
        <MainLayout
            groups={navGroups}
            activePage={page}
            onNavigate={value => setPage(value as PageId)}
            userName={user.full_name}
            roleName={user.role?.name || "Pengguna"}
            onLogout={logout}
            pageTitle={currentTitle}
        >
            {notice && <div className="alert success">{notice}<button onClick={() => setNotice("")}>×</button></div>}
            {page === "dashboard" && <DashboardPage userName={user.full_name} onNavigate={setPage} />}
            {page === "roles" && can("ROLE_VIEW") && <RolePage token={token} canManage={can("ROLE_MANAGE")} />}
            {page === "features" && can("FEATURE_VIEW") && <PermissionPage token={token} canManage={can("FEATURE_MANAGE")} onChanged={() => undefined} />}
            {page === "access" && can("ACCESS_MANAGE") && <AccessPage token={token} canManage={can("ACCESS_MANAGE")} />}
        </MainLayout>
    );
}
