// barcodeScanner.js

import Quagga from "https://cdn.jsdelivr.net/npm/@ericblade/quagga2@0.0.5/dist/quagga.min.js";

const startScanButton = document.getElementById("start-scan");
const stopScanButton = document.getElementById("stop-scan");
const barcodeResultElement = document.getElementById("barcode-result");

function initializeScanner() {
  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: document.querySelector("#scanner-preview"),
        constraints: {
          facingMode: "environment", // Use the back camera
        },
      },
      decoder: {
        readers: ["code_128_reader", "ean_reader", "ean_8_reader"], // Add barcode types here
      },
    },
    (err) => {
      if (err) {
        console.error("Error initializing Quagga:", err);
        return;
      }
      console.log("Quagga initialized.");
      startScanButton.disabled = true;
      stopScanButton.disabled = false;
      Quagga.start();
    }
  );

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    barcodeResultElement.textContent = code;
    console.log("Barcode detected:", code);

    // Stop scanning automatically after a successful scan
    Quagga.stop();
    startScanButton.disabled = false;
    stopScanButton.disabled = true;
  });
}

function stopScanner() {
  Quagga.stop();
  startScanButton.disabled = false;
  stopScanButton.disabled = true;
  console.log("Scanner stopped.");
}

// Event listeners
startScanButton.addEventListener("click", initializeScanner);
stopScanButton.addEventListener("click", stopScanner);
