import { z } from 'zod';

const announcementSchema = z.object({

    title: z.string().trim().min(1, "title is required"),
    body: z.string().trim().min(1, "description is required"),
    type: z.enum([ "Reminder", "Notification", "Announcement", "General"
    ]).optional(),
})

export default announcementSchema;