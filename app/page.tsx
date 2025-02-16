// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to [Stall Name]</h1>
      <p>Scan the QR code to order your favorite meals!</p>
      <Link href="/menu">
        <button>View Menu</button>
      </Link>
    </main>
  );
}
