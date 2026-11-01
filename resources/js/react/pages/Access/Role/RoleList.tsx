import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { request } from "../../../../lib/api/request";
import type { Role } from "../../../types/role";
import type { Page } from "../../../../types/pagination";
import Pagination from "../../../components/common/Pagination";

type Props = {
    token: string;
    canManage: boolean;
    refreshKey: number;
    onAdd: () => void;
    onEdit: (role: Role) => void;
    onDeleted: () => void;
};

export default function RoleList({
    token,
    canManage,
    refreshKey,
    onAdd,
    onEdit,
    onDeleted,
}: Props) {
    const [data, setData] = useState<Page<Role> | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        const query = new URLSearchParams({
            page: String(page),
            per_page: String(perPage),
        });

        if (search) query.set("search", search);
        if (status !== "") query.set("is_active", status);

        const result = await request<Page<Role>>(
            `/roles?${query.toString()}`,
            token,
        );

        setData(result);
    }, [token, page, perPage, search, status, refreshKey]);

    useEffect(() => {
        load().catch(error => setError((error as Error).message));
    }, [load]);

    const handleDelete = async (role: Role) => {
        if (!window.confirm(`Hapus role "${role.name}"?`)) return;

        setBusy(true);
        setError("");

        try {
            await request(`/roles/${role.id}`, token, {
                method: "DELETE",
            });

            if ((data?.data.length ?? 0) === 1 && page > 1) {
                setPage(value => value - 1);
            } else {
                onDeleted();
            }
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const applySearch = () => {
        setPage(1);
        setSearch(searchInput.trim());
    };

    const resetFilters = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setPage(1);
    };

    return (
        <>
            {error && (
                <div className="alert error">
                    {error}
                    <button onClick={() => setError("")}>×</button>
                </div>
            )}

            <div className="access-panel">
                <div className="panel-heading">
                    <div>
                        <h2>Daftar Role</h2>
                        <p>Role menentukan kelompok hak akses pengguna.</p>
                    </div>

                    <div className="heading-actions">
                        <span>{data?.total ?? 0} role</span>
                        {canManage && (
                            <button className="btn-primary" onClick={onAdd}>
                                <Plus size={15} />
                                Tambah Role
                            </button>
                        )}
                    </div>
                </div>

                <div className="list-toolbar access-toolbar">
                    <input
                        value={searchInput}
                        onChange={event => setSearchInput(event.target.value)}
                        onKeyDown={event => event.key === "Enter" && applySearch()}
                        placeholder="Cari nama atau kode role..."
                    />

                    <select
                        value={status}
                        onChange={event => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Semua Status</option>
                        <option value="1">Aktif</option>
                        <option value="0">Nonaktif</option>
                    </select>

                    <button className="btn-primary" onClick={applySearch}>
                        <Search size={15} />
                        Cari
                    </button>

                    <button className="btn-secondary" onClick={resetFilters}>
                        <RotateCcw size={15} />
                        Atur Ulang
                    </button>
                </div>

                <div className="table-wrap">
                    <table className="access-table">
                        <thead>
                            <tr>
                                <th>NO</th>
                                <th>NAMA ROLE</th>
                                <th>KODE</th>
                                <th>JUMLAH FITUR</th>
                                <th>STATUS</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data.map((role, index) => (
                                <tr key={role.id}>
                                    <td>{(page - 1) * perPage + index + 1}</td>
                                    <td><b>{role.name}</b></td>
                                    <td>{role.code}</td>
                                    <td>{role.permissions_count ?? 0}</td>
                                    <td>
                                        <span className={role.is_active ? "pill active" : "pill"}>
                                            {role.is_active ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            {canManage && (
                                                <>
                                                    <button
                                                        className="icon-action"
                                                        title="Edit"
                                                        onClick={() => onEdit(role)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-action danger"
                                                        title="Hapus"
                                                        disabled={busy || role.code === "SUPERADMIN"}
                                                        onClick={() => handleDelete(role)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!data?.data.length && (
                                <tr>
                                    <td colSpan={6} className="empty-cell">
                                        Belum ada data role.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    data={data}
                    page={page}
                    setPage={setPage}
                    perPage={perPage}
                    setPerPage={setPerPage}
                />
            </div>
        </>
    );
}
