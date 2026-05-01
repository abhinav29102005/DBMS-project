/**
 * UIMS Auth Module — User Repository
 * 
 * Neon PostgreSQL implementation.
 */

import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { User, Role, Permission } from '../domain/entities';

export class UserRepository {
  constructor(private sql: NeonQueryFunction<false, false>) {}

  /**
   * Find an active user by email.
   */
  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.sql`
      SELECT * FROM auth.users 
      WHERE email = ${email} 
        AND deleted_at IS NULL 
      LIMIT 1
    `;
    return (rows[0] as User) || null;
  }

  /**
   * Find a user by ID.
   */
  async findById(id: string): Promise<User | null> {
    const rows = await this.sql`
      SELECT * FROM auth.users 
      WHERE id = ${id} 
        AND deleted_at IS NULL 
      LIMIT 1
    `;
    return (rows[0] as User) || null;
  }

  /**
   * Create a new user.
   */
  async create(user: Partial<User>): Promise<User> {
    const rows = await this.sql`
      INSERT INTO auth.users (
        email, first_name, last_name, password_hash, password_algo, status
      ) VALUES (
        ${user.email}, ${user.firstName}, ${user.lastName}, 
        ${user.passwordHash}, ${user.passwordAlgo}, ${user.status || 'active'}
      )
      RETURNING *
    `;
    return rows[0] as User;
  }

  /**
   * Update login stats.
   */
  async updateLoginStats(id: string): Promise<void> {
    await this.sql`
      UPDATE auth.users 
      SET last_login_at = now(), 
          failed_login_count = 0,
          updated_at = now(),
          version = version + 1
      WHERE id = ${id}
    `;
  }

  /**
   * Record a failed login attempt.
   */
  async recordFailedLogin(id: string): Promise<number> {
    const rows = await this.sql`
      UPDATE auth.users 
      SET failed_login_count = failed_login_count + 1,
          updated_at = now()
      WHERE id = ${id}
      RETURNING failed_login_count
    `;
    return rows[0].failed_login_count;
  }

  /**
   * Lock a user account.
   */
  async lockAccount(id: string): Promise<void> {
    await this.sql`
      UPDATE auth.users 
      SET status = 'locked',
          updated_at = now()
      WHERE id = ${id}
    `;
  }

  /**
   * Get user's primary role and all permissions.
   */
  async getUserAuthDetails(userId: string): Promise<{ 
    role: string, 
    scopeId?: string, 
    permissions: string[] 
  }> {
    // Get primary role (highest priority or first)
    const roleRows = await this.sql`
      SELECT r.code, ur.scope_id 
      FROM auth.roles r
      JOIN auth.user_roles ur ON ur.role_id = r.id
      WHERE ur.user_id = ${userId}
      ORDER BY r.is_system DESC, r.code ASC
      LIMIT 1
    `;

    if (roleRows.length === 0) {
      return { role: 'guest', permissions: [] };
    }

    const role = roleRows[0].code;
    const scopeId = roleRows[0].scope_id;

    // Get aggregate permissions for all user roles
    const permRows = await this.sql`
      SELECT DISTINCT p.code
      FROM auth.permissions p
      JOIN auth.role_permissions rp ON rp.permission_id = p.id
      JOIN auth.user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = ${userId}
    `;

    return {
      role,
      scopeId,
      permissions: permRows.map(r => r.code)
    };
  }

  /**
   * Assign a role to a user.
   */
  async assignRole(userId: string, roleCode: string, scopeId?: string): Promise<void> {
    await this.sql`
      INSERT INTO auth.user_roles (user_id, role_id, scope_id)
      SELECT ${userId}, id, ${scopeId}
      FROM auth.roles
      WHERE code = ${roleCode}
      ON CONFLICT (user_id, role_id, scope_id) DO NOTHING
    `;
  }
}
