'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Check, X, Clock, Users } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  friendship_status: 'none' | 'pending' | 'accepted' | 'blocked' | 'declined';
}

interface UserBrowserProps {
  onSelectUser?: (user: User) => void;
  selectedUsers?: string[];
  showFriendActions?: boolean;
}

export function UserBrowser({ onSelectUser, selectedUsers = [], showFriendActions = true }: UserBrowserProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchUsers(1, debouncedSearch);
  }, [debouncedSearch]);

  const fetchUsers = async (pageNum: number, searchTerm: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/browse?search=${encodeURIComponent(searchTerm)}&page=${pageNum}&limit=20`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data structure is valid
      const usersArray = data.users || [];
      const pagination = data.pagination || { page: pageNum, limit: 20, hasMore: false };
      
      if (pageNum === 1) {
        setUsers(usersArray);
      } else {
        setUsers(prev => [...prev, ...usersArray]);
      }
      
      setHasMore(pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      
      // Reset to safe state on error
      if (pageNum === 1) {
        setUsers([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUserId: userId })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, friendship_status: 'pending' }
            : user
        ));
        toast.success('Friend request sent!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const getFriendshipBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="secondary" className="text-green-600"><Check className="w-3 h-3 mr-1" />Friends</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'blocked':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Blocked</Badge>;
      default:
        return null;
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchUsers(page + 1, debouncedSearch);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading && users.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && users.length === 0 && search && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p>No users match your search "{search}"</p>
            <p className="text-sm mt-2">Try a different search term or check the spelling.</p>
          </div>
        )}

        {!loading && users.length === 0 && !search && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No users available</h3>
            <p>There are no other users in the system yet.</p>
            <p className="text-sm mt-2">Users will appear here as they join the platform.</p>
          </div>
        )}

        {users.map((user) => (
          <Card 
            key={user.id} 
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedUsers.includes(user.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectUser?.(user)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.display_name || user.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getFriendshipBadge(user.friendship_status)}
                  
                  {showFriendActions && user.friendship_status === 'none' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFriendRequest(user.id);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add Friend
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {loading && users.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        
        {hasMore && !loading && users.length > 0 && (
          <Button 
            variant="outline" 
            onClick={loadMore}
            className="w-full"
          >
            Load More Users
          </Button>
        )}
      </div>
    </div>
  );
}
