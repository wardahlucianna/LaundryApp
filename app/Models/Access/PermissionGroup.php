<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PermissionGroup extends Model
{
    protected $table = 'groupFeature';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['name', 'icon', 'ordering', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (PermissionGroup $group) => $group->id ??= (string) Str::uuid());
    }

    public function features()
    {
        return $this->hasMany(PermissionFeature::class, 'featureId');
    }
}
