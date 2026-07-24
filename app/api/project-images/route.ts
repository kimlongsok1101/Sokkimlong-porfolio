import { NextResponse } from "next/server";
import { readdirSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminClient";

const ALLOWED_IMAGE_EXTENSIONS = /(jpe?g|png|gif|webp|avif)$/i;
const STORAGE_BUCKET = "projects";

function isImageFileName(name: string) {
  return ALLOWED_IMAGE_EXTENSIONS.test(name);
}

async function ensureBucketExists(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>) {
  const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
  if (error && error.statusCode !== "409" && error.status !== 409) {
    return { success: false, error };
  }
  return { success: true, data };
}

export async function GET() {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list("", {
      limit: 250,
      sortBy: { column: "name", order: "asc" },
    });

    if (!error && data) {
      const files = (data ?? [])
        .filter((item) => item.name && isImageFileName(item.name))
        .map((item) => {
          const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(item.name);
          return {
            name: item.name,
            url: urlData.publicUrl,
          };
        })
        .filter((item) => Boolean(item.url));

      return NextResponse.json({ data: files });
    }

    if (error && (error.statusCode === "404" || error.status === 404 || /Bucket not found/i.test(error.message ?? ""))) {
      const bucketResult = await ensureBucketExists(supabase);
      if (bucketResult.success) {
        return NextResponse.json({ data: [] });
      }
    }
  }

  try {
    const projectImagesPath = join(process.cwd(), "public", "projects");
    const files = readdirSync(projectImagesPath, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter(isImageFileName)
      .map((name) => ({ name, url: `/projects/${name}` }));

    return NextResponse.json({ data: files });
  } catch (error) {
    console.error("project-images GET error:", error);
    return NextResponse.json({ data: [], error: "Unable to list project images." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const filename = file.name;
    if (!isImageFileName(filename)) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    }

    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const supabase = createSupabaseAdminClient();

    if (supabase) {
      const bucketResult = await ensureBucketExists(supabase);
      if (!bucketResult.success) {
        console.error("Unable to ensure bucket exists:", bucketResult.error);
      } else {
        let uploadError: any = null;

        const uploadFile = async () => {
          const result = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(safeName, file, { upsert: true });
          uploadError = result.error;
          return result;
        };

        let uploadResult = await uploadFile();

        if (uploadError && /Bucket not found/i.test(uploadError?.message ?? "")) {
          const retryBucket = await ensureBucketExists(supabase);
          if (retryBucket.success) {
            uploadResult = await uploadFile();
            uploadError = uploadResult.error;
          }
        }

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(safeName);
          if (urlData?.publicUrl) {
            return NextResponse.json({ data: { name: filename, url: urlData.publicUrl } });
          }
        }

        console.error("Supabase storage upload failed or returned no public URL", uploadError);
      }
    }

    const projectImagesPath = join(process.cwd(), "public", "projects");
    mkdirSync(projectImagesPath, { recursive: true });
    const filePath = join(projectImagesPath, safeName);
    const contents = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, contents);

    return NextResponse.json({ data: { name: filename, url: `/projects/${safeName}` } });
  } catch (error) {
    console.error("project-images POST error:", error);
    return NextResponse.json({ error: "Unable to upload project image." }, { status: 500 });
  }
}
