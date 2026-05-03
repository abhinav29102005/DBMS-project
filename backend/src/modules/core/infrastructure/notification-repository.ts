import type { NeonQueryFunction } from '@neondatabase/serverless';

export class NotificationRepository {
  constructor(private sql: NeonQueryFunction<false, false>) {}

  async getForUser(userId: string): Promise<any[]> {
    return this.sql`
      SELECT * FROM core.notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.sql`
      UPDATE core.notifications
      SET is_read = true
      WHERE id = ${id} AND user_id = ${userId}
    `;
  }

  async create(data: { user_id: string, title: string, message: string, type?: string, link?: string }): Promise<void> {
    await this.sql`
      INSERT INTO core.notifications (user_id, title, message, type, link)
      VALUES (${data.user_id}, ${data.title}, ${data.message}, ${data.type || 'info'}, ${data.link})
    `;
  }
}
