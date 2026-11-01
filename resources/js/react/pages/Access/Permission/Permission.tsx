import { useState } from "react";
import type { Permission } from "../../../../features/master/fitur/permission/types/permission";
import PermissionForm from "./PermissionForm";
import PermissionList from "./PermissionList";
type Props = { token: string; canManage: boolean; onChanged: () => void };
export default function PermissionPage({ token, canManage, onChanged }: Props) {
 const [editing,setEditing]=useState<Permission|null>(null), [formVisible,setFormVisible]=useState(false), [refreshKey,setRefreshKey]=useState(0), [notice,setNotice]=useState("");
 const openForm=(permission?:Permission)=>{setEditing(permission??null);setNotice("");setFormVisible(true);};
 const closeForm=()=>{setFormVisible(false);setEditing(null);};
 const saved=(message:string)=>{closeForm();setNotice(message);setRefreshKey(v=>v+1);onChanged();};
 const deleted=()=>{setNotice("Fitur berhasil dihapus.");setRefreshKey(v=>v+1);onChanged();};
 return <><div className="access-heading"><div><small>MASTER DATA</small><h1>{formVisible?(editing?"Ubah Fitur":"Tambah Fitur"):"Manajemen Fitur"}</h1><p>{formVisible?"Lengkapi informasi fitur.":"Kelola daftar fitur aplikasi."}</p></div></div>{notice&&!formVisible&&<div className="alert success">{notice}<button onClick={()=>setNotice("")}>×</button></div>}{formVisible?<PermissionForm token={token} permission={editing} onSaved={saved} onCancel={closeForm}/>:<PermissionList token={token} canManage={canManage} refreshKey={refreshKey} onAdd={()=>openForm()} onEdit={openForm} onDeleted={deleted}/>}</>;
}