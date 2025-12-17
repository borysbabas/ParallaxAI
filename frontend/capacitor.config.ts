import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'nl.parallax.darktech',
    appName: 'Dark Tech',
    webDir: 'dist',
    plugins: {
        Camera: {
            presentationStyle: 'fullscreen',
            permissions: ['camera', 'photos']
        },
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#000000',
            showSpinner: false
        }
    }
};

export default config;
