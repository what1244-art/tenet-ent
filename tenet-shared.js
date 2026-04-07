/* 메인/밴드클럽 페이지 공용: 방문자 카운트 + 공지 배너
   <body> 안에 <script src="tenet-shared.js" data-site="main|bandclub"></script> 로 삽입 */
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

  // 2) 공지 배너
  fetch(APPS_SCRIPT_URL + "?action=getBanner")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.enabled || !data.text) return;
      var bar = document.createElement("div");
      bar.id = "tenet-banner";
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;background:#000;color:#fff;text-align:center;padding:10px 16px;font-size:13px;z-index:9999;font-family:-apple-system,sans-serif;";
      bar.textContent = data.text;
      document.body.style.paddingTop = "40px";
      document.body.appendChild(bar);
    })
    .catch(function () {});
})();
