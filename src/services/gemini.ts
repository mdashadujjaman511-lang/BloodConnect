import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Function Declarations for Tool Calling
const searchDonorsTool: FunctionDeclaration = {
  name: "searchDonors",
  parameters: {
    type: Type.OBJECT,
    description: "Search for blood donors based on blood group and location.",
    properties: {
      bloodGroup: { type: Type.STRING, description: "The blood group needed (e.g., A+, O-)" },
      location: { type: Type.STRING, description: "The district or area in Bangladesh" },
    },
    required: ["bloodGroup", "location"],
  },
};

const checkEligibilityTool: FunctionDeclaration = {
  name: "checkEligibility",
  parameters: {
    type: Type.OBJECT,
    description: "Check if a user is eligible to donate blood based on their last donation date.",
    properties: {
      lastDonationDate: { type: Type.STRING, description: "ISO date string of the last donation" },
      weight: { type: Type.NUMBER, description: "Weight in kg" },
    },
    required: ["lastDonationDate"],
  },
};

const findBloodBanksTool: FunctionDeclaration = {
  name: "findBloodBanks",
  parameters: {
    type: Type.OBJECT,
    description: "Find nearby blood banks or hospitals.",
    properties: {
      location: { type: Type.STRING, description: "The city or area" },
    },
    required: ["location"],
  },
};

export const chatWithBondhu = async (message: string, history: any[] = []) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are Bondhu, the AI assistant for RoktoBondhon, a blood donation platform in Bangladesh. 
        You help users find donors, check eligibility, and provide donation tips. 
        Support both Bangla and English. Be empathetic and helpful.
        If a user is in a medical emergency, advise them to call 999 or go to the nearest hospital immediately.`,
        tools: [{ functionDeclarations: [searchDonorsTool, checkEligibilityTool, findBloodBanksTool] }],
      },
    });

    return response;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
