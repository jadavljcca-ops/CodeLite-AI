import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || "developer@codelite.ai";
    const fullName = body.fullName || "Demo Developer";

    const response = NextResponse.json({
      success: true,
      user: {
        id: "demo-user-id",
        email,
        user_metadata: { full_name: fullName },
      },
    });

    // Set cookie for 7 days
    response.cookies.set("codelite_demo_user", JSON.stringify({ email, fullName, id: "demo-user-id" }), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
