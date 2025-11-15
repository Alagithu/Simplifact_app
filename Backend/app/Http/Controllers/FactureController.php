<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FactureController extends Controller
{
public function index(){
    $userId = Auth::id();
    $factures = Facture::where('id_user', $userId)->get();
    return response()->json($factures,200);
}

public function store(Request $request)
{
    $id_user = Auth::id();
    if (!$id_user) {
        return response()->json(['error' => 'Utilisateur non authentifié'], 401);
    }

    $data = $request->all();
    \Log::info('Facture reçue:', $data);

    if (empty($data['ref_facture']) || empty($data['billed_to'])) {
        return response()->json(['error' => 'Champs ref_facture ou billed_to manquants'], 400);
    }

    if (empty($data['lines']) || !is_array($data['lines'])) {
        return response()->json(['error' => 'Aucune ligne de produit fournie'], 400);
    }

    try {
        // Créer la facture
        $facture = Facture::create([
            'id_user'       => $id_user,
            'ref_facture'   => $data['ref_facture'],
            'montant_ht'    => $data['montant_ht'] ?? 0,
            'tva'           => $data['tva'] ?? 0,
            'montant_ttc'   => $data['montant_ttc'] ?? 0,
            'mode_paiement' => $data['mode_paiement'] ?? '',
            'name_client'   => $data['billed_to'],
        ]);

        // Ajouter les lignes
        foreach ($data['lines'] as $line) {
            if (!isset($line['ref_produit'], $line['nom_produit'], $line['quantite'], $line['prix_unitaire'])) {
                return response()->json(['error' => 'Ligne produit invalide'], 400);
            }

            $facture->lines()->create([
                'ref_produit'   => $line['ref_produit'],
                'nom_produit'  => $line['nom_produit'],
                'quantite'      => (int) $line['quantite'],
                'prix_unitaire' => (float) $line['prix_unitaire'],
                'total_ligne'   => (int)$line['quantite'] * (float)$line['prix_unitaire'],
            ]);
        }

        return response()->json([
            'message' => 'Facture créée avec succès',
            'data'    => $facture->load('lines')
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Erreur création facture: '.$e->getMessage());
        return response()->json(['error' => 'Erreur interne: '.$e->getMessage()], 500);
    }
}




    public function update (Request $request,$id){
        $id_user=Auth::user()->id;
        $facture=Facture::findOrFail($id);
        
        if($facture->id_user != $id_user)
        return response()->json(['message'=>'unthorized'],403);
       
        $facture->update($request->all());
        return response()->json($facture,200);
    }
    public function show($id)
    {
        $facture = Facture::with(['lines' => function($q) {
            $q->select('id', 'facture_id', 'ref_produit', 'nom_produit', 'quantite', 'prix_unitaire', 'total_ligne');
        }])->findOrFail($id);

        return response()->json($facture);
    }

    public function destroy(Request $request, $id)
    {

    $facture = Facture::findOrFail($id);

    // Vérification propriétaire
    if (!$facture) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    $facture->delete();

    return response()->json([
        'message' => 'Facture supprimée avec succès',
        'id' => $id
    ], 200);
    }

}
