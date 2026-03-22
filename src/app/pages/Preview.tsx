import { useLocation, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Preview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { extractedText } = location.state || { extractedText: "No content detected." };

  const handleValidate = () => {
    // Simulate analysis - randomly decide if content is harmful
    const isHarmful = Math.random() > 0.5;
    
    const result = isHarmful
      ? {
          isHarmful: true,
          description: "The content contains language that may be considered bullying or harassment. It includes aggressive tone and potentially harmful statements directed at individuals.",
          phrasesDetected: [
            "You're worthless",
            "Nobody likes you",
            "Go away loser"
          ],
          source: "Text analysis engine",
          suggestedAction: "This content should be reviewed and potentially removed. Consider reporting to the platform moderators. If this involves a minor, contact school authorities or parents."
        }
      : {
          isHarmful: false,
          description: "The analyzed content appears to be safe and does not contain harmful, bullying, or threatening language. No concerning patterns were detected."
        };

    navigate("/result", { state: { result } });
  };

  const handleReupload = () => {
    navigate("/");
  };

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

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl mb-2 text-gray-800">
            Detected Content
          </h1>
          <p className="text-gray-600">
            Review the extracted text before analysis
          </p>
        </div>

        {/* Content Box */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {extractedText}
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleValidate}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Validate
          </Button>
          <Button
            onClick={handleReupload}
            variant="outline"
            className="px-8 py-6 text-lg rounded-full border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            Re-upload
          </Button>
        </div>
      </div>
    </div>
  );
}
