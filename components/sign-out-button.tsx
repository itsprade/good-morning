'use client';

import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gm-text-tertiary hover:text-gm-text-secondary transition-colors"
    >
      Sign Out
    </button>
  );
}
