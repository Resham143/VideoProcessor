/**
 * Handles catalogue view functionality - loading and displaying video files
 */

/**
 * Loads the catalogue of videos from the server
 */
async function loadCatalogue() {
  try {
    const response = await fetch("/api/upload");
    const result = await response.json();

    const tbody = document.getElementById("catalogueTableBody");
    const emptyMessage = document.getElementById("catalogueEmptyMessage");
    const tableContainer = document.getElementById("catalogueTableContainer");

    if (!tbody) return;

    if (result.videoFiles && result.videoFiles.length > 0) {
      // Hide empty message and show table
      if (emptyMessage) {
        emptyMessage.classList.add("d-none");
      }
      if (tableContainer) {
        tableContainer.style.display = "block";
      }

      // Clear existing rows
      tbody.innerHTML = "";

      // Add video rows
      result.videoFiles.forEach((file) => {
        const row = document.createElement("tr");
        row.className = "video-row";
        row.style.cursor = "pointer";
        row.setAttribute("data-filename", file.fileName);
        row.onclick = function (e) {
          playVideo(file.fileName);
          // Highlight selected row
          document.querySelectorAll(".video-row").forEach((r) => {
            r.classList.remove("table-active");
          });
          e.currentTarget.classList.add("table-active");
        };

        row.innerHTML = `
                    <td>${escapeHtml(file.fileName)}</td>
                    <td>${formatFileSize(file.fileSize)}</td>
                `;

        tbody.appendChild(row);
      });
    } else {
      // Show empty message and hide table
      if (emptyMessage) {
        emptyMessage.classList.remove("d-none");
      }
      if (tableContainer) {
        tableContainer.style.display = "none";
      }
      tbody.innerHTML = "";
    }
  } catch (error) {
    console.error("Error loading catalogue:", error);
    const emptyMessage = document.getElementById("catalogueEmptyMessage");
    if (emptyMessage) {
      emptyMessage.classList.remove("d-none");
      emptyMessage.innerHTML =
        '<p class="mb-0 text-danger">Error loading catalogue. Please try again.</p>';
    }
  }
}

/**
 * Plays a video in the video player
 * @param {string} filename - Name of the video file to play
 */
function playVideo(filename) {
  const videoContainer = document.getElementById("videoContainer");
  if (!videoContainer) return;

  videoContainer.innerHTML = `
        <video controls autoplay class="w-100" style="max-height: 500px;">
            <source src="/media/${encodeURIComponent(
              filename
            )}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    `;
}
