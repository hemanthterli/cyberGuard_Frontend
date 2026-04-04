import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, Link, Youtube, Mic } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LoadingModal } from "../components/LoadingModal";
import { API_BASE } from "../lib/api";
import { useLanguage } from "../i18n/LanguageContext";
import { useLocationSelection } from "../i18n/LocationContext";


type ExtractedState = {
  loading: boolean;
  error: string;
};

const initialState: ExtractedState = {
  loading: false,
  error: "",
};

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { location } = useLocationSelection();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newsInput, setNewsInput] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [state, setState] = useState<ExtractedState>(initialState);
  const [whisperLoading, setWhisperLoading] = useState(false);

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

  const extractTextFromResponse = async (response: Response) => {
    const payload = await response.json();
    if (!response.ok || !payload?.success) {
      throw new Error(extractApiError(payload, t("requestFailed")));
    }
    const text = payload?.data?.text;
    if (!text) {
      throw new Error(t("noContentExtracted"));
    }
    return text as string;
  };

  const handleExtract = async () => {
    const selections = [
      imageFile ? "image" : null,
      newsInput.trim() ? "news" : null,
      youtubeLink.trim() ? "youtube" : null,
      audioFile ? "audio" : null,
    ].filter(Boolean);

    if (selections.length === 0) {
      setState({ ...initialState, error: t("provideOneInput") });
      return;
    }

    if (selections.length > 1) {
      setState({ ...initialState, error: t("useOneInputOnly") });
      return;
    }

    setState({ loading: true, error: "" });

    try {
      let extractedText = "";
      let sourceType = "";
      let source = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const response = await fetch(`${API_BASE}/image`, {
          method: "POST",
          body: formData,
        });
        extractedText = await extractTextFromResponse(response);
        sourceType = "image_ocr";
        source = imageFile.name;
      } else if (newsInput.trim()) {
        const response = await fetch(`${API_BASE}/news-article`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: newsInput.trim() }),
        });
        extractedText = await extractTextFromResponse(response);
        sourceType = "news_article";
        source = newsInput.trim();
      } else if (youtubeLink.trim()) {
        const response = await fetch(`${API_BASE}/youtube`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: youtubeLink.trim() }),
        });
        extractedText = await extractTextFromResponse(response);
        sourceType = "youtube_transcript";
        source = youtubeLink.trim();
      } else if (audioFile) {
        setWhisperLoading(true);
        const formData = new FormData();
        formData.append("file", audioFile);
        const response = await fetch(`${API_BASE}/audio`, {
          method: "POST",
          body: formData,
        });
        extractedText = await extractTextFromResponse(response);
        sourceType = "audio_transcript";
        source = audioFile.name;
      }

      navigate("/preview", {
        state: {
          extractedText,
          sourceType,
          source,
          language,
          location,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("extractionFailed");
      setState({ ...initialState, error: message });
    } finally {
      setWhisperLoading(false);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <LoadingModal
        steps={[
          "Loading Whisper Model...",
          "Detecting Language...",
          "Transcribing Audio...",
        ]}
        isOpen={whisperLoading}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4 text-gray-800">
            {t("homeTitle")}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {t("homeSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">{t("imageUpload")}</h3>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="bg-white border-gray-300"
                />
                {imageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    {t("selectedFile")}: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Link className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">{t("newsArticle")}</h3>
                <Input
                  type="text"
                  placeholder={t("pasteArticleUrl")}
                  value={newsInput}
                  onChange={(e) => setNewsInput(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Youtube className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">{t("youtubeLink")}</h3>
                <Input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mic className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">{t("audioUpload")}</h3>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="bg-white border-gray-300"
                />
                {audioFile && (
                  <p className="text-sm text-green-600 mt-2">
                    {t("selectedFile")}: {audioFile.name}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {state.error && (
          <p className="text-center text-sm text-red-600 mb-4">{state.error}</p>
        )}

        <div className="text-center">
          <Button
            onClick={handleExtract}
            disabled={state.loading}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {state.loading ? t("extracting") : t("extractContent")}
          </Button>
        </div>
      </div>
    </div>
  );
}
