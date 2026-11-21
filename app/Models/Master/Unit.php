<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Unit extends Model
{
    protected $table = 'units';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';
    protected $primaryKey = 'unitId';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['code', 'name', 'symbol', 'description', 'isActive', 'ordering'];

    protected $casts = [
        'isActive' => 'boolean',
        'ordering' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(fn (Unit $unit) => $unit->unitId ??= (string) Str::uuid());
    }
}
