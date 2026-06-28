import { useI18n } from "../i18n/I18nProvider";
import { useTheme } from "../theme/ThemeProvider";
import { MoonIcon, SunIcon } from "./icons";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const label = theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark");
  return (
    <button type="button" className="icon-button" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
