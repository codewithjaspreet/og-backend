import { z } from 'zod';

export const deviceInfoSchema = z.object({
  id: z.string().trim().min(1, "device_id is required"),
  user_id: z.string().trim().min(1, "device_type is required"),
  devicePlatform: z.string().trim().min(1, "device_platform is required"),
  deviceToken: z.string().trim().min(1, "device_token is required"),
  appVersion: z.string().trim().min(1, "app_version is required"),
});


