
import { Suspense } from 'react';
import { FriendsManager } from '@/components/shared/friends-manager';

export default function FriendsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Amigos</h1>
        <p className="text-muted-foreground">
          Gerencie seus amigos para compartilhar despesas facilmente.
        </p>
      </div>

      <Suspense fallback={<div>Carregando amigos...</div>}>
        <FriendsManager />
      </Suspense>
    </div>
  );
}

