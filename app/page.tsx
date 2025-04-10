import Link from "next/link";

export default function Home() {
  return (
    <main className="home-container">
      <h1 className="home-title">Welcome to Food Dae</h1>
      <p className="home-text">Scan the QR code to order your favorite snacks!</p>
      <Link href="/menu">
        <button className="home-button">View Menu</button>
      </Link>
    </main>
  );
}
