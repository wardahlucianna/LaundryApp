import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { request } from "../../../../lib/api/request";
import type { Page } from "../../../../types/pagination";

type FeatureGroup = { id: string; name: string; code: string };
type Feature = {
    id: string;
    permission_group_id: string;
    name: string;
    code: string;
    path: string | null;
    menu_type: "sidebar" | "topbar";
    is_active: boolean;
    group?: FeatureGroup;
};
type Props = {
    token: string;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
};
type FeatureForm = {
    permission_group_id: string;
    name: string;
    code: string;
    path: string;
    menu_type: "sidebar" | "topbar";
};

const emptyForm: FeatureForm = {
    permission_group_id: "",
    name: "",
    code: "",
    path: "",
    menu_type: "sidebar",
};

export default function FeaturePage({ token, canCreate, canUpdate, canDelete }: Props) {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [groups, setGroups] = useState<FeatureGroup[]>([]);
    const [form, setForm] = useState<FeatureForm>(emptyForm);
    const [editing, setEditing] = useState<Feature | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Feature | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const load = useCallback(async () => {
        const query = new URLSearchParams({ per_page: "100" });
        if (search) query.set("search", search);
        if (status !== "") query.set("is_active", status);
        const [featureResult, groupResult] = await Promise.all([
            request<Page<Feature>>(`/permission-features?${query.toString()}`, token),
            request<Page<FeatureGroup>>("/permission-groups?per_page=100", token),
        ]);
        setFeatures(featureResult.data);
        setGroups(groupResult.data);
    }, [token, search, status]);

    useEffect(() => {
        load().catch(error => setError((error as Error).message));
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, permission_group_id: groups[0]?.id ?? "" });
        setError("");
        setFormVisible(true);
    };

    const openEdit = (feature: Feature) => {
        setEditing(feature);
        setForm({
            permission_group_id: feature.permission_group_id,
            name: feature.name,
            code: feature.code,
            path: feature.path ?? "",
            menu_type: feature.menu_type,
        });
        setError("");
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await request(
                editing ? `/permission-features/${editing.id}` : "/permission-features",
                token,
                {
                    method: editing ? "PUT" : "POST",
                    body: JSON.stringify({ ...form, path: form.path || null, is_active: true }),
                },
            );
            closeForm();
            setNotice(editing ? "Fitur berhasil diperbarui." : "Fitur berhasil ditambahkan.");
            await load();
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || busy) return;
        setBusy(true);
        setError("");
        try {
            await request(`/permission-features/${deleteTarget.id}`, token, { method: "DELETE" });
            setDeleteTarget(null);
            setNotice("Fitur berhasil dihapus.");
            await load();
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const updateField = <K extends keyof FeatureForm>(key: K, value: FeatureForm[K]) => {
        setForm(current => ({ ...current, [key]: value }));
    };

    return (
        <>
            <div className="access-heading">
                <div><h1>{formVisible ? (editing ? "Ubah Fitur" : "Tambah Fitur") : "Manajemen Fitur"}</h1></div>
            </div>

            {error && <div className="alert error">{error}<button onClick={() => setError("")}>×</button></div>}
            {notice && !formVisible && <div className="alert success">{notice}<button onClick={() => setNotice("")}>×</button></div>}

            {formVisible ? (
                <div className="access-panel">
                    <form className="modal-form permission-form-grid" onSubmit={handleSubmit}>
                        <label>Kelompok Menu
                            <select value={form.permission_group_id} onChange={event => updateField("permission_group_id", event.target.value)} required>
                                <option value="">Pilih kelompok...</option>
                                {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                            </select>
                        </label>
                        <label>Nama Fitur
                            <input value={form.name} onChange={event => updateField("name", event.target.value)} placeholder="Contoh: Manajemen Pelanggan" required />
                        </label>
                        <label>Kode Fitur
                            <input value={form.code} onChange={event => updateField("code", event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "_"))} placeholder="CUSTOMERS" required />
                        </label>
                        <label>Path Menu
                            <input value={form.path} onChange={event => updateField("path", event.target.value)} placeholder="/customers" />
                            <small className="field-note">Path halaman yang dibuka ketika menu dipilih.</small>
                        </label>
                        <label>Tipe Menu
                            <select value={form.menu_type} onChange={event => updateField("menu_type", event.target.value as FeatureForm["menu_type"])}>
                                <option value="sidebar">Sidebar</option>
                                <option value="topbar">Topbar</option>
                            </select>
                        </label>
                        <div className="modal-actions permission-form-actions">
                            <button type="button" className="btn-secondary" onClick={closeForm} disabled={busy}>Batal</button>
                            <button className="btn-primary" disabled={busy || !form.permission_group_id}>{busy ? "Menyimpan..." : "Simpan Fitur"}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="access-panel">
                    <div className="panel-heading">
                        <div><h2>Daftar Fitur</h2><p>Setiap fitur dapat memiliki aksi Lihat, Tambah, Edit, dan Hapus.</p></div>
                        {canCreate && <button className="btn-primary" onClick={openCreate}><Plus size={15} />Tambah Fitur</button>}
                    </div>
                    <div className="list-toolbar access-toolbar">
                        <input value={searchInput} onChange={event => setSearchInput(event.target.value)} onKeyDown={event => event.key === "Enter" && setSearch(searchInput.trim())} placeholder="Cari nama atau kode fitur..." />
                        <select value={status} onChange={event => setStatus(event.target.value)}>
                            <option value="">Semua Status</option><option value="1">Aktif</option><option value="0">Nonaktif</option>
                        </select>
                        <button className="btn-primary" onClick={() => setSearch(searchInput.trim())}><Search size={15} />Cari</button>
                        <button className="btn-secondary" onClick={() => { setSearchInput(""); setSearch(""); setStatus(""); }}><RotateCcw size={15} />Atur Ulang</button>
                    </div>
                    <div className="table-wrap">
                        <table className="access-table">
                            <thead><tr><th>NO</th><th>NAMA FITUR</th><th>KELOMPOK</th><th>KODE</th><th>PATH MENU</th><th>STATUS</th><th>AKSI</th></tr></thead>
                            <tbody>
                                {features.map((feature, index) => (
                                    <tr key={feature.id}>
                                        <td>{index + 1}</td><td><b>{feature.name}</b></td><td>{feature.group?.name ?? "—"}</td><td>{feature.code}</td><td>{feature.path || "—"}</td>
                                        <td><span className={feature.is_active ? "pill active" : "pill"}>{feature.is_active ? "Aktif" : "Nonaktif"}</span></td>
                                        <td><div className="row-actions">
                                            {canUpdate && <button className="icon-action" title="Edit" onClick={() => openEdit(feature)}><Pencil size={16} /></button>}
                                            {canDelete && <button className="icon-action danger" title="Hapus" onClick={() => setDeleteTarget(feature)}><Trash2 size={16} /></button>}
                                        </div></td>
                                    </tr>
                                ))}
                                {!features.length && <tr><td colSpan={7} className="empty-cell">Belum ada data fitur.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="delete-modal-backdrop" onClick={() => !busy && setDeleteTarget(null)}>
                    <section className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="feature-delete-title" onClick={event => event.stopPropagation()}>
                        <button className="delete-modal-close" onClick={() => setDeleteTarget(null)} disabled={busy} aria-label="Tutup"><X size={18} /></button>
                        <div className="delete-modal-icon"><Trash2 size={24} /></div>
                        <h2 id="feature-delete-title">Hapus fitur?</h2>
                        <p>Fitur <strong>“{deleteTarget.name}”</strong> akan dihapus. Pastikan fitur ini tidak lagi memiliki aksi yang digunakan.</p>
                        <div className="delete-modal-actions">
                            <button className="btn-secondary" onClick={() => setDeleteTarget(null)} disabled={busy}>Batal</button>
                            <button className="delete-confirm-button" onClick={handleDelete} disabled={busy}>{busy ? "Menghapus..." : "Ya, Hapus"}</button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
