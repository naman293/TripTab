export const clerkAppearance: Record<string, unknown> = {
  variables: {
    colorPrimary: '#58D4F5',
    colorPrimaryForeground: '#111111',
    colorBackground: '#FFF7E9',
    colorInput: '#FFFDF7',
    colorInputForeground: '#111111',
    colorForeground: '#111111',
    colorDanger: '#FF6F61',
    colorRing: 'rgba(88, 212, 245, 0.55)',
    fontFamily: 'Nunito, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  },
  elements: {
    // Layout
    rootBox: 'w-full',
    cardBox: 'bg-transparent shadow-none w-full',
    card: 'bg-transparent shadow-none border-0 p-0',
    headerTitle: 'brand-font text-3xl font-extrabold',
    headerSubtitle: 'text-sm font-bold opacity-80',

    // Inputs/buttons
    formFieldInput: 'outlined-input w-full px-3 py-2 text-sm',
    formButtonPrimary: 'brutal-btn bg-mustard px-4 py-2 text-sm font-extrabold',
    formButtonReset: 'brutal-btn bg-cream px-4 py-2 text-sm font-extrabold',

    // Social buttons
    socialButtonsBlockButton: 'brutal-btn bg-offwhite px-4 py-2 text-sm font-extrabold',
    socialButtonsBlockButtonText: 'text-ink',

    // Links/footers
    footerActionLink: 'font-extrabold underline underline-offset-2',
    identityPreviewText: 'text-sm font-bold',

    // Dividers
    dividerLine: 'border-ink',
    dividerText: 'text-xs font-extrabold uppercase tracking-wide'
  } as unknown
};
