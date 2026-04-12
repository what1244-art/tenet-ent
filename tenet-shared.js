/* 메인/밴드클럽 페이지 공용: 방문자 카운트 + 공지 배너 */
(function () {
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfFj58_INgDLNWg3QXkeMvQlDwrudnhUXZ5rIweSZOkS2Oc3MK8_3HTWy5N9sij5Aj/exec";
  var script = document.currentScript;
  var site = (script && script.dataset.site) || "main";

  // 1) 방문자 카운트 (세션당 1회)
  try {
    var key = "tenet_visited_" + site;
    if (!sessionStorage.getItem(key)) {
      fetch(APPS_SCRIPT_URL + "?action=incrementVisitor&site=" + site).catch(function () {});
      sessionStorage.setItem(key, "1");
    }
  } catch (e) {}

  // 배너 테마 프리셋
  var THEMES = {
    general:    { icon: "📢", bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", color: "#fff" },
    event:      { icon: "🎉", bg: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)", color: "#fff" },
    show:       { icon: "🎵", bg: "linear-gradient(135deg, #000000 0%, #434343 50%, #00d4ff 100%)", color: "#fff" },
    maintenance:{ icon: "🔧", bg: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", color: "#1a1a1a" },
    holiday:    { icon: "🏖️", bg: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)", color: "#fff" },
    open:       { icon: "✨", bg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", color: "#fff" }
  };

  // 2) 공지 배너
  fetch(APPS_SCRIPT_URL + "?action=getBanner")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.enabled || !data.text) return;
      var msg = data.text, themeKey = "general";
      try {
        var parsed = JSON.parse(data.text);
        if (parsed && parsed.msg) { msg = parsed.msg; themeKey = parsed.style || "general"; }
      } catch (e) {}
      var theme = THEMES[themeKey] || THEMES.general;

      var bar = document.createElement("div");
      bar.id = "tenet-banner";
      bar.style.cssText = [
        "position:fixed", "top:0", "left:0", "right:0",
        "background:" + theme.bg,
        "color:" + theme.color,
        "padding:14px 20px",
        "font-size:14px",
        "font-weight:500",
        "letter-spacing:0.01em",
        "z-index:9999",
        "font-family:-apple-system,BlinkMacSystemFont,'Pretendard','Apple SD Gothic Neo',sans-serif",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "gap:12px",
        "box-shadow:0 2px 12px rgba(0,0,0,0.25)",
        "backdrop-filter:blur(8px)",
        "animation:tenetBannerSlide 0.5s ease-out"
      ].join(";");

      var iconSpan = document.createElement("span");
      iconSpan.textContent = theme.icon;
      iconSpan.style.cssText = "font-size:18px;line-height:1;";

      var msgSpan = document.createElement("span");
      msgSpan.textContent = msg;
      msgSpan.style.cssText = "line-height:1.4;text-align:center;";

      bar.appendChild(iconSpan);
      bar.appendChild(msgSpan);

      // 닫기 버튼
      var closeBtn = document.createElement("button");
      closeBtn.textContent = "×";
      closeBtn.setAttribute("aria-label", "닫기");
      closeBtn.style.cssText = [
        "position:absolute", "right:14px", "top:50%", "transform:translateY(-50%)",
        "background:transparent", "border:none", "color:" + theme.color,
        "font-size:22px", "cursor:pointer", "opacity:0.7", "padding:4px 10px", "line-height:1"
      ].join(";");
      closeBtn.addEventListener("click", function () {
        bar.style.display = "none";
        document.body.style.paddingTop = "0";
      });
      bar.appendChild(closeBtn);

      // 키프레임 주입
      var styleEl = document.createElement("style");
      styleEl.textContent = "@keyframes tenetBannerSlide{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}";
      document.head.appendChild(styleEl);

      document.body.style.paddingTop = "52px";
      document.body.appendChild(bar);
    })
    .catch(function () {});
})();
