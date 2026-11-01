import { useEffect, useState, type FormEvent } from "react";
import { request } from "../../../../lib/api/request";
import type { Role, RoleFormValue } from "../../../types/role";

type Props = {
    token: string;
    role: Role | null;
    onSaved: (message: string) => void;
    onCancel: () => void;
};

export default function RoleForm({
    token,
    role,
    onSaved,
    onCancel,
}: Props) {
    const [form, setForm] = useState<RoleFormValue>({
        name: "",
        code: "",
    });
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(Boolean(role));
    const [error, setError] = useState("");

    useEffect(() => {
        if (!role) {
            setForm({ name: "", code: "" });
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        request<{ data: Role }>(`/roles/${role.id}`, token)
            .then(result => {
                if (active) {
                    setForm({
                        name: result.data.name,
                        code: result.data.code,
                    });
                }
            })
            .catch(error => {
                if (active) {
                    setError((error as Error).message);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [role, token]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true);
        setError("");

        try {
            await request(role ? `/roles/${role.id}` : "/roles", token, {
                method: role ? "PUT" : "POST",
                body: JSON.stringify(form),
            });

            onSaved(
                role
                    ? "Role berhasil diperbarui."
                    : "Role berhasil ditambahkan.",
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
                    <h2>{role ? "Ubah Role" : "Tambah Role"}</h2>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}

            {loading ? (
                <p>Memuat data role...</p>
            ) : (
                <form
                    className="modal-form permission-form-grid"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Nama Role
                        <input
                            value={form.name}
                            onChange={event =>
                                setForm({
                                    ...form,
                                    name: event.target.value,
                                })
                            }
                            placeholder="Contoh: Administrator"
                            required
                            autoFocus
                        />
                    </label>

                    <label>
                        Kode Role
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
                            placeholder="CONTOH_ROLE"
                            required
                        />
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
                                : role
                                    ? "Simpan Perubahan"
                                    : "Simpan Role"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
