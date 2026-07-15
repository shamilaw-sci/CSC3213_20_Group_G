'use client';

import { useCurrency } from '@/context/CurrencyContext';

type WorkshopPriceProps = {
  price: number;
  className?: string;
};

export default function WorkshopPrice({ price, className }: WorkshopPriceProps) {
  const { formatPrice } = useCurrency();

  return <span className={className}>{formatPrice(price)}</span>;
}
