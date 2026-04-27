"use client";
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return <header className="bg-primary text-white text-[14px] h-[56px] flex items-center justify-between p-4 border-b border-[#30363D]">
    <div>
      <p className="text-xl font-bold text-white">SequelPrep</p>
    </div>
    <div className="flex gap-2">
      {session && <>
          <p>{session?.user?.email}</p>
          {'|'}
          <button onClick={() => signOut()}>
            Sign Out
          </button>
        </>
      }
      {!session && <button onClick={() => signIn()}>
        Sign In
      </button>}
    </div>
  </header>;
}
