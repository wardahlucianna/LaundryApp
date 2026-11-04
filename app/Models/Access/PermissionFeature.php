<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PermissionFeature extends Model
{
    protected $table = 'features';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['featureId', 'name', 'path', 'ordering', 'menu_type', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (PermissionFeature $feature) => $feature->id ??= (string) Str::uuid());
    }

    public function group()
    {
        return $this->belongsTo(PermissionGroup::class, 'featureId', 'groupFeatureId');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'roleFeatures', 'featureId', 'roleId');
    }
}
