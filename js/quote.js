(function () {
  var SPACES = [
    { id: "garage", name: "Garage", blurb: "Boxes, bikes, tools", kind: "bays" },
    { id: "storage", name: "Storage unit or attic", blurb: "Closets, old furniture", kind: "bays" },
    { id: "rooms", name: "Rooms or whole house", blurb: "Moving, estates", kind: "rooms" },
    { id: "yard", name: "Yard or outside", blurb: "Brush, lumber, debris", kind: "yard" },
    { id: "few", name: "Just a few items", blurb: "Couch, fridge, recliner", kind: "few" }
  ];

  /* Example prices for the concept calculator only.
     Anchors from the brief: garage one bay full $365, yard pile $180, disposal $80,
     and the published ranges on the home page. */
  var FULLNESS = {
    bays: [
      { id: "few", name: "A few things", mobile: "A few items from $129", price: 129, time: "20–40 min", bay1: 22, bay2: 0 },
      { id: "corner", name: "One corner", mobile: "A corner $225–295", price: 260, time: "30–50 min", bay1: 40, bay2: 0 },
      { id: "one", name: "One bay full", mobile: "About half $375–475", price: 365, time: "45–75 min", bay1: 100, bay2: 0 },
      { id: "half", name: "A bay and a half", mobile: "Most of it $525–625", price: 575, time: "1–2 hours", bay1: 100, bay2: 50 },
      { id: "both", name: "Both bays packed", mobile: "Wall to wall $650–795", price: 722, time: "2–3 hours", bay1: 100, bay2: 100 }
    ],
    rooms: [
      { id: "few", name: "A few items", mobile: "A few items from $129", price: 129, time: "20–40 min", bay1: 20, bay2: 0 },
      { id: "room", name: "A room of furniture", mobile: "A room $245–395", price: 320, time: "45–75 min", bay1: 70, bay2: 0 },
      { id: "several", name: "A few rooms", mobile: "A few rooms $375–475", price: 445, time: "1–2 hours", bay1: 100, bay2: 40 },
      { id: "most", name: "Most of the house", mobile: "Most of it $525–625", price: 575, time: "2–3 hours", bay1: 100, bay2: 80 },
      { id: "whole", name: "Whole-house cleanout", mobile: "Whole house — let's talk", price: 0, time: "Half a day or more", bay1: 100, bay2: 100, talk: true }
    ],
    yard: [
      { id: "small", name: "A small pile", mobile: "A few items from $129", price: 129, time: "20–40 min", bay1: 25, bay2: 0 },
      { id: "pile", name: "A yard pile", mobile: "A typical yard pile $180", price: 180, time: "30–50 min", bay1: 55, bay2: 0 },
      { id: "large", name: "A large pile", mobile: "A large pile $225–295", price: 260, time: "45–75 min", bay1: 90, bay2: 20 },
      { id: "storm", name: "Storm cleanup", mobile: "Most of it $375–475", price: 425, time: "1–2 hours", bay1: 100, bay2: 60 },
      { id: "property", name: "The whole yard", mobile: "Wall to wall $650–795", price: 722, time: "2–3 hours", bay1: 100, bay2: 100 }
    ],
    few: [
      { id: "few", name: "Just a few items", mobile: "A few items from $129", price: 129, time: "20–40 min", bay1: 20, bay2: 0 }
    ]
  };

  var DISPOSAL = 80;
  var COUNTERS = [
    { id: "mattress", name: "Mattress / box spring", fee: 30, suffix: "each" },
    { id: "fridge", name: "Fridge / freezer / AC", fee: 50, suffix: "each" },
    { id: "tires", name: "Tires", fee: 20, suffix: "each" },
    { id: "tvs", name: "TVs / monitors", fee: 20, suffix: "each" }
  ];
  var HEAVY = [
    { id: "stairs", name: "Stairs, 2+ flights" },
    { id: "sectional", name: "Big sectional" },
    { id: "treadmill", name: "Treadmill" },
    { id: "tub", name: "Cast-iron tub" }
  ];
  var CUSTOM = [
    { id: "concrete", name: "Concrete or dirt" },
    { id: "piano", name: "Piano" },
    { id: "safe", name: "Gun safe" },
    { id: "hottub", name: "Hot tub" },
    { id: "pool", name: "Pool table" },
    { id: "shed", name: "Shed teardown" }
  ];

  var state = {
    space: null,
    fullness: null,
    counts: {},
    heavy: {},
    custom: {}
  };

  var spacesEl = document.getElementById("spaces");
  var fullnessEl = document.getElementById("fullness");
  var hintEl = document.getElementById("full-hint");
  var bayVisual = document.getElementById("bay-visual");
  if (!spacesEl) return;

  function money(n) {
    return "$" + Math.round(n);
  }

  function currentSpace() {
    return SPACES.find(function (s) { return s.id === state.space; });
  }

  function fullnessOptions() {
    var space = currentSpace();
    return FULLNESS[space ? space.kind : "bays"] || FULLNESS.bays;
  }

  function currentFull() {
    return fullnessOptions().find(function (f) { return f.id === state.fullness; }) || null;
  }

  function renderChoices(el, items, selected, onPick, labelFn, subFn) {
    el.innerHTML = "";
    items.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice" + (selected === item.id ? " is-on" : "");
      btn.setAttribute("aria-pressed", selected === item.id ? "true" : "false");
      var strong = document.createElement("strong");
      strong.textContent = labelFn(item);
      var span = document.createElement("span");
      span.textContent = subFn(item);
      btn.appendChild(strong);
      btn.appendChild(span);
      btn.addEventListener("click", function () { onPick(item.id); });
      el.appendChild(btn);
    });
  }

  function renderSpaces() {
    renderChoices(spacesEl, SPACES, state.space, function (id) {
      state.space = id;
      var space = currentSpace();
      var opts = fullnessOptions();
      if (space && space.kind === "few") state.fullness = opts[0].id;
      else if (!opts.some(function (o) { return o.id === state.fullness; })) state.fullness = null;
      render();
    }, function (s) { return s.name; }, function (s) { return s.blurb; });
  }

  function renderFullness() {
    var space = currentSpace();
    var opts = fullnessOptions();
    var isBay = space && space.kind === "bays";
    var isYard = space && space.kind === "yard";
    hintEl.textContent = isBay
      ? "Think in bays. A one-car garage is one bay."
      : isYard
        ? "Think about the size of the pile, from a small heap to the whole yard."
        : space && space.kind === "few"
          ? "A short list of items starts at the example rate for a few items."
          : "Tell us how much of the house needs to go.";
    bayVisual.hidden = !(space && (space.kind === "bays" || space.kind === "rooms" || space.kind === "yard"));
    if (space && space.kind === "bays") {
      bayVisual.querySelector("p").textContent = "Think in bays. A one-car garage is one bay.";
    } else if (space && space.kind === "yard") {
      bayVisual.querySelector("p").textContent = "A visual stand-in for pile size — not a measured load.";
    } else {
      bayVisual.querySelector("p").textContent = "A visual stand-in for how full the job is.";
    }
    var full = currentFull();
    var b1 = document.querySelector("#bay1 .fill");
    var b2 = document.querySelector("#bay2 .fill");
    if (b1 && b2) {
      b1.style.height = (full ? full.bay1 : 0) + "%";
      b2.style.height = (full ? full.bay2 : 0) + "%";
    }
    var b1l = document.querySelector("#bay1 .lbl");
    var b2l = document.querySelector("#bay2 .lbl");
    if (isBay) {
      if (b1l) b1l.textContent = "Bay 1";
      if (b2l) b2l.textContent = "Bay 2";
    } else {
      if (b1l) b1l.textContent = "Load";
      if (b2l) b2l.textContent = "Extra";
    }
    renderChoices(fullnessEl, opts, state.fullness, function (id) {
      state.fullness = id;
      render();
    }, function (f) { return f.name; }, function (f) { return f.mobile; });
  }

  function renderCounters() {
    var box = document.getElementById("counters");
    box.innerHTML = "";
    COUNTERS.forEach(function (item) {
      if (state.counts[item.id] == null) state.counts[item.id] = 0;
      var row = document.createElement("div");
      row.className = "counter-row";
      row.innerHTML = "<div><strong>" + item.name + "</strong><div class='help'>Example +" + money(item.fee) + " " + item.suffix + "</div></div>";
      var ctr = document.createElement("div");
      ctr.className = "counter";
      var minus = document.createElement("button");
      minus.type = "button";
      minus.setAttribute("aria-label", "Remove one " + item.name);
      minus.textContent = "–";
      var out = document.createElement("output");
      out.textContent = String(state.counts[item.id]);
      var plus = document.createElement("button");
      plus.type = "button";
      plus.setAttribute("aria-label", "Add one " + item.name);
      plus.textContent = "+";
      minus.addEventListener("click", function () {
        state.counts[item.id] = Math.max(0, (state.counts[item.id] || 0) - 1);
        render();
      });
      plus.addEventListener("click", function () {
        state.counts[item.id] = Math.min(20, (state.counts[item.id] || 0) + 1);
        render();
      });
      ctr.appendChild(minus);
      ctr.appendChild(out);
      ctr.appendChild(plus);
      row.appendChild(ctr);
      box.appendChild(row);
    });
  }

  function renderFlags(elId, items, key) {
    var box = document.getElementById(elId);
    box.innerHTML = "";
    items.forEach(function (item) {
      var on = !!state[key][item.id];
      var row = document.createElement("div");
      row.className = "flag-row";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "toggle";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.innerHTML = "<span class='box'></span><span>" + item.name + "</span>";
      btn.addEventListener("click", function () {
        state[key][item.id] = !state[key][item.id];
        render();
      });
      row.appendChild(btn);
      box.appendChild(row);
    });
  }

  function renderSidebar() {
    var lines = document.getElementById("quote-lines");
    var totalEl = document.getElementById("quote-total");
    var timeEl = document.getElementById("quote-time");
    var customEl = document.getElementById("quote-custom");
    var bookLink = document.getElementById("book-link");
    var space = currentSpace();
    var full = currentFull();
    var html = "";
    var total = 0;
    var talk = !!(full && full.talk);
    var customOn = CUSTOM.some(function (c) { return state.custom[c.id]; });
    var heavyOn = HEAVY.filter(function (h) { return state.heavy[h.id]; });

    if (space && full) {
      html += line(space.name + " · " + full.name, full.talk ? "Let's talk" : money(full.price));
      if (!full.talk) total += full.price;
      html += line("Disposal fees (example)", money(DISPOSAL));
      total += DISPOSAL;
    } else {
      html += line("Choose a space and how full it is", "—");
    }

    COUNTERS.forEach(function (item) {
      var n = state.counts[item.id] || 0;
      if (!n) return;
      var fee = n * item.fee;
      total += fee;
      html += line(n + " × " + item.name, money(fee));
    });

    if (heavyOn.length) {
      html += line("Heavy / awkward: " + heavyOn.map(function (h) { return h.name; }).join(", "), "On site");
    }
    if (customOn) {
      var names = CUSTOM.filter(function (c) { return state.custom[c.id]; }).map(function (c) { return c.name; });
      html += line("Custom: " + names.join(", "), "We'll call");
    }

    lines.innerHTML = html || "<div class='quote-line'><span>Your selections will show up here.</span></div>";
    if (talk) {
      totalEl.textContent = "Let's talk";
    } else if (customOn && space && full) {
      totalEl.textContent = "from " + money(total);
    } else if (space && full) {
      totalEl.textContent = money(total);
    } else {
      totalEl.textContent = "—";
    }
    timeEl.textContent = "Time on site · " + (full ? full.time : "—");
    customEl.hidden = !(customOn || talk);
    if (customOn || talk) {
      customEl.hidden = false;
      customEl.textContent = "Some items need a custom price — we'll call you.";
    }
    var params = new URLSearchParams();
    if (space) params.set("job", space.id);
    bookLink.href = "book.html" + (params.toString() ? "?" + params.toString() : "");
  }

  function line(label, value) {
    return "<div class='quote-line'><span>" + escapeHtml(label) + "</span><span>" + escapeHtml(value) + "</span></div>";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function render() {
    renderSpaces();
    renderFullness();
    renderCounters();
    renderFlags("heavy", HEAVY, "heavy");
    renderFlags("custom", CUSTOM, "custom");
    renderSidebar();
  }

  render();
})();
