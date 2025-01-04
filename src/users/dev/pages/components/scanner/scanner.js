// scanner.js

export function initializeScanner() {
  const scannerContainer = document.getElementById("scanner-container");

  if (!scannerContainer) {
    console.error("No se encontró el contenedor del scanner.");
    return;
  }

  scannerContainer.innerHTML = `
    <div class="scanner">
      <h3>Escáner de Código de Barras</h3>
      <video id="scanner-preview" autoplay style="width: 100%;"></video>
      <button id="start-scan" class="btn btn-primary">Iniciar Escaneo</button>
      <button id="stop-scan" class="btn btn-secondary" disabled>Detener Escaneo</button>
      <p id="scan-result">Resultado: <span id="barcode-result"></span></p>
    </div>
  `;

  const startScanButton = document.getElementById("start-scan");
  const stopScanButton = document.getElementById("stop-scan");
  const barcodeResultElement = document.getElementById("barcode-result");

  function startScanning() {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: document.querySelector("#scanner-preview"),
          constraints: { facingMode: "environment" },
        },
        decoder: { readers: ["code_128_reader", "ean_reader", "ean_8_reader"] },
      },
      (err) => {
        if (err) {
          console.error("Error al iniciar el escáner:", err);
          return;
        }
        console.log("Quagga inicializado.");
        startScanButton.disabled = true;
        stopScanButton.disabled = false;
        Quagga.start();
      }
    );

    Quagga.onDetected((data) => {
      const code = data.codeResult.code;
      barcodeResultElement.textContent = code;
      console.log("Código detectado:", code);

      // Detener escaneo automáticamente después de un escaneo exitoso
      stopScanning();
    });
  }

  function stopScanning() {
    Quagga.stop();
    startScanButton.disabled = false;
    stopScanButton.disabled = true;
    console.log("Escáner detenido.");
  }

  startScanButton.addEventListener("click", startScanning);
  stopScanButton.addEventListener("click", stopScanning);
}

document.addEventListener("DOMContentLoaded", initializeScanner);
