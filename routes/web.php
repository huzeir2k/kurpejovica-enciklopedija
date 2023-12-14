<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('index');
});


Route::get('/family', 'FamilyController@index');
Route::get('/family/create', 'FamilyController@create');
Route::post('/family/store', 'FamilyController@store');
Route::get('/family/{id}', 'FamilyController@show');
Route::get('/family/{id}/edit', 'FamilyController@edit');
Route::put('/family/{id}', 'FamilyController@update');
Route::delete('/family/{id}', 'FamilyController@destroy');
