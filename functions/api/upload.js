const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg","image/png","image/gif","image/webp","image/svg+xml"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.MEDIA) return json({ error: "Image storage is not configured yet." }, 503);

  const form = await request.formData();
  const file = form.get("image");

  if (!(file instanceof File)) return json({ error: "Select an image first." }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: "Unsupported image type." }, 400);
  if (file.size > MAX_SIZE) return json({ error: "Image must be 10 MB or smaller." }, 400);

  const ext = ({
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/gif":"gif",
    "image/webp":"webp",
    "image/svg+xml":"svg"
  })[file.type] || "img";

  const id = crypto.randomUUID().replaceAll("-", "");
  const key = `images/${id}.${ext}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  const url = new URL(request.url);
  const publicUrl = `${url.origin}/media/${key}`;

  return json({ url: publicUrl, key, size: file.size, type: file.type });
}
