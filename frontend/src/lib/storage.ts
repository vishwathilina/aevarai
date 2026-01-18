import { supabase } from './supabase';

/**
 * Upload a document (PDF, DOCX, etc.) to Supabase storage
 * @param file - The file to upload
 * @param productId - The product ID to organize files
 * @returns The file path in storage
 */
export const uploadDocument = async (file: File, productId: number): Promise<string> => {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `products/product_${productId}/${timestamp}_${sanitizedFileName}`;

    const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Document upload error:', error);
        throw new Error(`Failed to upload document: ${error.message}`);
    }

    return filePath;
};

/**
 * Upload an image to Supabase storage
 * @param file - The image file to upload
 * @param productId - The product ID to organize images
 * @returns The file path in storage
 */
export const uploadImage = async (file: File, productId: number): Promise<string> => {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `products/product_${productId}/images/${timestamp}_${sanitizedFileName}`;

    const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Image upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    return filePath;
};

/**
 * Get a signed URL for a document (secure, time-limited)
 * @param filePath - The path to the file in storage
 * @param expiresIn - Expiry time in seconds (default: 1 hour)
 * @returns Signed URL for accessing the document
 */
export const getDocumentUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        console.error('Error creating signed URL:', error);
        throw new Error(`Failed to get document URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
        throw new Error('No signed URL returned');
    }

    return data.signedUrl;
};

/**
 * Get a signed URL for an image (secure, time-limited)
 * @param filePath - The path to the image in storage
 * @param expiresIn - Expiry time in seconds (default: 1 hour)
 * @returns Signed URL for accessing the image
 */
export const getImageUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
        .from('images')
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        console.error('Error creating signed URL for image:', error);
        throw new Error(`Failed to get image URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
        throw new Error('No signed URL returned');
    }

    return data.signedUrl;
};

/**
 * Get a public URL for an image (if bucket is public)
 * @param filePath - The path to the image in storage
 * @returns Public URL for the image
 */
export const getPublicImageUrl = (filePath: string): string => {
    const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

/**
 * Get the Supabase project URL
 * @returns The Supabase project URL
 */
export const getSupabaseUrl = (): string => {
    return import.meta.env.VITE_SUPABASE_URL;
};

/**
 * Get a public URL for an image using the Supabase URL
 * @param filePath - The path to the image in storage
 * @returns Full public URL for the image
 */
export const getImagePublicUrl = (filePath: string): string => {
    const supabaseUrl = getSupabaseUrl();
    return `${supabaseUrl}/storage/v1/object/public/images/${filePath}`;
};

/**
 * Get a signed URL for a document (for private documents)
 * @param filePath - The path to the document in storage
 * @returns Signed URL for accessing the document
 */
export const getDocumentSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
    return getDocumentUrl(filePath, expiresIn);
};

/**
 * Delete a document from storage
 * @param filePath - The path to the file to delete
 */
export const deleteDocument = async (filePath: string): Promise<void> => {
    const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);

    if (error) {
        console.error('Error deleting document:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
    }
};

/**
 * Delete an image from storage
 * @param filePath - The path to the image to delete
 */
export const deleteImage = async (filePath: string): Promise<void> => {
    const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

    if (error) {
        console.error('Error deleting image:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

/**
 * Upload multiple images for a product
 * @param files - Array of image files
 * @param productId - The product ID
 * @returns Array of file paths
 */
export const uploadMultipleImages = async (files: File[], productId: number): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadImage(file, productId));
    return Promise.all(uploadPromises);
};

/**
 * Upload multiple documents for a product
 * @param files - Array of document files
 * @param productId - The product ID
 * @returns Array of file paths
 */
export const uploadMultipleDocuments = async (files: File[], productId: number): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadDocument(file, productId));
    return Promise.all(uploadPromises);
};
