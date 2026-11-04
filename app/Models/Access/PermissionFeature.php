<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PermissionFeature extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['permission_group_id', 'name', 'path', 'ordering', 'menu_type', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (PermissionFeature $feature) => $feature->id ??= (string) Str::uuid());
    }

    public function group()
    {
        return $this->belongsTo(PermissionGroup::class, 'permission_group_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permission_features', 'permission_feature_id', 'role_id');
    }
}
