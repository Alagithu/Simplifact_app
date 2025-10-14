<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
     public function getAll(Request $request)
    {
    $users = User::with(['user:id,name'])->get();
    return response()->json($users);
    
    }
    public function register(Request $request)
    {
        $request->validate([
            'name'=>'required|string|max:255',
            'email'=>'required|string|email|max:255|max:255|unique:users,email',
            'password'=>'required|string|min:8',
            'cdi'=>'integer|min:8',
            'phone'=>'integer|min:8',
            'role'=>'string'
        ]);
        $user=User::create([
            'name'=>$request->name,
            'phone'=>$request->phone,
            'cdi'=>$request->cdi,
            'society'=>$request->society,
            'category'=>$request->category,
            'email'=>$request->email,
            'role'=>$request->role,
            'password'=>Hash::make($request->password),
        ]);
        return response()->json([
            'message'=>'User Registered Successfully',
            'User'=>$user
            ],201);
    }
    public function login(Request $request)
    {
        $request->validate([
            'email'=>'required|string|email',
            'password'=>'required|string',
        ]);
        if (!Auth::attempt($request->only('email','password')))
        return response()->json([
            'message'=>'invalid email or password']
            ,401);
            // Create Token
            $user= User::where('email',$request->email)->FirstOrFail();
            $token=$user->createToken('auth_Token')->plainTextToken;
           return response()->json([
            'message'=>'Login Successfully',
            'user'=>$user,
            'token'=>$token,
            'role'=>$user->role
            ],200);
    }
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message'=>'logout successfully']);
    }
    // get user (factures,products,devis)
    public function getUserFactures($id)
    {
        $factures=User::findOrFail($id)->factures();
        return response()->json($factures,200);
    }
     public function getUserDevis($id)
    {
        $devis=User::findOrFail($id)->devis();
        return response()->json($devis,200);
    }
     public function getUserProducts($id)
    {
        $products=User::findOrFail($id)->products();
        return response()->json($products,200);
    }

    /*********************************************************************************************** */
      public function index(){
       $user= User::all();
        return response()->json($user,200);
    }
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Mise à jour sécurisée
        $user->update($request->only([
            'name',
            'email',
            'phone',
            'society',
            'category',
            'role'
        ]));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ], 200);
    }

    public function show (Request $request,$id){
        $user=User::find($id);
        return response()->json($user,200);
    }
    public function destroy (Request $request,$id){
        $id_user=Auth::user()->id;
        $user=User::findOrFail($id);
        
        if($user->id_user != $id_user)
        return response()->json(['message'=>'unthorized'],403);
        
        $user->delete();
        return response()->json(null,204);
    }

}
