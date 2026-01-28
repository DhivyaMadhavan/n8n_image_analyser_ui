import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, ArrowLeft, FileText, User, Mail } from 'lucide-react';

interface DetectionResult {
  Detection_id: string;
  Face_detection_violation: boolean;
  Status: string;
}

interface LocationState {
  results: DetectionResult[];
  sourceImage: string;
  detectionImages: string[];
  candidateName: string;
  email: string;
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  if (!state || !state.results) {
    return <Navigate to="/" replace />;
  }

  const { results, sourceImage, detectionImages, candidateName, email } = state;

  const violationCount = results.filter(r => r.Face_detection_violation).length;
  const totalCount = results.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-8 h-8" />
                  Analysis Results
                </h1>
                <p className="text-blue-100 mt-2">Proctoring verification completed</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" />
                New Analysis
              </button>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="p-8 mb-6 bg-blue-50 rounded-xl border border-blue-100 flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              <p className="font-semibold text-gray-800">{candidateName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <p className="font-semibold text-gray-800">{email}</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-100">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Detections</p>
                <p className="text-3xl font-bold text-gray-800">{totalCount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Violations Found</p>
                <p className={`text-3xl font-bold ${violationCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {violationCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Clean Detections</p>
                <p className="text-3xl font-bold text-green-600">{totalCount - violationCount}</p>
              </div>
            </div>
          </div>

          

          {/* Detailed Results */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Detailed Results</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    result.Face_detection_violation
                      ? 'bg-red-50 border-red-200 hover:shadow-lg hover:shadow-red-100'
                      : 'bg-green-50 border-green-200 hover:shadow-lg hover:shadow-green-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {result.Face_detection_violation ? (
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          Detection #{index + 1}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            result.Face_detection_violation
                              ? 'bg-red-200 text-red-800'
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {result.Face_detection_violation ? 'VIOLATION' : 'CLEAN'}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Detection ID
                          </p>
                          <p className="text-sm text-gray-800 font-mono break-all">
                            {result.Detection_id}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Face Violation
                          </p>
                          <p className={`text-sm font-bold ${result.Face_detection_violation ? 'text-red-600' : 'text-green-600'}`}>
                            {result.Face_detection_violation ? 'Yes' : 'No'}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg md:col-span-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Status Details
                          </p>
                          <p className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap break-words">
                            {result.Status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Run Another Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
