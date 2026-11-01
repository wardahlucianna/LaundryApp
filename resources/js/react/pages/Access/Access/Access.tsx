import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../../../../lib/api/request";
import type { Role } from "../../../types/role";
import type { Permission } from "../../../types/permission";
import type { Page } from "../../../../types/pagination";

type Props = {
    token: string;
    canManage: boolean;
};

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

    useEffect(() => {
        if (canManage) {
            loadOptions().catch(error => setError((error as Error).message));
        }
    }, [canManage, loadOptions]);

    const permissionGroups = useMemo(() => {
        const groups = new Map<string, {
            name: string;
            features: Map<string, { name: string; path: string | null; permissions: Permission[] }>;
        }>();

        permissions.forEach(permission => {
            const groupName = permission.feature?.group?.name ?? "Fitur Lainnya";
            const featureId = permission.feature?.id ?? permission.id;
            const featureName = permission.feature?.name ?? permission.name;

            if (!groups.has(groupName)) {
                groups.set(groupName, { name: groupName, features: new Map() });
            }

            const group = groups.get(groupName)!;
            if (!group.features.has(featureId)) {
                group.features.set(featureId, {
                    name: featureName,
                    path: permission.feature?.path ?? permission.path,
                    permissions: [],
                });
            }
            group.features.get(featureId)!.permissions.push(permission);
        });

        return Array.from(groups.values());
    }, [permissions]);

    const handleRoleChange = async (roleId: string) => {
        setSelectedRole(roleId);
        setSelectedPermissions([]);
        setError("");
        setNotice("");

        if (!roleId) return;

        try {
            const result = await request<{ data: Role }>(`/roles/${roleId}`, token);
            setSelectedPermissions(
                (result.data.permissions ?? []).map(permission => permission.id),
            );
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleSave = async () => {
        if (!selectedRole || busy) return;

        setBusy(true);
        setError("");
        setNotice("");

        try {
            await request(`/roles/${selectedRole}/permissions`, token, {
                method: "PUT",
                body: JSON.stringify({ permission_ids: selectedPermissions }),
            });
            setNotice("Hak akses berhasil disimpan.");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const togglePermission = (permissionId: string, checked: boolean) => {
        setSelectedPermissions(current =>
            checked
                ? [...current, permissionId]
                : current.filter(id => id !== permissionId),
        );
    };

    const toggleFeature = (featurePermissions: Permission[], checked: boolean) => {
        setSelectedPermissions(current => {
            const ids = featurePermissions.map(permission => permission.id);
            return checked
                ? Array.from(new Set([...current, ...ids]))
                : current.filter(id => !ids.includes(id));
        });
    };

    return (
        <>
            <div className="access-heading">
                <div>
                    <small>PENGATURAN</small>
                    <h1>Hak Akses</h1>
                    <p>Atur izin Lihat, Tambah, Edit, dan Hapus untuk setiap fitur.</p>
                </div>
            </div>

            {error && (
                <div className="alert error">
                    {error}
                    <button onClick={() => setError("")}>×</button>
                </div>
            )}

            {notice && (
                <div className="alert success">
                    {notice}
                    <button onClick={() => setNotice("")}>×</button>
                </div>
            )}

            <div className="access-panel">
                <div className="panel-heading">
                    <div>
                        <h2>Pengaturan Hak Akses</h2>
                        <p>Pilih role, lalu tentukan aksi yang boleh dilakukan.</p>
                    </div>
                </div>

                <label className="role-picker">
                    Pilih Role
                    <select
                        value={selectedRole}
                        onChange={event => handleRoleChange(event.target.value)}
                    >
                        <option value="">Pilih role...</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.name} ({role.code})
                            </option>
                        ))}
                    </select>
                </label>

                {selectedRole && (
                    <>
                        <div className="access-permission-groups">
                            {permissionGroups.map(group => (
                                <section className="access-permission-group" key={group.name}>
                                    <h3>{group.name}</h3>
                                    {Array.from(group.features.entries()).map(([featureId, feature]) => {
                                        const featureIds = feature.permissions.map(item => item.id);
                                        const selectedCount = featureIds.filter(id => selectedPermissions.includes(id)).length;
                                        const allSelected = featureIds.length > 0 && selectedCount === featureIds.length;

                                        return (
                                            <div className="access-feature-block" key={featureId}>
                                                <div className="access-feature-heading">
                                                    <div>
                                                        <b>{feature.name}</b>
                                                        {feature.path && <small>{feature.path}</small>}
                                                    </div>
                                                    <label className="access-feature-all">
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            ref={element => {
                                                                if (element) element.indeterminate = selectedCount > 0 && !allSelected;
                                                            }}
                                                            onChange={event => toggleFeature(feature.permissions, event.target.checked)}
                                                        />
                                                        Semua
                                                    </label>
                                                </div>
                                                <div className="access-action-list">
                                                    {feature.permissions.map(permission => (
                                                        <label className="access-action-option" key={permission.id}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissions.includes(permission.id)}
                                                                onChange={event => togglePermission(permission.id, event.target.checked)}
                                                            />
                                                            <span>{permission.name}</span>
                                                            <small>{permission.code}</small>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </section>
                            ))}
                        </div>

                        <div className="permission-footer">
                            <span>{selectedPermissions.length} hak akses dipilih</span>
                            <button className="btn-primary" onClick={handleSave} disabled={busy}>
                                {busy ? "Menyimpan..." : "Simpan Hak Akses"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
