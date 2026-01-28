import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

interface Detection {
  detectionId: string;
  capturedAt: string;
  imageUrl: string;
}

export default function FormPage() {
  const navigate = useNavigate();

  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [sourceImage, setSourceImage] = useState('');
  const [detectionImages, setDetectionImages] = useState<Detection[]>([
    { detectionId: '', capturedAt: new Date().toISOString().slice(0, 16), imageUrl: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDetectionImage = () => {
    setDetectionImages([
      ...detectionImages,
      { detectionId: '', capturedAt: new Date().toISOString().slice(0, 16), imageUrl: '' }
    ]);
  };

  const removeDetectionImage = (index: number) => {
    if (detectionImages.length > 1) {
      setDetectionImages(detectionImages.filter((_, i) => i !== index));
    }
  };

  const updateDetectionImage = (index: number, field: keyof Detection, value: string) => {
    const updated = [...detectionImages];
    updated[index][field] = value;
    setDetectionImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!candidateName.trim() || !email.trim()) {
      setError('Please provide candidate name and email');
      return;
    }

    if (!sourceImage.trim()) {
      setError('Please provide a source image URL');
      return;
    }

    const validDetections = detectionImages.filter(d => d.imageUrl.trim() !== '');
    if (validDetections.length === 0) {
      setError('Please provide at least one detection image');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      candidate_name: candidateName,
      email: email,
      source_image: { image_url: sourceImage },
      detections: validDetections.map(d => ({
        detection_id: d.detectionId || `image-${Date.now()}`,
        captured_at: d.capturedAt,
        image_url: d.imageUrl
      }))
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      navigate('/results', {
        state: {
          results: data,
          sourceImage,
          detectionImages: validDetections,
          candidateName,
          email
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

              {/* Candidate Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Sibi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abc@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  disabled={isSubmitting}
                />
              </div>

              {/* Source Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source Image URL
                </label>
                <input
                  type="url"
                  value={sourceImage}
                  onChange={(e) => setSourceImage(e.target.value)}
                  placeholder="https://example.com/source-image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  disabled={isSubmitting}
                />
                {sourceImage && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={sourceImage}
                      alt="Source preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {(e.target as HTMLImageElement).style.display = 'none';}}
                    />
                  </div>
                )}
              </div>

              {/* Detection Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Detection Images
                  </label>
                  <button
                    type="button"
                    onClick={addDetectionImage}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                    disabled={isSubmitting}
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add Detection
                  </button>
                </div>

                <div className="space-y-4">
                  {detectionImages.map((d, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-700">Detection #{idx + 1}</h4>
                        {detectionImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDetectionImage(idx)}
                            className="text-red-600 hover:bg-red-50 px-2 py-1 rounded transition"
                            disabled={isSubmitting}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Detection Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Detection ID"
                          value={d.detectionId}
                          onChange={(e) => updateDetectionImage(idx, 'detectionId', e.target.value)}
                          className="w-full min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          disabled={isSubmitting}
                        />
                        <input                          
                        type="text"
                        placeholder="Captured At"
                        value={d.capturedAt}
                        onChange={(e) => updateDetectionImage(idx, 'capturedAt', e.target.value)}
                        className="w-full min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        disabled={isSubmitting}
                    />

                        <input
                          type="url"
                          placeholder="Image URL"
                          value={d.imageUrl}
                          onChange={(e) => updateDetectionImage(idx, 'imageUrl', e.target.value)}
                          className="w-full min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          disabled={isSubmitting}
                        />
                      </div>
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
