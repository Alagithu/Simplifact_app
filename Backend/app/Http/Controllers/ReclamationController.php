<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReclamationController extends Controller
{
      public function index(){
        $userId = Auth::id();
        $reclamation=Reclamation::where('id_user', $userId)->get();
        return response()->json($reclamation,200);
    }
        public function getAll(Request $request)
    {
        $reclamations = Reclamation::with(['user:id,name'])->get();
        return response()->json($reclamations);
    }

    public function store(Request $request)
    {
        $id_user=Auth::id();
        $reclamation=Reclamation::create(
           [
            'title'=>$request->title,
            'description'=>$request->description,
            'id_user'=>$id_user
           ] 
        );
        return response()->json($reclamation,201);
    }
    public function update (Request $request,$id){
        $id_user=Auth::user()->id;
        $reclamation=Reclamation::findOrFail($id);
        
        if($reclamation->id_user != $id_user)
        return response()->json(['message'=>'unthorized'],403);

        $reclamation->update($request->all());
        return response()->json($reclamation,200);
    }
    public function show (Request $request,$id){
        $reclamation=Reclamation::find($id);
        return response()->json($reclamation,200);
    }
    public function destroy (Request $request,$id){
       
        $reclamation=Reclamation::findOrFail($id);
        
        if(!$reclamation)
        return response()->json(['message'=>'unthorized'],403);
        
        $reclamation->delete();
        return response()->json(null,204);
    }
}
