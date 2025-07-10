async function lookupPlayer() {
  const username = document.getElementById("username").value.trim();
  const resultBox = document.getElementById("result");
  const nameElem = document.getElementById("name");
  const skinElem = document.getElementById("skin");
  const extraInfo = document.getElementById("extraInfo");

  if (!username) {
    alert("Please enter a username.");
    return;
  }

  try {
    // Step 1: Get UUID and correct username
    const res = await fetch(`https://playerdb.co/api/player/minecraft/${username}`);
    if (!res.ok) throw new Error("User not found.");
    const data = await res.json();
    const player = data.data.player;
    const uuid = player.id;
    const currentName = player.username;

    // Step 2: Get detailed profile from Ashcon
    const ashRes = await fetch(`https://api.ashcon.app/mojang/v2/user/${uuid}`);
    if (!ashRes.ok) throw new Error("Could not fetch profile info.");
    const ashData = await ashRes.json();

    // Use Mojang skin URL format fallback in case Ashcon is missing skin
    const skinURL = ashData.textures?.raw?.skin || `https://crafatar.com/skins/${uuid}`;
    const capeURL = ashData.textures?.raw?.cape || null;
    const model = ashData.textures?.raw?.metadata?.model === "slim" ? "Alex (Slim)" : "Classic";
    const createdAt = ashData.created_at ? new Date(ashData.created_at).toLocaleDateString() : "Unknown";

    // Update UI elements
    nameElem.textContent = currentName;
    skinElem.src = skinURL;
    skinElem.alt = `${currentName}'s skin`;
    skinElem.style.display = "block";

    // Clear and setup extraInfo container
    extraInfo.innerHTML = "";

    // Create or reuse download button
    let btn = document.getElementById("downloadSkinBtn");
    if (!btn) {
      btn = document.createElement("a");
      btn.id = "downloadSkinBtn";
      btn.className = "button-unique";
      btn.textContent = "Download Skin";
      btn.style.marginTop = "15px";
      btn.style.display = "inline-block";
      extraInfo.appendChild(btn);
    } else {
      btn.style.display = "inline-block";
      // Remove old event listeners by cloning and replacing
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      btn = newBtn;
    }

    // Attach download click handler
    btn.onclick = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(skinURL);
        if (!response.ok) throw new Error("Failed to fetch skin image.");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentName}_skin.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      } catch (err) {
        alert("Download failed: " + err.message);
      }
    };

    // Append the rest of the player info AFTER the button
    extraInfo.innerHTML += `
      <p><strong>Model:</strong> ${model}</p>
      <p><strong>Account Created:</strong> ${createdAt}</p>
      <p><strong>Cape:</strong> ${
        capeURL
          ? `<img src="${capeURL}" alt="Cape" style="width:100px; image-rendering: pixelated;">`
          : "None"
      }</p>
      <p><strong>Links:</strong>
        <a href="https://namemc.com/profile/${currentName}" target="_blank" style="color:#4a90e2;">NameMC</a> |
        <a href="https://mcuuid.net/?q=${currentName}" target="_blank" style="color:#4a90e2;">UUID Lookup</a>
      </p>
    `;

    // Clear name history if it exists
    const historyList = document.getElementById("history");
    if (historyList) historyList.innerHTML = "";

    resultBox.style.display = "block";
  } catch (err) {
    alert("Error: " + err.message);
    resultBox.style.display = "none";
    console.error(err);
  }
}

const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const sectionId = btn.getAttribute("data-section");
      document.querySelectorAll(".section").forEach(section => {
        section.style.display = (section.id === sectionId) ? "" : "none";
        section.classList.toggle("active", section.id === sectionId);
      });
    });
  });

function toggleTCGSettingsModal() {
  const modal = document.getElementById("settings-modal-tcg");
  modal.classList.toggle("hidden");

  if (!modal.classList.contains("hidden")) {
    syncToggleWithDarkMode();
  }
}

const darkModeToggleModal = document.getElementById("darkModeToggleModal");

const savedDarkMode = localStorage.getItem("darkMode") === "enabled";
function initializeDarkMode() {
  const savedDarkMode = localStorage.getItem("darkMode");

  if (savedDarkMode === "enabled") {
    document.body.classList.add("dark-mode");
    if (darkModeToggleModal) darkModeToggleModal.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    if (darkModeToggleModal) darkModeToggleModal.checked = false;
    // If darkMode was enabled before, but now the user wants light mode, reset it
    if (savedDarkMode === "enabled") {
      localStorage.setItem("darkMode", "disabled");
    }
  }

  if (darkModeToggleModal) {
    darkModeToggleModal.addEventListener("change", () => {
      const isChecked = darkModeToggleModal.checked;
      document.body.classList.toggle("dark-mode", isChecked);
      localStorage.setItem("darkMode", isChecked ? "enabled" : "disabled");
    });
  }
}

// Call it on load
initializeDarkMode();

function syncToggleWithDarkMode() {
  if (darkModeToggleModal) {
    darkModeToggleModal.checked = document.body.classList.contains("dark-mode");
  }
}

const mslSearchInputField = document.getElementById('msl-search-input');
const mslAllServerCards = document.querySelectorAll('.msl-server-card');

mslSearchInputField.addEventListener('input', () => {
    const mslSearchQuery = mslSearchInputField.value.toLowerCase();

    mslAllServerCards.forEach(mslCardElement => {
      const mslServerTitle = mslCardElement.querySelector('.msl-server-name').textContent.toLowerCase();
      const mslServerText = mslCardElement.querySelector('.msl-server-description').textContent.toLowerCase();

      const mslMatchesSearch = mslServerTitle.includes(mslSearchQuery) || mslServerText.includes(mslSearchQuery);

      mslCardElement.style.display = mslMatchesSearch ? '' : 'none';
    });
});

document.querySelectorAll('.msl-copy-button').forEach(button => {
    button.addEventListener('click', () => {
      const ip = button.getAttribute('data-ip');
      navigator.clipboard.writeText(ip).then(() => {
        button.textContent = "Copied!";
        setTimeout(() => button.textContent = "Kopieer Link", 1500);
      });
    });
});

let count = localStorage.getItem('visitorCount');
if (!count) {
    count = 0;
}

// Convert to number and increment
count = Number(count) + 1;

// Save the new count back to localStorage
localStorage.setItem('visitorCount', count);

// Show count on the page
document.getElementById('visitor-count').textContent = count;