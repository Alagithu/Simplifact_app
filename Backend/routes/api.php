<?php

use App\Http\Controllers\DevisController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// user routes (ajouter pagination)
Route::get('users/all',[UserController::class,'index']);
Route::get('users/{id}',[UserController::class,'show']);
Route::delete('users/{id}',[UserController::class,'destroy']);
Route::put('users/{id}',[UserController::class,'update']);
Route::get('users', [UserController::class, 'getAll'])->middleware('auth:sanctum');


// auth routes
Route::post('register',[UserController::class,'register']);
Route::post('login',[UserController::class,'login']);
Route::post('logout',[UserController::class,'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function()
{    
// reclamations routes (ajouter pagination)
Route::get('reclamation/all',[ReclamationController::class,'index']);
Route::post('reclamation/add',[ReclamationController::class,'store']);
Route::put('reclamation/{id}',[ReclamationController::class,'update']);
Route::get('reclamation/{id}',[ReclamationController::class,'show']);
Route::delete('reclamation/{id}',[ReclamationController::class,'destroy']);
Route::get('reclamation', [ReclamationController::class, 'getAll'])->middleware('auth:sanctum');

// product routes (ajouter pagination)
Route::get('product/all',[ProductController::class,'index']);
Route::post('product/add',[ProductController::class,'store']);
Route::put('product/{id}',[ProductController::class,'update']);
Route::get('product/{id}',[ProductController::class,'show']);
Route::delete('product/{id}',[ProductController::class,'destroy']);
Route::get('product', [ProductController::class, 'getAll'])->middleware('auth:sanctum');


//Facture routes
Route::get('facture/all',[FactureController::class,'index']);
Route::post('facture/add',[FactureController::class,'store']);
Route::put('facture/{id}',[FactureController::class,'update']);
Route::get('facture/{id}',[FactureController::class,'show']);
Route::delete('facture/{id}',[FactureController::class,'destroy']);
Route::get('facture', [FactureController::class, 'getAll'])->middleware('auth:sanctum');

//Devis routes
Route::get('devis/all',[DevisController::class,'index']);
Route::post('devis/add',[DevisController::class,'store']);
Route::put('devis/{id}',[DevisController::class,'update']);
Route::get('devis/{id}',[DevisController::class,'show']);
Route::delete('devis/{id}',[DevisController::class,'destroy']);

Route::get('devis', [DevisController::class, 'getAll'])->middleware('auth:sanctum');

// get user papers

Route::get('user/{id}/factures',[UserController::class,'getUserFactures']);
Route::get( 'user/{id}/devis',[UserController::class,'getUserDevis']);
Route::get( 'user/{id}/products',[UserController::class,'getUserProducts']);
});



















Route::get('factures',[FactureController::class,'index']);
Route::post('factures',[FactureController::class,'store']);
Route::put('factures/{id}',[FactureController::class,'update']);
Route::get('factures/{id}',[FactureController::class,'show']);
Route::delete('factures/{id}',[FactureController::class,'destroy']);