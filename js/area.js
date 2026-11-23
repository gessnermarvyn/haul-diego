(function () {
  var form = document.getElementById("zip-form");
  var input = document.getElementById("zip");
  var result = document.getElementById("zip-result");
  if (!form || !input || !result || typeof lookupZip !== "function") return;

  function show(zip) {
    var found = lookupZip(zip);
    result.classList.remove("is-yes", "is-no");
    if (found.reason === "invalid") {
      result.classList.add("is-no");
      result.textContent = "Enter a 5-digit ZIP code.";
      return;
    }
    if (found.ok) {
      result.classList.add("is-yes");
      result.textContent = "Yes, we cover " + found.name + ". Most weeks we can be there within a few days.";
    } else {
      result.classList.add("is-no");
      result.textContent = "Sorry, we don't currently serve " + found.zip + ". We cover San Diego County — try a ZIP like 92109 or 91910.";
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    show(input.value);
  });

  document.querySelectorAll("[data-zip]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      input.value = btn.getAttribute("data-zip");
      show(input.value);
    });
  });
})();
