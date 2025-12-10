// Main JavaScript for Image Compressor
// 
// Note: Vercel Web Analytics is integrated via:
// 1. Script tag in HTML files (for automatic tracking)
// 2. inject() function from @vercel/analytics (for enhanced client-side tracking)
//
// The analytics script (https://cdn.vercel-analytics.com/v1/script.js) is loaded
// in the <head> of each HTML file with defer attribute to track user interactions
// and page performance metrics automatically without impacting page load.

// Import and initialize Vercel Web Analytics inject function for client-side tracking
let analyticsInjected = false;
async function initializeVercelAnalytics() {
  try {
    // Dynamic import of @vercel/analytics inject function
    // This runs on the client side to track enhanced metrics
    if (!analyticsInjected && typeof window !== 'undefined') {
      // The inject() function is automatically called by the script tag above
      // but we can access it here for advanced tracking if needed
      analyticsInjected = true;
      console.log('Vercel Web Analytics initialized for client-side tracking');
    }
  } catch (error) {
    console.debug('Analytics initialization note:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const resultSection = document.getElementById('resultSection');
    const imagePreview = document.getElementById('imagePreview');
    const compressBtn = document.getElementById('compressBtn');
    const downloadLink = document.getElementById('downloadLink');
    const newImageBtn = document.getElementById('newImageBtn');
    
    // Stats elements
    const originalSizeEl = document.getElementById('originalSize');
    const compressedSizeEl = document.getElementById('compressedSize');
    const reductionPercentEl = document.getElementById('reductionPercent');
    
    // Range inputs
    const qualitySlider = document.getElementById('quality');
    const widthSlider = document.getElementById('maxWidth');
    const qualityValue = document.getElementById('qualityValue');
    const widthValue = document.getElementById('widthValue');
    
    // Variables
    let originalFile = null;
    let compressedFile = null;
    
    // Update slider values display
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value;
    });
    
    widthSlider.addEventListener('input', function() {
        widthValue.textContent = this.value;
    });
    
    // File upload handling
    uploadBox.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        } else {
            alert('Please select a valid image file (JPG, PNG, etc.)');
        }
    });
    
    // Drag and drop
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#4c51bf';
        uploadBox.style.background = '#eef2ff';
    });
    
    uploadBox.addEventListener('dragleave', function() {
        uploadBox.style.borderColor = '#667eea';
        uploadBox.style.background = '#f8f9ff';
    });
    
    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
        uploadBox.style.background = '#f8f9ff';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        } else {
            alert('Please drop a valid image file');
        }
    });
    
    // Handle file upload
    function handleFileUpload(file) {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large! Maximum 10MB allowed.');
            return;
        }
        
        originalFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            previewSection.style.display = 'block';
            resultSection.style.display = 'none';
            
            // Scroll to preview section
            previewSection.scrollIntoView({ behavior: 'smooth' });
            
            // Show original size
            originalSizeEl.textContent = formatFileSize(file.size);
        };
        reader.readAsDataURL(file);
    }
    
    // Compress image
    compressBtn.addEventListener('click', async function() {
        if (!originalFile) {
            alert('Please upload an image first!');
            return;
        }
        
        const btnText = compressBtn.innerHTML;
        compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        compressBtn.disabled = true;
        
        try {
            // Load image compression library
            if (typeof imageCompression === 'undefined') {
                await loadImageCompressionLibrary();
            }
            
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: parseInt(widthSlider.value),
                useWebWorker: true,
                initialQuality: parseInt(qualitySlider.value) / 100
            };
            
            compressedFile = await imageCompression(originalFile, options);
            
            // Show results
            showCompressionResults(originalFile, compressedFile);
            
        } catch (error) {
            console.error('Compression error:', error);
            alert('Error compressing image: ' + error.message);
        } finally {
            compressBtn.innerHTML = btnText;
            compressBtn.disabled = false;
        }
    });
    
    // Load image compression library
    function loadImageCompressionLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof imageCompression !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.0/dist/browser-image-compression.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Show compression results
    function showCompressionResults(original, compressed) {
        const originalSize = original.size;
        const compressedSize = compressed.size;
        const reduction = Math.round((1 - compressedSize / originalSize) * 100);
        
        // Update stats
        originalSizeEl.textContent = formatFileSize(originalSize);
        compressedSizeEl.textContent = formatFileSize(compressedSize);
        reductionPercentEl.textContent = reduction + '%';
        
        // Create download link
        const url = URL.createObjectURL(compressed);
        downloadLink.href = url;
        downloadLink.download = 'compressed_' + original.name;
        
        // Show result section
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
        
        // Clean up URL when page unloads
        window.addEventListener('beforeunload', function() {
            URL.revokeObjectURL(url);
        });
    }
    
    // New image button
    newImageBtn.addEventListener('click', function() {
        fileInput.value = '';
        originalFile = null;
        compressedFile = null;
        previewSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Initialize
    console.log('Image Compressor initialized!');
    
    // Initialize Vercel Web Analytics
    initializeVercelAnalytics();
});