export default function WorkshopPrice({ price }: { price: number }) {
  return (
    <span className="font-semibold text-slate-700">
      LKR {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}
