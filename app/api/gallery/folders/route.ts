import { NextResponse } from "next/server";

const BASE = "https://drive.google.com/drive/folders";

export async function GET() {
  const church = process.env.GALLERY_FOLDER_CHURCH;
  const kids = process.env.GALLERY_FOLDER_KIDS;
  const youth = process.env.GALLERY_FOLDER_YOUTH;
  return NextResponse.json({
    church: church ? `${BASE}/${church}` : null,
    kids: kids ? `${BASE}/${kids}` : null,
    youth: youth ? `${BASE}/${youth}` : null,
  });
}
