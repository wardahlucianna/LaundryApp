export type Permission = {
    id: string;
    name: string;
    code: string;
    path: string | null;
    is_active: boolean;
    roles_count?: number;
};

export type PermissionFormValue = {
    name: string;
    code: string;
    path: string;
};
