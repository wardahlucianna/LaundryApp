import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Home,
    KeyRound,
    PanelsTopLeft,
    ShieldCheck,
} from "lucide-react";
import { request } from "./lib/api/request";
import type { Role } from "./react/types/role";
import DashboardPage from "./react/pages/Home/Home";
import MainLayout, {
    type NavigationGroup,
} from "./react/layouts/MainLayout";
import RolePage from "./react/pages/Access/Role/Role";
import FeaturePage from "./react/pages/Access/Permission/FeaturePage";
import AccessPage from "./react/pages/Access/Access/Access";

type User = {
    id: string;
    full_name: string;
    username: string;
    role?: Role;
};

type PageId = "dashboard" | "roles" | "features" | "access";

const pagePaths: Record<PageId, string> = {
    dashboard: "/home",
    roles: "/roles",
    features: "/permissions",
    access: "/access",
};

function getPageFromPath(pathname: string): PageId {
    const entry = Object.entries(pagePaths).find(([, path]) => path === pathname);
    return (entry?.[0] as PageId | undefined) ?? "dashboard";
}

export default function App() {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem("sunrise_token"),
    );
    const [user, setUser] = useState<User | null>(null);
    const [permissionCodes, setPermissionCodes] = useState<string[]>([]);
    const [page, setPage] = useState<PageId>(() =>
        getPageFromPath(window.location.pathname),
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const navigate = useCallback((nextPage: PageId) => {
        const nextPath = pagePaths[nextPage];
        if (window.location.pathname !== nextPath) {
            window.history.pushState({}, "", nextPath);
        }
        setPage(nextPage);
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            setPage(getPageFromPath(window.location.pathname));
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    useEffect(() => {
        if (token && user && !Object.values(pagePaths).includes(window.location.pathname)) {
            window.history.replaceState({}, "", pagePaths.dashboard);
            setPage("dashboard");
        }
    }, [token, user]);

    const can = useCallback(
        (code: string) =>
            permissionCodes.includes(code) || user?.role?.code === "SUPERADMIN",
        [permissionCodes, user],
    );

    const loadIdentity = useCallback(async (authToken: string) => {
        const result = await request<{
            user: User;
            permissions: string[];
        }>("/auth/me", authToken);

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

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true);
        setError("");

        const form = new FormData(event.currentTarget);

        try {
            const result = await request<{
                token: string;
                user: User;
                permissions: string[];
            }>("/auth/login", null, {
                method: "POST",
                body: JSON.stringify({
                    username: form.get("username"),
                    password: form.get("password"),
                }),
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

    const handleLogout = async () => {
        try {
            if (token) {
                await request("/auth/logout", token, {
                    method: "POST",
                });
            }
        } catch {
            // Clear the local session even if the logout endpoint is unavailable.
        }

        localStorage.removeItem("sunrise_token");
        setToken(null);
        setUser(null);
        setPermissionCodes([]);
        window.history.pushState({}, "", "/");
        setPage("dashboard");
    };

    const navigationGroups = useMemo<NavigationGroup[]>(
        () => [
            {
                title: "BERANDA",
                items: [
                    {
                        id: "dashboard",
                        label: "Home",
                        icon: Home,
                    },
                ],
            },
            {
                title: "MASTER DATA",
                items: [
                    ...(can("ROLE_VIEW")
                        ? [{
                            id: "roles",
                            label: "Manajemen Role",
                            icon: ShieldCheck,
                        }]
                        : []),
                    ...(can("FEATURE_VIEW")
                        ? [{
                            id: "features",
                            label: "Manajemen Fitur",
                            icon: PanelsTopLeft,
                        }]
                        : []),
                ],
            },
            {
                title: "PENGATURAN",
                items: can("ACCESS_MANAGE")
                    ? [{
                        id: "access",
                        label: "Hak Akses",
                        icon: KeyRound,
                    }]
                    : [],
            },
        ].filter(group => group.items.length > 0),
        [can],
    );

    const currentTitle =
        navigationGroups
            .flatMap(group => group.items)
            .find(item => item.id === page)?.label ?? "Home";

    if (!token || !user) {
        return (
            <div className="login-shell">
                <form className="login-card" onSubmit={handleLogin}>
                    <div className="login-brand">
                        <span>✦</span>
                        <div>
                            <b>Sunrise Laundry</b>
                            <small>MANAGEMENT SYSTEM</small>
                        </div>
                    </div>

                    <h1>Selamat datang</h1>
                    <p>Masuk untuk mengelola aplikasi Sunrise Laundry.</p>

                    {error && <div className="alert error">{error}</div>}

                    <label>
                        Username
                        <input
                            name="username"
                            autoComplete="username"
                            required
                            placeholder="Masukkan username"
                        />
                    </label>

                    <label>
                        Password
                        <input
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="Masukkan password"
                        />
                    </label>

                    <button className="btn-primary full" disabled={busy}>
                        {busy ? "Memproses..." : "Masuk"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <MainLayout
            groups={navigationGroups}
            activePage={page}
            onNavigate={value => navigate(value as PageId)}
            userName={user.full_name}
            username={user.username}
            roleName={user.role?.name || "Pengguna"}
            onLogout={handleLogout}
            pageTitle={currentTitle}
        >
            {notice && (
                <div className="alert success">
                    {notice}
                    <button onClick={() => setNotice("")}>×</button>
                </div>
            )}

            {page === "dashboard" && (
                <DashboardPage
                    userName={user.full_name}
                    onNavigate={navigate}
                />
            )}

            {page === "roles" && can("ROLE_VIEW") && (
                <RolePage
                    token={token}
                    canManage={can("ROLE_MANAGE")}
                />
            )}

            {page === "features" && can("FEATURE_VIEW") && (
                <FeaturePage
                    token={token}
                    canCreate={can("FEATURE_CREATE")}
                    canUpdate={can("FEATURE_UPDATE")}
                    canDelete={can("FEATURE_DELETE")}
                />
            )}

            {page === "access" && can("ACCESS_MANAGE") && (
                <AccessPage
                    token={token}
                    canManage={can("ACCESS_MANAGE")}
                />
            )}
        </MainLayout>
    );
}
