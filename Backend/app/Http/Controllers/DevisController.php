<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Devis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DevisController extends Controller
{
   public function getAll(Request $request)
    {
    $devis = Devis::with(['lines', 'user:id,name'])->get();
    return response()->json($devis);
    
    }
    public function index(){
        $userId = Auth::id(); 
        $devis = Devis::where('id_user', $userId)->with('user:id,name')->get();
        return response()->json($devis,200);
    }
    public function store(Request $request)
    {
            try {
            $id_user = Auth::id(); 
            if (!$id_user) {
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            $data = $request->all();

            \Log::info('Devis reçu:', $data);

            // Vérification des lignes
            if (empty($data['lines']) || !is_array($data['lines'])) {
                return response()->json(['error' => 'Aucune ligne de produit fournie'], 400);
            }

            // Vérification des champs obligatoires du devis
            if (empty($data['ref_devis']) || empty($data['categorie'])) {
                return response()->json(['error' => 'Champs ref_devis ou categorie manquants'], 400);
            }
                $total = 0;
                $lines = $data['lines'];
            // Créer le devis principal
            $devis = Devis::create([
                'id_user'   => $id_user,
                'ref_devis' => $data['ref_devis'],
                'categorie' => $data['categorie'],
                'total'     => $data['total'] ?? 0,
            ]);

            // Créer les lignes associées
            foreach ($data['lines'] as $line) {
                if (!isset($line['ref_produit'], $line['nom_produit'], $line['quantite'], $line['prix_unitaire'])) {
                    return response()->json(['error' => 'Champs manquants pour une ligne de produit'], 400);
                }
                $line_total = (int)$line['quantite'] * (float)$line['prix_unitaire'];
                $total += $line_total;

                $devis->lines()->create([
                    'ref_produit'   => $line['ref_produit'],
                    'nom_produit'   => $line['nom_produit'],
                    'quantite'      => (int) $line['quantite'],
                    'prix_unitaire' => (float) $line['prix_unitaire'],
                    'total_ligne'   => ((int)$line['quantite']) * ((float)$line['prix_unitaire']),
                ]);
            }
                // Mettre à jour le total du devis
                $devis->update(['total' => $total]);
                

            return response()->json([
                'message' => 'Devis créé avec succès',
                'data'    => $devis->load('lines')
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur création devis: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur interne: ' . $e->getMessage()], 500);
        }
    }
    
    public function update (Request $request,$id){
        $id_user=Auth::user()->id;
        $devi=Devis::findOrFail($id);
        
        if($devi->id_user != $id_user)
        return response()->json(['message'=>'unthorized'],403);
       
        $devi->update($request->all());
        return response()->json($devi,200);
    }
    public function show (Request $request,$id){
        $devis = Devis::with('lines')->findOrFail($id);
        return response()->json($devis,200);
    }
    public function destroy (Request $request,$id){
        $id_user=Auth::user()->id;
        $devi=Devis::findOrFail($id);
        
        if($devi->id_user != $id_user)
        return response()->json(['message'=>'unthorized'],403);
        
        $devi->delete();
        return response()->json(null,204);
    }
}
