import { notFound } from "next/navigation";
import AdminLogin from "./AdminLogin";

// Always evaluate the gate at request time (depends on a runtime env var).
export const dynamic = "force-dynamic";

/**
 * The admin login lives behind a secret path segment so it isn't easy to find.
 * The expected segment is stored in the server-only env var ADMIN_LOGIN_PATH
 * (NOT a NEXT_PUBLIC_ var, so the secret never ships in the client bundle).
 * Anything that doesn't match returns a 404 — e.g. /admin/login is just a 404.
 *
 * Log in at:  /admin/<ADMIN_LOGIN_PATH>
 */
export default async function AdminGatePage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  if (!process.env.ADMIN_LOGIN_PATH || gate !== process.env.ADMIN_LOGIN_PATH) {
    notFound();
  }

  return <AdminLogin />;
}
