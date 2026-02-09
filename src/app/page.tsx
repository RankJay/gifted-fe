import { Logo } from "@/components/icons/logo-b";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="">
        <Logo width={150} height={150} />
      </main>
    </div>
  );
}
