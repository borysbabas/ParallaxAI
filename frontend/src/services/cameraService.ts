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
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                correctOrientation: true,
                saveToGallery: false,
            });

            if (!image.dataUrl) {
                throw new Error('No image data received');
            }

            // Convert dataUrl to blob
            const blob = await this.dataUrlToBlob(image.dataUrl);

            return {
                dataUrl: image.dataUrl,
                timestamp: new Date().toLocaleString(),
                blob
            };
        } catch (error) {
            console.error('Native camera error:', error);
            throw error;
        }
    }

    /**
     * Pick image from gallery using native picker (Capacitor)
     */
    async pickFromGallery(): Promise<CapturedImage | null> {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos,
                correctOrientation: true,
            });

            if (!image.dataUrl) {
                throw new Error('No image data received');
            }

            const blob = await this.dataUrlToBlob(image.dataUrl);

            return {
                dataUrl: image.dataUrl,
                timestamp: new Date().toLocaleString(),
                blob
            };
        } catch (error) {
            console.error('Gallery picker error:', error);
            throw error;
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
