import pool from '../database/db';
import { Member } from '../types';

export const memberModel = {
  async findAll(): Promise<Member[]> {
    const { rows: members } = await pool.query('SELECT * FROM members WHERE deleteYn = 0');

    for (const member of members) {
      const { rows: skills } = await pool.query('SELECT skill_name FROM member_skills WHERE member_id = $1', [member.id]);
      member.skills = skills.map(s => s.skill_name);
    }
    return members;
  },

  async findById(id: string): Promise<Member | null> {
    const { rows } = await pool.query('SELECT * FROM members WHERE id = $1 AND deleteYn = 0', [id]);
    if (rows.length === 0) {
      return null;
    }
    const member = rows[0];
    const { rows: skills } = await pool.query('SELECT skill_name FROM member_skills WHERE member_id = $1', [member.id]);
    member.skills = skills.map(s => s.skill_name);
    return member;
  },

  async create(member: Member): Promise<Member> {
    const { id, name, position, join_date, note, skills, employee_number } = member;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(
          'INSERT INTO members (id, name, position, join_date, note, employee_number) VALUES ($1, $2, $3, $4, $5, $6)',
          [employee_number, name, position, join_date, note, employee_number]
      );

      if (skills && skills.length > 0) {
          const skillValues = skills.map((skill, index) => `($1, $${index + 2})`).join(',');
          const skillParams = [id, ...skills];
          await client.query(`INSERT INTO member_skills (member_id, skill_name) VALUES ${skillValues}`, skillParams);
      }
      
      await client.query('COMMIT');
      return { ...member, deleteYn: 0 }; // Return the created member
    } catch (error: any) {
      await client.query('ROLLBACK');

      // Check for unique violation error (code '23505' in PostgreSQL)
      if (error.code === '23505') {
        const { rows } = await client.query('SELECT * FROM members WHERE id = $1', [id]);
        const existingMember = rows[0];

        if (existingMember && existingMember.deleteyn === 1) {
          // The member is soft-deleted, so revive them
          try {
            await client.query('BEGIN');
            await client.query(
              'UPDATE members SET name = $1, position = $2, join_date = $3, note = $4, deleteYn = 0, updated_at = NOW() WHERE id = $5',
              [name, position, join_date, note, id]
            );

            // Update skills
            await client.query('DELETE FROM member_skills WHERE member_id = $1', [id]);
            if (skills && skills.length > 0) {
              const skillValues = skills.map((skill, index) => `($1, $${index + 2})`).join(',');
              const skillParams = [id, ...skills];
              await client.query(`INSERT INTO member_skills (member_id, skill_name) VALUES ${skillValues}`, skillParams);
            }

            await client.query('COMMIT');
            const revivedMember = await this.findById(id);
            if (!revivedMember) throw new Error('Failed to revive member.');
            return revivedMember;
          } catch (reviveError) {
            await client.query('ROLLBACK');
            throw reviveError;
          }
        } else {
          // Active member exists, it's a true conflict
          throw new Error(`Member with ID ${id} already exists.`);
        }
      }
      // Re-throw other errors
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id: string, member: Partial<Omit<Member, 'skills' | 'id'>> & { skills?: string[] }): Promise<Member | null> {
    const { skills, ...memberData } = member;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (Object.keys(memberData).length > 0) {
            const queryParts: string[] = [];
            const values: any[] = [];
            let valueCounter = 1;

            for (const [key, value] of Object.entries(memberData)) {
                queryParts.push(`${key} = $${valueCounter}`);
                values.push(value);
                valueCounter++;
            }
            const queryString = `UPDATE members SET ${queryParts.join(', ')} WHERE id = $${valueCounter}`;
            values.push(id);
            await client.query(queryString, values);
        }

        if (skills) {
            await client.query('DELETE FROM member_skills WHERE member_id = $1', [id]);
            if (skills.length > 0) {
              const skillValues = skills.map((skill, index) => `($1, $${index + 2})`).join(',');
              const skillParams = [id, ...skills];
              await client.query(`INSERT INTO member_skills (member_id, skill_name) VALUES ${skillValues}`, skillParams);
            }
        }
        
        await client.query('COMMIT');
        return this.findById(id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
  },

  async remove(id: string): Promise<void> {
    await pool.query('UPDATE members SET deleteYn = 1 WHERE id = $1', [id]);
  }
};
