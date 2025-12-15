// MVP: Route disabled - Feature coming soon
// Original code preserved in git history - revert this file when ready to enable

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Feature coming soon", code: "FEATURE_DISABLED" },
    { status: 503 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Feature coming soon", code: "FEATURE_DISABLED" },
    { status: 503 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Feature coming soon", code: "FEATURE_DISABLED" },
    { status: 503 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Feature coming soon", code: "FEATURE_DISABLED" },
    { status: 503 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Feature coming soon", code: "FEATURE_DISABLED" },
    { status: 503 }
  );
}
