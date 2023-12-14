<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'date_of_birth',
        'date_of_death', // If applicable
        'relationship',   // e.g., parent, child, grandparent
        'bio',            // Biography or additional information
        // Add more fields as needed
    ];

    /**
     * Define relationships with other models.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Example of a scope for retrieving living family members.
     */
    public function scopeLiving($query)
    {
        return $query->whereNull('date_of_death');
    }

    /**
     * Example of an accessor for displaying the full name.
     */
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * Example of an accessor for calculating age.
     */
    public function getAgeAttribute()
    {
        // Implement logic to calculate age based on date_of_birth
        // You can use Carbon or other date manipulation libraries
        return optional($this->date_of_birth)->age;
    }
}

