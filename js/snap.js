(function () {
  var drop = document.getElementById("drop");
  var input = document.getElementById("files");
  var previews = document.getElementById("previews");
  var form = document.getElementById("snap-form");
  var fileErr = document.getElementById("file-err");
  var formErr = document.getElementById("form-err");
  var done = document.getElementById("snap-done");
  if (!form || !drop) return;

  var files = [];
  var MAX = 6;

  function showErr(el, msg) {
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || "";
  }

  function render() {
    previews.innerHTML = "";
    files.forEach(function (file, i) {
      var wrap = document.createElement("div");
      wrap.className = "thumb";
      var img = document.createElement("img");
      img.alt = "Preview " + (i + 1);
      img.src = URL.createObjectURL(file);
      img.onload = function () { URL.revokeObjectURL(img.src); };
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Remove photo " + (i + 1));
      btn.textContent = "×";
      btn.addEventListener("click", function () {
        files.splice(i, 1);
        render();
      });
      wrap.appendChild(img);
      wrap.appendChild(btn);
      previews.appendChild(wrap);
    });
  }

  function addFiles(list) {
    showErr(fileErr, "");
    Array.prototype.forEach.call(list, function (file) {
      if (files.length >= MAX) return;
      if (!file.type || file.type.indexOf("image/") !== 0) {
        showErr(fileErr, "Please add photos only.");
        return;
      }
      files.push(file);
    });
    if (list.length && files.length >= MAX) {
      showErr(fileErr, files.length > MAX ? "You can send up to 6 photos." : "");
      files = files.slice(0, MAX);
    }
    render();
  }

  drop.addEventListener("click", function () { input.click(); });
  drop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  });
  input.addEventListener("change", function () {
    addFiles(input.files);
    input.value = "";
  });
  drop.addEventListener("dragover", function (e) {
    e.preventDefault();
    drop.classList.add("is-over");
  });
  drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
  drop.addEventListener("drop", function (e) {
    e.preventDefault();
    drop.classList.remove("is-over");
    addFiles(e.dataTransfer.files);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showErr(formErr, "");
    if (!files.length) {
      showErr(formErr, "Please add at least one photo of the items to haul.");
      return;
    }
    var first = document.getElementById("first").value.trim();
    var mobile = document.getElementById("mobile").value.trim();
    if (!first || !mobile) {
      showErr(formErr, "Please add your first name and mobile number.");
      return;
    }
    form.hidden = true;
    done.hidden = false;
  });
})();
