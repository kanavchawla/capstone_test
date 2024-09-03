import { QRCodeCanvas } from "qrcode.react";

const QRCodeComponent = ({ order }) => {
  const orderData = JSON.stringify(order); // Serialize the order object

  return (
    <div>
      <h2>Your Order QR Code</h2>
      <QRCodeCanvas value={orderData} size={256} /> {/* QR code with order data */}
    </div>
  );
};

export default QRCodeComponent;
