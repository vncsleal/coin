import { sql } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  is_public?: boolean;
  bio?: string;
}

/**
 * Ensures that the current user exists in our database
 * This should be called whenever a user action requires database access
 */
export async function ensureUserInDatabase(): Promise<UserProfile | null> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      throw new Error('User email not found');
    }

    // Check if user already exists in our database
    const existingUser = await sql`
      SELECT * FROM users WHERE id = ${user.id}
    `;

    if (existingUser.length > 0) {
      return existingUser[0] as UserProfile;
    }

    // Create user in our database
    const newUser = await sql`
      INSERT INTO users (id, email, display_name, avatar_url, created_at, updated_at)
      VALUES (
        ${user.id}, 
        ${email}, 
        ${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || email.split('@')[0]},
        ${user.imageUrl || null},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return newUser[0] as UserProfile;
  } catch (error) {
    console.error('Error ensuring user in database:', error);
    throw error;
  }
}

/**
 * Updates user profile information
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const allowedFields = ['display_name', 'avatar_url', 'is_public', 'bio'];
    const updateFields = Object.keys(updates).filter(key => 
      allowedFields.includes(key) && updates[key as keyof UserProfile] !== undefined
    );

    if (updateFields.length === 0) {
      throw new Error('No valid updates provided');
    }

    // Build the update query dynamically based on which fields are being updated
    let result;
    
    if (updateFields.includes('display_name') && updateFields.includes('avatar_url')) {
      result = await sql`
        UPDATE users 
        SET display_name = ${updates.display_name}, avatar_url = ${updates.avatar_url}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING *
      `;
    } else if (updateFields.includes('display_name')) {
      result = await sql`
        UPDATE users 
        SET display_name = ${updates.display_name}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING *
      `;
    } else if (updateFields.includes('avatar_url')) {
      result = await sql`
        UPDATE users 
        SET avatar_url = ${updates.avatar_url}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING *
      `;
    } else if (updateFields.includes('bio')) {
      result = await sql`
        UPDATE users 
        SET bio = ${updates.bio}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING *
      `;
    } else if (updateFields.includes('is_public')) {
      result = await sql`
        UPDATE users 
        SET is_public = ${updates.is_public}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING *
      `;
    } else {
      throw new Error('No supported fields to update');
    }

    if (result.length === 0) {
      throw new Error('User not found');
    }

    return result[0] as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Gets user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;

    return result.length > 0 ? result[0] as UserProfile : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}