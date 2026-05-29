function env(name, fallback = "") {
  return process.env[name] || fallback;
}

export class ModelClient {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || env("MODEL_API_URL");
    this.apiKey = options.apiKey || env("MODEL_API_KEY");
    this.model = options.model || env("MODEL_NAME", "local-loop-only");
  }

  isConfigured() {
    return Boolean(this.apiUrl && this.apiKey && this.model !== "local-loop-only");
  }

  buildSystemPrompt(scan) {
    const loopSummary = (scan.regions || [])
      .map((region) => `${region.id}: load=${region.load}, role=${region.role}`)
      .join("\n");

    return [
      "You are the speaking layer for Elemental Dialogue Lab.",
      "Use the current focus loop as your primary voice while still considering the background signals.",
      "Stay practical, direct, creative, and coherent.",
      "Do not claim to be a medical condition, a human mind, or a copy of any copyrighted character.",
      `Current focus: ${scan.focus}`,
      "Loop load map:",
      loopSummary
    ].join("\n");
  }

  buildMessages(input, scan) {
    return [
      { role: "system", content: this.buildSystemPrompt(scan) },
      { role: "user", content: input }
    ];
  }

  async reply(input, scan) {
    if (!this.isConfigured()) {
      return {
        provider: "local-fallback",
        model: this.model,
        text: scan.spoken?.text || "Local loop response only. Add MODEL_API_URL, MODEL_API_KEY, and MODEL_NAME to enable model-backed chat."
      };
    }

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.buildMessages(input, scan),
        temperature: Number(env("MODEL_TEMPERATURE", "0.8"))
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Model provider error ${response.status}: ${detail.slice(0, 500)}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || data?.output_text || data?.text || JSON.stringify(data);

    return {
      provider: "external-model",
      model: this.model,
      text
    };
  }
}
