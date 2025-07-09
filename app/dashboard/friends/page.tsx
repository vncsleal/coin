import { Suspense } from 'react';
import { FriendsManager } from '@/components/shared/friends-manager';

export default function FriendsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
        <p className="text-muted-foreground">
          Manage your friends to easily share expenses together.
        </p>
      </div>

      <Suspense fallback={<div>Loading friends...</div>}>
        <FriendsManager />
      </Suspense>
    </div>
  );
}
