// Test utility for rendering components with providers, mock data, etc.
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { RenderOptions, RenderResult } from '@testing-library/react';

// Optionally add more providers here (e.g., TanStack Table context, theme, etc.)
interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };
