import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, Link, Youtube, Mic } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Home() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newsInput, setNewsInput] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleValidate = () => {
    // Mock extracted text based on what was uploaded
    let extractedText = "";
    if (imageFile) {
      extractedText = "Sample text extracted from the image: This is a message discussing recent events.";
    } else if (newsInput) {
      extractedText = `News article content: ${newsInput}`;
    } else if (youtubeLink) {
      extractedText = "Transcript from YouTube video: This is the conversation happening in the video.";
    } else if (audioFile) {
      extractedText = "Audio transcription: This is what was said in the audio file.";
    } else {
      extractedText = "No content provided. Please upload media or paste a link.";
    }

    navigate("/preview", { state: { extractedText } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4 text-gray-800">
            Cyber Safety Analyzer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            This tool analyzes media content to detect harmful or bullying content. 
            Upload media or paste links to verify the content. Get safety insights 
            and recommended actions.
          </p>
        </div>

        {/* Upload Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Image Upload */}
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
                  <p className="text-sm text-green-600 mt-2">✓ {imageFile.name}</p>
                )}
              </div>
            </div>
          </Card>

          {/* News Article */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Link className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-gray-800">News Article</h3>
                <Input
                  type="text"
                  placeholder="Paste URL or enter text..."
                  value={newsInput}
                  onChange={(e) => setNewsInput(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </Card>

          {/* YouTube Link */}
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
              </div>
            </div>
          </Card>

          {/* Audio Upload */}
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
                  <p className="text-sm text-green-600 mt-2">✓ {audioFile.name}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Validate Button */}
        <div className="text-center">
          <Button
            onClick={handleValidate}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Validate Content
          </Button>
        </div>
      </div>
    </div>
  );
}
