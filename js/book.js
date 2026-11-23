(function () {
  var JOBS = [
    { id: "garage", name: "Garage cleanout" },
    { id: "house", name: "House cleanout" },
    { id: "furniture", name: "Furniture" },
    { id: "mattress", name: "Mattress" },
    { id: "appliances", name: "Appliances" },
    { id: "yard", name: "Yard debris" },
    { id: "reno", name: "Renovation debris" },
    { id: "other", name: "Something else" }
  ];
  var WINDOWS = ["7–9 am", "9–11 am", "11 am–1 pm", "1–3 pm", "3–5 pm", "5–7 pm"];
  var TITLES = [
    "What needs to go?",
    "Where should we come?",
    "When should we come?",
    "How can we reach you?"
  ];
  var LEADS = [
    "Step 1 of 4. Choose the job type, then we'll check your ZIP.",
    "Step 2 of 4. Enter the pickup ZIP so we can confirm we serve your area.",
    "Step 3 of 4. Pick a day and a two-hour window. We run Monday through Saturday.",
    "Step 4 of 4. Leave your details and we'll show a demo confirmation."
  ];

  var state = { step: 1, job: null, zip: "", zipOk: false, zipName: "", day: null, window: null };
  var params = new URLSearchParams(location.search);
  var jobMap = { rooms: "house", storage: "garage", few: "other" };
  if (params.get("job")) state.job = jobMap[params.get("job")] || params.get("job");

  var jobBox = document.getElementById("job-types");
  var form = document.getElementById("book-form");
  var nextBtn = document.getElementById("next-btn");
  var backBtn = document.getElementById("back-btn");
  if (!form || !jobBox) return;

  function renderJobs() {
    jobBox.innerHTML = "";
    JOBS.forEach(function (job) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice" + (state.job === job.id ? " is-on" : "");
      btn.setAttribute("aria-pressed", state.job === job.id ? "true" : "false");
      btn.innerHTML = "<strong>" + job.name + "</strong>";
      btn.addEventListener("click", function () {
        state.job = job.id;
        renderJobs();
      });
      jobBox.appendChild(btn);
    });
  }

  function upcomingDays(count) {
    var out = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (out.length < count) {
      if (d.getDay() !== 0) {
        out.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  var days = upcomingDays(12);
  var daysEl = document.getElementById("days");
  var windowsEl = document.getElementById("windows");
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function renderDays() {
    daysEl.innerHTML = "";
    days.forEach(function (d, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day" + (state.day === i ? " is-on" : "");
      btn.innerHTML = "<small>" + dayNames[d.getDay()] + "</small><strong>" + d.getDate() + "</strong><small>" + monthNames[d.getMonth()] + "</small>";
      btn.addEventListener("click", function () {
        state.day = i;
        renderDays();
      });
      daysEl.appendChild(btn);
    });
  }

  function renderWindows() {
    windowsEl.innerHTML = "";
    WINDOWS.forEach(function (w) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "window" + (state.window === w ? " is-on" : "");
      btn.textContent = w;
      btn.addEventListener("click", function () {
        state.window = w;
        renderWindows();
      });
      windowsEl.appendChild(btn);
    });
  }

  function setStep(n) {
    state.step = n;
    document.querySelectorAll("#book-form [data-step]").forEach(function (el) {
      el.hidden = Number(el.getAttribute("data-step")) !== n;
    });
    document.getElementById("step-title").textContent = TITLES[n - 1];
    document.getElementById("step-lead").textContent = LEADS[n - 1];
    document.querySelectorAll("#progress span").forEach(function (el, i) {
      el.classList.toggle("is-on", i < n);
    });
    backBtn.hidden = n === 1;
    nextBtn.textContent = n === 4 ? "Send request" : "Continue";
  }

  function jobName() {
    var j = JOBS.find(function (x) { return x.id === state.job; });
    return j ? j.name : "";
  }

  function checkZip() {
    var input = document.getElementById("zip");
    var ok = document.getElementById("zip-ok");
    var err = document.getElementById("zip-err");
    var found = lookupZip(input.value);
    ok.hidden = true;
    err.hidden = true;
    state.zipOk = false;
    if (found.reason === "invalid") {
      err.hidden = false;
      err.textContent = "Enter a 5-digit ZIP code.";
      return false;
    }
    if (!found.ok) {
      err.hidden = false;
      err.textContent = "Sorry, we don't currently serve " + found.zip + ". We cover San Diego County.";
      return false;
    }
    state.zipOk = true;
    state.zip = found.zip;
    state.zipName = found.name;
    ok.hidden = false;
    ok.textContent = "Great, we serve your area. " + found.name + " is in our coverage zone.";
    return true;
  }

  document.getElementById("check-zip").addEventListener("click", checkZip);
  document.getElementById("zip").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      checkZip();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (state.step === 1) {
      if (!state.job) return alert("Please choose what needs to go.");
      setStep(2);
      return;
    }
    if (state.step === 2) {
      if (!checkZip()) return;
      setStep(3);
      return;
    }
    if (state.step === 3) {
      if (state.day == null || !state.window) return alert("Please pick a day and a two-hour window.");
      setStep(4);
      return;
    }
    var name = document.getElementById("name").value.trim();
    var phone = document.getElementById("phone").value.trim();
    if (!name || !phone) return alert("Please add your name and mobile number.");
    form.hidden = true;
    document.querySelector(".page-hero .book-shell").hidden = true;
    var confirm = document.getElementById("confirm");
    confirm.hidden = false;
    var d = days[state.day];
    var when = dayNames[d.getDay()] + ", " + monthNames[d.getMonth()] + " " + d.getDate() + " · " + state.window;
    document.getElementById("confirm-summary").textContent =
      jobName() + " in " + state.zipName + " (" + state.zip + ") · " + when + " · " + name + " · " + phone;
  });

  backBtn.addEventListener("click", function () {
    if (state.step > 1) setStep(state.step - 1);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    nextBtn.click();
  });

  renderJobs();
  renderDays();
  renderWindows();
  setStep(1);
})();
