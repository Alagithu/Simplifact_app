<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    // Liste les messages d'une conversation
    public function index($conversationId)
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Envoie un message
    public function store(Request $request, $conversationId)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $message = Message::create([
            'conversation_id' => $conversationId,
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);

        return response()->json($message, 201);
    }
}
