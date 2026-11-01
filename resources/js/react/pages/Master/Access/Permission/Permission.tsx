import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import PermissionFormModal from "../../../../../features/master/fitur/permission/modals/PermissionFormModal";
import { request } from "../../../../../lib/api/request";
import type { Permission, PermissionFormValue } from "../../../../../features/master/fitur/permission/types/permission";
import type { Page } from "../../../../../types/pagination";
import Pagination from "../../../../components/common/Pagination";

type Props = { token: string; canManage: boolean; onChanged: () => void };

export default function PermissionPage({ token, canManage, onChanged }: Props) {
    const [data, setData] = useState<Page<Permission> | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [reload, setReload] = useState(0);
    const [editing, setEditing] = useState<Permission | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<PermissionFormValue>({ name: "", code: "", path: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const load = useCallback(async () => {
        const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
        if (search) query.set("search", search);
        if (status !== "") query.set("is_active", status);
        const result = await request<Page<Permission>>(`/permissions?${query.toString()}`, token);
        setData(result);
    }, [token, page, perPage, search, status, reload]);

    useEffect(() => { load().catch(error => setError(error.message)); }, [load]);

    const openCreate = () => { setEditing(null); setForm({ name: "", code: "", path: "" }); setError(""); setFormOpen(true); };
    const openEdit = (permission: Permission) => { setEditing(permission); setForm({ name: permission.name, code: permission.code, path: permission.path || "" }); setError(""); setFormOpen(true); };
    const closeForm = () => { if (!busy) { setFormOpen(false); setEditing(null); } };

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true); setError(""); setNotice("");
        try {
            await request(editing ? `/permissions/${editing.id}` : "/permissions", token, {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify({ ...form, path: form.path || null }),
            });
            setFormOpen(false); setEditing(null); setNotice(editing ? "Fitur berhasil diperbarui." : "Fitur berhasil ditambahkan.");
            setReload(value => value + 1); onChanged();
        } catch (error) { setError((error as Error).message); }
        finally { setBusy(false); }
    };

    const remove = async (permission: Permission) => {
        if (!window.confirm(`Hapus fitur "${permission.name}"?`)) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await request(`/permissions/${permission.id}`, token, { method: "DELETE" });
            setNotice("Fitur berhasil dihapus.");
            if ((data?.data.length ?? 0) === 1 && page > 1) setPage(value => value - 1);
            else setReload(value => value + 1);
            onChanged();
        } catch (error) { setError((error as Error).message); }
        finally { setBusy(false); }
    };

    return (
        <>
            <div className="access-heading"><div><small>MASTER DATA</small><h1>Manajemen Fitur</h1><p>Kelola daftar fitur aplikasi.</p></div></div>
            {error && <div className="alert error">{error}<button onClick={() => setError("")}>×</button></div>}
            {notice && <div className="alert success">{notice}<button onClick={() => setNotice("")}>×</button></div>}
            <div className="access-panel">
                <div className="panel-heading"><div><h2>Daftar Fitur</h2><p>Fitur yang dapat diberikan kepada setiap role.</p></div><div className="heading-actions"><span>{data?.total ?? 0} fitur</span>{canManage && <button className="btn-primary" onClick={openCreate}><Plus size={15}/> Tambah Fitur</button>}</div></div>
                <div className="list-toolbar access-toolbar">
                    <input value={searchInput} onChange={event => setSearchInput(event.target.value)} onKeyDown={event => event.key === "Enter" && (setPage(1), setSearch(searchInput.trim()))} placeholder="Cari nama, kode, atau path fitur..." />
                    <select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Semua Status</option><option value="1">Aktif</option><option value="0">Nonaktif</option></select>
                    <button className="btn-primary" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}><Search size={15}/> Cari</button>
                    <button className="btn-secondary" onClick={() => { setSearchInput(""); setSearch(""); setStatus(""); setPage(1); }}><RotateCcw size={15}/> Atur Ulang</button>
                </div>
                <div className="table-wrap"><table className="access-table"><thead><tr><th>NO</th><th>NAMA FITUR</th><th>KODE</th><th>PATH MENU</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>
                    {data?.data.map((feature, index) => <tr key={feature.id}><td>{(page - 1) * perPage + index + 1}</td><td><b>{feature.name}</b></td><td>{feature.code}</td><td>{feature.path || "—"}</td><td><span className={feature.is_active ? "pill active" : "pill"}>{feature.is_active ? "Aktif" : "Nonaktif"}</span></td><td><div className="row-actions">{canManage && <><button className="icon-action" title="Edit" onClick={() => openEdit(feature)}><Pencil size={16}/></button><button className="icon-action danger" title="Hapus" disabled={busy} onClick={() => remove(feature)}><Trash2 size={16}/></button></>}</div></td></tr>)}
                    {!data?.data.length && <tr><td colSpan={6} className="empty-cell">Belum ada data fitur.</td></tr>}
                </tbody></table></div>
                <Pagination data={data} page={page} setPage={setPage} perPage={perPage} setPerPage={setPerPage}/>
            </div>
            <PermissionFormModal open={formOpen} editing={Boolean(editing)} value={form} busy={busy} onChange={setForm} onSubmit={save} onClose={closeForm}/>
        </>
    );
}
