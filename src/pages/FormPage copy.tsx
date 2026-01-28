import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

interface DetectionImage {
  id: string;
  url: string;
}

export default function FormPage() {
  const navigate = useNavigate();
  const [sourceImage, setSourceImage] = useState('');
  const [detectionImages, setDetectionImages] = useState<DetectionImage[]>([
    { id: '1', url: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDetectionImage = () => {
    setDetectionImages([
      ...detectionImages,
      { id: Date.now().toString(), url: '' }
    ]);
  };

  const removeDetectionImage = (id: string) => {
    if (detectionImages.length > 1) {
      setDetectionImages(detectionImages.filter(img => img.id !== id));
    }
  };

  const updateDetectionImage = (id: string, url: string) => {
    setDetectionImages(
      detectionImages.map(img => (img.id === id ? { ...img, url } : img))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validDetectionImages = detectionImages
      .filter(img => img.url.trim() !== '')
      .map(img => img.url);

    if (!sourceImage.trim()) {
      setError('Please provide a source image URL');
      return;
    }

    if (validDetectionImages.length === 0) {
      setError('Please provide at least one detection image URL');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceImage,
          detectionImages: validDetectionImages,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      navigate('/results', {
        state: {
          results: data,
          sourceImage,
          detectionImages: validDetectionImages
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Upload className="w-8 h-8" />
              Proctoring Analysis
            </h1>
            <p className="text-blue-100 mt-2">
              Upload source and detection images for verification
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source Image URL
                </label>
                <input
                  type="url"
                  value={sourceImage}
                  onChange={(e) => setSourceImage(e.target.value)}
                  placeholder="https://example.com/source-image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isSubmitting}
                />
                {sourceImage && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={sourceImage}
                      alt="Source preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Detection Image URLs
                  </label>
                  <button
                    type="button"
                    onClick={addDetectionImage}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                    disabled={isSubmitting}
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add Image
                  </button>
                </div>

                <div className="space-y-3">
                  {detectionImages.map((image, index) => (
                    <div key={image.id} className="flex gap-2">
                      <input
                        type="url"
                        value={image.url}
                        onChange={(e) => updateDetectionImage(image.id, e.target.value)}
                        placeholder={`https://example.com/detection-image-${index + 1}.jpg`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        disabled={isSubmitting}
                      />
                      {detectionImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDetectionImage(image.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          disabled={isSubmitting}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Analyze Images
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
