'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserBrowser } from './user-browser';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Mail,
  MoreHorizontal,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Friend {
  id: number;
  user_id: string;
  friend_user_id: string;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
  initiated_by: string;
  created_at: string;
  updated_at: string;
  friend_email: string;
  friend_name?: string;
  friend_avatar?: string;
  friend_id: string;
}

export function FriendsManager() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
      setFriends([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async (friendId: number, action: 'accept' | 'decline' | 'remove' | 'block') => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchFriends();
        
        const actionMessages = {
          accept: 'Solicitação de amizade aceita',
          decline: 'Solicitação de amizade recusada',
          remove: 'Amigo removido',
          block: 'Usuário bloqueado'
        };
        
        toast.success(actionMessages[action]);
      } else {
        throw new Error('Failed to update friendship');
      }
    } catch (error) {
      console.error('Error updating friendship:', error);
      toast.error('Failed to update friendship');
    }
  };

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => f.status === 'pending');

  const FriendCard = ({ friend, showActions = true }: { friend: Friend; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={friend.friend_avatar} />
              <AvatarFallback>
                {(friend.friend_name || friend.friend_email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {friend.friend_name || friend.friend_email}
              </p>
              <p className="text-sm text-muted-foreground">
                {friend.friend_email}
              </p>
              {friend.status === 'pending' && (
                <p className="text-xs text-muted-foreground">
                  {friend.initiated_by === friend.user_id ? 'Solicitação enviada' : 'Solicitação recebida'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {friend.status === 'accepted' && (
              <Badge variant="secondary" className="text-green-600">
                <Check className="w-3 h-3 mr-1" />
                Amigos
              </Badge>
            )}
            
            {friend.status === 'pending' && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Pendente
              </Badge>
            )}

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {friend.status === 'pending' && friend.initiated_by !== friend.user_id && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleFriendAction(friend.id, 'accept')}
                        className="text-green-600"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aceitar Solicitação
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleFriendAction(friend.id, 'decline')}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Recusar Solicitação
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {friend.status === 'accepted' && (
                    <>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleFriendAction(friend.id, 'remove')}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover Amigo
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuItem
                    onClick={() => handleFriendAction(friend.id, 'block')}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Bloquear Usuário
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Amigos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedFriends.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingRequests.filter(f => f.initiated_by !== f.user_id).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Enviadas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingRequests.filter(f => f.initiated_by === f.user_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            Meus Amigos ({acceptedFriends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Solicitações ({pendingRequests.filter(f => f.initiated_by !== f.user_id).length})
          </TabsTrigger>
          <TabsTrigger value="discover">
            <UserPlus className="w-4 h-4 mr-2" />
            Encontrar Amigos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Amigos</CardTitle>
              <CardDescription>
                Pessoas com quem você está conectado para compartilhar despesas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {acceptedFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Nenhum amigo ainda</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comece encontrando e adicionando amigos para compartilhar despesas.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab('discover')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Encontrar Amigos
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptedFriends.map((friend) => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Amizade</CardTitle>
              <CardDescription>
                Solicitações de amizade pendentes que precisam da sua resposta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.filter(f => f.initiated_by !== f.user_id).length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Nenhuma solicitação pendente</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Você não tem nenhuma solicitação de amizade no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests
                    .filter(f => f.initiated_by !== f.user_id)
                    .map((friend) => (
                      <FriendCard key={friend.id} friend={friend} />
                    ))}
                </div>
              )}

              {/* Sent Requests Section */}
              {pendingRequests.filter(f => f.initiated_by === f.user_id).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Solicitações Enviadas</h3>
                  <div className="space-y-3">
                    {pendingRequests
                      .filter(f => f.initiated_by === f.user_id)
                      .map((friend) => (
                        <FriendCard key={friend.id} friend={friend} showActions={false} />
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Encontrar Amigos</CardTitle>
              <CardDescription>
                Procure usuários e envie solicitações de amizade para começar a compartilhar despesas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserBrowser 
                onSelectUser={(user) => {
                  // Optional: Could show user details in a modal
                  console.log('Selected user:', user);
                }}
                showFriendActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
