import { useState } from "react";
import type { Permission } from "../../../types/permission";
import PermissionForm from "./PermissionForm";
import PermissionList from "./PermissionList";

type Props = {
    token: string;
    canManage: boolean;
    onChanged: () => void;
};

export default function PermissionPage({ token, canManage, onChanged }: Props) {
    const [editing, setEditing] = useState<Permission | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [notice, setNotice] = useState("");

    const openForm = (permission?: Permission) => {
        setEditing(permission ?? null);
        setNotice("");
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setEditing(null);
    };

    const handleSaved = (message: string) => {
        closeForm();
        setNotice(message);
        setRefreshKey(value => value + 1);
        onChanged();
    };

    const handleDeleted = () => {
        setNotice("Fitur berhasil dihapus.");
        setRefreshKey(value => value + 1);
        onChanged();
    };

    return (
        <>
            <div className="access-heading">
                <div>
                    <small>MASTER DATA</small>
                    <h1>
                        {formVisible
                            ? editing ? "Ubah Fitur" : "Tambah Fitur"
                            : "Manajemen Fitur"}
                    </h1>
                </div>
            </div>

            {notice && !formVisible && (
                <div className="alert success">
                    {notice}
                    <button onClick={() => setNotice("")}>×</button>
                </div>
            )}

            {formVisible ? (
                <PermissionForm
                    token={token}
                    permission={editing}
                    onSaved={handleSaved}
                    onCancel={closeForm}
                />
            ) : (
                <PermissionList
                    token={token}
                    canManage={canManage}
                    refreshKey={refreshKey}
                    onAdd={() => openForm()}
                    onEdit={openForm}
                    onDeleted={handleDeleted}
                />
            )}
        </>
    );
}
