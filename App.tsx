
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import IntroScreen from './components/IntroScreen';
import Generator from './components/Generator';
import { PostData } from './types';

type AppMode = 'intro' | 'managed' | 'free';

const slokaAndPromptSchema = {
    type: Type.OBJECT,
    properties: {
        sanskrit_sloka: { type: Type.STRING, description: "An original four-line sloka from the Ramayana in Sanskrit (Devanagari script)." },
        malayalam_transliteration: { type: Type.STRING, description: "The transliteration of the above Sanskrit sloka in Malayalam script." },
        malayalam_meaning: { type: Type.STRING, description: "The meaning of the sloka in Malayalam." },
        english_meaning: { type: Type.STRING, description: "The meaning of the sloka in English." },
        visual_prompt: { type: Type.STRING, description: "A detailed, vivid, artistic description for an image generator to create a picture that visually represents the sloka's theme, mood, and characters." },
    },
    required: ["sanskrit_sloka", "malayalam_transliteration", "malayalam_meaning", "english_meaning", "visual_prompt"],
};

const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('intro');
    const [apiKey, setApiKey] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('subscription') === 'success') {
            localStorage.setItem('subscriptionStatus', 'active');
            localStorage.setItem('appMode', 'managed');
            setMode('managed');
            // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        const subscriptionStatus = localStorage.getItem('subscriptionStatus');
        if (subscriptionStatus === 'active') {
            setMode('managed');
            return;
        }

        const savedMode = localStorage.getItem('appMode') as AppMode;
        const savedApiKey = localStorage.getItem('userApiKey');
        if (savedMode === 'free' && savedApiKey) {
            setApiKey(savedApiKey);
            setMode('free');
        }
    }, []);

    const handleModeChange = (newMode: AppMode, newApiKey?: string) => {
        setMode(newMode);
        localStorage.setItem('appMode', newMode);
        if (newMode === 'free' && newApiKey) {
            setApiKey(newApiKey);
            localStorage.setItem('userApiKey', newApiKey);
            localStorage.removeItem('subscriptionStatus');
        } else if (newMode === 'managed') {
            localStorage.removeItem('userApiKey');
        }
    };

    const handleGoToIntro = () => {
        setMode('intro');
        localStorage.removeItem('appMode');
        localStorage.removeItem('userApiKey');
        localStorage.removeItem('subscriptionStatus');
    };

    const generateTextServerSide = async (): Promise<PostData> => {
        const response = await fetch('/api/generate-text', { method: 'POST' });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to generate sloka text from server.');
        }
        return response.json();
    };

    const generateImageServerSide = async (visual_prompt: string): Promise<string> => {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visual_prompt }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to generate image from server.');
        }
        const { rawImageUrl } = await response.json();
        return rawImageUrl;
    };

    const generateTextClientSide = async (userApiKey: string): Promise<PostData> => {
        const ai = new GoogleGenAI({ apiKey: userApiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate an original four-line sloka from the Ramayana, along with its translations and a creative visual prompt for an image generator.",
            config: {
                systemInstruction: "You are an expert on the Ramayana. Your task is to generate a four-line Sanskrit sloka, provide its Malayalam transliteration and meaning, its English meaning, and a creative visual prompt. You must respond strictly in the provided JSON schema format.",
                responseMimeType: "application/json",
                responseSchema: slokaAndPromptSchema,
            },
        });
        return JSON.parse(response.text);
    };

    const generateImageClientSide = async (userApiKey: string, visual_prompt: string): Promise<string> => {
        const ai = new GoogleGenAI({ apiKey: userApiKey });
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `Epic, cinematic, high detail photo of: ${visual_prompt}. The style should be reminiscent of classical Indian art, with rich colors and dramatic lighting.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new Error("Client-side image generation failed.");
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    };

    if (mode === 'intro') {
        return <IntroScreen onModeSelect={handleModeChange} />;
    }

    const generationFunctions = mode === 'managed' 
        ? { generateText: generateTextServerSide, generateImage: generateImageServerSide }
        : { 
            generateText: () => generateTextClientSide(apiKey!), 
            generateImage: (prompt: string) => generateImageClientSide(apiKey!, prompt) 
          };

    return (
      <Generator
        key={mode}
        generationFunctions={generationFunctions}
        onModeChange={handleGoToIntro}
        isManagedMode={mode === 'managed'}
      />
    );
};

export default App;