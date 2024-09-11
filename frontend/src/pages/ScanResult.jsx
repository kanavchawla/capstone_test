import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const ScanResult = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const shopId = searchParams.get("shopId");
  const userId = searchParams.get("userId");
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details.");
        }
        const data = await response.json();
        setOrderData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  return (
    <div>
      {error && <div>Error: {error}</div>}
      {orderData ? (
        <div>
          <h1>Order ID: {orderData._id}</h1>
          <p>Shop ID: {shopId}</p>
          <p>User ID: {userId}</p>
          {/* Render more order details here */}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ScanResult;
