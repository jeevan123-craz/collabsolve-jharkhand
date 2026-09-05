'use client';

import SignInGate from '@/components/SignInGate';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <SignInGate onComplete={() => router.push('/')} />
  );
}
