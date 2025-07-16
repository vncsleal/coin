'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Search, Clock, Check, X, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  display_name?: string;
  email: string;
  avatar_url?: string; // Added avatar_url
  friendship_status?: 'friends' | 'pending_sent' | 'pending_received' | 'none';
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'denied';
  sender_name?: string;
  receiver_name?: string;
}

export default function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce delay
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    fetchFriendsAndRequests();
  }, []);

  const fetchFriendsAndRequests = async () => {
    try {
      const response = await fetch('/api/friends/list');
      if (!response.ok) {
        throw new Error('Failed to fetch friends and requests');
      }
      const data = await response.json();
      setFriends(data.friends);
      setPendingRequests(data.pendingRequests);
    } catch (error) {
      console.error('Error fetching friends and requests:', error);
      toast.error('Failed to load friends and requests.');
    }
  };

  const handleSearch = useCallback(async () => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/users/browse?query=${encodeURIComponent(debouncedSearchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users.');
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      });
      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }
      toast.success('Friend request sent!');
      fetchFriendsAndRequests(); // Refresh lists
      handleSearch(); // Refresh search results to update status
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request.');
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'deny') => {
    try {
      const response = await fetch(`/api/friends/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${action} friend request`);
      }
      toast.success(`Friend request ${action}ed!`);
      fetchFriendsAndRequests(); // Refresh lists
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast.error(`Failed to ${action} friend request.`);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }
      toast.success('Amigo removido!');
      fetchFriendsAndRequests(); // Refresh lists
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Falha ao remover amigo.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Amigos</h1>
        <p className="text-muted-foreground">Gerencie suas conexões e pedidos de amizade.</p>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar Amigos
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Meus Amigos
            
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Encontrar Novos Amigos</CardTitle>
              </div>
              <CardDescription>Busque por usuários e envie solicitações de amizade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex w-full items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch} variant="default">
                  Buscar
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Resultados da Busca</h3>
                    <Badge variant="secondary">{searchResults.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} alt={user.display_name || 'User'} />
                            <AvatarFallback className="text-sm font-medium">
                              {user.display_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{user.display_name || 'Usuário Desconhecido'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.friendship_status === 'none' && (
                            <Button onClick={() => sendFriendRequest(user.id)} size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Adicionar Amigo
                            </Button>
                          )}
                          {user.friendship_status === 'pending_sent' && (
                            <Button variant="outline" disabled size="sm">
                              <Clock className="h-4 w-4 mr-2" />
                              Solicitação Enviada
                            </Button>
                          )}
                          {user.friendship_status === 'pending_received' && (
                            <div className="flex space-x-2">
                              <Button onClick={() => handleFriendRequest(user.id, 'accept')} size="sm">
                                <Check className="h-4 w-4 mr-1" />
                                Aceitar
                              </Button>
                              <Button variant="outline" onClick={() => handleFriendRequest(user.id, 'deny')} size="sm">
                                <X className="h-4 w-4 mr-1" />
                                Recusar
                              </Button>
                            </div>
                          )}
                          {user.friendship_status === 'friends' && (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Users className="h-3 w-3 mr-1" />
                              Amigos
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Solicitações Pendentes</CardTitle>
                </div>
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive">{pendingRequests.length}</Badge>
                )}
              </div>
              <CardDescription>Solicitações de amizade que requerem sua atenção.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Nenhuma solicitação pendente</p>
                  <p className="text-sm text-muted-foreground mt-2">Todas as solicitações foram processadas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder-user.jpg" alt={request.sender_name} />
                          <AvatarFallback className="text-sm font-medium">
                            {request.sender_name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{request.sender_name || 'Usuário Desconhecido'}</p>
                          <p className="text-sm text-muted-foreground">quer ser seu amigo</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleFriendRequest(request.id, 'accept')} size="sm">
                          <Check className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button variant="outline" onClick={() => handleFriendRequest(request.id, 'deny')} size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friends List Tab */}
        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Meus Amigos</CardTitle>
                </div>
                
              </div>
              <CardDescription>Suas conexões ativas e confirmadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Nenhum amigo ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">Comece a buscar e adicionar amigos na aba "Buscar Amigos"!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.avatar_url || "/placeholder-user.jpg"} alt={friend.display_name || 'Friend'} />
                          <AvatarFallback className="text-sm font-medium">
                            {friend.display_name?.charAt(0).toUpperCase() || friend.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{friend.display_name || 'Amigo Desconhecido'}</p>
                          <p className="text-sm text-muted-foreground">{friend.email}</p>
                        </div>
                      </div>
                      <Button variant="default" size="sm" onClick={() => handleRemoveFriend(friend.id)}>
                        <UserX className="h-4 w-4 mr-1" />
                        Remover Amigo
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
