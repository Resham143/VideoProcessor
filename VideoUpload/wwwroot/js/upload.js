/**
 * Handles file upload functionality
 */

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB in bytes
const FILE_SIZE_ERROR = "Please check file issue before uploading";

/**
 * Initializes the upload form event listener
 */
function initializeUpload() {
  const uploadForm = document.getElementById("uploadForm");
  if (!uploadForm) {
    console.error("Upload form not found");
    return;
  }
  uploadForm.addEventListener("submit", handleUploadSubmit);
}

/**
 * Handles the upload form submission
 * @param {Event} e - Form submit event
 */
async function handleUploadSubmit(e) {
  e.preventDefault();

  const fileInput = document.getElementById("fileInput");
  const files = Array.from(fileInput.files);

  if (files.length === 0) {
    showUploadError("Please select at least one file");
    return;
  }

  // Validate file sizes and build FormData in one pass
  const formData = new FormData();
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      showUploadError(FILE_SIZE_ERROR);
      return;
    }
    formData.append("files", file);
  }

  const uploadBtn = document.getElementById("uploadBtn");
  const uploadSpinner = document.getElementById("uploadSpinner");
  const uploadError = document.getElementById("uploadError");
  const uploadSuccess = document.getElementById("uploadSuccess");

  // Show loading state
  uploadBtn.disabled = true;
  uploadSpinner.classList.remove("d-none");
  uploadError.classList.add("d-none");
  uploadSuccess.classList.add("d-none");

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!result) {
      throw new Error("Invalid server response");
    }

    if (response.ok) {
      handleUploadSuccess(result, fileInput);
    } else {
      handleUploadError(result);
    }
  } catch (error) {
    handleUploadException(error);
  } finally {
    uploadBtn.disabled = false;
    uploadSpinner.classList.add("d-none");
  }
}

/**
 * Handles successful upload
 * @param {Object} result - Server response result
 * @param {HTMLInputElement} fileInput - File input element
 */
function handleUploadSuccess(result, fileInput) {
  const uploadSuccess = document.getElementById("uploadSuccess");
  const message = result.message || "Files uploaded successfully!";

  uploadSuccess.textContent = message;
  uploadSuccess.classList.remove("d-none");
  fileInput.value = "";

  if (typeof showCatalogueView === "function") {
    showCatalogueView();
  }

  // Show success notification in catalogue view
  setTimeout(() => {
    const catalogueCard = document.querySelector("#catalogueView .card-header");
    if (catalogueCard?.parentElement) {
      const successMsg = document.createElement("div");
      successMsg.className = "alert alert-success alert-dismissible fade show";
      successMsg.setAttribute("role", "alert");
      successMsg.innerHTML = `
        <strong>Success!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      catalogueCard.parentElement.insertBefore(
        successMsg,
        catalogueCard.nextSibling
      );
      setTimeout(() => successMsg.remove(), 3000);
    }
  }, 100);
}

/**
 * Handles upload error response
 * @param {Object} result - Server error response
 */
function handleUploadError(result) {
  if (typeof ensureUploadViewVisible === "function") {
    ensureUploadViewVisible();
  }

  let errorMessage = result.error || result.message || "Upload failed";

  if (result.errors?.length > 0) {
    const hasSizeError = result.errors.some(
      (err) =>
        err.includes("check file issue") ||
        err.includes("exceeds") ||
        err.includes("200MB")
    );
    errorMessage = hasSizeError ? FILE_SIZE_ERROR : result.errors.join(", ");
  }

  showUploadError(errorMessage);
}

/**
 * Handles upload exception
 * @param {Error} error - Exception error
 */
function handleUploadException(error) {
  if (typeof ensureUploadViewVisible === "function") {
    ensureUploadViewVisible();
  }

  const isSizeError =
    error.message?.includes("413") ||
    error.message?.includes("Request Entity Too Large") ||
    error.message?.includes("size");

  showUploadError(
    isSizeError
      ? FILE_SIZE_ERROR
      : `An error occurred while uploading: ${error.message}`
  );
}

/**
 * Displays an error message in the upload form
 * @param {string} message - Error message to display
 */
function showUploadError(message) {
  const uploadError = document.getElementById("uploadError");
  if (uploadError) {
    uploadError.textContent = message;
    uploadError.classList.remove("d-none");
    uploadError.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// Initialize upload when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeUpload);
} else {
  initializeUpload();
}
