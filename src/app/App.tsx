import { RouterProvider } from "react-router";
import { router } from "./routes";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { LanguageProvider } from "./i18n/LanguageContext";
import LocationSwitcher from "./components/LocationSwitcher";
import { LocationProvider } from "./i18n/LocationContext";

export default function App() {
  return (
    <LanguageProvider>
      <LocationProvider>
        <LanguageSwitcher />
        <LocationSwitcher />
        <RouterProvider router={router} />
      </LocationProvider>
    </LanguageProvider>
  );
}
