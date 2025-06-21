// app/user/layout.tsx
// This file will render the `UserHomePage` (which is `page.tsx`)

import { Suspense } from 'react';

export default function UserLayout({
  children, // This `children` prop will be your `app/user/page.tsx` content
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading user interface...</div>}>
      {children}
    </Suspense>
  );
}