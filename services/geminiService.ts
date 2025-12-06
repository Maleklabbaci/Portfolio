import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Ideally, in a real production env, this key comes from a secure backend proxy.
// For this frontend demo, we assume the environment variable is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAgencyResponse = async (userMessage: string): Promise<string> => {
  try {
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