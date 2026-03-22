import { useLocation, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, AlertTriangle, ArrowLeft, Home } from "lucide-react";

interface ResultData {
  isHarmful: boolean;
  description: string;
  phrasesDetected?: string[];
  source?: string;
  suggestedAction?: string;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || { 
    result: { 
      isHarmful: false, 
      description: "No analysis available." 
    } 
  };

  const resultData: ResultData = result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Result Header */}
        <div className="text-center mb-8">
          {resultData.isHarmful ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl mb-2 text-red-700">
                Harmful Content Detected
              </h1>
              <p className="text-gray-600">
                Please review the details below
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl mb-2 text-green-700">
                Result
              </h1>
              <p className="text-gray-600">
                Content analysis complete
              </p>
            </>
          )}
        </div>

        {/* Result Content */}
        {resultData.isHarmful ? (
          <div className="space-y-6 mb-8">
            {/* Description */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <h3 className="text-lg mb-3 text-gray-800">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {resultData.description}
              </p>
            </Card>

            {/* Phrases Detected */}
            {resultData.phrasesDetected && resultData.phrasesDetected.length > 0 && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
                <h3 className="text-lg mb-3 text-gray-800">Phrases Detected</h3>
                <ul className="space-y-2">
                  {resultData.phrasesDetected.map((phrase, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-red-500 mt-1">•</span>
                      <span className="italic">"{phrase}"</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Source */}
            {resultData.source && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
                <h3 className="text-lg mb-3 text-gray-800">Source</h3>
                <p className="text-gray-700">
                  {resultData.source}
                </p>
              </Card>
            )}

            {/* Suggested Action */}
            {resultData.suggestedAction && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
                <h3 className="text-lg mb-3 text-gray-800">Suggested Action</h3>
                <p className="text-gray-700 leading-relaxed">
                  {resultData.suggestedAction}
                </p>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-8 text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              {resultData.description}
            </p>
          </Card>
        )}

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate("/")}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Analyze New Content
          </Button>
        </div>
      </div>
    </div>
  );
}
