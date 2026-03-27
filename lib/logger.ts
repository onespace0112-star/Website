import prisma from '@/lib/prisma'

/**
 * Creates a system log entry.
 * @param action The action performed (e.g., "增加", "修改", "删除", "Add", "Update", "Delete").
 * @param content Detailed description of the action (e.g., "Created project: Villa X", "Deleted user: John").
 */
export async function createLog(action: string, content: string) {
    try {
        await prisma.systemLog.create({
            data: {
                action,
                content,
            },
        })
    } catch (error) {
        console.error('Failed to create system log:', error)
        // We don't throw here to avoid failing the main request just because logging failed
    }
}
