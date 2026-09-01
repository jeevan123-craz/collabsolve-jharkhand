'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppContext';

export default function Footer() {
  const { t } = useApp();
  
  return (
    <footer className="bg-surface-container-high dark:bg-surface-dark border-t border-outline-variant w-full mt-lg">
      <div className="flex flex-col md:flex-row justify-between items-center py-lg px-gutter max-w-container-max mx-auto font-body-md text-body-md text-on-surface dark:text-on-surface-variant">
        <div className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed mb-md md:mb-0">
            CollabSolve Jharkhand
        </div>
        <div className="flex flex-wrap justify-center gap-md font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant mb-md md:mb-0">
          <a className="hover:text-primary dark:hover:text-primary-fixed transition-colors cursor-pointer" href="#">Privacy Policy</a>
          <a className="hover:text-primary dark:hover:text-primary-fixed transition-colors cursor-pointer" href="#">Terms of Service</a>
          <a className="hover:text-primary dark:hover:text-primary-fixed transition-colors cursor-pointer" href="#">Contact Us</a>
        </div>
        <div className="font-label-sm text-label-sm text-outline">
            {t('footer.tagline')}
        </div>
      </div>
    </footer>
  );
}
