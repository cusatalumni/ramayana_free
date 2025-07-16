
import React, { useState, useCallback } from 'react';
import { PostData, DisplayablePost } from '../types';
import Header from './Header';
import QuoteCard from './QuoteCard';
import ActionButtons from './ActionButtons';
import Loader from './Loader';
import { GenerateIcon } from './icons';

interface GeneratorProps {
  generationFunctions: {
    generateText: () => Promise<PostData>;
    generateImage: (prompt: string) => Promise<string>;
  };
  onModeChange: () => void;
  isManagedMode: boolean;
}

const addWatermark = async (imageUrl: string, watermarkText: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error("Could not get canvas context"));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(24, Math.floor(canvas.width / 30));
      ctx.font = `700 ${fontSize}px Lora, serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-0.349); // ~20 degrees
      ctx.fillText(watermarkText, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => reject(new Error("Image failed to load for watermarking."));
    img.src = imageUrl;
  });
}


const Generator: React.FC<GeneratorProps> = ({ generationFunctions, onModeChange, isManagedMode }) => {
  const [post, setPost] = useState<DisplayablePost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldGenerateImage, setShouldGenerateImage] = useState<boolean>(true);

  const handleGeneratePost = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPost(null);

    try {
      const textData = await generationFunctions.generateText();
      setPost({ ...textData, imageUrl: null, imageRequested: shouldGenerateImage });

      if (shouldGenerateImage) {
        const rawImageUrl = await generationFunctions.generateImage(textData.visual_prompt);
        const watermarkedImageUrl = await addWatermark(rawImageUrl, "www.annapoornainfo.com");
        setPost(currentPost => currentPost ? { ...currentPost, imageUrl: watermarkedImageUrl } : null);
      }
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Post generation failed: ${errorMessage}`);
        setPost(null);
    } finally {
        setIsLoading(false);
    }
  }, [shouldGenerateImage, generationFunctions]);

  const getButtonText = () => {
    if (isLoading) {
      return shouldGenerateImage ? 'Generating Post...' : 'Generating Sloka...';
    }
    return shouldGenerateImage ? 'Generate Daily Post' : 'Generate Sloka (Text Only)';
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen text-stone-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <Header showChangeModeButton={true} onModeChange={onModeChange}/>

        <main className="mt-8">
          <div className="flex flex-col items-center mb-6">
              <div className={`flex items-center justify-center space-x-3 text-stone-600 mb-6 bg-amber-100/50 p-3 rounded-full border border-amber-200 transition-opacity ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <label htmlFor="image-toggle" className={`font-semibold pl-2 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Generate Post with Image</label>
                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="image-toggle" 
                    id="image-toggle" 
                    checked={shouldGenerateImage}
                    onChange={() => setShouldGenerateImage(!shouldGenerateImage)}
                    disabled={isLoading}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:cursor-not-allowed"
                    style={{top: '-0.25rem', left: '-0.25rem'}}
                  />
                  <label htmlFor="image-toggle" className={`toggle-label block overflow-hidden h-4 rounded-full bg-stone-300 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}></label>
                </div>
                {isManagedMode && <span className="ml-2 bg-green-200 text-green-800 text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full">Subscribed</span>}
              </div>
              
            <button
              onClick={handleGeneratePost}
              disabled={isLoading}
              className="font-cinzel text-lg inline-flex items-center gap-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:bg-gradient-to-br disabled:from-amber-300 disabled:to-orange-400 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? <Loader isButtonLoader={true} /> : <GenerateIcon />}
              {getButtonText()}
            </button>
          </div>

          {error && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {post && (
            <div className="mt-8 animate-fade-in">
              <QuoteCard {...post} />
              <ActionButtons {...post} />
              <div className="text-center mt-6 text-sm text-stone-600">
                <p>
                  ✨ To create this kind of Ramayana post with images visit{' '}
                  <a 
                    href="https://www.annapoornainfo.com/ramayana" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    www.annapoornainfo.com/ramayana
                  </a>
                  {' '}now ✨
                </p>
              </div>
            </div>
          )}

           {!post && !isLoading && !error && (
            <div className="mt-12 text-center text-stone-500">
              <p className="text-lg">Set your options and click the button to generate your daily inspiration.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Generator;