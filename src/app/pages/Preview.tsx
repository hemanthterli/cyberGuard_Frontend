import { useLocation, useNavigate } from "react-router";
import { Info, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

const API_BASE = "http://localhost:8002";

interface ReviewState {
  extractedText: string;
  sourceType: string;
  source: string;
}

export default function Preview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ReviewState) || {
    extractedText: "No content detected.",
    sourceType: "unknown",
    source: "unknown",
  };

  const [content, setContent] = useState(state.extractedText);
  const [enhancing, setEnhancing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");

  const handleEnhance = async () => {
    if (!content) {
      setError("No content available to enhance.");
      return;
    }
    setError("");
    setEnhancing(true);
    try {
      const response = await fetch(`${API_BASE}/content-enhancement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: state.sourceType,
          source: state.source,
          content,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.detail || payload?.message || "Enhancement failed");
      }
      const text = payload?.data?.text;
      if (!text) {
        throw new Error("No enhanced content returned");
      }
      setContent(text);
      setValidated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enhancement failed";
      setError(message);
    } finally {
      setEnhancing(false);
    }
  };

  const handleValidate = async () => {
    if (!content) {
      setError("No content available to validate.");
      return;
    }
    setError("");
    try {
      const response = await fetch(`${API_BASE}/core-decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: state.source,
          source_type: state.sourceType,
          content,
          user_context: "",
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.detail || payload?.message || "Validation failed");
      }
      navigate("/result", {
        state: {
          decision: payload.data,
          content,
          source: state.source,
          sourceType: state.sourceType,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Validation failed";
      setError(message);
    }
  };

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
          <h1 className="text-3xl md:text-4xl mb-2 text-gray-800">
            Content Review
          </h1>
          <p className="text-gray-600">Review and enhance extracted content</p>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-6">
          <div className="text-sm text-gray-500 mb-4 space-y-1">
            <p>
              <span className="font-medium text-gray-700">Source:</span> {state.source}
            </p>
            <p>
              <span className="font-medium text-gray-700">Content Type:</span> {state.sourceType}
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </Card>

        {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!validated && (
            <div className="flex items-center gap-2">
              <Button onClick={handleEnhance} disabled={enhancing}>
                {enhancing ? "Enhancing..." : "Enhance Content"}
              </Button>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-gray-800"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-sm leading-relaxed">
                    Enhancing content cleans raw data by removing noise such as
                    special characters, links, OCR errors, and unstructured
                    formatting. It improves readability and structure without
                    adding new information.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {validated && (
            <Button
              onClick={handleValidate}
              className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Validate Content
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
