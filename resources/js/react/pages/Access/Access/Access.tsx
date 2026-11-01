import { useCallback, useEffect, useState } from "react";
import { request } from "../../../../lib/api/request";
import type { Role } from "../../../../features/master/akses/role/types/role";
import type { Permission } from "../../../../features/master/fitur/permission/types/permission";
import type { Page } from "../../../../types/pagination";

type Props = { token: string; canManage: boolean };

export default function AccessPage({ token, canManage }: Props) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadOptions = useCallback(async () => {
        const [roleResult, permissionResult] = await Promise.all([
            request<Page<Role>>("/roles?per_page=100", token),
            request<Page<Permission>>("/permissions?per_page=100", token),
        ]);
        setRoles(roleResult.data);
        setPermissions(permissionResult.data);
    }, [token]);

    useEffect(() => { if (canManage) loadOptions().catch(error => setError(error.message)); }, [canManage, loadOptions]);

    const selectRole = async (roleId: string) => {
        setSelectedRole(roleId); setSelectedPermissions([]); setError(""); setNotice("");
        if (!roleId) return;
        try {
            const result = await request<{ data: Role }>(`/roles/${roleId}`, token);
            setSelectedPermissions((result.data.permissions || []).map(permission => permission.id));
        } catch (error) { setError((error as Error).message); }
    };

    const save = async () => {
        if (!selectedRole || busy) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await request(`/roles/${selectedRole}/permissions`, token, {
                method: "PUT", body: JSON.stringify({ permission_ids: selectedPermissions }),
            });
            setNotice("Hak akses berhasil disimpan.");
        } catch (error) { setError((error as Error).message); }
        finally { setBusy(false); }
    };

    return (
        <>
            <div className="access-heading"><div><small>PENGATURAN</small><h1>Hak Akses</h1><p>Atur fitur yang dapat diakses setiap role.</p></div></div>
            {error && <div className="alert error">{error}<button onClick={() => setError("")}>×</button></div>}
            {notice && <div className="alert success">{notice}<button onClick={() => setNotice("")}>×</button></div>}
            <div className="access-panel">
                <div className="panel-heading"><div><h2>Pengaturan Hak Akses</h2><p>Pilih role, lalu tentukan fitur yang boleh diakses.</p></div></div>
                <label className="role-picker">Pilih Role
                    <select value={selectedRole} onChange={event => selectRole(event.target.value)}>
                        <option value="">Pilih role...</option>
                        {roles.map(role => <option key={role.id} value={role.id}>{role.name} ({role.code})</option>)}
                    </select>
                </label>
                {selectedRole && <>
                    <div className="permission-grid">{permissions.map(permission => (
                        <label key={permission.id} className="permission-card">
                            <input type="checkbox" checked={selectedPermissions.includes(permission.id)} onChange={event => setSelectedPermissions(current => event.target.checked ? [...current, permission.id] : current.filter(id => id !== permission.id))}/>
                            <span><b>{permission.name}</b><small>{permission.code}{permission.path ? ` · ${permission.path}` : ""}</small></span>
                        </label>
                    ))}</div>
                    <div className="permission-footer"><span>{selectedPermissions.length} fitur dipilih</span><button className="btn-primary" onClick={save} disabled={busy}>{busy ? "Menyimpan..." : "Simpan Hak Akses"}</button></div>
                </>}
            </div>
        </>
    );
}