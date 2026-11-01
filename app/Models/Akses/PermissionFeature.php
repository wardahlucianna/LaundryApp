<?php

namespace App\Models\Akses;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PermissionFeature extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['permission_group_id', 'name', 'code', 'path', 'menu_type', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (PermissionFeature $feature) => $feature->id ??= (string) Str::uuid());
    }

    public function group()
    {
        return $this->belongsTo(PermissionGroup::class, 'permission_group_id');
    }

    public function actions()
    {
        return $this->hasMany(Permission::class, 'permission_feature_id');
    }
}
