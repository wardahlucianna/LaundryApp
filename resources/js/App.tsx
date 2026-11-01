import React, { useCallback, useEffect, useMemo, useState } from "react";

type Role = { id: string; name: string; code: string; is_active: boolean; permissions_count?: number; permissions?: Permission[] };
type Permission = { id: string; name: string; code: string; path: string | null; is_active: boolean; roles_count?: number };
type Page<T> = { data: T[]; current_page: number; last_page: number; total: number; per_page: number };
type User = { id: string; full_name: string; username: string; role?: Role };

const API = "/api";

async function request<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = body.message || Object.values(body.errors || {}).flat().join(" ") || "Permintaan gagal.";
        throw new Error(String(message));
    }
    return body as T;
}

export default function App() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("sunrise_token"));
    const [user, setUser] = useState<User | null>(null);
    const [permissionCodes, setPermissionCodes] = useState<string[]>([]);
    const [page, setPage] = useState<"roles" | "features" | "access">("roles");
    const [roles, setRoles] = useState<Page<Role> | null>(null);
    const [features, setFeatures] = useState<Page<Permission> | null>(null);
    const [allFeatures, setAllFeatures] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
    const [rolePage, setRolePage] = useState(1);
    const [featurePage, setFeaturePage] = useState(1);
    const [roleSearch, setRoleSearch] = useState("");
    const [featureSearch, setFeatureSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [roleForm, setRoleForm] = useState({ name: "", code: "" });
    const [featureForm, setFeatureForm] = useState({ name: "", code: "", path: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const can = useCallback((code: string) => permissionCodes.includes(code) || user?.role?.code === "SUPERADMIN", [permissionCodes, user]);

    const loadIdentity = useCallback(async (authToken: string) => {
        const result = await request<{ user: User; permissions: string[] }>("/auth/me", authToken);
        setUser(result.user);
        setPermissionCodes(result.permissions);
    }, []);

    useEffect(() => {
        if (!token) return;
        loadIdentity(token).catch(() => {
            localStorage.removeItem("sunrise_token");
            setToken(null);
            setUser(null);
        });
    }, [token, loadIdentity]);

    const loadRoles = useCallback(async () => {
        if (!token || !can("ROLE_VIEW")) return;
        const result = await request<Page<Role>>(`/roles?page=${rolePage}&per_page=${perPage}&search=${encodeURIComponent(roleSearch)}`, token);
        setRoles(result);
    }, [token, can, rolePage, perPage, roleSearch]);

    const loadFeatures = useCallback(async () => {
        if (!token || !can("FEATURE_VIEW")) return;
        const result = await request<Page<Permission>>(`/permissions?page=${featurePage}&per_page=${perPage}&search=${encodeURIComponent(featureSearch)}`, token);
        setFeatures(result);
    }, [token, can, featurePage, perPage, featureSearch]);

    const loadAllFeatures = useCallback(async () => {
        if (!token || !can("ACCESS_MANAGE")) return;
        const result = await request<Page<Permission>>("/permissions?per_page=100", token);
        setAllFeatures(result.data);
    }, [token, can]);

    useEffect(() => { loadRoles().catch(e => setError(e.message)); }, [loadRoles]);
    useEffect(() => { loadFeatures().catch(e => setError(e.message)); }, [loadFeatures]);
    useEffect(() => { loadAllFeatures().catch(e => setError(e.message)); }, [loadAllFeatures]);

    const loadRolePermissions = async (roleId: string) => {
        setSelectedRole(roleId);
        if (!token || !roleId) { setSelectedPermissionIds([]); return; }
        try {
            const result = await request<{ data: Role }>(`/roles/${roleId}`, token);
            setSelectedPermissionIds((result.data.permissions || []).map(p => p.id));
        } catch (e) { setError((e as Error).message); }
    };

    const login = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true); setError("");
        const form = new FormData(event.currentTarget);
        try {
            const result = await request<{ token: string; user: User; permissions: string[] }>("/auth/login", null, {
                method: "POST",
                body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
            });
            localStorage.setItem("sunrise_token", result.token);
            setToken(result.token); setUser(result.user); setPermissionCodes(result.permissions);
            setNotice("Berhasil masuk.");
        } catch (e) { setError((e as Error).message); }
        finally { setBusy(false); }
    };

    const logout = async () => {
        try { if (token) await request("/auth/logout", token, { method: "POST" }); } catch { /* token is cleared locally */ }
        localStorage.removeItem("sunrise_token"); setToken(null); setUser(null); setPermissionCodes([]);
    };

    const createRole = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); if (!token) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await request("/roles", token, { method: "POST", body: JSON.stringify(roleForm) });
            setRoleForm({ name: "", code: "" }); setNotice("Role berhasil ditambahkan."); await loadRoles();
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    const createFeature = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); if (!token) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await request("/permissions", token, { method: "POST", body: JSON.stringify({ ...featureForm, path: featureForm.path || null }) });
            setFeatureForm({ name: "", code: "", path: "" }); setNotice("Fitur berhasil ditambahkan."); await loadFeatures(); await loadAllFeatures();
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    const saveAccess = async () => {
        if (!token || !selectedRole) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await request(`/roles/${selectedRole}/permissions`, token, {
                method: "PUT", body: JSON.stringify({ permission_ids: selectedPermissionIds }),
            });
            setNotice("Hak akses berhasil disimpan.");
            await loadRoles();
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    const nav = useMemo(() => [
        { id: "roles" as const, label: "Manajemen Role", code: "ROLE_VIEW" },
        { id: "features" as const, label: "Manajemen Fitur", code: "FEATURE_VIEW" },
        { id: "access" as const, label: "Pengaturan Hak Akses", code: "ACCESS_MANAGE" },
    ].filter(item => can(item.code)), [can]);

    if (!token || !user) {
        return <div className="login-shell"><form className="login-card" onSubmit={login}>
            <div className="login-brand"><span>✦</span><div><b>Sunrise Laundry</b><small>MANAGEMENT SYSTEM</small></div></div>
            <h1>Selamat datang</h1><p>Masuk untuk mengelola role dan hak akses aplikasi.</p>
            {error && <div className="alert error">{error}</div>}
            <label>Username<input name="username" autoComplete="username" required placeholder="Masukkan username" /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Masukkan password" /></label>
            <button className="btn-primary full" disabled={busy}>{busy ? "Memproses..." : "Masuk"}</button>
        </form></div>;
    }

    const currentTitle = nav.find(item => item.id === page)?.label || "Manajemen Akses";

    return <div className="access-layout">
        <aside className="access-sidebar">
            <div className="login-brand"><span>✦</span><div><b>Sunrise Laundry</b><small>MANAGEMENT SYSTEM</small></div></div>
            <div className="access-nav-title">PENGATURAN</div>
            {nav.map(item => <button key={item.id} className={page === item.id ? "access-nav active" : "access-nav"} onClick={() => setPage(item.id)}>{item.label}</button>)}
            <div className="access-user"><b>{user.full_name}</b><small>{user.role?.name || "Pengguna"}</small><button onClick={logout}>Keluar</button></div>
        </aside>
        <main className="access-main">
            <header className="access-topbar"><span>Pengaturan / <b>{currentTitle}</b></span><span>Sunrise Laundry</span></header>
            <section className="access-content">
                <div className="access-heading"><div><small>ADMINISTRASI</small><h1>{currentTitle}</h1><p>Kelola role, daftar fitur, dan hak akses pengguna.</p></div></div>
                {error && <div className="alert error">{error}<button onClick={() => setError("")}>×</button></div>}
                {notice && <div className="alert success">{notice}<button onClick={() => setNotice("")}>×</button></div>}

                {page === "roles" && can("ROLE_VIEW") && <div className="access-panel">
                    <div className="panel-heading"><div><h2>Daftar Role</h2><p>Role menentukan kelompok hak akses pengguna.</p></div><span>{roles?.total ?? 0} role</span></div>
                    {can("ROLE_MANAGE") && <form className="inline-form" onSubmit={createRole}>
                        <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="Nama role" required />
                        <input value={roleForm.code} onChange={e => setRoleForm({ ...roleForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "_") })} placeholder="KODE_ROLE" required />
                        <button className="btn-primary" disabled={busy}>Tambah Role</button>
                    </form>}
                    <div className="list-toolbar"><input value={roleSearch} onChange={e => { setRoleSearch(e.target.value); setRolePage(1); }} placeholder="Cari nama atau kode role..." /></div>
                    <div className="table-wrap"><table className="access-table"><thead><tr><th>NAMA ROLE</th><th>KODE</th><th>JUMLAH FITUR</th><th>STATUS</th></tr></thead><tbody>
                        {roles?.data.map(role => <tr key={role.id}><td><b>{role.name}</b></td><td>{role.code}</td><td>{role.permissions_count ?? 0}</td><td><span className={role.is_active ? "pill active" : "pill"}>{role.is_active ? "Aktif" : "Nonaktif"}</span></td></tr>)}
                        {!roles?.data.length && <tr><td colSpan={4} className="empty-cell">Belum ada data role.</td></tr>}
                    </tbody></table></div>
                    <Pagination data={roles} page={rolePage} setPage={setRolePage} perPage={perPage} setPerPage={setPerPage} />
                </div>}

                {page === "features" && can("FEATURE_VIEW") && <div className="access-panel">
                    <div className="panel-heading"><div><h2>Daftar Fitur</h2><p>Fitur yang dapat diberikan kepada setiap role.</p></div><span>{features?.total ?? 0} fitur</span></div>
                    {can("FEATURE_MANAGE") && <form className="inline-form feature-form" onSubmit={createFeature}>
                        <input value={featureForm.name} onChange={e => setFeatureForm({ ...featureForm, name: e.target.value })} placeholder="Nama fitur" required />
                        <input value={featureForm.code} onChange={e => setFeatureForm({ ...featureForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "_") })} placeholder="KODE_FITUR" required />
                        <input value={featureForm.path} onChange={e => setFeatureForm({ ...featureForm, path: e.target.value })} placeholder="/path-menu" />
                        <button className="btn-primary" disabled={busy}>Tambah Fitur</button>
                    </form>}
                    <div className="list-toolbar"><input value={featureSearch} onChange={e => { setFeatureSearch(e.target.value); setFeaturePage(1); }} placeholder="Cari nama, kode, atau path fitur..." /></div>
                    <div className="table-wrap"><table className="access-table"><thead><tr><th>NAMA FITUR</th><th>KODE</th><th>PATH MENU</th><th>STATUS</th></tr></thead><tbody>
                        {features?.data.map(feature => <tr key={feature.id}><td><b>{feature.name}</b></td><td>{feature.code}</td><td>{feature.path || "—"}</td><td><span className={feature.is_active ? "pill active" : "pill"}>{feature.is_active ? "Aktif" : "Nonaktif"}</span></td></tr>)}
                        {!features?.data.length && <tr><td colSpan={4} className="empty-cell">Belum ada data fitur.</td></tr>}
                    </tbody></table></div>
                    <Pagination data={features} page={featurePage} setPage={setFeaturePage} perPage={perPage} setPerPage={setPerPage} />
                </div>}

                {page === "access" && can("ACCESS_MANAGE") && <div className="access-panel">
                    <div className="panel-heading"><div><h2>Pengaturan Hak Akses</h2><p>Pilih role, lalu tentukan fitur yang boleh diakses.</p></div></div>
                    <label className="role-picker">Pilih Role
                        <select value={selectedRole} onChange={e => loadRolePermissions(e.target.value)}>
                            <option value="">Pilih role...</option>{roles?.data.map(role => <option key={role.id} value={role.id}>{role.name} ({role.code})</option>)}
                        </select>
                    </label>
                    {selectedRole && <><div className="permission-grid">{allFeatures.map(feature => <label key={feature.id} className="permission-card">
                        <input type="checkbox" checked={selectedPermissionIds.includes(feature.id)} onChange={e => setSelectedPermissionIds(old => e.target.checked ? [...old, feature.id] : old.filter(id => id !== feature.id))} />
                        <span><b>{feature.name}</b><small>{feature.code}{feature.path ? ` · ${feature.path}` : ""}</small></span>
                    </label>)}</div>
                    <div className="permission-footer"><span>{selectedPermissionIds.length} fitur dipilih</span><button className="btn-primary" onClick={saveAccess} disabled={busy}>Simpan Hak Akses</button></div></>}
                </div>}
            </section>
        </main>
    </div>;
}

function Pagination<T>({ data, page, setPage, perPage, setPerPage }: {
    data: Page<T> | null; page: number; setPage: (page: number) => void;
    perPage: number; setPerPage: (size: number) => void;
}) {
    return <div className="pagination-bar">
        <div>Menampilkan {data?.data.length ?? 0} dari {data?.total ?? 0} data</div>
        <div className="pagination-actions">
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} aria-label="Jumlah data per halaman">
                {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size} / halaman</option>)}
            </select>
            <button disabled={!data || page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
            <span>Halaman {data?.current_page ?? 1} / {data?.last_page ?? 1}</span>
            <button disabled={!data || page >= data.last_page} onClick={() => setPage(page + 1)}>Berikutnya</button>
        </div>
    </div>;
}
