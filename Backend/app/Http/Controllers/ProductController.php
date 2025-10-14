<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function getAll(Request $request)
    {
    $products = Product::with([ 'user:id,name'])->get();
    return response()->json($products);
    }


     public function index(){
       $userId = Auth::id(); 
        $products = Product::where('id_user', $userId)->get();
        return response()->json($products,200);
    }
    public function store(Request $request)
    {
        $id_user=Auth::id();
        //  $request->validate([
        //     'id_user'=>'required|exists:users,id'
        // ]);
        $product=Product::create(
           [
            'nom_produit'=>$request->nom_produit,
            'ref_produit'=>$request->ref_produit,
            'type'=>$request->type,
            'prix'=>$request->prix,
            'id_user'=>$id_user
           ]
        );
        return response()->json($product,201);
    }
    public function update (Request $request,$id){
        $id_user=Auth::user()->id;
        $product=Product::findOrFail($id);
        
        if($product->id_user != $id_user)
        return response()->json(['message'=>'unthorized'],403);

        $product->update($request->all());
        return response()->json($product,200);
    }
    public function show (Request $request,$id){
        $product=Product::find($id);
        return response()->json($product,200);
    }
    public function destroy (Request $request,$id){
        $id_user=Auth::user()->id;
        $product=Product::findOrFail($id);
        
        if($product->id_user != $id_user)
        return response()->json(['message'=>'unthorized'],403);
        
        $product->delete();
        return response()->json(null,204);
    }
}
