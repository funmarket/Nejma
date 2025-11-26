"use client";
import { useDevapp } from '@/components/providers/devapp-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function UserButton() {
  const { user, loadingUser, signIn, signOut } = useDevapp();

  if (loadingUser) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold"
      >
        Connect
      </button>
    );
  }

  const displayName = user.displayName || user.email || "User";
  const avatarInitial = displayName[0]?.toUpperCase() || 'U';

  return (
    <button
      onClick={signOut}
      className="px-3 py-1 rounded-full bg-card border border-primary/50 text-foreground text-sm font-bold flex items-center gap-2"
    >
      {user.photoURL ? (
        <img src={user.photoURL} alt="User avatar" className="w-6 h-6 rounded-full"/>
      ) : (
        <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
          {avatarInitial}
        </span>
      )}
      <span className="truncate max-w-[100px]">@{displayName}</span>
    </button>
  );
}
