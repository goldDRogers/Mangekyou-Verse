import { supabase } from '../lib/supabaseClient';

export const profileService = {
    async updateAvatar(url: string) {
        if (!supabase) return;

        const { data, error } = await supabase.auth.updateUser({
            data: { avatar_url: url }
        });

        if (error) throw error;
        return data;
    },

    async updateMetadata(metadata: Record<string, any>) {
        if (!supabase) return;

        const { data, error } = await supabase.auth.updateUser({
            data: metadata
        });

        if (error) throw error;
        return data;
    },

    async uploadAvatar(file: File) {
        if (!supabase) throw new Error('Supabase not configured');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Try to upload
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            // If bucket doesn't exist, this might fail. In a real app we'd ensure the bucket exists.
            console.error('Upload error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return this.updateAvatar(publicUrl);
    }
};
