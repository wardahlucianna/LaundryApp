<?php

namespace App\Models\Akses;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PermissionGroup extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['name', 'code', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (PermissionGroup $group) => $group->id ??= (string) Str::uuid());
    }

    public function features()
    {
        return $this->hasMany(PermissionFeature::class);
    }
}
