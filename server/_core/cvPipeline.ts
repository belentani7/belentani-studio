import { invokeLLM } from "./llm";

export type CVInput = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{ company: string; position: string; duration: string; description: string }>;
  education: Array<{ school: string; degree: string; year: string }>;
  skills: string[];
  photoUrl?: string;
};

export type CVEnhancementMode = "local" | "ai";

export function getCVEnhancementMode(): CVEnhancementMode {
  return process.env.CV_ENHANCEMENT_MODE?.toLowerCase() === "ai" ? "ai" : "local";
}

export function enhanceCVLocally(input: CVInput): CVInput {
  if (input.summary?.trim()) return input;
  const skills = input.skills.slice(0, 3).join(", ");
  const positions = Array.from(new Set(input.experience.map((item) => item.position).filter(Boolean))).slice(0, 2).join(" y ");
  const fragments = [
    positions ? `Perfil con experiencia en ${positions}.` : "Perfil profesional en preparación.",
    skills ? `Habilidades declaradas: ${skills}.` : "",
  ].filter(Boolean);
  return { ...input, summary: fragments.join(" ") };
}

export type CVProviderId = "local" | "builtin";
export type CVProviderStatus = { id: CVProviderId; enabled: boolean; external: boolean; chargeable: boolean };

interface CVEnhancementProvider {
  id: CVProviderId;
  enhance(input: CVInput): Promise<CVInput>;
}

const localProvider: CVEnhancementProvider = {
  id: "local",
  enhance: async (input) => enhanceCVLocally(input),
};

const builtInProvider: CVEnhancementProvider = {
  id: "builtin",
  enhance: async (input) => enhanceCVWithBuiltinProvider(input),
};

export function getCVProviderStatus(): CVProviderStatus {
  const aiEnabled = getCVEnhancementMode() === "ai";
  return aiEnabled
    ? { id: "builtin", enabled: true, external: true, chargeable: true }
    : { id: "local", enabled: true, external: false, chargeable: false };
}

function resolveCVProvider(): CVEnhancementProvider {
  return getCVEnhancementMode() === "ai" ? builtInProvider : localProvider;
}

async function enhanceCVWithBuiltinProvider(input: CVInput): Promise<CVInput> {
  try {
    const response = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "Eres especialista en selección en España. Mejora un CV sin inventar datos, mantén el idioma español y usa lenguaje claro y compatible con ATS." },
        { role: "user", content: JSON.stringify({ fullName: input.fullName, summary: input.summary, experience: input.experience, education: input.education, skills: input.skills }) },
      ],
      reasoning: { effort: "minimal" },
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cv_enhancement",
          strict: true,
          schema: { type: "object", properties: { summary: { type: "string" }, experience: { type: "array", items: { type: "object", properties: { company: { type: "string" }, position: { type: "string" }, duration: { type: "string" }, description: { type: "string" } }, required: ["company", "position", "duration", "description"], additionalProperties: false } } }, required: ["summary", "experience"], additionalProperties: false },
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    const enhanced = JSON.parse(typeof content === "string" ? content : "{}");
    return { ...input, summary: enhanced.summary || input.summary || "", experience: enhanced.experience?.length ? enhanced.experience : input.experience };
  } catch {
    // La caída del proveedor nunca bloquea un CV gratuito.
    return enhanceCVLocally(input);
  }
}

export async function enhanceCV(input: CVInput): Promise<CVInput> {
  return resolveCVProvider().enhance(input);
}
