<?php

namespace App\Models\Akses;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Permission extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['name', 'code', 'path', 'is_active', 'permission_feature_id', 'action_name'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(function (Permission $permission) {
            $permission->id ??= (string) Str::uuid();
        });
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }

    public function feature()
    {
        return $this->belongsTo(PermissionFeature::class, 'permission_feature_id');
    }
}
