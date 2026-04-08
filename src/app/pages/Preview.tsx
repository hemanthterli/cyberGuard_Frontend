import { useLocation, useNavigate } from "react-router";
import { Info, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { LoadingModal } from "../components/LoadingModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { API_BASE } from "../lib/api";
import { useLanguage } from "../i18n/LanguageContext";
import { useLocationSelection } from "../i18n/LocationContext";


interface ReviewState {
  extractedText: string;
  sourceType: string;
  source: string;
  language?: string;
  location?: string;
}

export default function Preview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { location: selectedLocation } = useLocationSelection();
  const state = (location.state as ReviewState) || {
    extractedText: t("noContentDetected"),
    sourceType: "unknown",
    source: t("unknown"),
  };

  const [content, setContent] = useState(state.extractedText);
  const [userContext, setUserContext] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [hasEnhanced, setHasEnhanced] = useState(false);
  const [error, setError] = useState("");

  const extractApiError = (payload: unknown, fallback: string) => {
    if (!payload || typeof payload !== "object") return fallback;
    const parsed = payload as {
      error?: { detail?: string };
      detail?: { detail?: string } | string;
      message?: string;
    };
    return (
      parsed.error?.detail ||
      (typeof parsed.detail === "object" ? parsed.detail?.detail : "") ||
      (typeof parsed.detail === "string" ? parsed.detail : "") ||
      parsed.message ||
      fallback
    );
  };

  const getContentTypeLabel = (sourceType: string) => {
    const normalized = sourceType.toLowerCase();
    if (normalized === "image_ocr") return t("imageOcr");
    if (normalized === "news_article") return t("newsArticleType");
    if (normalized === "youtube_transcript") return t("youtubeTranscript");
    if (normalized === "audio_transcript") return t("audioTranscript");
    return sourceType || t("unknown");
  };

  const handleEnhance = async () => {
    if (!content) {
      setError(t("noContentToEnhance"));
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
        throw new Error(extractApiError(payload, t("enhancementFailed")));
      }
      const text = payload?.data?.text;
      if (!text) {
        throw new Error(t("noEnhancedReturned"));
      }
      setContent(text);
      setHasEnhanced(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("enhancementFailed");
      setError(message);
    } finally {
      setEnhancing(false);
    }
  };

  const handleValidate = async () => {
    if (!content) {
      setError(t("noContentToValidate"));
      return;
    }
    setError("");
    setValidating(true);
    try {
      const response = await fetch(`${API_BASE}/core-decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: state.source,
          source_type: state.sourceType,
          content,
          user_context: userContext.trim() || null,
          language,
          location: selectedLocation,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(extractApiError(payload, t("validationFailed")));
      }
      navigate("/result", {
        state: {
          decision: payload.data,
          content,
          source: state.source,
          sourceType: state.sourceType,
          language,
          location: selectedLocation,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : t("validationFailed");
      setError(message);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <LoadingModal
        steps={[
          "Fetching relevant content...",
          "Extracting key legal terms...",
          "Refining search queries...",
          "Segmenting legal information...",
          "Enhancing contextual accuracy...",
        ]}
        isOpen={enhancing}
      />
      <LoadingModal
        steps={[
          "Validating legal references...",
          "Cross-checking sources...",
          "Ensuring content accuracy...",
          "Verifying legal context...",
          "Filtering inconsistencies...",
          "Re-evaluating extracted data...",
        ]}
        isOpen={validating}
      />
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("backToHome")}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl mb-2 text-gray-800">
            {t("previewTitle")}
          </h1>
          <p className="text-gray-600">{t("previewSubtitle")}</p>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-6">
          <div className="text-sm text-gray-500 mb-4 space-y-1">
            <p>
              <span className="font-medium text-gray-700">{t("source")}:</span> {state.source}
            </p>
            <p>
              <span className="font-medium text-gray-700">{t("contentType")}:</span>{" "}
              {getContentTypeLabel(state.sourceType)}
            </p>
            {hasEnhanced && (
              <p className="text-green-600 font-medium">{t("contentEnhanced")}</p>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </Card>

        {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("userContext")}
          </label>
          <Textarea
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder={t("userContextPlaceholder")}
            rows={6}
            className="bg-white border-gray-300 text-gray-700 placeholder:text-gray-400 resize-none"
          />
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleEnhance}
              disabled={enhancing || hasEnhanced}
            >
              {enhancing ? t("enhancing") : hasEnhanced ? t("enhanced") : t("enhanceContent")}
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
                  {t("enhanceTooltip")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            onClick={handleValidate}
            disabled={validating}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {validating ? t("validating") : t("validateContent")}
          </Button>
        </div>
      </div>
    </div>
  );
}
