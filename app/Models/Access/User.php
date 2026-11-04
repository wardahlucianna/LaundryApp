<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'userId';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';
    const REMEMBER_TOKEN = 'rememberToken';

    protected $fillable = [
        'roleId', 'fullName', 'username', 'email', 'phone', 'password', 'isActive',
    ];

    protected $hidden = ['password', 'rememberToken'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'isActive' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::creating(fn (User $user) => $user->userId ??= (string) Str::uuid());
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'roleId', 'roleId');
    }
}
