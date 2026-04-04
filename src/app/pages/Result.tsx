import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { CheckCircle, AlertTriangle, ArrowLeft, Home, ExternalLink, Download } from "lucide-react";
import { LoadingModal } from "../components/LoadingModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { API_BASE } from "../lib/api";
import { useLanguage } from "../i18n/LanguageContext";
import { useLocationSelection } from "../i18n/LocationContext";

interface DecisionData {
  bullying: string;
  description: string;
  phrases: string;
  source: string;
  impact_action: string;
  core_cybercrime?: string;
}

interface CyberLaw {
  law: string;
  description: string;
}

interface RAGSource {
  title: string;
  url?: string;
  category?: string;
}

interface CyberLawsData {
  summary: string;
  detected_phrases: string[];
  applicable_laws: CyberLaw[];
  recommended_actions: string[];
  country?: string;
  rag_sources?: RAGSource[];
}

const COMPLAINT_PORTALS: Record<string, string> = {
  india: "https://cybercrime.gov.in/",
  usa: "https://www.ic3.gov/",
  uk: "https://report.ncsc.gov.uk/",
};

interface ResultState {
  decision: DecisionData;
  content: string;
  source: string;
  sourceType: string;
  language?: string;
  location?: string;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { location: selectedLocation } = useLocationSelection();
  const state = (location.state as ResultState) || {
    decision: {
      bullying: "no",
      description: t("noAnalysisAvailable"),
      phrases: "",
      source: t("unknown"),
      impact_action: "",
    },
    content: t("noValidatedContent"),
    source: t("unknown"),
    sourceType: t("unknown"),
  };

  const [lawsData, setLawsData] = useState<CyberLawsData | null>(null);
  const [lawsOpen, setLawsOpen] = useState(false);
  const [lawsLoading, setLawsLoading] = useState(false);
  const [lawsError, setLawsError] = useState("");

  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [complaintError, setComplaintError] = useState("");
  const [isEditingComplaint, setIsEditingComplaint] = useState(false);

  const isHarmful = state.decision.bullying.toLowerCase() === "yes";

  const getContentTypeLabel = (sourceType: string) => {
    const normalized = sourceType.toLowerCase();
    if (normalized === "image_ocr") return t("imageOcr");
    if (normalized === "news_article") return t("newsArticleType");
    if (normalized === "youtube_transcript") return t("youtubeTranscript");
    if (normalized === "audio_transcript") return t("audioTranscript");
    return sourceType || t("unknown");
  };

  const getBullyingLabel = (bullyingValue: string) => {
    const normalized = bullyingValue.trim().toLowerCase();
    if (normalized === "yes") return t("yes");
    if (normalized === "no") return t("no");
    return bullyingValue;
  };

  const phrases = state.decision.phrases
    ? state.decision.phrases
        .split(/\n|;|,|\|/)
        .map((phrase) => phrase.trim())
        .filter(Boolean)
    : [];

  const handleGetCyberLaws = async () => {
    if (!isHarmful) return;
    setLawsError("");
    setLawsOpen(true);
    if (lawsData || lawsLoading) return;
    setLawsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/get-cyber-laws`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: state.content,
          core_decision: state.decision,
          retrieved_laws: [],
          language,
          location: selectedLocation,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(extractApiError(payload, t("fetchLawsFailed")));
      }
      setLawsData(payload.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("fetchLawsFailed");
      setLawsError(message);
    } finally {
      setLawsLoading(false);
    }
  };

  const parseComplaintError = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      return (
        parsed?.error?.detail ||
        parsed?.detail?.detail ||
        (typeof parsed?.detail === "string" ? parsed.detail : "") ||
        parsed?.message ||
        ""
      );
    } catch {
      return "";
    }
  };

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

  const GET_LAWS_STEPS = [
    "Initializing RAG System...",
    "Searching Vector Database...",
    "Retrieving Relevant Laws...",
    "Validating Laws...",
  ];

  const COMPLAINT_STEPS = [
    "Generating Complaint...",
    "Structuring Legal Format...",
    "Finalizing Output...",
  ];

  const handleComplaintAction = async () => {
    // If already generated, just open the dialog — no re-fetch
    if (complaintText) {
      setComplaintOpen(true);
      return;
    }
    if (!lawsData) return;
    setComplaintError("");
    setComplaintLoading(true);

    try {
      const response = await fetch(`${API_BASE}/generate-complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: lawsData.summary,
          detected_phrases: lawsData.detected_phrases,
          applicable_laws: lawsData.applicable_laws,
          recommended_actions: lawsData.recommended_actions,
          language,
          location: selectedLocation,
        }),
      });
      const raw = await response.text();
      if (!response.ok) {
        const detail = parseComplaintError(raw);
        throw new Error(detail || t("generateComplaintFailed"));
      }
      if (!raw.trim()) {
        throw new Error(t("complaintEmpty"));
      }
      setComplaintText(raw.trim());
      setComplaintOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("generateComplaintFailed");
      setComplaintError(message);
    } finally {
      setComplaintLoading(false);
    }
  };

  const handleDownloadComplaint = () => {
    if (!complaintText) return;
    const blob = new Blob([complaintText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaint.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("backToHome")}
        </button>

        <div className="text-center mb-8">
          {isHarmful ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl mb-2 text-red-700">{t("harmfulDetected")}</h1>
              <p className="text-gray-600">{t("reviewDetails")}</p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl mb-2 text-green-700">{t("validationComplete")}</h1>
              <p className="text-gray-600">{t("contentAnalysisComplete")}</p>
            </>
          )}
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-6">
          <h3 className="text-lg mb-3 text-gray-800">{t("validatedContent")}</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{state.content}</p>
        </Card>

        <div className="grid gap-4 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <h3 className="text-lg mb-3 text-gray-800">{t("decisionSummary")}</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">{t("bullying")}:</span> {getBullyingLabel(state.decision.bullying)}
              </p>
              <p>
                <span className="font-semibold">{t("description")}:</span> {state.decision.description}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <h3 className="text-lg mb-3 text-gray-800">{t("detectedPhrases")}</h3>
            {phrases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {phrases.map((phrase, index) => (
                  <span
                    key={`${phrase}-${index}`}
                    className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-sm"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{t("noPhrasesDetected")}</p>
            )}
          </Card>

          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-lg">
            <h3 className="text-lg mb-3 text-blue-900">{t("recommendedActions")}</h3>
            <p className="text-blue-900 font-medium">{state.decision.impact_action || t("noActionSuggested")}</p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <h3 className="text-lg mb-3 text-gray-800">{t("metadata")}</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">{t("source")}:</span> {state.source}
              </p>
              <p>
                <span className="font-semibold">{t("contentType")}:</span> {getContentTypeLabel(state.sourceType)}
              </p>
            </div>
          </Card>
        </div>

        {isHarmful && (
          <div className="mb-8 flex flex-col items-center gap-4">
            {/* Primary action row */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={handleGetCyberLaws}
                disabled={lawsLoading}
                className="px-5 py-5 text-sm rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 shadow-sm"
              >
                {lawsLoading ? t("fetchingCyberLaws") : lawsData ? t("viewCyberLaws") : t("getCyberLaws")}
              </Button>

              {lawsData && (
                <Button
                  onClick={handleComplaintAction}
                  disabled={complaintLoading}
                  className="px-6 py-5 text-sm rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {complaintLoading
                    ? t("draftingComplaint")
                    : complaintText
                    ? t("viewComplaint")
                    : t("generateComplaint")}
                </Button>
              )}

              {complaintText && COMPLAINT_PORTALS[selectedLocation] && (
                <a
                  href={COMPLAINT_PORTALS[selectedLocation]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("fileComplaint")}
                </a>
              )}
            </div>

            {lawsError && <p className="text-sm text-red-600 text-center">{lawsError}</p>}
            {complaintError && <p className="text-sm text-red-600 text-center">{complaintError}</p>}
          </div>
        )}

        <div className="text-center">
          <Button
            onClick={() => navigate("/")}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t("analyzeNewContent")}
          </Button>
        </div>
      </div>

      <LoadingModal steps={GET_LAWS_STEPS} isOpen={lawsLoading} />
      <LoadingModal steps={COMPLAINT_STEPS} isOpen={complaintLoading} />

      <Dialog open={lawsOpen} onOpenChange={setLawsOpen}>
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[85vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("cyberLawsAnalysis")}</DialogTitle>
            <DialogDescription>{t("legalGuidance")}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1">
            {!lawsData && !lawsError && (
              <p className="text-sm text-gray-400">{t("loadingLegalAnalysis")}</p>
            )}

            {lawsData && (
              <div className="space-y-5 py-1">
                {lawsData.country && (
                  <p className="text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
                    {t("lawsApplicableTo")} {lawsData.country}
                  </p>
                )}

                <div className="rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-600">{t("summary")}</h4>
                  <p className="mt-2 text-gray-800 font-medium whitespace-pre-wrap">{lawsData.summary}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">{t("applicableLaws")}</h4>
                  <div className="space-y-3">
                    {lawsData.applicable_laws?.length ? (
                      lawsData.applicable_laws.map((law, index) => {
                        const src = lawsData.rag_sources?.[index];
                        return (
                          <div
                            key={`${law.law}-${index}`}
                            className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                          >
                            <p className="text-blue-900 font-semibold text-sm">{law.law}</p>
                            <p className="text-blue-800 text-sm mt-1 leading-relaxed">{law.description}</p>
                            {src?.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {src.title || t("viewSource")}
                              </a>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">{t("noLawsProvided")}</p>
                    )}
                  </div>
                </div>

                {lawsData.recommended_actions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">{t("recommendedActions")}</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {lawsData.recommended_actions.map((action, index) => (
                        <p key={`${action}-${index}`}>• {action}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {lawsError && <p className="text-sm text-red-600">{lawsError}</p>}
          </div>

          <DialogFooter className="shrink-0 pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={() => setLawsOpen(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={complaintOpen} onOpenChange={(open) => { setComplaintOpen(open); if (!open) setIsEditingComplaint(false); }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("complaintDraft")}</DialogTitle>
            <DialogDescription>{t("copyComplaintHint")}</DialogDescription>
          </DialogHeader>

          {complaintText ? (
            <div className="rounded-lg border border-gray-200 bg-white/90 p-4 max-h-[60vh] overflow-y-auto">
              {isEditingComplaint ? (
                <Textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={16}
                  className="w-full text-sm text-gray-800 border-none shadow-none resize-none focus-visible:ring-0 p-0"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{complaintText}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("noComplaintDraft")}</p>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {complaintText && (
              <Button
                variant="outline"
                className="inline-flex items-center gap-1"
                onClick={handleDownloadComplaint}
              >
                <Download className="w-4 h-4" />
                {t("downloadComplaint")}
              </Button>
            )}
            {complaintText && (
              <Button
                variant="outline"
                onClick={() => setIsEditingComplaint((prev) => !prev)}
              >
                {isEditingComplaint ? t("saveComplaint") : t("editComplaint")}
              </Button>
            )}
            <Button variant="outline" onClick={() => { setComplaintOpen(false); setIsEditingComplaint(false); }}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
