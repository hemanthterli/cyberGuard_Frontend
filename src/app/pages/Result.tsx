import { useLocation, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, AlertTriangle, ArrowLeft, Home } from "lucide-react";

interface DecisionData {
  bullying: string;
  description: string;
  phrases: string;
  source: string;
  impact_action: string;
}

interface ResultState {
  decision: DecisionData;
  content: string;
  source: string;
  sourceType: string;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ResultState) || {
    decision: {
      bullying: "no",
      description: "No analysis available.",
      phrases: "",
      source: "unknown",
      impact_action: "",
    },
    content: "No validated content available.",
    source: "unknown",
    sourceType: "unknown",
  };

  const isHarmful = state.decision.bullying.toLowerCase() === "yes";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          {isHarmful ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl mb-2 text-red-700">
                Harmful Content Detected
              </h1>
              <p className="text-gray-600">Please review the details below</p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl mb-2 text-green-700">
                Validation Complete
              </h1>
              <p className="text-gray-600">Content analysis complete</p>
            </>
          )}
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-6">
          <h3 className="text-lg mb-3 text-gray-800">Validated Content</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {state.content}
          </p>
        </Card>

        <div className="grid gap-4 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <h3 className="text-lg mb-3 text-gray-800">Decision Summary</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Bullying:</span> {state.decision.bullying}
              </p>
              <p>
                <span className="font-semibold">Description:</span> {state.decision.description}
              </p>
              <p>
                <span className="font-semibold">Phrases:</span> {state.decision.phrases}
              </p>
              <p>
                <span className="font-semibold">Source:</span> {state.decision.source}
              </p>
              <p>
                <span className="font-semibold">Action:</span> {state.decision.impact_action}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <h3 className="text-lg mb-3 text-gray-800">Metadata</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Source:</span> {state.source}
              </p>
              <p>
                <span className="font-semibold">Content Type:</span> {state.sourceType}
              </p>
            </div>
          </Card>
        </div>

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
