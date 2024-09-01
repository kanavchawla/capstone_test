import { QRCodeCanvas } from "qrcode.react";

const QRCodeComponent = ({ order }) => {
  const orderData = JSON.stringify(order);
  return (
    <div>
      <h2>Your Order QR Code</h2>
      <QRCodeCanvas value={orderData} />
    </div>
  );
};

export default QRCodeComponent;
