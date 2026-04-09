import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.lafermedemarieario',
  appName: 'La Ferme de Marie à Rio',

  // En production : l'app charge le site Vercel
  // Le site web continue de tourner normalement, rien ne change
  server: {
    url: 'https://lafermedemarieario.com.br',
    cleartext: false,
  },

  // Dossier de build local (utilisé uniquement si server.url est commenté)
  webDir: 'out',

  ios: {
    scheme: 'LaFermedeMarie',
    contentInset: 'always',
    backgroundColor: '#F5F2E9',
    preferredContentMode: 'mobile',
    scrollEnabled: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F5F2E9',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#4A5D4E',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
