export async function onRequestGet({ request, env, params }) {
  if (!env.MEDIA) return new Response("Image storage is not configured.", { status: 503 });

  const path = Array.isArray(params.path) ? params.path.join("/") : params.path;
  const object = await env.MEDIA.get(path);

  if (!object) return new Response("Image not found.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
