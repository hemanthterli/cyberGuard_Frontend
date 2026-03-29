import { RouterProvider } from "react-router";
import { router } from "./routes";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { LanguageProvider } from "./i18n/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <LanguageSwitcher />
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
