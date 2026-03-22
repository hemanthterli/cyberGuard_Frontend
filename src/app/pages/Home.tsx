import { useState, type Dispatch, type SetStateAction } from "react";
import { Upload, Link, Youtube, Mic } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const API_BASE = "http://localhost:8002";

type ContentState = {
  extracted: string;
  enhanced: string;
  loading: boolean;
  enhancing: boolean;
  error: string;
};

const initialState: ContentState = {
  extracted: "",
  enhanced: "",
  loading: false,
  enhancing: false,
  error: "",
};

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newsInput, setNewsInput] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [imageState, setImageState] = useState<ContentState>(initialState);
  const [newsState, setNewsState] = useState<ContentState>(initialState);
  const [youtubeState, setYoutubeState] = useState<ContentState>(initialState);
  const [audioState, setAudioState] = useState<ContentState>(initialState);

  const extractTextFromResponse = async (response: Response) => {
    const payload = await response.json();
    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error?.detail || payload?.message || "Request failed");
    }
    const text = payload?.data?.text;
    if (!text) {
      throw new Error("No content extracted");
    }
    return text as string;
  };

  const enhanceContent = async (
    sourceType: string,
    source: string | null,
    content: string,
    setState: Dispatch<SetStateAction<ContentState>>
  ) => {
    if (!content) {
      setState((prev) => ({ ...prev, error: "No extracted content to enhance." }));
      return;
    }
    setState((prev) => ({ ...prev, enhancing: true, error: "" }));
    try {
      const body: Record<string, string> = {
        source_type: sourceType,
        content,
      };
      if (source) {
        body.source = source;
      }
      const response = await fetch(`${API_BASE}/content-enhancement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const enhanced = await extractTextFromResponse(response);
      setState((prev) => ({ ...prev, enhanced }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Enhancement failed";
      setState((prev) => ({ ...prev, error: message }));
    } finally {
      setState((prev) => ({ ...prev, enhancing: false }));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      setImageState((prev) => ({ ...prev, error: "Please select an image file." }));
      return;
    }
    setImageState({ ...initialState, loading: true });
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const response = await fetch(`${API_BASE}/image`, {
        method: "POST",
        body: formData,
      });
      const extracted = await extractTextFromResponse(response);
      setImageState((prev) => ({ ...prev, extracted }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setImageState((prev) => ({ ...prev, error: message }));
    } finally {
      setImageState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleNewsFetch = async () => {
    if (!newsInput.trim()) {
      setNewsState((prev) => ({ ...prev, error: "Please enter a news article URL." }));
      return;
    }
    setNewsState({ ...initialState, loading: true });
    try {
      const response = await fetch(`${API_BASE}/news-article`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newsInput.trim() }),
      });
      const extracted = await extractTextFromResponse(response);
      setNewsState((prev) => ({ ...prev, extracted }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fetch failed";
      setNewsState((prev) => ({ ...prev, error: message }));
    } finally {
      setNewsState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleYoutubeFetch = async () => {
    if (!youtubeLink.trim()) {
      setYoutubeState((prev) => ({ ...prev, error: "Please enter a YouTube URL." }));
      return;
    }
    setYoutubeState({ ...initialState, loading: true });
    try {
      const response = await fetch(`${API_BASE}/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeLink.trim() }),
      });
      const extracted = await extractTextFromResponse(response);
      setYoutubeState((prev) => ({ ...prev, extracted }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fetch failed";
      setYoutubeState((prev) => ({ ...prev, error: message }));
    } finally {
      setYoutubeState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleAudioUpload = async () => {
    if (!audioFile) {
      setAudioState((prev) => ({ ...prev, error: "Please select an audio file." }));
      return;
    }
    setAudioState({ ...initialState, loading: true });
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      const response = await fetch(`${API_BASE}/audio`, {
        method: "POST",
        body: formData,
      });
      const extracted = await extractTextFromResponse(response);
      setAudioState((prev) => ({ ...prev, extracted }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setAudioState((prev) => ({ ...prev, error: message }));
    } finally {
      setAudioState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4 text-gray-800">
            Cyber Safety Analyzer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Upload media or paste links to extract content, then enhance and
            structure it for downstream analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">Image Upload</h3>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="bg-white border-gray-300"
                />
                {imageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {imageFile.name}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    onClick={handleImageUpload}
                    disabled={imageState.loading}
                  >
                    {imageState.loading ? "Uploading..." : "Upload / Get Content"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      enhanceContent(
                        "image_ocr",
                        imageFile?.name || null,
                        imageState.extracted,
                        setImageState
                      )
                    }
                    disabled={!imageState.extracted || imageState.enhancing}
                  >
                    {imageState.enhancing ? "Enhancing..." : "Enhance Content"}
                  </Button>
                </div>
                {imageState.error && (
                  <p className="text-sm text-red-600 mt-3">{imageState.error}</p>
                )}
                {imageState.extracted && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Extracted</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-200 rounded-md p-3">
                      {imageState.extracted}
                    </div>
                  </div>
                )}
                {imageState.enhanced && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Enhanced</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 border border-blue-200 rounded-md p-3">
                      {imageState.enhanced}
                    </div>
                  </div>
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
                <h3 className="text-lg mb-2 text-gray-800">News Article</h3>
                <Input
                  type="text"
                  placeholder="Paste article URL"
                  value={newsInput}
                  onChange={(e) => setNewsInput(e.target.value)}
                  className="bg-white border-gray-300"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    onClick={handleNewsFetch}
                    disabled={newsState.loading}
                  >
                    {newsState.loading ? "Fetching..." : "Get Content"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      enhanceContent(
                        "news_article",
                        newsInput.trim() || null,
                        newsState.extracted,
                        setNewsState
                      )
                    }
                    disabled={!newsState.extracted || newsState.enhancing}
                  >
                    {newsState.enhancing ? "Enhancing..." : "Enhance Content"}
                  </Button>
                </div>
                {newsState.error && (
                  <p className="text-sm text-red-600 mt-3">{newsState.error}</p>
                )}
                {newsState.extracted && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Extracted</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-200 rounded-md p-3">
                      {newsState.extracted}
                    </div>
                  </div>
                )}
                {newsState.enhanced && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Enhanced</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-purple-50 border border-purple-200 rounded-md p-3">
                      {newsState.enhanced}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Youtube className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">YouTube Link</h3>
                <Input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  className="bg-white border-gray-300"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    onClick={handleYoutubeFetch}
                    disabled={youtubeState.loading}
                  >
                    {youtubeState.loading ? "Fetching..." : "Get Content"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      enhanceContent(
                        "youtube_transcript",
                        youtubeLink.trim() || null,
                        youtubeState.extracted,
                        setYoutubeState
                      )
                    }
                    disabled={!youtubeState.extracted || youtubeState.enhancing}
                  >
                    {youtubeState.enhancing ? "Enhancing..." : "Enhance Content"}
                  </Button>
                </div>
                {youtubeState.error && (
                  <p className="text-sm text-red-600 mt-3">{youtubeState.error}</p>
                )}
                {youtubeState.extracted && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Extracted</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-200 rounded-md p-3">
                      {youtubeState.extracted}
                    </div>
                  </div>
                )}
                {youtubeState.enhanced && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Enhanced</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-red-50 border border-red-200 rounded-md p-3">
                      {youtubeState.enhanced}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mic className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">Audio Upload</h3>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="bg-white border-gray-300"
                />
                {audioFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {audioFile.name}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    onClick={handleAudioUpload}
                    disabled={audioState.loading}
                  >
                    {audioState.loading ? "Uploading..." : "Upload / Get Content"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      enhanceContent(
                        "audio_transcript",
                        audioFile?.name || null,
                        audioState.extracted,
                        setAudioState
                      )
                    }
                    disabled={!audioState.extracted || audioState.enhancing}
                  >
                    {audioState.enhancing ? "Enhancing..." : "Enhance Content"}
                  </Button>
                </div>
                {audioState.error && (
                  <p className="text-sm text-red-600 mt-3">{audioState.error}</p>
                )}
                {audioState.extracted && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Extracted</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-200 rounded-md p-3">
                      {audioState.extracted}
                    </div>
                  </div>
                )}
                {audioState.enhanced && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Enhanced</p>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-green-50 border border-green-200 rounded-md p-3">
                      {audioState.enhanced}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
