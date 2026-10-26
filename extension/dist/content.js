(function () {
  // Prevent duplicate script execution on the same tab
  if (document.getElementById("studylens-launcher-button")) {
    return;
  }

  let selectedText = "";

  // Capture selection and forward to React iframe
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      selectedText = selection;
      const panelIframe = document.getElementById("studylens-panel-iframe");
      if (panelIframe && panelIframe.contentWindow) {
        panelIframe.contentWindow.postMessage(
          { type: "STUDYLENS_SELECTION", text: selectedText },
          "*"
        );
      }
    }
  });

  // Single floating launcher button on host webpage
  const button = document.createElement("button");
  button.id = "studylens-launcher-button";
  button.innerHTML = `
    <span style="display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.2);font-size:16px;">✳</span>
    <span>StudyLens</span>
    <span style="width:6px;height:6px;border-radius:50%;background:#bce8b9;"></span>
  `;

  Object.assign(button.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: "2147483647",
    padding: "10px 18px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.8)",
    background: "linear-gradient(135deg, #2d6c55, #1e4c3d)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 12px 32px rgba(27,72,54,0.3)",
    cursor: "pointer",
    transition: "transform 0.2s ease"
  });

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-3px)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
  });

  // Panel Iframe Overlay
  const panel = document.createElement("iframe");
  panel.id = "studylens-panel-iframe";
  panel.title = "StudyLens Assistant";
  panel.src = chrome.runtime.getURL("index.html");

  Object.assign(panel.style, {
    display: "none",
    position: "fixed",
    right: "24px",
    bottom: "80px",
    width: "390px",
    height: "650px",
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "calc(100vh - 100px)",
    border: "none",
    borderRadius: "20px",
    boxShadow: "0 24px 70px rgba(24, 45, 35, 0.25)",
    background: "#ffffff",
    zIndex: "2147483646"
  });

  button.addEventListener("click", () => {
    const isHidden = panel.style.display === "none";
    panel.style.display = isHidden ? "block" : "none";
  });

  window.addEventListener("message", (event) => {
    if (event.data?.type === "STUDYLENS_CLOSE") {
      panel.style.display = "none";
    }
  });

  document.body.appendChild(panel);
  document.body.appendChild(button);
})();