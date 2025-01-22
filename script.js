const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const uploadImage = document.getElementById("uploadImage");
const brightnessSlider = document.getElementById("brightness");
const contrastSlider = document.getElementById("contrast");
const filterSelect = document.getElementById("filter");
const cropBtn = document.getElementById("cropBtn");
const revertBtn = document.getElementById("revertBtn");
const downloadBtn = document.getElementById("downloadBtn");

let originalImage = new Image();
let currentImage = new Image();
let isImageLoaded = false;
let cropArea = { x: 50, y: 50, width: 300, height: 300 };
let isCropping = false;
let startX = 0;
let startY = 0;
let selectedAspectRatio = null;

uploadImage.addEventListener("change", handleImageUpload);
brightnessSlider.addEventListener("input", updateImage);
contrastSlider.addEventListener("input", updateImage);
filterSelect.addEventListener("change", updateImage);
cropBtn.addEventListener("click", cropImage);
revertBtn.addEventListener("click", revertChanges);
downloadBtn.addEventListener("click", downloadImage);

document.querySelectorAll('.aspectBtn').forEach(button => {
    button.addEventListener('click', setAspectRatio);
});

canvas.addEventListener('mousedown', startCrop);
canvas.addEventListener('mousemove', drawCropArea);
canvas.addEventListener('mouseup', endCrop);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            currentImage.src = e.target.result;  // Store a copy for reverting
        };
        reader.readAsDataURL(file);
    }
}

originalImage.onload = function() {
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    isImageLoaded = true;
    updateImage();
};

function updateImage() {
    if (isImageLoaded) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const brightness = brightnessSlider.value;
        const contrast = contrastSlider.value;
        const filter = filterSelect.value;

        ctx.filter = `brightness(${100 + parseInt(brightness)}%) contrast(${100 + parseInt(contrast)}%) ${filter}`;
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

        if (isCropping) {
            ctx.beginPath();
            ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.setLineDash([6]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

function setAspectRatio(event) {
    const ratio = event.target.getAttribute('data-ratio');
    selectedAspectRatio = ratio;

    switch (selectedAspectRatio) {
        case "6:9":
            cropArea.width = 600;
            cropArea.height = (600 / 6) * 9;
            break;
        case "3:2":
            cropArea.width = 600;
            cropArea.height = (600 / 3) * 2;
            break;
        case "4:3":
            cropArea.width = 600;
            cropArea.height = (600 / 4) * 3;
            break;
        default:
            break;
    }

    updateImage();
}

function startCrop(e) {
    if (!isImageLoaded || selectedAspectRatio === null) return;

    startX = e.offsetX;
    startY = e.offsetY;
    isCropping = true;
    cropArea.x = startX;
    cropArea.y = startY;
    cropArea.width = 0;
    cropArea.height = 0;
}

function drawCropArea(e) {
    if (!isCropping) return;

    const width = e.offsetX - startX;
    const height = e.offsetY - startY;

    if (selectedAspectRatio) {
        const aspectRatio = selectedAspectRatio.split(":").map(Number);
        const ratio = aspectRatio[0] / aspectRatio[1];
        if (Math.abs(width) > Math.abs(height)) {
            cropArea.width = width;
            cropArea.height = cropArea.width / ratio;
        } else {
            cropArea.height = height;
            cropArea.width = cropArea.height * ratio;
        }
    }

    updateImage();
}

function endCrop() {
    isCropping = false;
}

function cropImage() {
    if (!isImageLoaded) return;

    const imageData = ctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.putImageData(imageData, 0, 0);
    currentImage = new Image();
    currentImage.src = canvas.toDataURL();
    updateImage();
}

function revertChanges() {
    currentImage.src = originalImage.src;
    updateImage();
}

function downloadImage() {
    const dataURL = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "edited-image.png";
    a.click();
}
