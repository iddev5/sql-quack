"use client";
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";

const links = [
  { href: '/dashboard', name: 'Problems' },
  { href: '/', name: 'Editor' },
]

export default function Navbar() {
  const { data: session } = useSession();

  return <header className="bg-primary text-white text-[14px] h-[56px] flex items-center justify-between p-4 border-b border-[#30363D]">
    <div className="flex items-end gap-4">
      <p className="text-xl font-bold text-white pr-8">SequelPrep</p>
      <div className="flex gap-4">
        {
          links.map(link =>
            <Link href={link.href} className="group hover:text-indigo-400 transition-all">
              {link.name}
              <div className="w-[0px] h-[2px] rounded-lg bg-indigo-400 opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300">

              </div>
            </Link>
          )
        }
      </div>
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
