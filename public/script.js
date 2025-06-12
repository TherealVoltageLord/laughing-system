document.addEventListener('DOMContentLoaded', () => {
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('fileInput');
  const resultContainer = document.getElementById('resultContainer');
  const previewContainer = document.getElementById('previewContainer');
  const fileUrl = document.getElementById('fileUrl');
  const copyBtn = document.getElementById('copyBtn');
  const newUploadBtn = document.getElementById('newUploadBtn');
  const loading = document.getElementById('loading');
  const errorDisplay = document.getElementById('error');

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  // Handle dropped files
  dropArea.addEventListener('drop', handleDrop, false);

  // Handle click to select files
  dropArea.addEventListener('click', () => fileInput.click());

  // Handle file selection
  fileInput.addEventListener('change', handleFiles);

  // Copy URL button
  copyBtn.addEventListener('click', copyToClipboard);

  // New upload button
  newUploadBtn.addEventListener('click', resetUploader);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
  }

  function unhighlight() {
    dropArea.style.borderColor = '#6c757d';
    dropArea.style.backgroundColor = 'white';
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
  }

  function handleFiles(e) {
    const files = e.target.files;
    if (files.length === 0) return;

    const file = files[0];
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      showError('File size exceeds 50MB limit');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      showError('Invalid file type. Only images and videos are allowed.');
      return;
    }

    uploadFile(file);
  }

  function uploadFile(file) {
    loading.style.display = 'block';
    dropArea.style.display = 'none';
    errorDisplay.style.display = 'none';

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error || 'Upload failed') });
      }
      return response.json();
    })
    .then(data => {
      displayResult(file, data.url);
    })
    .catch(error => {
      showError(error.message);
      dropArea.style.display = 'block';
    })
    .finally(() => {
      loading.style.display = 'none';
    });
  }

  function displayResult(file, url) {
    // Create preview based on file type
    if (file.type.startsWith('image')) {
      previewContainer.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Uploaded image">`;
    } else if (file.type.startsWith('video')) {
      previewContainer.innerHTML = `
        <video controls>
          <source src="${URL.createObjectURL(file)}" type="${file.type}">
          Your browser does not support the video tag.
        </video>
      `;
    }

    fileUrl.value = url;
    resultContainer.style.display = 'block';
  }

  function copyToClipboard() {
    fileUrl.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.backgroundColor = '#4361ee';
    }, 2000);
  }

  function resetUploader() {
    resultContainer.style.display = 'none';
    dropArea.style.display = 'block';
    fileInput.value = '';
    previewContainer.innerHTML = '';
    errorDisplay.style.display = 'none';
  }

  function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
    setTimeout(() => {
      errorDisplay.style.display = 'none';
    }, 5000);
  }
});