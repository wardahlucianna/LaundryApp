import { useState, type FormEvent } from "react";
import { request } from "../../../../lib/api/request";
import type {
    Permission,
    PermissionFormValue,
} from "../../../types/permission";

type Props = {
    token: string;
    permission: Permission | null;
    onSaved: (message: string) => void;
    onCancel: () => void;
};

export default function PermissionForm({
    token,
    permission,
    onSaved,
    onCancel,
}: Props) {
    const [form, setForm] = useState<PermissionFormValue>({
        name: permission?.name ?? "",
        code: permission?.code ?? "",
        path: permission?.path ?? "",
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true);
        setError("");

        try {
            await request(
                permission ? `/permissions/${permission.id}` : "/permissions",
                token,
                {
                    method: permission ? "PUT" : "POST",
                    body: JSON.stringify({
                        ...form,
                        path: form.path || null,
                    }),
                },
            );

            onSaved(
                permission
                    ? "Fitur berhasil diperbarui."
                    : "Fitur berhasil ditambahkan.",
            );
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="access-panel">
            <div className="panel-heading">
                <div>
                    <h2>{permission ? "Ubah Fitur" : "Tambah Fitur"}</h2>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}

            <form className="modal-form permission-form-grid" onSubmit={handleSubmit}>
                <label>
                    Nama Fitur
                    <input
                        value={form.name}
                        onChange={event =>
                            setForm({ ...form, name: event.target.value })
                        }
                        placeholder="Contoh: Manajemen Pelanggan"
                        required
                        autoFocus
                    />
                </label>

                <label>
                    Kode Fitur
                    <input
                        value={form.code}
                        onChange={event =>
                            setForm({
                                ...form,
                                code: event.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9_-]/g, "_"),
                            })
                        }
                        placeholder="CUSTOMER_VIEW"
                        required
                    />
                </label>

                <label>
                    Path Menu
                    <input
                        value={form.path}
                        onChange={event =>
                            setForm({ ...form, path: event.target.value })
                        }
                        placeholder="/customers"
                    />
                    <small className="field-note">
                        Isi path halaman yang digunakan untuk membuka menu. Awali dengan tanda /,
                        dan pastikan sesuai dengan route halaman di frontend. Contoh: /customers.
                    </small>
                </label>

                <div className="modal-actions permission-form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        Batal
                    </button>
                    <button className="btn-primary" disabled={busy}>
                        {busy
                            ? "Menyimpan..."
                            : permission
                                ? "Simpan Perubahan"
                                : "Simpan Fitur"}
                    </button>
                </div>
            </form>
        </div>
    );
}
