import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import RoleFormModal from "../../../../../features/master/akses/role/modals/RoleFormModal";
import { request } from "../../../../../lib/api/request";
import type { Role, RoleFormValue } from "../../../../../features/master/akses/role/types/role";
import type { Page } from "../../../../../types/pagination";
import Pagination from "../../../../components/common/Pagination";

type Props = { token: string; canManage: boolean };

export default function RolePage({ token, canManage }: Props) {
    const [data, setData] = useState<Page<Role> | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [reload, setReload] = useState(0);
    const [editing, setEditing] = useState<Role | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<RoleFormValue>({ name: "", code: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const load = useCallback(async () => {
        const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
        if (search) query.set("search", search);
        if (status !== "") query.set("is_active", status);
        const result = await request<Page<Role>>(`/roles?${query.toString()}`, token);
        setData(result);
    }, [token, page, perPage, search, status, reload]);

    useEffect(() => { load().catch(error => setError(error.message)); }, [load]);

    const openCreate = () => { setEditing(null); setForm({ name: "", code: "" }); setError(""); setFormOpen(true); };
    const openEdit = (role: Role) => { setEditing(role); setForm({ name: role.name, code: role.code }); setError(""); setFormOpen(true); };
    const closeForm = () => { if (!busy) { setFormOpen(false); setEditing(null); } };

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true); setError(""); setNotice("");
        try {
            await request(editing ? `/roles/${editing.id}` : "/roles", token, {
                method: editing ? "PUT" : "POST", body: JSON.stringify(form),
            });
            setFormOpen(false); setEditing(null); setNotice(editing ? "Role berhasil diperbarui." : "Role berhasil ditambahkan.");
            setReload(value => value + 1);
        } catch (error) { setError((error as Error).message); }
        finally { setBusy(false); }
    };

    const remove = async (role: Role) => {
        if (!window.confirm(`Hapus role "${role.name}"?`)) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await request(`/roles/${role.id}`, token, { method: "DELETE" });
            setNotice("Role berhasil dihapus.");
            if ((data?.data.length ?? 0) === 1 && page > 1) setPage(value => value - 1);
            else setReload(value => value + 1);
        } catch (error) { setError((error as Error).message); }
        finally { setBusy(false); }
    };

    return (
        <>
            <div className="access-heading"><div><small>MASTER DATA</small><h1>Manajemen Role</h1><p>Kelola kelompok pengguna dan perannya.</p></div></div>
            {error && <div className="alert error">{error}<button onClick={() => setError("")}>×</button></div>}
            {notice && <div className="alert success">{notice}<button onClick={() => setNotice("")}>×</button></div>}
            <div className="access-panel">
                <div className="panel-heading"><div><h2>Daftar Role</h2><p>Role menentukan kelompok hak akses pengguna.</p></div><div className="heading-actions"><span>{data?.total ?? 0} role</span>{canManage && <button className="btn-primary" onClick={openCreate}><Plus size={15}/> Tambah Role</button>}</div></div>
                <div className="list-toolbar access-toolbar">
                    <input value={searchInput} onChange={event => setSearchInput(event.target.value)} onKeyDown={event => event.key === "Enter" && (setPage(1), setSearch(searchInput.trim()))} placeholder="Cari nama atau kode role..." />
                    <select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Semua Status</option><option value="1">Aktif</option><option value="0">Nonaktif</option></select>
                    <button className="btn-primary" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}><Search size={15}/> Cari</button>
                    <button className="btn-secondary" onClick={() => { setSearchInput(""); setSearch(""); setStatus(""); setPage(1); }}><RotateCcw size={15}/> Atur Ulang</button>
                </div>
                <div className="table-wrap"><table className="access-table"><thead><tr><th>NO</th><th>NAMA ROLE</th><th>KODE</th><th>JUMLAH FITUR</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>
                    {data?.data.map((role, index) => <tr key={role.id}><td>{(page - 1) * perPage + index + 1}</td><td><b>{role.name}</b></td><td>{role.code}</td><td>{role.permissions_count ?? 0}</td><td><span className={role.is_active ? "pill active" : "pill"}>{role.is_active ? "Aktif" : "Nonaktif"}</span></td><td><div className="row-actions">{canManage && <><button className="icon-action" title="Edit" onClick={() => openEdit(role)}><Pencil size={16}/></button><button className="icon-action danger" title="Hapus" disabled={busy || role.code === "SUPERADMIN"} onClick={() => remove(role)}><Trash2 size={16}/></button></>}</div></td></tr>)}
                    {!data?.data.length && <tr><td colSpan={6} className="empty-cell">Belum ada data role.</td></tr>}
                </tbody></table></div>
                <Pagination data={data} page={page} setPage={setPage} perPage={perPage} setPerPage={setPerPage}/>
            </div>
            <RoleFormModal open={formOpen} editing={Boolean(editing)} value={form} busy={busy} onChange={setForm} onSubmit={save} onClose={closeForm}/>
        </>
    );
}
