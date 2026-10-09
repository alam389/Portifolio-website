import { NextResponse, type NextRequest } from "next/server";

// The resume lives in a private Supabase bucket. This signs a short-lived URL
// with the secret key (server only), so the key and the file's location never
// reach the browser. Downloads redirect to the signed URL; `?view` streams the
// PDF inline from this origin so /resume can embed it in an iframe.
const BUCKET = "resume";
const OBJECT = "anthony_resume.pdf";
const FILENAME = "Anthony_Lam_Resume.pdf";
const EXPIRES_IN_S = 60;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.has("view");
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) {
    return NextResponse.json({ error: "Resume unavailable" }, { status: 503 });
  }

  const res = await fetch(`${base}/storage/v1/object/sign/${BUCKET}/${OBJECT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: EXPIRES_IN_S }),
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Resume unavailable" }, { status: 502 });
  }

  const { signedURL } = (await res.json()) as { signedURL: string };
  const url = `${base}/storage/v1${signedURL}`;

  if (view) {
    const pdf = await fetch(url, { cache: "no-store" });
    if (!pdf.ok || !pdf.body) {
      return NextResponse.json({ error: "Resume unavailable" }, { status: 502 });
    }
    return new NextResponse(pdf.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${FILENAME}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.redirect(`${url}&download=${encodeURIComponent(FILENAME)}`, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
