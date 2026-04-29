import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";

export async function GET() {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;
  return NextResponse.json({ admin });
}
