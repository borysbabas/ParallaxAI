import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import {Capacitor} from '@capacitor/core';

export interface CapturedImage {
    dataUrl: string;
    timestamp: string;
    blob: Blob;
}

/**
 * Unified camera service that works on both web and native platforms
 */
export class CameraService {
    private readonly isNative: boolean;

    constructor() {
        this.isNative = Capacitor.isNativePlatform();
    }

    /**
     * Check if running on native platform (iOS/Android)
     */
    isNativePlatform(): boolean {
        return this.isNative;
    }

    /**
     * Take a picture using native camera (Capacitor)
     */
    async takeNativePicture(): Promise<CapturedImage | null> {
        try {
            console.log('Requesting camera access...');

            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                correctOrientation: true,
                saveToGallery: false,
            });

            console.log('Camera photo received:', image.format);

            if (!image.dataUrl) {
                throw new Error('No image data received from camera');
            }

            // Convert dataUrl to blob
            const blob = await this.dataUrlToBlob(image.dataUrl);
            console.log('Image converted to blob:', blob.size, 'bytes');

            return {
                dataUrl: image.dataUrl,
                timestamp: new Date().toLocaleString(),
                blob
            };
        } catch (error: any) {
            console.error('Native camera error:', error);

            // Provide user-friendly error messages
            if (error.message && error.message.includes('User cancelled')) {
                throw new Error('Camera was cancelled');
            } else if (error.message && error.message.includes('permission')) {
                throw new Error('Camera permission denied. Please enable camera access in Settings.');
            } else {
                throw new Error(error.message || 'Failed to access camera. Please check permissions in Settings.');
            }
        }
    }

    /**
     * Pick image from gallery using native picker (Capacitor)
     */
    async pickFromGallery(): Promise<CapturedImage | null> {
        try {
            console.log('Opening photo gallery...');

            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos,
                correctOrientation: true,
            });

            console.log('Gallery photo selected:', image.format);

            if (!image.dataUrl) {
                throw new Error('No image data received from gallery');
            }

            const blob = await this.dataUrlToBlob(image.dataUrl);
            console.log('Gallery image converted to blob:', blob.size, 'bytes');

            return {
                dataUrl: image.dataUrl,
                timestamp: new Date().toLocaleString(),
                blob
            };
        } catch (error: any) {
            console.error('Gallery picker error:', error);

            // Provide user-friendly error messages
            if (error.message && error.message.includes('User cancelled')) {
                throw new Error('Photo selection was cancelled');
            } else if (error.message && error.message.includes('permission')) {
                throw new Error('Photo library permission denied. Please enable access in Settings.');
            } else {
                throw new Error(error.message || 'Failed to access photo library. Please check permissions in Settings.');
            }
        }
    }

    /**
     * Convert File to CapturedImage
     */
    async fileToImage(file: File): Promise<CapturedImage> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    dataUrl: reader.result as string,
                    timestamp: new Date().toLocaleString(),
                    blob: file
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Convert dataUrl to Blob
     */
    private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
        const response = await fetch(dataUrl);
        return await response.blob();
    }
}

export const cameraService = new CameraService();
