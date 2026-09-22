export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    if (request.method === "OPTIONS") return new Response(null, {headers:cors});
    if (request.method !== "POST") return new Response(JSON.stringify({error:"POST required"}), {status:405,headers:{"Content-Type":"application/json",...cors}});
    try {
      const body = await request.json();
      if (!Array.isArray(body.messages) || body.messages.length === 0) throw new Error("messages are required");
      const messages = body.messages.slice(0,20).map(m => ({
        role: ["system","user","assistant"].includes(m.role) ? m.role : "user",
        content: String(m.content || "").slice(0,12000)
      }));
      const endpoint = env.AI_BASE_URL || "https://api.openai.com/v1/chat/completions";
      const payload = {model: body.model || env.AI_MODEL || "default", messages, temperature: 0.7};
      const upstream = await fetch(endpoint, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization:"Bearer "+env.AI_API_KEY},
        body:JSON.stringify(payload)
      });
      const data = await upstream.json();
      if (!upstream.ok) return new Response(JSON.stringify({error:data.error?.message || "AI provider request failed"}), {status:502,headers:{"Content-Type":"application/json",...cors}});
      const output = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({output}), {headers:{"Content-Type":"application/json",...cors}});
    } catch (e) {
      return new Response(JSON.stringify({error:e.message || "Invalid request"}), {status:400,headers:{"Content-Type":"application/json",...cors}});
    }
  }
};