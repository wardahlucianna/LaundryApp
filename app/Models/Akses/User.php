<?php

namespace App\Models\Akses;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'role_id',
        'full_name',
        'username',
        'email',
        'phone',
        'password',
        'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            $user->id ??= (string) Str::uuid();
        });
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}
