import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { revalidateSecret } from "@/sanity/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = request.headers.get("x-sanity-secret") || body.secret;

    if (secret !== revalidateSecret) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const type = body._type;
    if (typeof type !== "string") {
      return NextResponse.json({ message: "Missing _type" }, { status: 400 });
    }

    revalidateTag(type, "default");
    return NextResponse.json({ revalidated: true, type });
  } catch {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
