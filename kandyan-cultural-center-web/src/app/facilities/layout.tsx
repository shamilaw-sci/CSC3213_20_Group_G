import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cultural Center Hall | Kandyan Cultural Center',
  description: 'Host your cultural events, workshops, and exhibitions.',
};

export default function FacilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}