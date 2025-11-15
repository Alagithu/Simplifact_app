<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    //Affiche toutes les conversations de l'utilisateur connecté
    public function index()
    {
        $userId = Auth::id();
        $conversations = Conversation::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with([
                // Charger les deux participants
                'sender:id,name,email',
                'receiver:id,name,email',
                // Charger le dernier message
                'messages' => function ($query) {
                    $query->latest()->limit(1);
                }
            ])
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($conversations);
    }

    //Crée une nouvelle conversation ou renvoie celle existante
     
    public function store(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $senderId = Auth::id();
        $receiverId = $request->recipient_id;

        // Vérifier si une conversation existe déjà entre les deux utilisateurs
        $conversation = Conversation::where(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $senderId)
                  ->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $receiverId)
                  ->where('receiver_id', $senderId);
        })->first();

        // Si elle n'existe pas, la créer
        if (!$conversation) {
            $conversation = Conversation::create([
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
            ]);
        }

        // Créer le message initial
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $senderId,
            'body' => $request->message,
        ]);

        // Actualiser la date de mise à jour
        $conversation->touch();

        return response()->json([
            'message' => 'Conversation créée ou mise à jour avec succès',
            'conversation' => $conversation->load(['sender', 'receiver']),
        ], 201);
    }
}
