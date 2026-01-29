import fs from 'fs/promises';
import path from 'path';
import { Client } from 'pg';
import pool from '../database/db';
import dotenv from 'dotenv';

dotenv.config();

const INITIAL_POSITION_LEVELS = [
    { id:1, name: '프로', sort_order: 5 },
];

const INITIAL_PROJECTS = [
  { id: 'p1', name: 'NextGen Banking System', code: 'NGB-2026', client: 'K-Bank', type: 'External', orderAmount: 5000000000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
  { id: 'p2', name: 'AI Customer Service Bot', code: 'AIC-2026', client: 'Retail Corp', type: 'Internal', orderAmount: 120000000, startDate: '2026-03-01', endDate: '2026-08-31', status: 'Planning' },
  { id: 'p3', name: 'Internal R&D Framework', code: 'RND-001', client: 'In-House', type: 'Other', orderAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
  { id: 'p4', name: 'test', code: 'RND-002', client: 'In-House', type: 'Other', orderAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' }
];

const INITIAL_MEMBERS = [
  { id: 'E26001', name: 'Kim Min-su', joinDate:'2026-01-27', position: '프로', skills: ['React', 'Node', 'AWS'] , note:''},
  { id: 'E26002', name: 'Lee Ji-young', joinDate:'2026-01-27', position: '프로', skills: ['Java', 'Spring', 'Architecture'], note:'' },
  { id: 'E26003', name: 'Park Jun-ho', joinDate:'2026-01-27',position: '프로', skills: ['Python', 'AI', 'TensorFlow'] , note:''},
  { id: 'E26004', name: 'Choi Su-jin', joinDate:'2026-01-27', position: '프로', skills: ['UI/UX', 'Figma', 'CSS'] , note:''},
  { id: 'E26005', name: 'Jung Tae-woo', joinDate:'2026-01-27', position: '프로', skills: ['DevOps', 'Docker', 'K8s'], note:'' },
];

const INITIAL_ASSIGNMENTS = [
  { id: 'a1', projectId: 'p1', memberId: 'E26001', memberName: 'Kim Min-su', role: 'PM', startDate: '2026-01-01', endDate: '2026-12-31', inputRatio: 1.0, monthlyWeights: { "2026-01": 1, "2026-02": 1, "2026-03": 1, "2026-04": 1, "2026-05": 1, "2026-06": 1, "2026-07": 1, "2026-08": 1, "2026-09": 1, "2026-10": 1, "2026-11": 1, "2026-12": 1 } },
  { id: 'a2', projectId: 'p1', memberId: 'E26002', memberName: 'Lee Ji-young', role: 'PL', startDate: '2026-01-01', endDate: '2026-12-31', inputRatio: 1.0, monthlyWeights: { "2026-01": 1, "2026-02": 1, "2026-03": 1, "2026-04": 1, "2026-05": 1, "2026-06": 1, "2026-07": 1, "2026-08": 1, "2026-09": 1, "2026-10": 1, "2026-11": 1, "2026-12": 1 } },
  { id: 'a3', projectId: 'p3', memberId: 'E26005', memberName: 'Jung Tae-woo', role: 'TA', startDate: '2026-02-01', endDate: '2026-11-30', inputRatio: 0.5, monthlyWeights: { "2026-02": 0.5, "2026-03": 0.5, "2026-04": 0.5, "2026-05": 0.5, "2026-06": 0.5, "2026-07": 0.5, "2026-08": 0.5, "2026-09": 0.5, "2026-10": 0.5, "2026-11": 0.5 } }
];

async function initializeDatabase() {
    const dbName = process.env.DB_DATABASE;
    const clientConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres', // Connect to the default database to check for existence
        ssl: false,
    };

    const client = new Client(clientConfig);
    try {
        console.log('Connecting to postgres database to check for existence...');
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (res.rowCount === 0) {
            console.log(`Database '${dbName}' not found. Creating it...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
    } catch (error) {
        console.error('Error checking or creating database:', error);
    } finally {
        console.log('Closing connection to postgres database.');
        await client.end();
    }

    let connection;
    try {
        console.log(`Connecting to '${dbName}' database...`);
        connection = await pool.connect();
        console.log('Connected to the database.');

        // 1. Read and execute DDL
        console.log('Executing DDL script...');
        const ddlPath = path.join(__dirname, '../database/ddl.sql');
        const ddl = await fs.readFile(ddlPath, 'utf-8');
        await connection.query(ddl);
        console.log('DDL script executed successfully.');

        // 2. Seed Position Levels
        console.log('Seeding position levels...');
        for (const level of INITIAL_POSITION_LEVELS) {
            await connection.query('INSERT INTO position_levels (name, sort_order) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [
                level.name, level.sort_order
            ]);
        }
        console.log('Position levels seeded successfully.');

        // 3. Seed Projects
        console.log('Seeding projects...');
        for (const project of INITIAL_PROJECTS) {
            await connection.query('INSERT INTO projects (id, name, code, client, type, order_amount, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
                project.id, project.name, project.code, project.client, project.type, project.orderAmount, project.startDate, project.endDate, project.status
            ]);
        }
        console.log('Projects seeded successfully.');

        // 4. Seed Members and Skills
        console.log('Seeding members and skills...');
        for (const member of INITIAL_MEMBERS) {
            await connection.query('INSERT INTO members (id, name, position, join_date, note) VALUES ($1, $2, $3, $4, $5)', [
                member.id, member.name, member.position, member.joinDate, member.note
            ]);
            for (const skill of member.skills) {
                await connection.query('INSERT INTO member_skills (member_id, skill_name) VALUES ($1, $2)', [
                    member.id, skill
                ]);
            }
        }
        console.log('Members and skills seeded successfully.');

        // 5. Seed Assignments
        console.log('Seeding assignments...');
        for (const assignment of INITIAL_ASSIGNMENTS) {
            await connection.query('INSERT INTO assignments (id, project_id, member_id, member_name, role, start_date, end_date, input_ratio, monthly_weights) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
                assignment.id, assignment.projectId, assignment.memberId, assignment.memberName, assignment.role, assignment.startDate, assignment.endDate, assignment.inputRatio, JSON.stringify(assignment.monthlyWeights)
            ]);
        }
        console.log('Assignments seeded successfully.');

        console.log('Database initialization complete!');

    } catch (error) {
        console.error('Error during DDL execution or seeding:', error);
    } finally {
        if (connection) {
            console.log(`Releasing connection to '${dbName}' database.`);
            connection.release();
        }
        console.log('Closing database pool.');
        await pool.end();
    }
}

initializeDatabase();
