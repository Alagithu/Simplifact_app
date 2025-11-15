<?php

namespace App\Policies;

use App\Models\ChMessage as Message;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class chMessage
{
    use HandlesAuthorization;

    //Vérifier si l'utilisateur peut voir les messages d'une conversation
   
    public function viewConversation(User $user, $otherUserId)
    {
    // L'utilisateur peut voir ses propres conversations
        return true;
    }

    // Vérifier si l'utilisateur peut envoyer un message
     
    public function send(User $user)
    {
        return true;
    }

    //Vérifier si l'utilisateur peut supprimer un message
    
    public function delete(User $user, Message $message)
    {
        return $user->id === $message->from_id;
    }

    //Vérifier si l'utilisateur peut voir un message
    
    public function view(User $user, Message $message)
    {
        return $user->id === $message->from_id || $user->id === $message->to_id;
    }
}