export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method === "GET") {
      return new Response(JSON.stringify({
        ok: true,
        service: "sandyhub-ai-api",
        api: "openai-responses"
      }), {
        headers: { "Content-Type": "application/json", ...cors }
      });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "POST required" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json", ...cors }
        }
      );
    }

    try {
      if (!env.AI_API_KEY) {
        throw new Error("AI_API_KEY secret is not configured");
      }

      const body = await request.json();

      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        throw new Error("messages are required");
      }

      const messages = body.messages.slice(0, 20).map((m) => ({
        role: ["system", "user", "assistant"].includes(m.role) ? m.role : "user",
        content: String(m.content || "").slice(0, 12000)
      }));

      const endpoint =
        env.AI_BASE_URL || "https://api.openai.com/v1/responses";

      const payload = {
        model: body.model || env.AI_MODEL || "gpt-5.6-luna",
        input: messages
      };

      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.AI_API_KEY
        },
        body: JSON.stringify(payload)
      });

      const data = await upstream.json();

      if (!upstream.ok) {
        return new Response(
          JSON.stringify({
            error: data.error?.message || "AI provider request failed"
          }),
          {
            status: 502,
            headers: {
              "Content-Type": "application/json",
              ...cors
            }
          }
        );
      }

      const output =
        data.output_text ||
        data.output
          ?.flatMap((item) => item.content || [])
          ?.filter((item) => item.type === "output_text")
          ?.map((item) => item.text)
          ?.join("") ||
        "";

      return new Response(
        JSON.stringify({ output }),
        {
          headers: {
            "Content-Type": "application/json",
            ...cors
          }
        }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: e.message || "Invalid request"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...cors
          }
        }
      );
    }
  }
};