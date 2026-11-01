const base = import.meta.env.BASE_URL;
const brandAsset = (fileName: string) => `${base}assets/brand/${fileName}`;

export const ASSETS = {
  bgGeneral: brandAsset('pattern-background.png'),
  bgLanding: brandAsset('landing-background.png'),
  bgAuth: brandAsset('auth-background.png'),
  bgBanner: brandAsset('mascot-banner.png'),
  stickerKit: brandAsset('sticker-sheet.png'),
  mascotSheet: brandAsset('mascot-sheet.png'),
  heroMascots: brandAsset('hero-mascots.png'),
  loginMascots: brandAsset('login-mascots.png'),
  authMascots: brandAsset('login-mascots.png'),
  siteBackground: brandAsset('site-background.png'),
  footerBackground: brandAsset('footer-background.png'),
  heroPair: brandAsset('hero-mascot-pair.png'),
  chatbotIcon: brandAsset('chatbot-icon.png'),
  chatbotDog: brandAsset('chatbot-dog.webp'),
  brandLogo: brandAsset('petphet-logo.webp'),
  statusSuccess: brandAsset('status-success.png'),
  statusError: brandAsset('status-error.png')
};

export const BRAND_COLORS = {
  cream: '#E8CCAD',
  orange: '#EC802B',
  yellow: '#EDC55B',
  teal: '#66BCB4',
  brown: '#81451F'
};
