import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGE_OPTIONS, type AppLanguage } from "../i18n/translations";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
      <label className="mr-2 text-sm font-medium text-gray-700" htmlFor="language-select">
        {t("language")}:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(event) => setLanguage(event.target.value as AppLanguage)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
