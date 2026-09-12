import { NextResponse } from "next/server";

// In-Memory Cache for 0ms Instant Repeat Roasts
const roastCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour TTL

const FREE_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-2-9b-it:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "nvidia/nemotron-3.5-lightning:free",
];

function generateFallbackRoast(repoUrl: string, repoUrl2: string, persona: string, isProfile: boolean) {
  const hash = (repoUrl + repoUrl2 + persona).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = Math.min(99, Math.max(72, (hash % 28) + 72));

  if (isProfile) {
    return {
      repoName: `@${repoUrl} (Profile)`,
      roast: `Looking at @${repoUrl}'s GitHub profile feels like browsing a digital cemetery of abandoned side projects. 412 unmerged draft pull requests, zero documentation, and a contribution graph greener than a toxic landfill.\n\nYour commit history consists entirely of "fix bug", "wip", and "trying again". If your developer career was an architecture, it would be held together with duct tape, coffee, and stackoverflow copy-pastes.`,
      roastScore: score,
      codeSmells: [
        "ABANDONED_PROJECT_CEMETERY",
        "ANY_TYPE_EVASION_CRIME",
        "COMMIT_LOG_SERIOUS_HYPERVENTILATION"
      ],
      verdict: "Career needs an emergency git hard reset and professional engineering counseling."
    };
  }

  if (repoUrl2) {
    return {
      repoName: `${repoUrl} vs ${repoUrl2}`,
      roast: `In this battle of architectural atrocities, ${repoUrl} and ${repoUrl2} enter the arena. ${repoUrl} features a recursive useEffect state loop that thrashes browser memory, while ${repoUrl2} attempts to render microservices with Kafka for a static blog.\n\nVerdict? Both codebases lose, but ${repoUrl2} takes the prize for supreme over-engineering. Your cloud compute bill is crying.`,
      roastScore: score,
      codeSmells: [
        "CYCLIC_MEMORY_THRASHING",
        "KAFKA_FOR_STATIC_BLOG",
        "INFRASTRUCTURE_COST_EXPLOSION"
      ],
      verdict: `${repoUrl2} lost the battle with a higher architectural shame index.`
    };
  }

  return {
    repoName: repoUrl,
    roast: `After conducting an autopsy on ${repoUrl}, our diagnostics confirm a catastrophic case of architectural delusion. The codebase features 800-line monolithic files, 40+ nested conditional blocks, and zero unit tests.\n\nEvery variable name is either 'data', 'temp', or 'x'. It's unclear whether this repository was written by an over-caffeinated intern or an AI trained exclusively on anti-patterns.`,
    roastScore: score,
    codeSmells: [
      "MONOLITHIC_FILE_ABOMINATION",
      "ZERO_UNIT_TEST_FAITH_BASED_DEPLOY",
      "ANY_TYPE_TYPESCRIPT_EVASION"
    ],
    verdict: "Codebase officially condemned by engineering health inspectors."
  };
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body payload" }, { status: 400 });
  }

  const { repoUrl, repoUrl2 = "", persona = "Cynical Senior", isProfile = false } = body;

  if (!repoUrl || typeof repoUrl !== "string") {
    return NextResponse.json({ error: "Target URL/username is required" }, { status: 400 });
  }

  const cacheKey = `${repoUrl.toLowerCase().trim()}:${repoUrl2.toLowerCase().trim()}:${persona}:${isProfile}`;
  const cached = roastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[CACHE HIT] Returning instant cached roast for ${cacheKey}`);
    return NextResponse.json(cached.data);
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  // If key is missing, immediately return high-quality dynamic procedural roast
  if (!apiKey) {
    const fallback = generateFallbackRoast(repoUrl, repoUrl2, persona, isProfile);
    roastCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return NextResponse.json(fallback);
  }

  const systemPrompt = `You are a ${persona}. Roast GitHub codebases and developer careers with brutal, witty sarcasm. Respond ONLY with valid JSON. Keep descriptions punchy and concise. Do NOT include any emojis.`;

  let userPrompt = "";
  if (isProfile) {
    userPrompt = `Roast GitHub user @${repoUrl}.\nJSON schema ONLY:\n{"repoName":"@${repoUrl} (Profile)","roast":"Brutal 2-paragraph profile roast.","roastScore":98,"codeSmells":["smell 1","smell 2","smell 3"],"verdict":"One brutal sentence."}`;
  } else if (repoUrl2) {
    userPrompt = `Compare and roast Repo A (${repoUrl}) vs Repo B (${repoUrl2}).\nJSON schema ONLY:\n{"repoName":"${repoUrl} vs ${repoUrl2}","roast":"Brutal 2-paragraph comparison declaring the loser.","roastScore":89,"codeSmells":["smell 1","smell 2","smell 3"],"verdict":"One sentence declaring the loser."}`;
  } else {
    userPrompt = `Roast GitHub repository ${repoUrl}.\nJSON schema ONLY:\n{"repoName":"${repoUrl}","roast":"Brutal 2-paragraph roast of the codebase.","roastScore":87,"codeSmells":["smell 1","smell 2","smell 3"],"verdict":"One brutal sentence summary."}`;
  }

  // Try free models in cascade
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://reporoaster.com",
          "X-Title": "Repo Roaster",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 350,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[MODEL WARN] Model ${model} returned ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      const cleaned = content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      roastCache.set(cacheKey, { data: parsed, timestamp: Date.now() });
      return NextResponse.json(parsed);

    } catch (e) {
      console.warn(`[MODEL FETCH ERROR] Failed with model ${model}:`, e);
    }
  }

  // If all AI models fail or API key unauthorized (401), return seamless procedural roast
  console.log(`[FALLBACK GENERATOR] Serving procedural roast for ${cacheKey}`);
  const fallbackData = generateFallbackRoast(repoUrl, repoUrl2, persona, isProfile);
  roastCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
  return NextResponse.json(fallbackData);
}
