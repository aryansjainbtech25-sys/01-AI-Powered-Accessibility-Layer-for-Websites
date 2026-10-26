import { useEffect, useState } from "react";
import "./AppRedesigned.css";

type Feature = "simplify" | "translate" | "listen" | "steps" | "explain" | "clear";
type Theme = "light" | "warm" | "dark";
type PanelPosition = "left" | "right";

const originalText =
  "Photosynthesis is the process by which green plants use sunlight to synthesise nutrients from carbon dioxide and water. It generally involves the green pigment chlorophyll and generates oxygen as a by-product.";

const simplifiedText =
  "Photosynthesis is how plants make their own food. They use sunlight, water and carbon dioxide. Plants also release oxygen during this process.";

const explanations: Record<Feature, { title: string; eyebrow: string; content: string }> = {
  simplify: {
    title: "A clearer explanation",
    eyebrow: "SIMPLIFIED VERSION",
    content: simplifiedText,
  },
  explain: {
    title: "Let's understand it",
    eyebrow: "CONCEPT EXPLAINED",
    content:
      "Think of a plant as a tiny food-making factory. Its leaves capture sunlight, its roots take in water, and its leaves absorb carbon dioxide from the air. The plant uses these ingredients to make sugar for energy and releases oxygen.",
  },
  translate: {
    title: "Choose your language",
    eyebrow: "LANGUAGE CENTRE",
    content: "Select a language below to preview the translated reading view.",
  },
  listen: {
    title: "Listen to this section",
    eyebrow: "AUDIO READER",
    content: simplifiedText,
  },
  steps: {
    title: "Photosynthesis, step by step",
    eyebrow: "GUIDED LEARNING",
    content:
      "1. Leaves capture energy from sunlight.\n2. Roots absorb water from the soil.\n3. Leaves take in carbon dioxide from the air.\n4. The plant uses these ingredients to make sugar.\n5. Oxygen is released into the air.",
  },
  clear: {
    title: "Clear reading view",
    eyebrow: "FOCUS READING",
    content: simplifiedText,
  },
};

const translatedSamples: Record<string, string> = {
  English: simplifiedText,
  हिन्दी: "प्रकाश संश्लेषण वह प्रक्रिया है जिसमें पौधे अपना भोजन बनाते हैं। वे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड का उपयोग करते हैं। इस प्रक्रिया में ऑक्सीजन भी निकलती है।",
  ಕನ್ನಡ: "ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಎಂದರೆ ಸಸ್ಯಗಳು ತಮ್ಮ ಆಹಾರವನ್ನು ತಯಾರಿಸುವ ಪ್ರಕ್ರಿಯೆ. ಅವು ಸೂರ್ಯನ ಬೆಳಕು, ನೀರು ಮತ್ತು ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಅನ್ನು ಬಳಸುತ್ತವೆ. ಈ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ಆಮ್ಲಜನಕವೂ ಬಿಡುಗಡೆಯಾಗುತ್ತದೆ.",
};

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"home" | "result" | "reading" | "settings">("home");
  const [activeFeature, setActiveFeature] = useState<Feature>("simplify");
  const [theme, setTheme] = useState<Theme>("warm");
  const [fontSize, setFontSize] = useState(18);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>("right");
  const [language, setLanguage] = useState("English");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedText, setSelectedText] = useState("");

  const currentContent =
    activeFeature === "translate"
      ? translatedSamples[language]
      : showOriginal
        ? originalText
        : explanations[activeFeature].content;

  useEffect(() => {
    document.documentElement.dataset.studylensTheme = theme;
    return () => {
      delete document.documentElement.dataset.studylensTheme;
    };
  }, [theme]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const openFeature = (feature: Feature) => {
    setActiveFeature(feature);
    setShowOriginal(false);
    setActiveView(feature === "clear" ? "reading" : "result");
    if (feature === "listen") {
      window.setTimeout(() => speak(simplifiedText), 0);
    }
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "हिन्दी" ? "hi-IN" : language === "ಕನ್ನಡ" ? "kn-IN" : "en-US";
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const goHome = () => {
    stopSpeaking();
    setActiveView("home");
    setShowOriginal(false);
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
    } catch {
      // Clipboard access can be blocked in some extension preview contexts.
    }
  };

  const getSelection = () => {
    const text = window.getSelection()?.toString().trim();
    if (text) {
      setSelectedText(text);
      setActiveView("result");
      setActiveFeature("explain");
    } else {
      setSelectedText("");
    }
  };

  return (
    <main className="app-shell">
      {!isOpen && (
        <button className={`floating-launcher ${panelPosition}`} onClick={() => setIsOpen(true)} aria-label="Open StudyLens">
          <span className="launcher-mark" aria-hidden="true">✳</span>
          <span>StudyLens</span>
          <span className="launcher-status" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <section className={`study-panel ${panelPosition} theme-${theme}`} aria-label="StudyLens accessibility panel">
          <header className="panel-header">
            <div className="brand-lockup">
              <div className="brand-mark" aria-hidden="true"><span>✳</span></div>
              <div>
                <div className="brand-name">StudyLens <span className="brand-beta">BETA</span></div>
                <p className="brand-subtitle">Your learning companion</p>
              </div>
            </div>
            <div className="header-actions">
              <button className={`icon-button ${activeView === "settings" ? "selected" : ""}`} onClick={() => setActiveView(activeView === "settings" ? "home" : "settings")} aria-label="Open settings" title="Settings">⚙</button>
              <button className="icon-button" onClick={() => { stopSpeaking(); setIsOpen(false); }} aria-label="Close StudyLens" title="Close">×</button>
            </div>
          </header>

          <div className="panel-scroll" style={{ fontSize: `${fontSize}px` }}>
            {activeView === "settings" ? (
              <div className="view-content settings-view">
                <button className="back-link" onClick={goHome}>← <span>Back to home</span></button>
                <div className="view-heading">
                  <span className="eyebrow">MAKE IT YOURS</span>
                  <h1>Reading Studio</h1>
                  <p>Small adjustments. A more comfortable read.</p>
                </div>

                <section className="setting-section">
                  <div className="setting-title-row">
                    <div className="setting-icon">Aa</div>
                    <div><h2>Font size</h2><p>Adjust text for comfortable reading</p></div>
                    <span className="setting-value">{fontSize}px</span>
                  </div>
                  <input className="font-slider" type="range" min="14" max="26" step="2" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} aria-label="Font size" />
                  <div className="range-labels"><span>Small</span><span>Large</span></div>
                  <div className="font-preview" style={{ fontSize: `${fontSize}px` }}>Learning should feel clear and comfortable.</div>
                </section>

                <section className="setting-section">
                  <div className="setting-title-row">
                    <div className="setting-icon">◐</div>
                    <div><h2>Reading theme</h2><p>Choose the feel of your reading space</p></div>
                  </div>
                  <div className="theme-options">
                    {([
                      { value: "light", label: "Light", description: "Crisp & clear", swatch: "☀" },
                      { value: "warm", label: "Warm", description: "Soft & calm", swatch: "◒" },
                      { value: "dark", label: "Dark", description: "Low light", swatch: "☾" },
                    ] as { value: Theme; label: string; description: string; swatch: string }[]).map((option) => (
                      <button key={option.value} className={`theme-option ${theme === option.value ? "active" : ""}`} onClick={() => setTheme(option.value)} aria-pressed={theme === option.value}>
                        <span className={`theme-swatch ${option.value}`}>{option.swatch}</span>
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="setting-section">
                  <div className="setting-title-row">
                    <div className="setting-icon">⇄</div>
                    <div><h2>Panel position</h2><p>Choose where StudyLens appears</p></div>
                  </div>
                  <div className="position-options">
                    <button className={`position-option ${panelPosition === "left" ? "active" : ""}`} onClick={() => setPanelPosition("left")} aria-pressed={panelPosition === "left"}>
                      <span className="position-diagram left"><i /></span><span>Left side</span>{panelPosition === "left" && <b>✓</b>}
                    </button>
                    <button className={`position-option ${panelPosition === "right" ? "active" : ""}`} onClick={() => setPanelPosition("right")} aria-pressed={panelPosition === "right"}>
                      <span className="position-diagram right"><i /></span><span>Right side</span>{panelPosition === "right" && <b>✓</b>}
                    </button>
                  </div>
                </section>
                <p className="settings-note"><span>✦</span> Reduced-motion preferences are respected automatically.</p>
              </div>
            ) : activeView === "home" ? (
              <div className="view-content home-view">
                <div className="welcome-card">
                  <div className="welcome-orbit" aria-hidden="true">✳</div>
                  <span className="eyebrow">A CLEARER WAY TO LEARN</span>
                  <h1>Your page,<br />made clearer.</h1>
                  <p>Understand complex content, explore your language and learn at your own pace.</p>
                  <div className="welcome-footer"><span className="pulse-dot" /> Ready when you are</div>
                </div>

                <div className="page-context">
                  <span className="context-icon">▤</span>
                  <span><strong>Learning page</strong><small>NCERT · Sample content</small></span>
                  <span className="context-badge">DEMO</span>
                </div>

                <div className="section-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h2>What do you need?</h2></div><span className="section-sparkle">✳</span></div>
                <div className="action-grid">
                  <button className="action-card" onClick={() => openFeature("simplify")}><span className="action-icon mint">✧</span><span className="action-copy"><strong>Make it simple</strong><small>Clearer, easier language</small></span><span className="card-arrow">↗</span></button>
                  <button className="action-card" onClick={() => openFeature("translate")}><span className="action-icon lavender">文</span><span className="action-copy"><strong>My language</strong><small>English · हिन्दी · ಕನ್ನಡ</small></span><span className="card-arrow">↗</span></button>
                  <button className="action-card" onClick={() => openFeature("listen")}><span className="action-icon peach">♫</span><span className="action-copy"><strong>Listen to page</strong><small>Hear content aloud</small></span><span className="card-arrow">↗</span></button>
                  <button className="action-card" onClick={() => openFeature("steps")}><span className="action-icon blue">☷</span><span className="action-copy"><strong>Guide me</strong><small>One step at a time</small></span><span className="card-arrow">↗</span></button>
                </div>

                <button className="clear-view-card" onClick={() => openFeature("clear")}>
                  <span className="clear-view-icon">▤</span><span className="clear-view-copy"><strong>Open Clear View</strong><small>A calmer, distraction-free reading space</small></span><span className="clear-view-arrow">→</span>
                </button>

                <div className="selection-card">
                  <div className="selection-icon">⌁</div>
                  <div className="selection-copy"><strong>Something confusing?</strong><p>Select a sentence on the page, then use the explain action.</p></div>
                  <button className="text-action" onClick={getSelection}>Use selection</button>
                </div>
              </div>
            ) : activeView === "reading" ? (
              <div className="view-content reading-view">
                <button className="back-link" onClick={goHome}>← <span>All tools</span></button>
                <div className="reading-topline"><span className="eyebrow">FOCUS READING</span><button className="pill-button" onClick={() => setActiveView("settings")}>Aa · Theme</button></div>
                <h1>Photosynthesis</h1>
                <p className="reading-intro">How plants turn light into life.</p>
                <div className="reading-tools"><span>SCIENCE</span><span>•</span><span>3 min read</span><span className="reading-tool-spacer" /><button onClick={() => speak(currentContent)} aria-label="Read this section aloud">♫ Listen</button></div>
                <article className="reading-article">
                  <h2>What is photosynthesis?</h2>
                  <p style={{ fontSize: `${fontSize}px` }}>{showOriginal ? originalText : simplifiedText}</p>
                  <div className="key-idea"><span>✦</span><div><strong>Key idea</strong><p>Plants use sunlight to make food and release oxygen.</p></div></div>
                  <h2>How does it work?</h2>
                  <ol><li>Leaves capture sunlight.</li><li>Roots absorb water from the soil.</li><li>Leaves take in carbon dioxide.</li><li>The plant makes sugar for energy.</li></ol>
                </article>
                <div className="reading-bottom-actions"><button className="secondary-button" onClick={() => setShowOriginal(!showOriginal)}>{showOriginal ? "View clear text" : "View original text"}</button><button className="primary-button" onClick={() => openFeature("steps")}>See the steps <span>→</span></button></div>
              </div>
            ) : (
              <div className="view-content result-view">
                <button className="back-link" onClick={goHome}>← <span>All tools</span></button>
                <div className="view-heading">
                  <span className="eyebrow">{explanations[activeFeature].eyebrow}</span>
                  <h1>{selectedText && activeFeature === "explain" ? "Understand this text" : explanations[activeFeature].title}</h1>
                  <p>{activeFeature === "simplify" ? "The main idea, without the extra complexity." : activeFeature === "translate" ? "Choose the language that feels right for you." : activeFeature === "listen" ? "Listen at your own pace." : activeFeature === "steps" ? "A complex idea, broken into manageable steps." : "Let's make the meaning easier to understand."}</p>
                </div>

                {activeFeature === "translate" && <div className="language-options">{Object.keys(translatedSamples).map((name) => <button key={name} className={language === name ? "active" : ""} onClick={() => setLanguage(name)}>{name}{language === name && <span>✓</span>}</button>)}</div>}

                {activeFeature === "steps" ? (
                  <div className="steps-list">{explanations.steps.content.split("\n").map((step, index) => <button key={step} className={`step-row ${completedSteps.includes(index) ? "done" : ""}`} onClick={() => setCompletedSteps((old) => old.includes(index) ? old.filter((n) => n !== index) : [...old, index])}><span className="step-number">{completedSteps.includes(index) ? "✓" : `0${index + 1}`}</span><span>{step.replace(/^\d+\.\s*/, "")}</span></button>)}<p className="steps-progress">{completedSteps.length} of 5 steps completed</p></div>
                ) : (
                  <div className="result-paper">
                    <div className="paper-label"><span className="paper-dot" /> {showOriginal ? "ORIGINAL TEXT" : activeFeature === "translate" ? language.toUpperCase() : "CLEAR VIEW"}</div>
                    <p style={{ fontSize: `${fontSize}px` }}>{selectedText && activeFeature === "explain" ? `You selected: “${selectedText}”\n\n${explanations.explain.content}` : currentContent}</p>
                    {activeFeature === "translate" && <span className="demo-note">Translation preview · connect your translation service for live page translation.</span>}
                  </div>
                )}

                {activeFeature === "listen" && <div className="audio-player"><button className="play-button" onClick={() => isSpeaking ? stopSpeaking() : speak(currentContent)}>{isSpeaking ? "Ⅱ" : "▶"}</button><div className="audio-details"><strong>{isSpeaking ? "Reading aloud…" : "Ready to listen"}</strong><small>Device speech · 1× speed</small><div className={`audio-wave ${isSpeaking ? "playing" : ""}`}>{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ height: `${8 + ((i * 13) % 19)}px` }} />)}</div></div></div>}

                <div className="result-toolbar">
                  <button className="secondary-button" onClick={() => speak(currentContent)}>♫ Listen</button>
                  <button className="secondary-button" onClick={copyContent}>▣ Copy text</button>
                  <button className="secondary-button" onClick={() => setShowOriginal(!showOriginal)}>{showOriginal ? "Clear text" : "Original"}</button>
                </div>
                <div className="gentle-note"><span>✦</span><p>Use this as a learning aid. Check the original source when accuracy matters.</p></div>
              </div>
            )}
          </div>
          <footer className="panel-footer">
            <span className="footer-brand"><span>✳</span> StudyLens</span>
            <span className="footer-separator">·</span>
            <span>Designed for clearer learning</span>
            <button onClick={() => setActiveView("settings")} aria-label="Reading settings">Aa</button>
          </footer>
        </section>
      )}
    </main>
  );
}

export default App;
