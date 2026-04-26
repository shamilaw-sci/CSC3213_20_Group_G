export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your order! Your Kandyan artifacts are on their way.
      </p>
      <a href="/shop" className="bg-black text-white px-8 py-3 rounded-lg text-lg">
        Continue Shopping
      </a>
    </div>
  );
}