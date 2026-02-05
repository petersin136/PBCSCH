import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const FOLDER_CHURCH = process.env.GALLERY_FOLDER_CHURCH;
const FOLDER_KIDS = process.env.GALLERY_FOLDER_KIDS;
const FOLDER_YOUTH = process.env.GALLERY_FOLDER_YOUTH;

export type GalleryCategory = "all" | "church" | "kids" | "youth";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
}

export interface GalleryFile extends DriveFile {
  category: GalleryCategory;
}

async function fetchDriveFiles(folderId: string): Promise<DriveFile[]> {
  if (!API_KEY || !folderId) return [];
  const q = `'${folderId}' in parents and mimeType contains 'image/'`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${API_KEY}&fields=files(id,name,mimeType,createdTime)`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("[gallery] Drive API error:", res.status, await res.text());
    return [];
  }
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

export async function GET(request: NextRequest) {
  const category = (request.nextUrl.searchParams.get("category") ?? "all") as GalleryCategory;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_DRIVE_API_KEY not configured" },
      { status: 500 }
    );
  }

  const folders: { cat: GalleryCategory; id: string | undefined }[] =
    category === "all"
      ? [
          { cat: "church", id: FOLDER_CHURCH },
          { cat: "kids", id: FOLDER_KIDS },
          { cat: "youth", id: FOLDER_YOUTH },
        ]
      : [
          {
            cat: category,
            id:
              category === "church"
                ? FOLDER_CHURCH
                : category === "kids"
                  ? FOLDER_KIDS
                  : FOLDER_YOUTH,
          },
        ];

  const seen = new Set<string>();
  const results: GalleryFile[] = [];
  for (const { cat, id } of folders) {
    if (!id) continue;
    const files = await fetchDriveFiles(id);
    for (const f of files) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      results.push({ ...f, category: cat });
    }
  }

  return NextResponse.json({ files: results });
}
