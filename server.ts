import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialisation getter for GoogleGenAI
let aiInstance: GoogleGenAI | null = null;
function getGeminiSDK(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is missing. Please add it via Settings > Secrets in the AI Studio environment.'
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Check if Gemini key is available
app.get('/api/config-status', (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  });
});

// API endpoint to test custom client-side BYOK key
app.post('/api/test-byok-key', async (req, res) => {
  const { customGeminiKey } = req.body;
  if (!customGeminiKey) {
    return res.status(400).json({ error: 'Please enter a Gemini API Key to test.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: customGeminiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build-byok-test' } }
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Ping: Reply exactly with "LaunchForge Connection Verified! Key is 100% active and running."',
    });

    res.json({
      success: true,
      text: response.text || 'Key verified, but model returned blank answer.'
    });
  } catch (error: any) {
    console.error('[LaunchForge BYOK Test] Validation failed:', error);
    res.json({
      success: false,
      error: error?.message || 'Verification failed. Please double-check your API token format.'
    });
  }
});

// API endpoint to generate high-fidelity launch packages
app.post('/api/generate-launch-package', async (req, res) => {
  const { productName, websiteUrl, rawDescription, keywords, pricingType, primaryCategory, customGeminiKey } = req.body;

  if (!productName || !rawDescription) {
    return res.status(400).json({ error: 'Product name and description are required.' });
  }

  // Fallback programmatic generation helper matching types
  const generateLocally = (reason?: string) => {
    const cleanKeywords = keywords ? keywords.split(',').map((k: string) => k.trim()) : ['saas', 'automation', 'productivity'];
    return {
      productName,
      pricingType: pricingType || 'Freemium',
      primaryCategory: primaryCategory || 'General SaaS',
      fallbackMode: true,
      fallbackError: reason || 'Unknown error occurred.',
      analyzedPitch: {
        strengths: [
          `Clear resolution of a specific friction point (${productName} centers directly around efficient execution).`,
          `High utility focus with a clear self-explanatory pricing model of ${pricingType}.`,
          `Targeted scope that makes it highly suitable for early adopter feedback cycles.`
        ],
        gaps: [
          "Could emphasize competitive alternatives comparisons early in the onboarding sequence.",
          "Consider expanding public help guides for integration setup to decrease churn."
        ],
        suggestedHook: `Stop wasting hours! ${productName} automates your workspace so you can focus entirely on high-yield logical steps.`
      },
      platformDrafts: [
        {
          platformId: "hunt",
          platformName: "Product Hunt",
          url: "https://www.producthunt.com",
          tagline: `The absolute easiest way to coordinate ${productName.toLowerCase()} workflows.`,
          shortDescription: `An autonomous solution designed to streamline ${productName.toLowerCase()} with no manual overhead. Integrates seamlessly to deliver real-time outcomes.`,
          longDescription: `Meet ${productName} - built from the ground up to solve the exact pain points developers face every day. Our key features include high performance modules, complete customization, and automated reporting. Launching with pricing tiers structured as ${pricingType} under the ${primaryCategory} category. Perfect for high-growth teams look for a modern, reliable stack with instant response latency.`,
          suggestedCategory: primaryCategory || "Developer Tools",
          tags: [cleanKeywords[0] || "productivity", "automation", "tech"],
          maxLimits: { tagline: 60, shortDescription: 260, longDescription: 600 }
        },
        {
          platformId: "beta",
          platformName: "BetaList",
          url: "https://betalist.com",
          tagline: `Test the next generation of custom ${productName.toLowerCase()} tooling.`,
          shortDescription: `Sign up for early access to ${productName}. Crafted specifically for fast-paced makers looking for a stable framework to handle their workspace. Get ready to launch today!`,
          suggestedCategory: "Tech & SaaS Startups",
          tags: ["early_access", cleanKeywords[0] || "tools"],
          maxLimits: { tagline: 120, shortDescription: 300 }
        },
        {
          platformId: "alternative",
          platformName: "AlternativeTo",
          url: "https://alternativeto.net",
          tagline: `Replace costly bloated legacy setups with modern AI-refined utility.`,
          shortDescription: `A premium, lightweight utility replacing heavy alternatives. Works directly where your data resides, requiring zero complex configuration to get started. Supports ${pricingType} licensing policies out of the box.`,
          suggestedCategory: "Productivity Applications",
          tags: ["open-source-alt", "lite-alternative"],
          maxLimits: { tagline: 80, shortDescription: 500 }
        },
        {
          platformId: "hub",
          platformName: "SaaSHub",
          url: "https://www.saashub.com",
          tagline: `Independent software reviews & verification for ${productName}.`,
          shortDescription: `Discover how ${productName} matches up against major players in ${primaryCategory}. Includes features for real-time tracking, custom indexing, and low-latency workflows.`,
          suggestedCategory: "Featured SaaS",
          tags: ["saas-alternative", "software"],
          maxLimits: { tagline: 80, shortDescription: 300 }
        }
      ],
      socialPosts: [
        {
          network: "TwitterX",
          title: "Announcing our Launch!",
          content: `We just shipped ${productName}! 🚀\n\nDesigned to solve the single largest friction in ${primaryCategory} with zero administrative overhead. Check us out and get started for free today!\n\n👉 ${websiteUrl || 'https://launchforge.ai'}\n\n#buildinpublic #indiehackers #saas`,
          bestPractices: "Post at 9:00 AM EST with an attached high-contrast screenshot for image preview embeds."
        },
        {
          network: "RedditStartups",
          title: `Show Reddit: We built ${productName} to fix bloated workflows`,
          content: `Hey r/startups,\n\nWe were tired of heavy, poorly-designed tools so we launched ${productName}. It tailors directly to teams using ${primaryCategory} features.\n\nWe would love your raw, unfiltered feedback on our pricing model (${pricingType}) and interface. Thank you!`,
          bestPractices: "Make sure you reply to every single comment in the thread within the first 3 hours to drive engagement algorithms."
        },
        {
          network: "HackerNews",
          title: `Show HN: ${productName} - A lightweight utility for ${primaryCategory}`,
          content: `We built a small, single-purpose solver to fix the latency and overhead when navigating ${productName.toLowerCase()} concepts. We made sure it is fast, simple, and runs without intrusive trackers.\n\nI'll be hanging around to answer questions about the stack or pricing decision.`,
          bestPractices: "Do not use sensational marketing buzzwords or emojis. HackerNews users expect factual, plain-text descriptions."
        },
        {
          network: "LinkedIn",
          title: "A New Chapter in Performance",
          content: `I am thoroughly proud to announce the formal product launch of ${productName}! 🎉\n\nOur mission is simple: eliminate complexity and restore absolute developer focus in the ${primaryCategory} sector.\n\nWe structure our delivery to enable high productivity benchmarks. Read how you can integrate us into your workflow:`,
          bestPractices: "Tag 2 key partners in the replies rather than the direct body of the post to maximize native algorithm distribution feeds."
        }
      ],
      seoPackage: {
        metaTitle: `${productName} | Pure, Lightweight ${primaryCategory} Orchestration`,
        metaDescription: `The elegant solver for ${productName.toLowerCase()} constraints. Built to help high-growth developers optimize execution performance immediately.`,
        seoKeywords: [productName.toLowerCase(), 'fast utility', primaryCategory.toLowerCase(), 'no-code solver'],
        structuredSnippet: `{"@context": "https://schema.org", "@type": "SoftwareApplication", "name": "${productName}", "operatingSystem": "All"}`
      }
    };
  };

  try {
    const activeKey = customGeminiKey || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      console.warn('[LaunchForge] Neither a custom client key nor a server GEMINI_API_KEY is configured. Generating via programmatic formula.');
      return res.json(generateLocally('Neither a custom client key nor a server GEMINI_API_KEY is configured on the server.'));
    }

    // Dynamic SDK instance for custom keys to support pure self-serve BYOK requests
    const ai = customGeminiKey 
      ? new GoogleGenAI({ apiKey: customGeminiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build-byok' } } })
      : getGeminiSDK();
    
    const userPrompt = `
      You are an expert startup founder and directory submission orchestrator. 
      Analyze the following startup and compile an exhaustive, high-fidelity Launch Package custom-formatted to fulfill the strict constraints of major platforms.

      PROJECT SPECIFICATIONS:
      - Product Name: ${productName}
      - Website URL: ${websiteUrl}
      - Category: ${primaryCategory}
      - Understood Pricing: ${pricingType}
      - Keywords provided: ${keywords}
      - Description/Features: ${rawDescription}

      Please analyze the pitches, build customized drafts matching exact character limits (tagline <= 60 etc.), and return the completed profiles.
    `;

    const systemInstruction = `
      You are the ultimate digital launch planner ("LaunchForge AI Owner").
      You take a product pitch and transform it into customized submission files for directories (Product Hunt, BetaList, AlternativeTo, SaaSHub).
      
      Here are the strict platform rules you MUST enforce in your outputs:
      1. Product Hunt: 
         - tagline: Must be succinct, maximum 60 characters. Tell exactly what it does.
         - shortDescription: Maximum 260 characters. High hook-potential.
         - longDescription: A long, rich text outlining main problems, features (about 400-500 chars).
      2. BetaList:
         - tagline: Succinct description, max 120 characters. Focus on early adopters.
         - shortDescription: Concise, max 300 characters.
      3. AlternativeTo:
         - tagline: Under 80 characters.
         - shortDescription: Long-form feature presentation and alternatives comparison, max 500 characters.
      4. SaaSHub:
         - tagline: Max 80 characters.
         - shortDescription: Max 300 characters emphasizing SaaS benefits.

      Format social media announcements perfectly optimized to drive traffic.
      
      You must respond with a JSON object that precisely fits the requested schema structure. Do not include markdown code wrapping or surrounding formatting. Just clean JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analyzedPitch: {
              type: Type.OBJECT,
              properties: {
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of 3 strengths of the product pitch.",
                },
                gaps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of 2-3 feature gaps or marketing gaps observed in their text.",
                },
                suggestedHook: {
                  type: Type.STRING,
                  description: "Compelling 1-sentence sales copy hook that users can use globally.",
                },
              },
              required: ['strengths', 'gaps', 'suggestedHook'],
            },
            platformDrafts: {
              type: Type.ARRAY,
              description: "Custom platform submission packages tailored to limits.",
              items: {
                type: Type.OBJECT,
                properties: {
                  platformId: { type: Type.STRING },
                  platformName: { type: Type.STRING },
                  url: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  shortDescription: { type: Type.STRING },
                  longDescription: { type: Type.STRING },
                  suggestedCategory: { type: Type.STRING },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  maxLimits: {
                    type: Type.OBJECT,
                    properties: {
                      tagline: { type: Type.INTEGER },
                      shortDescription: { type: Type.INTEGER },
                      longDescription: { type: Type.INTEGER },
                    },
                    required: ['tagline', 'shortDescription'],
                  },
                },
                required: [
                  'platformId',
                  'platformName',
                  'url',
                  'tagline',
                  'shortDescription',
                  'suggestedCategory',
                  'tags',
                  'maxLimits',
                ],
              },
            },
            socialPosts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  network: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  bestPractices: { type: Type.STRING },
                },
                required: ['network', 'content', 'bestPractices'],
              },
            },
            seoPackage: {
              type: Type.OBJECT,
              properties: {
                metaTitle: { type: Type.STRING },
                metaDescription: { type: Type.STRING },
                seoKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                structuredSnippet: { type: Type.STRING },
              },
              required: ['metaTitle', 'metaDescription', 'seoKeywords'],
            },
          },
          required: ['analyzedPitch', 'platformDrafts', 'socialPosts', 'seoPackage'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    const errorString = error?.message || '';
    if (
      errorString.includes('reported as leaked') ||
      errorString.includes('PERMISSION_DENIED') ||
      errorString.includes('403')
    ) {
      console.warn('[LaunchForge] Key status: restricted or reported as leaked. Applying fallback presets.');
    } else {
      console.warn('[LaunchForge] Generation failed. Reverting to programmatic local fallback:', errorString);
    }
    let friendlyMessage = errorString || 'Unknown generation failure.';
    if (
      friendlyMessage.includes('reported as leaked') ||
      friendlyMessage.includes('PERMISSION_DENIED') ||
      friendlyMessage.includes('403') ||
      friendlyMessage.includes('block')
    ) {
      friendlyMessage = "Standard shared API Key has been reported as leaked or blocked by Google AI Studio security scanners. Please switch to the '💻 Tech Sandbox' tab on the right to input your own custom Gemini API Key!";
    }
    res.json(generateLocally(friendlyMessage));
  }
});

// API endpoint to generate high-fidelity AI launcher images using Gemini / Imagen
app.post('/api/generate-ai-image', async (req, res) => {
  const { prompt, model, aspectRatio, customGeminiKey } = req.body;
  const activePrompt = prompt || 'A modern high fidelity website preview card, tech startup branding, vector flat design.';
  const activeModel = model || 'gemini-2.5-flash-image';
  const activeAspect = aspectRatio || '16:9';

  const defaultFallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(activePrompt.substring(0, 30))}/800/450`;

  try {
    const activeKey = customGeminiKey || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      return res.json({
        imageUrl: defaultFallbackUrl,
        isFallback: true,
        fallbackReason: 'No API Key is configured on the server. Please bring your own Gemini API Key in the Tech Sandbox to unlock absolute AI image generation!'
      });
    }

    const ai = customGeminiKey
      ? new GoogleGenAI({ apiKey: customGeminiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build-byok' } } })
      : getGeminiSDK();

    if (activeModel.includes('imagen')) {
      // Imagen generation protocol
      const response = await ai.models.generateImages({
        model: activeModel,
        prompt: activePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: activeAspect === '4:3' ? '4:3' : activeAspect === '1:1' ? '1:1' : '16:9',
        },
      });

      const base64Bytes = response?.generatedImages?.[0]?.image?.imageBytes;
      if (!base64Bytes) {
        throw new Error('Imagen returned an empty visual payload.');
      }

      return res.json({
        imageUrl: `data:image/png;base64,${base64Bytes}`,
        isFallback: false
      });
    } else {
      // Gemini Flash Image protocol (nano banana)
      const response = await ai.models.generateContent({
        model: activeModel,
        contents: {
          parts: [{ text: activePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: activeAspect as any
          }
        }
      });

      let base64Bytes: string | undefined = undefined;
      const parts = response?.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            base64Bytes = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Bytes) {
        throw new Error('Gemini image model did not return any inline image data.');
      }

      return res.json({
        imageUrl: `data:image/png;base64,${base64Bytes}`,
        isFallback: false
      });
    }
  } catch (error: any) {
    const errorString = error?.message || '';
    if (
      errorString.includes('reported as leaked') ||
      errorString.includes('PERMISSION_DENIED') ||
      errorString.includes('403')
    ) {
      console.warn('[LaunchForge Image Agent] Key status: restricted or reported as leaked. Applying placeholder fallback.');
    } else {
      console.warn('[LaunchForge Image Agent] Image generation failed. Reverting to custom seed placeholder:', errorString);
    }
    let friendlyMessage = errorString || 'Unknown generation failure.';
    if (
      friendlyMessage.includes('reported as leaked') ||
      friendlyMessage.includes('PERMISSION_DENIED') ||
      friendlyMessage.includes('403') ||
      friendlyMessage.includes('block')
    ) {
      friendlyMessage = "Standard shared API Key has been reported as leaked or blocked by Google AI Studio security scanners. Please switch to the '💻 Tech Sandbox' tab on the right to input your own custom Gemini API Key!";
    }
    return res.json({
      imageUrl: defaultFallbackUrl,
      isFallback: true,
      fallbackReason: friendlyMessage
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LaunchForge Backend] Running autonomously on port ${PORT}`);
  });
}

startServer();
