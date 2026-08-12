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

export async function enhanceCVWithAI(input: CVInput): Promise<CVInput> {
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
  try {
    const enhanced = JSON.parse(typeof content === "string" ? content : "{}");
    return { ...input, summary: enhanced.summary || input.summary || "", experience: enhanced.experience?.length ? enhanced.experience : input.experience };
  } catch {
    return input;
  }
}
