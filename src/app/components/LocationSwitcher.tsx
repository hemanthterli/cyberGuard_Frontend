import { useLanguage } from "../i18n/LanguageContext";
import { type AppLocation, useLocationSelection } from "../i18n/LocationContext";

const LABELS = {
  en: {
    title: "Location",
    india: "India",
    uk: "United Kingdom (UK)",
    usa: "United States (USA)",
  },
  hi: {
    title: "स्थान",
    india: "भारत",
    uk: "यूनाइटेड किंगडम (UK)",
    usa: "यूनाइटेड स्टेट्स (USA)",
  },
  te: {
    title: "ప్రాంతం",
    india: "భారతదేశం",
    uk: "యునైటెడ్ కింగ్‌డమ్ (UK)",
    usa: "యునైటెడ్ స్టేట్స్ (USA)",
  },
} as const;

const OPTIONS: AppLocation[] = ["india", "uk", "usa"];

export default function LocationSwitcher() {
  const { language } = useLanguage();
  const { location, setLocation } = useLocationSelection();
  const labels = LABELS[language];

  return (
    <div className="fixed top-20 right-4 z-50 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
      <label className="mr-2 text-sm font-medium text-gray-700" htmlFor="location-select">
        {labels.title}:
      </label>
      <select
        id="location-select"
        value={location}
        onChange={(event) => setLocation(event.target.value as AppLocation)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
