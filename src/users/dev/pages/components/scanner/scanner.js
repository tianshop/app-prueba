export function initializeScanner() {
  const scannerContainer = document.getElementById("scanner-container");
  if (!scannerContainer) {
    console.error("No se encontró el contenedor del scanner.");
    return;
  }

  scannerContainer.innerHTML = `
    <div class="scanner">
      <h3>Escáner de Código de Barras</h3>
      <div id="scanner-frame" style="position: relative; width: 100%; max-width: 400px; margin: auto; border: 2px solid #ddd; border-radius: 8px; overflow: hidden;">
        <video id="scanner-preview" autoplay playsinline style="width: 100%; height: 300px; object-fit: cover;"></video>
        <canvas id="interactive" class="viewport" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
      </div>
      <button id="start-scan" class="btn btn-primary mt-3">Iniciar Escaneo</button>
      <button id="stop-scan" class="btn btn-secondary mt-3" disabled>Detener Escaneo</button>
      <p id="scan-result" class="mt-3">Resultado: <span id="barcode-result"></span></p>
    </div>
  `;

  const startScanButton = document.getElementById("start-scan");
  const stopScanButton = document.getElementById("stop-scan");
  const barcodeResultElement = document.getElementById("barcode-result");
  const videoElement = document.getElementById("scanner-preview");

  async function startScanning() {
    try {
      // Primero obtenemos acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Asignamos el stream al elemento de video
      videoElement.srcObject = stream;
      await videoElement.play();

      // Configuramos Quagga
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoElement,
            constraints: {
              facingMode: "environment"
            },
            area: { // Definir un área de escaneo más específica
              top: "20%",    
              right: "20%",  
              left: "20%",   
              bottom: "20%"  
            }
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader"
            ],
            debug: {
              drawBoundingBox: true,
              showFrequency: true,
              drawScanline: true,
              showPattern: true
            }
          },
          locate: true
        },
        function(err) {
          if (err) {
            console.error("Error al iniciar Quagga:", err);
            return;
          }
          console.log("Quagga inicializado correctamente");
          startScanButton.disabled = true;
          stopScanButton.disabled = false;
          Quagga.start();
        }
      );
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    }
  }

  function stopScanning() {
    if (videoElement.srcObject) {
      const tracks = videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    }
    Quagga.stop();
    startScanButton.disabled = false;
    stopScanButton.disabled = true;
    console.log("Escáner detenido.");
  }

  // Manejadores de eventos de Quagga
  Quagga.onProcessed((result) => {
    const drawingCanvas = document.getElementById("interactive");
    const drawingContext = drawingCanvas.getContext("2d");
    
    if (drawingCanvas && drawingContext) {
      drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      
      if (result && result.boxes) {
        result.boxes
          .filter(box => box !== result.box)
          .forEach(box => {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingContext, {
              color: "green",
              lineWidth: 2
            });
          });
      }

      if (result && result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingContext, {
          color: "blue",
          lineWidth: 2
        });
      }
    }
  });

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    barcodeResultElement.textContent = code;
    console.log("Código detectado:", code);
    // Opcional: detener el escaneo después de una detección exitosa
    stopScanning();
  });

  startScanButton.addEventListener("click", startScanning);
  stopScanButton.addEventListener("click", stopScanning);
}

document.addEventListener("DOMContentLoaded", initializeScanner);