// Flow Wirer — nối prototype flow từ JSON { start, links }
figma.showUI(__html__, { width: 420, height: 520 });

function post(type, payload) {
  figma.ui.postMessage(Object.assign({ type: type }, payload));
}

function buildTransition(kind) {
  if (kind === "NONE") return null;
  return { type: kind, easing: { type: "EASE_OUT" }, duration: 0.3 };
}

// Tách "<Frame>/<layer>" theo tên frame thật (tên frame có thể chứa "/")
function splitKey(key, frames) {
  var best = null;
  frames.forEach(function (f) {
    if (key.indexOf(f.name + "/") === 0 && (!best || f.name.length > best.name.length)) best = f;
  });
  if (!best) return null;
  return { frame: best, layerName: key.slice(best.name.length + 1) };
}

async function wire(data, transitionKind) {
  var frames = figma.currentPage.children.filter(function (n) { return n.type === "FRAME"; });
  var byName = {};
  frames.forEach(function (f) { if (!(f.name in byName)) byName[f.name] = f; });
  var ok = 0, fail = 0;

  var links = data.links || {};
  var keys = Object.keys(links);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var dest = links[key];
    try {
      var parts = splitKey(key, frames);
      if (!parts) throw new Error("không tìm thấy frame nguồn trong '" + key + "'");
      var node = parts.frame.findOne(function (n) { return n.name === parts.layerName; });
      if (!node) throw new Error("không tìm thấy layer '" + parts.layerName + "' trong frame '" + parts.frame.name + "'");
      var action;
      if (dest === "BACK") {
        action = { type: "BACK" };
      } else {
        var target = byName[dest];
        if (!target) throw new Error("không tìm thấy frame đích '" + dest + "'");
        action = {
          type: "NODE",
          destinationId: target.id,
          navigation: "NAVIGATE",
          transition: buildTransition(transitionKind),
          preserveScrollPosition: false
        };
      }
      await node.setReactionsAsync([{ trigger: { type: "ON_CLICK" }, actions: [action] }]);
      ok++;
      post("log", { ok: true, text: key + " → " + dest });
    } catch (e) {
      fail++;
      post("log", { ok: false, text: key + " → " + dest + " : " + (e && e.message ? e.message : e) });
    }
  }

  if (data.start) {
    try {
      var startFrame = byName[data.start];
      if (!startFrame) throw new Error("không tìm thấy frame start '" + data.start + "'");
      var points = [{ nodeId: startFrame.id, name: "Flow 1" }];
      if (typeof figma.currentPage.setFlowStartingPointsAsync === "function") {
        await figma.currentPage.setFlowStartingPointsAsync(points);
      } else {
        figma.currentPage.flowStartingPoints = points;
      }
      post("log", { ok: true, text: "Flow starting point: " + data.start });
    } catch (e) {
      fail++;
      post("log", { ok: false, text: "start '" + data.start + "' : " + (e && e.message ? e.message : e) });
    }
  }

  post("done", { ok: ok, fail: fail });
  figma.notify("Flow Wirer: " + ok + " link OK, " + fail + " lỗi");
}

figma.ui.onmessage = async function (msg) {
  if (msg.type !== "wire") return;
  var data;
  try {
    data = JSON.parse(msg.json);
  } catch (e) {
    post("log", { ok: false, text: "JSON không hợp lệ: " + e.message });
    post("done", { ok: 0, fail: 1 });
    return;
  }
  try {
    await wire(data, msg.transition);
  } catch (e) {
    post("log", { ok: false, text: "Lỗi không mong đợi: " + (e && e.message ? e.message : e) });
    post("done", { ok: 0, fail: 1 });
  }
};
