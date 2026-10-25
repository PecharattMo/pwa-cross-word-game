const ENGLISH_LOCALE = "en-US";

function preferredEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const locale = ENGLISH_LOCALE.toLowerCase();
  return (
    voices.find(
      (voice) => voice.localService && voice.lang.toLowerCase() === locale,
    ) ??
    voices.find((voice) => voice.lang.toLowerCase() === locale) ??
    voices.find(
      (voice) => voice.localService && voice.lang.toLowerCase().startsWith("en"),
    ) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

export function speakEnglishWord(word: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return false;
  }

  const pronunciation = new SpeechSynthesisUtterance(word);
  pronunciation.lang = ENGLISH_LOCALE;
  pronunciation.rate = 0.85;
  pronunciation.pitch = 1;
  pronunciation.voice = preferredEnglishVoice(window.speechSynthesis.getVoices()) ?? null;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(pronunciation);
  return true;
}
