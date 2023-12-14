<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        // Add more fields as needed
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Define relationships with other models.
     */
    public function familyMembers()
    {
        return $this->hasMany(FamilyMember::class);
    }

    /**
     * Example of a method to retrieve the user's family tree.
     */
    public function getFamilyTree()
    {
        // Implement logic to retrieve the family tree based on relationships
        return $this->familyMembers;
    }

    /**
     * Example of a method to add a family member.
     */
    public function addFamilyMember(array $data)
    {
        // Implement logic to create a new family member for the user
        return $this->familyMembers()->create($data);
    }

    /**
     * Example of a method to update a family member.
     */
    public function updateFamilyMember($familyMemberId, array $data)
    {
        // Implement logic to update a family member associated with the user
        return $this->familyMembers()->findOrFail($familyMemberId)->update($data);
    }

    /**
     * Example of a method to delete a family member.
     */
    public function deleteFamilyMember($familyMemberId)
    {
        // Implement logic to delete a family member associated with the user
        return $this->familyMembers()->findOrFail($familyMemberId)->delete();
    }
}
