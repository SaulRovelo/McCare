"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner"; // Usando la librería que ya tienes en tu package.json

interface PaypalProps {
  monto: number;
}

export default function PaypalButton({ monto }: PaypalProps) {
  // Reemplaza con tu Client ID de PayPal Sandbox
  const initialOptions = {
    clientId: "test", // AQUÍ VA TU CLIENT ID REAL DE PAYPAL DEVELOPER
    currency: "USD",
    intent: "capture",
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "rect" }}
          createOrder={async () => {
            // Llamamos a tu nuevo endpoint de Backend para crear la orden
            const res = await fetch(`http://127.0.0.1:8000/api/pagos/crear-orden?monto=${monto}`, {
              method: "POST",
            });
            const data = await res.json();
            return data.order_id; // Este ID le dice a PayPal cuánto cobrar
          }}
          onApprove={async (data) => {
            // Cuando el usuario paga, avisamos a tu backend para registrar la donación
            try {
              const response = await fetch(`http://127.0.0.1:8000/api/pagos/capturar/${data.orderID}?monto=${monto}`, {
                method: "POST",
              });

              if (response.ok) {
                toast.success("¡Donación recibida! Gracias por apoyar a McCare.");
              }
            } catch (error) {
              toast.error("El pago se realizó pero hubo un error al registrarlo.");
            }
          }}
          onError={(err) => {
            console.error("PayPal Error:", err);
            toast.error("Hubo un problema con la pasarela de pago.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}