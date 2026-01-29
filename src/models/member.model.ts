import pool from '../database/db';
import { Member } from '../types';
import { generateId } from '../utils/helpers';

export const memberModel = {
  async findAll(): Promise<Member[]> {
    const { rows: members } = await pool.query('SELECT * FROM members');

    for (const member of members) {
      const { rows: skills } = await pool.query('SELECT skill_name FROM member_skills WHERE member_id = $1', [member.id]);
      member.skills = skills.map(s => s.skill_name);
    }
    return members;
  },

  async findById(id: string): Promise<Member | null> {
    const { rows } = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
    if (rows.length === 0) {
      return null;
    }
    const member = rows[0];
    const { rows: skills } = await pool.query('SELECT skill_name FROM member_skills WHERE member_id = $1', [member.id]);
    member.skills = skills.map(s => s.skill_name);
    return member;
  },

  async create(member: Omit<Member, 'id' | 'skills'> & { skills: string[] }): Promise<Member> {
    const newMember: Member = { id: generateId(), ...member };
    const { id, name, position, employee_number, join_date, note, skills } = newMember;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'INSERT INTO members (id, name, position, employee_number, join_date, note) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, name, position, employee_number, join_date, note]
        );
        if (skills && skills.length > 0) {
            const skillValues = skills.map((skill, index) => `($1, $${index + 2})`).join(',');
            const skillParams = [id, ...skills];
            await client.query(`INSERT INTO member_skills (member_id, skill_name) VALUES ${skillValues}`, skillParams);
        }
        await client.query('COMMIT');
        return newMember;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
  },

  async update(id: string, member: Partial<Omit<Member, 'skills'>> & { skills?: string[] }): Promise<Member | null> {
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
    await pool.query('DELETE FROM members WHERE id = $1', [id]);
  }
};
