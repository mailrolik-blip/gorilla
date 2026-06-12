import type { Metadata } from 'next';

import { AvtomagistralLanding } from './avtomagistral-landing';

export const metadata: Metadata = {
  title: 'Автомагистраль — грузоперевозки и спецтехника',
  description:
    'Грузовые перевозки, услуги спецтехники и организация работ для бизнеса, строительных объектов, подрядчиков и частных задач.',
  icons: {
    icon: '/landings/avtomagistral/brand/favicon.svg',
  },
  openGraph: {
    title: 'Автомагистраль — грузоперевозки и спецтехника',
    description:
      'Грузовые перевозки, услуги спецтехники и организация работ для бизнеса, строительных объектов, подрядчиков и частных задач.',
    images: [
      {
        url: '/landings/avtomagistral/brand/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Автомагистраль — грузоперевозки и спецтехника',
      },
    ],
  },
};

export default function AvtomagistralPage() {
  return <AvtomagistralLanding />;
}
