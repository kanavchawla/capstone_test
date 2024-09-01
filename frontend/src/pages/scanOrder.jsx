import { QrReader } from "react-qr-reader";
import { useState } from "react";

const ScanOrder = () => {
  const [scannedData, setScannedData] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setScannedData(JSON.parse(data));
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <h2>Scan QR Code</h2>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "100%" }}
      />
      {scannedData && (
        <div>
          <h3>Order Details:</h3>
          <ul>
            {scannedData.map((item, index) => (
              <li key={index}>
                {item.item}: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScanOrder;
