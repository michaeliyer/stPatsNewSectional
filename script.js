// Retrieve sections from localStorage or initialize
let sections = JSON.parse(localStorage.getItem("allSectionsLocal")) || {};

// References
const container = document.getElementById("sectionsContainer");
let selectedSection = null;

// Render all sections on page load
document.addEventListener("DOMContentLoaded", function () {
  renderSections();
  populateFontDropdown();
});

// // Render sections

function renderSections() {
  container.innerHTML = "";

  Object.keys(sections).forEach((sectionName) => {
    const sectionData = sections[sectionName];

    const section = document.createElement("div");
    section.className = "section";
    section.id = `section-${sectionName.replace(/\s+/g, "")}`;

    // Apply saved styles
    section.style.fontFamily = sectionData.fontFamily || "Arial";
    section.style.fontSize = sectionData.fontSize
      ? `${sectionData.fontSize}px`
      : "16px";
    section.style.color = sectionData.color || "#000000";
    section.style.backgroundColor = sectionData.backgroundColor || "#ffffff";

    section.style.display = "none"; // 🟢 Start hidden by default

    const title = document.createElement("span");
    title.className = "section-title";
    title.textContent = sectionName;
    title.addEventListener("click", () => editSectionName(sectionName));

    // 🟢 Hamburger Menu
    const menuBtn = document.createElement("button");
    menuBtn.textContent = "☰";
    menuBtn.className = "menu-btn";

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-menu";

    // ✔️ Check All
    const checkAllBtn = document.createElement("button");
    checkAllBtn.textContent = "✔️ Check All";
    checkAllBtn.addEventListener("click", () => checkAllTasks(sectionName));
    dropdown.appendChild(checkAllBtn);

    // ❌ Uncheck All
    const uncheckAllBtn = document.createElement("button");
    uncheckAllBtn.textContent = "❌ Uncheck All";
    uncheckAllBtn.addEventListener("click", () => uncheckAllTasks(sectionName));
    dropdown.appendChild(uncheckAllBtn);

    // 🎯 Completed Style Button
    const completedStyleBtn = document.createElement("button");
    completedStyleBtn.textContent = "🎯 Completed Style";
    completedStyleBtn.addEventListener("click", () =>
      openCompletedStyleModal(sectionName)
    );
    dropdown.appendChild(completedStyleBtn);

    // 🎨 Style Button
    const styleBtn = document.createElement("button");
    styleBtn.textContent = "🎨 Style";
    styleBtn.addEventListener("click", () => openStyleModal(sectionName));

    // 👁 Hide/Show Button
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = sectionData.hidden ? "👁 Show" : "👁 Hide";

    toggleBtn.className = "toggle-visibility-btn"; // 🟢 Add class

    toggleBtn.addEventListener("click", () =>
      toggleContent(section, toggleBtn)
    );
    // toggleBtn.addEventListener("click", () => toggleContent(section));

    // 🗑 Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑 Delete";
    deleteBtn.addEventListener("click", () => deleteSection(sectionName));

    // ➕ Add Task Button
    const showInputBtn = document.createElement("button");
    showInputBtn.textContent = "➕ Add Task";

    // 📤 Export Section Button
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "📤 Export Section";
    exportBtn.addEventListener("click", () => exportSection(sectionName));

    // 📥 Import Section Button
    const importBtn = document.createElement("button");
    importBtn.textContent = "📥 Import Section";
    importBtn.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
      fileInput.addEventListener("change", importSection);
      fileInput.click();
    });

    // Section Content
    const content = document.createElement("div");
    content.className = "section-content";

    const list = document.createElement("ul");
    list.id = `${sectionName.replace(/\s+/g, "")}List`;

    // Hidden Input + Add Button Container
    const inputContainer = document.createElement("div");
    inputContainer.style.display = "none";
    inputContainer.style.flexDirection = "column";
    inputContainer.style.marginTop = "0.5rem";
    inputContainer.className = "task-input-container";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Add task...";
    input.id = `${sectionName.replace(/\s+/g, "")}Task`;

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add";
    addBtn.addEventListener("click", () => addTask(sectionName));

    inputContainer.appendChild(input);
    inputContainer.appendChild(addBtn);

    // Toggle input visibility
    showInputBtn.addEventListener("click", () => {
      inputContainer.style.display =
        inputContainer.style.display === "flex" ? "none" : "flex";
    });

    // 🟢 Assemble dropdown
    dropdown.appendChild(styleBtn);
    dropdown.appendChild(toggleBtn);
    dropdown.appendChild(deleteBtn);
    dropdown.appendChild(showInputBtn);
    dropdown.appendChild(exportBtn);
    dropdown.appendChild(importBtn);

    // Toggle dropdown visibility
    menuBtn.addEventListener("click", () => {
      dropdown.style.display =
        dropdown.style.display === "flex" ? "none" : "flex";
    });

    content.appendChild(list);
    content.appendChild(inputContainer);

    // Apply hide state
    if (sectionData.hidden) {
      content.style.display = "none";
    }

    section.appendChild(title);
    section.appendChild(menuBtn);
    section.appendChild(dropdown);
    section.appendChild(content);

    container.appendChild(section);

    renderTasks(sectionName);
  });

  saveSections();
}

// Save sections
function saveSections() {
  localStorage.setItem("allSectionsLocal", JSON.stringify(sections));
}

// Add section
function addSection() {
  const sectionInput = document.getElementById("newSection");
  const sectionName = sectionInput.value.trim();

  if (sectionName === "" || sections[sectionName]) {
    alert("Section name invalid or already exists.");
    return;
  }

  sections[sectionName] = {
    tasks: [],
    fontFamily: "Arial",
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#ffffff",
  };

  sectionInput.value = "";
  renderSections();
}

// Edit section name
function editSectionName(oldName) {
  const newName = prompt("Enter new name:", oldName);
  if (newName && newName.trim() !== "" && newName !== oldName) {
    if (sections[newName]) {
      alert("Section name already exists.");
      return;
    }
    sections[newName] = { ...sections[oldName] };
    delete sections[oldName];
    renderSections();
  }
}

// Delete section
function deleteSection(sectionName) {
  if (
    !confirm(
      `❌ Are you sure you want to delete the entire "${sectionName}" section?`
    )
  )
    return;
  if (
    !confirm(
      "🔥 Final warning: This section and all its tasks will be permanently deleted!"
    )
  )
    return;
  if (!confirm("🔥 Fine: This section is history!")) return;

  delete sections[sectionName];
  renderSections();
}

// Toggle
function toggleContent(section, toggleBtn) {
  const sectionName = section.querySelector(".section-title").textContent;
  const content = section.querySelector(".section-content");

  if (sections[sectionName].hidden) {
    content.style.display = "block";
    toggleBtn.textContent = "👁 Hide";
    sections[sectionName].hidden = false;
  } else {
    content.style.display = "none";
    toggleBtn.textContent = "👁 Show";
    sections[sectionName].hidden = true;
  }

  saveSections();
}

// Add task
function addTask(sectionName) {
  const taskInput = document.getElementById(
    `${sectionName.replace(/\s+/g, "")}Task`
  );
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Task cannot be empty.");
    return;
  }

  sections[sectionName].tasks.push({
    text: taskText,
    checked: false,
  });

  taskInput.value = "";
  renderTasks(sectionName);
}

// Render tasks
function renderTasks(sectionName) {
  const list = document.getElementById(
    `${sectionName.replace(/\s+/g, "")}List`
  );
  list.innerHTML = "";

  const bgColor = sections[sectionName].backgroundColor || "#ffffff";
  const completedStyle =
    JSON.parse(localStorage.getItem(`completedStyle-${sectionName}`)) || {};

  sections[sectionName].tasks.forEach((taskObj, index) => {
    const listItem = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = taskObj.checked;
    checkbox.id = `${sectionName.replace(/\s+/g, "")}Task${index}`;

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;

    if (
      taskObj.text.startsWith("http://") ||
      taskObj.text.startsWith("https://")
    ) {
      const link = document.createElement("a");
      link.href = taskObj.text;
      link.textContent = taskObj.text;
      link.target = "_blank";
      link.style.color = "#ffeb3b";
      label.appendChild(link);
    } else {
      label.textContent = taskObj.text;
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.addEventListener("click", () => {
      deleteTask(sectionName, index);
    });

    // Match section background
    listItem.style.backgroundColor = bgColor;

    // ✅ Apply completed styling if checked
    if (taskObj.checked) {
      listItem.classList.add("completed");
      if (completedStyle) {
        label.style.fontFamily = completedStyle.fontFamily;
        label.style.fontSize = `${completedStyle.fontSize}px`;
        label.style.color = completedStyle.textColor;
        listItem.style.backgroundColor = completedStyle.bgColor;
      }
    }

    // 🧠 Add or remove styling on toggle
    checkbox.addEventListener("change", () => {
      sections[sectionName].tasks[index].checked = checkbox.checked;

      if (checkbox.checked) {
        listItem.classList.add("completed");
        if (completedStyle) {
          label.style.fontFamily = completedStyle.fontFamily;
          label.style.fontSize = `${completedStyle.fontSize}px`;
          label.style.color = completedStyle.textColor;
          listItem.style.backgroundColor = completedStyle.bgColor;
        }
      } else {
        listItem.classList.remove("completed");
        label.removeAttribute("style"); // Reset label styles
        listItem.style.backgroundColor = bgColor; // Reapply section bg
      }

      saveSections();
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    listItem.appendChild(deleteBtn);
    list.appendChild(listItem);
  });

  saveSections();
}

// Delete task
function deleteTask(sectionName, taskIndex) {
  if (!confirm("⚠️ Are you sure you want to delete this task?")) return;
  if (!confirm("🔥 Final warning: This task will disappear forever!")) return;

  sections[sectionName].tasks.splice(taskIndex, 1);
  renderTasks(sectionName);
}

// Open style modal
function openStyleModal(sectionName) {
  selectedSection = sectionName;
  const sectionData = sections[sectionName];

  document.getElementById("fontSelect").value =
    sectionData.fontFamily || "Arial";
  document.getElementById("fontSize").value = sectionData.fontSize || 16;
  document.getElementById("textColor").value = sectionData.color || "#000000";
  document.getElementById("bgColor").value =
    sectionData.backgroundColor || "#ffffff";

  document.getElementById("styleModal").style.display = "block";
}

// Apply style
function applyStyle() {
  if (!selectedSection) return;

  const font = document.getElementById("fontSelect").value;
  const size = parseInt(document.getElementById("fontSize").value);
  const color = document.getElementById("textColor").value;
  const bg = document.getElementById("bgColor").value;

  sections[selectedSection].fontFamily = font;
  sections[selectedSection].fontSize = size;
  sections[selectedSection].color = color;
  sections[selectedSection].backgroundColor = bg;

  saveSections();
  renderSections();
  closeStyleModal();
}

// Close modal
function closeStyleModal() {
  document.getElementById("styleModal").style.display = "none";
  selectedSection = null;
}

// Export
function exportData() {
  const fileName = prompt("Save entire checklist as:", "sections.json");
  if (!fileName) return;

  const dataStr = JSON.stringify(sections, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  a.download = fileName.endsWith(".json") ? fileName : fileName + ".json";
  // a.download = "sections.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      sections = JSON.parse(e.target.result);
      saveSections();
      renderSections();
    } catch (err) {
      alert("Import failed.");
    }
  };
  reader.readAsText(file);
}

function exportSection(sectionName) {
  const sectionData = sections[sectionName];
  const fileName = prompt(`Save "${sectionName}" as:`, `${sectionName}.json`);
  if (!fileName) return;

  const dataStr = JSON.stringify({ [sectionName]: sectionData }, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".json") ? fileName : fileName + ".json";
  a.click();

  URL.revokeObjectURL(url);
}

function importSection(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      const importedSectionName = Object.keys(importedData)[0];

      if (sections[importedSectionName]) {
        if (!confirm(`"${importedSectionName}" exists. Overwrite?`)) return;
      }

      sections[importedSectionName] = importedData[importedSectionName];
      saveSections();
      renderSections();
      alert(`"${importedSectionName}" imported!`);
    } catch (err) {
      alert("Import failed.");
    }
  };
  reader.readAsText(file);
}

function checkAllTasks(sectionName) {
  sections[sectionName].tasks.forEach((task) => {
    task.checked = true;
  });

  saveSections();
  renderTasks(sectionName);
}

function uncheckAllTasks(sectionName) {
  sections[sectionName].tasks.forEach((task) => {
    task.checked = false;
  });

  saveSections();
  renderTasks(sectionName);
}

let allSectionsHidden = true; // 🟢 Default hidden

function toggleAllSections() {
  const allSections = document.querySelectorAll(".section");

  allSections.forEach((section) => {
    section.style.display = allSectionsHidden ? "flex" : "none";
  });

  const btn = document.getElementById("toggleAllBtn");
  btn.textContent = allSectionsHidden
    ? "👁 Hide All Sections"
    : "👁 Show All Sections";

  allSectionsHidden = !allSectionsHidden;
}

function toggleHeaderControls() {
  const controls = document.getElementById("controls");
  const btn = document.getElementById("headerToggleBtn");

  controls.classList.toggle("hidden-controls");
  const isHidden = controls.classList.contains("hidden-controls");
  btn.textContent = isHidden ? "➕ Show Controls" : "➖ Hide Controls";
}

// Initialize controls state on page load
document.addEventListener("DOMContentLoaded", () => {
  const controls = document.getElementById("controls");
  const toggleBtn = document.getElementById("headerToggleBtn");

  // Start with controls hidden
  controls.classList.add("hidden-controls");
  toggleBtn.textContent = "➕ Show Controls";
});

// Populate fonts dropdown (from fonts.js)
function populateFontDropdown() {
  const fontSelect = document.getElementById("fontSelect");
  const completedFontSelect = document.getElementById("completedFontFamily");

  // Clear existing options
  fontSelect.innerHTML = "";
  completedFontSelect.innerHTML = "";

  // Add default options
  const defaultOption = document.createElement("option");
  defaultOption.value = "Arial";
  defaultOption.textContent = "Arial";
  fontSelect.appendChild(defaultOption);

  const defaultCompletedOption = document.createElement("option");
  defaultCompletedOption.value = "Arial";
  defaultCompletedOption.textContent = "Arial";
  completedFontSelect.appendChild(defaultCompletedOption);

  // Add all available fonts
  googleFonts.forEach((font) => {
    // For main font select
    const option = document.createElement("option");
    option.value = font;
    option.textContent = font;
    option.style.fontFamily = font;
    fontSelect.appendChild(option);

    // For completed font select
    const completedOption = document.createElement("option");
    completedOption.value = font;
    completedOption.textContent = font;
    completedOption.style.fontFamily = font;
    completedFontSelect.appendChild(completedOption);
  });
}

let currentCompletedSection = null;

function openCompletedStyleModal(sectionName) {
  currentCompletedSection = sectionName;
  const saved =
    JSON.parse(localStorage.getItem(`completedStyle-${sectionName}`)) || {};

  document.getElementById("completedFontFamily").value =
    saved.fontFamily || "Arial";
  document.getElementById("completedFontSize").value = saved.fontSize || 16;
  document.getElementById("completedTextColor").value =
    saved.textColor || "#888888";
  document.getElementById("completedBgColor").value =
    saved.bgColor || "#eeeeee";

  document.getElementById("completedStyleModal").style.display = "block";
}

document.getElementById("applyCompletedStyle").addEventListener("click", () => {
  if (!currentCompletedSection) return;

  const style = {
    fontFamily: document.getElementById("completedFontFamily").value,
    fontSize: parseInt(document.getElementById("completedFontSize").value),
    textColor: document.getElementById("completedTextColor").value,
    bgColor: document.getElementById("completedBgColor").value,
  };

  // Save the style
  localStorage.setItem(
    `completedStyle-${currentCompletedSection}`,
    JSON.stringify(style)
  );

  // Apply the style immediately to completed tasks
  const section = document.getElementById(
    `section-${currentCompletedSection.replace(/\s+/g, "")}`
  );
  if (section) {
    const completedTasks = section.querySelectorAll(".completed");
    completedTasks.forEach((task) => {
      const label = task.querySelector("label");
      if (label) {
        label.style.fontFamily = style.fontFamily;
        label.style.fontSize = `${style.fontSize}px`;
        label.style.color = style.textColor;
      }
      task.style.backgroundColor = style.bgColor;
    });
  }

  // Re-render tasks to ensure all styles are applied
  renderTasks(currentCompletedSection);

  // Hide the modal
  document.getElementById("completedStyleModal").style.display = "none";
});

document.getElementById("closeCompletedStyle").addEventListener("click", () => {
  document.getElementById("completedStyleModal").style.display = "none";
  currentCompletedSection = null;
});

const openBtn = document.getElementById("openBodyStyler");
const modal = document.getElementById("bodyModal");
const closeBtn = document.getElementById("closeBodyStyler");
const applyBtn = document.getElementById("applyBodyStyler");
const bodyBgColor = document.getElementById("bodyBgColor");
const bodyFontColor = document.getElementById("bodyFontColor");

// Toggle modal (open or close)
openBtn.addEventListener("click", () => {
  modal.classList.toggle("hidden");
});

// Close modal from "Close" button
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Apply styling + close modal
applyBtn.addEventListener("click", () => {
  document.body.style.backgroundColor = bodyBgColor.value;
  document.body.style.color = bodyFontColor.value;

  localStorage.setItem(
    "bodyStyle",
    JSON.stringify({
      backgroundColor: bodyBgColor.value,
      color: bodyFontColor.value,
    })
  );

  modal.classList.add("hidden");
});

const notepad = document.getElementById("notepad");
const notepadKey = "notepadContent";

window.addEventListener("DOMContentLoaded", () => {
  const notepad = document.getElementById("notepad");
  const notepadKey = "notepadContent";

  const mainUI = document.getElementById("mainUI");
  const toggleUIBtn = document.getElementById("toggleUIBtn");

  // Function to convert URLs to links
  function convertUrlsToLinks(element) {
    const text = element.innerHTML;
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    const urls = text.match(urlRegex);

    if (urls) {
      let newHtml = text;
      urls.forEach((url) => {
        // Only convert if it's not already a link
        if (!newHtml.includes(`href="${url}"`)) {
          const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s;">${url}</a>`;
          newHtml = newHtml.replace(url, linkHtml);
        }
      });
      element.innerHTML = newHtml;
    }
  }

  // Load saved notepad content and convert links
  const saved = localStorage.getItem(notepadKey);
  if (saved) {
    notepad.innerHTML = saved;
    convertUrlsToLinks(notepad);
  }

  // Handle input events
  notepad.addEventListener("input", () => {
    convertUrlsToLinks(notepad);
    localStorage.setItem(notepadKey, notepad.innerHTML);
  });

  // Handle paste events
  notepad.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, pastedText);

    const cleanedHtml = cleanHtml(notepad.innerHTML);
    notepad.innerHTML = cleanedHtml;
    localStorage.setItem(notepadKey, cleanedHtml);
  });

  // Handle link clicks
  notepad.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      e.preventDefault();
      window.open(e.target.href, "_blank", "noopener,noreferrer");
    }
  });

  // Export notepad content
  window.downloadNotepad = function () {
    const blob = new Blob([JSON.stringify({ content: notepad.innerHTML })], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "notepad.json";
    a.click();
  };

  // Import content
  document.getElementById("notepadImport").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      if (data.content) {
        notepad.innerHTML = data.content;
        localStorage.setItem(notepadKey, data.content);
      }
    };
    reader.readAsText(file);
  });

  // Clear notepad
  window.clearNotepad = function () {
    if (confirm("Clear the notepad? This can't be undone.")) {
      notepad.innerHTML = "";
      localStorage.removeItem(notepadKey);
    }
  };

  // Toggle notepad controls
  window.toggleNotepadControls = function () {
    document.querySelector(".notepad-controls").classList.toggle("hidden");
  };

  // Toggle main UI visibility
  toggleUIBtn.addEventListener("click", () => {
    const isHidden = mainUI.classList.toggle("hidden");
    console.log("Toggle UI clicked. Hidden?", isHidden); // 👈 debug
    toggleUIBtn.textContent = isHidden ? "👁 Show UI" : "🧺 Hide UI";
  });
});

document.getElementById("mainUI").classList.remove("hidden");