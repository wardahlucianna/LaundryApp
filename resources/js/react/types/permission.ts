export type PermissionGroupSummary = {
    id: string;
    name: string;
    code: string;
};

export type PermissionFeatureSummary = {
    id: string;
    name: string;
    code: string;
    path: string | null;
    group?: PermissionGroupSummary | null;
};

export type Permission = {
    id: string;
    name: string;
    code: string;
    path: string | null;
    is_active: boolean;
    roles_count?: number;
    action_name?: string | null;
    permission_feature_id?: string | null;
    feature?: PermissionFeatureSummary | null;
};

export type PermissionFormValue = {
    name: string;
    code: string;
    path: string;
};
