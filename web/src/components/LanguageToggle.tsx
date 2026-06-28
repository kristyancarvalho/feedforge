import { LANGUAGE_LABELS, LANGUAGES } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import { LanguageIcon } from "./icons";

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();

  function cycle() {
    const index = LANGUAGES.indexOf(language);
    const next = LANGUAGES[(index + 1) % LANGUAGES.length];
    setLanguage(next);
  }

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={cycle}
      aria-label={t("common.language")}
      title={t("common.language")}
    >
      <LanguageIcon className="inline-icon" />
      <span>{LANGUAGE_LABELS[language]}</span>
    </button>
  );
}
