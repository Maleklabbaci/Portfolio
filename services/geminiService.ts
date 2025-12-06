import { GoogleGenAI } from "@google/genai";

// Helper to safely get API key without crashing
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  return undefined;
};

export const generateAgencyResponse = async (userMessage: string): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI Chat disabled.");
    return "L'assistant virtuel est momentanément indisponible (Configuration requise). Veuillez nous envoyer un email via le formulaire.";
  }

  try {
    // Initialize client only when needed to prevent startup crashes
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: `Tu es "VisionBot", l'assistant virtuel expert de l'agence "iVision Agency".
        Ton rôle est d'aider les potentiels clients à définir leurs besoins avant de contacter l'équipe humaine.
        
        Services de l'agence :
        1. Production Vidéo (Reels, TikTok, Publicités TV/Web)
        2. Photographie (Produit, Mode, Corporate)
        3. Design Graphique (Branding, UI/UX, Social Media)
        4. Publicité Payante (Facebook Ads, Google Ads, TikTok Ads)
        
        Ton ton doit être : Professionnel, Créatif, Concis et Engageant.
        Ne donne pas de prix fixes, dis que cela dépend du projet.
        Si l'utilisateur demande un devis, pose des questions qualifiantes (budget, délais, objectifs).
        Réponds toujours en Français.`,
        temperature: 0.7,
      }
    });

    return response.text || "Désolé, je n'ai pas pu générer une réponse pour le moment.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Je rencontre actuellement des difficultés techniques. Veuillez réessayer plus tard ou contacter l'agence directement.";
  }
};