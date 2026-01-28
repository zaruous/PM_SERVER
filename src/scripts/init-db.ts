import fs from 'fs/promises';
import path from 'path';
import pool from '../database/db';

const INITIAL_PROJECTS = [
  { id: 'p1', name: 'NextGen Banking System', code: 'NGB-2026', client: 'K-Bank', type: 'External', orderAmount: 5000000000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
  { id: 'p2', name: 'AI Customer Service Bot', code: 'AIC-2026', client: 'Retail Corp', type: 'Internal', orderAmount: 120000000, startDate: '2026-03-01', endDate: '2026-08-31', status: 'Planning' },
  { id: 'p3', name: 'Internal R&D Framework', code: 'RND-001', client: 'In-House', type: 'Other', orderAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
  { id: 'p4', name: 'test', code: 'RND-002', client: 'In-House', type: 'Other', orderAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' }
];

const INITIAL_MEMBERS = [
  { id: 'm1', name: 'Kim Min-su', joinDate:'2026-01-27', position: 'Senior', skills: ['React', 'Node', 'AWS'] , note:''},
  { id: 'm2', name: 'Lee Ji-young', joinDate:'2026-01-27', position: 'Lead', skills: ['Java', 'Spring', 'Architecture'], note:'' },
  { id: 'm3', name: 'Park Jun-ho', joinDate:'2026-01-27',position: 'Senior', skills: ['Python', 'AI', 'TensorFlow'] , note:''},
  { id: 'm4', name: 'Choi Su-jin', joinDate:'2026-01-27', position: 'Junior', skills: ['UI/UX', 'Figma', 'CSS'] , note:''},
  { id: 'm5', name: 'Jung Tae-woo', joinDate:'2026-01-27', position: 'Senior', skills: ['DevOps', 'Docker', 'K8s'], note:'' },
];

const INITIAL_ASSIGNMENTS = [
  { id: 'a1', projectId: 'p1', memberId: 'm1', memberName: 'Kim Min-su', role: 'PM', startDate: '2026-01-01', endDate: '2026-12-31', inputRatio: 1.0, monthlyWeights: { "2026-01": 1, "2026-02": 1, "2026-03": 1, "2026-04": 1, "2026-05": 1, "2026-06": 1, "2026-07": 1, "2026-08": 1, "2026-09": 1, "2026-10": 1, "2026-11": 1, "2026-12": 1 } },
  { id: 'a2', projectId: 'p1', memberId: 'm2', memberName: 'Lee Ji-young', role: 'PL', startDate: '2026-01-01', endDate: '2026-12-31', inputRatio: 1.0, monthlyWeights: { "2026-01": 1, "2026-02": 1, "2026-03": 1, "2026-04": 1, "2026-05": 1, "2026-06": 1, "2026-07": 1, "2026-08": 1, "2026-09": 1, "2026-10": 1, "2026-11": 1, "2026-12": 1 } },
  { id: 'a3', projectId: 'p3', memberId: 'm5', memberName: 'Jung Tae-woo', role: 'TA', startDate: '2026-02-01', endDate: '2026-11-30', inputRatio: 0.5, monthlyWeights: { "2026-02": 0.5, "2026-03": 0.5, "2026-04": 0.5, "2026-05": 0.5, "2026-06": 0.5, "2026-07": 0.5, "2026-08": 0.5, "2026-09": 0.5, "2026-10": 0.5, "2026-11": 0.5 } }
];

async function initializeDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Connected to the database.');

        // 1. Read and execute DDL
        console.log('Executing DDL script...');
        const ddlPath = path.join(__dirname, '../database/ddl.sql');
        const ddl = await fs.readFile(ddlPath, 'utf-8');
        // Split by semicolon and filter out empty statements
        const ddlStatements = ddl.split(';').filter(query => query.trim() !== '');

        for (const statement of ddlStatements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        console.log('DDL script executed successfully.');

        // 2. Seed Projects
        console.log('Seeding projects...');
        for (const project of INITIAL_PROJECTS) {
            await connection.query('INSERT INTO projects (id, name, code, client, type, order_amount, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                project.id, project.name, project.code, project.client, project.type, project.orderAmount, project.startDate, project.endDate, project.status
            ]);
        }
        console.log('Projects seeded successfully.');

        // 3. Seed Members and Skills
        console.log('Seeding members and skills...');
        for (const member of INITIAL_MEMBERS) {
            await connection.query('INSERT INTO members (id, name, position, join_date, note) VALUES (?, ?, ?, ?, ?)', [
                member.id, member.name, member.position, member.joinDate, member.note
            ]);
            for (const skill of member.skills) {
                await connection.query('INSERT INTO member_skills (member_id, skill_name) VALUES (?, ?)', [
                    member.id, skill
                ]);
            }
        }
        console.log('Members and skills seeded successfully.');

        // 4. Seed Assignments
        console.log('Seeding assignments...');
        for (const assignment of INITIAL_ASSIGNMENTS) {
            await connection.query('INSERT INTO assignments (id, project_id, member_id, member_name, role, start_date, end_date, input_ratio, monthly_weights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                assignment.id, assignment.projectId, assignment.memberId, assignment.memberName, assignment.role, assignment.startDate, assignment.endDate, assignment.inputRatio, JSON.stringify(assignment.monthlyWeights)
            ]);
        }
        console.log('Assignments seeded successfully.');

        console.log('Database initialization complete!');

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        if (connection) {
            connection.release();
        }
        await pool.end();
    }
}

initializeDatabase();
