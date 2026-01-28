import pool from '../database/db';
import { Member } from '../types';
import { generateId } from '../utils/helpers';

export const memberModel = {
  async findAll(): Promise<Member[]> {
    const [members] = await pool.query('SELECT * FROM members');
    const membersArray = members as Member[];

    for (const member of membersArray) {
      const [skills] = await pool.query('SELECT skill_name FROM member_skills WHERE member_id = ?', [member.id]);
      member.skills = (skills as any[]).map(s => s.skill_name);
    }
    return membersArray;
  },

  async findById(id: string): Promise<Member | null> {
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    const members = rows as Member[];
    if (members.length === 0) {
      return null;
    }
    const member = members[0];
    const [skills] = await pool.query('SELECT skill_name FROM member_skills WHERE member_id = ?', [member.id]);
    member.skills = (skills as any[]).map(s => s.skill_name);
    return member;
  },

  async create(member: Omit<Member, 'id' | 'skills'> & { skills: string[] }): Promise<Member> {
    const newMember = { id: generateId(), ...member };
    
    const { skills, ...memberData } = newMember;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('INSERT INTO members SET ?', memberData);
        if (skills && skills.length > 0) {
            const skillValues = skills.map(skill => [newMember.id, skill]);
            await connection.query('INSERT INTO member_skills (member_id, skill_name) VALUES ?', [skillValues]);
        }
        await connection.commit();
        return { ...newMember, skills };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  },

  async update(id: string, member: Partial<Omit<Member, 'skills'>> & { skills?: string[] }): Promise<Member | null> {
    const { skills, ...memberData } = member;
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (Object.keys(memberData).length > 0) {
            await connection.query('UPDATE members SET ? WHERE id = ?', [memberData, id]);
        }

        if (skills) {
            await connection.query('DELETE FROM member_skills WHERE member_id = ?', [id]);
            if (skills.length > 0) {
                const skillValues = skills.map(skill => [id, skill]);
                await connection.query('INSERT INTO member_skills (member_id, skill_name) VALUES ?', [skillValues]);
            }
        }
        
        await connection.commit();
        return this.findById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  },

  async remove(id: string): Promise<void> {
    // Deleting from members will cascade to member_skills
    await pool.query('DELETE FROM members WHERE id = ?', [id]);
  }
};
