import request from 'supertest';
import app from '../index';
import pool from '../database/db';

describe('Projects API', () => {

  // Close the database connection after all tests
  afterAll(async () => {
    await pool.end();
  });

  it('should fetch all projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should create a new project', async () => {
    const newProject = {
      name: 'Test Project',
      code: 'TEST-2026',
      client: 'Test Client',
      type: 'External',
      order_amount: 100000,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      status: 'Planning'
    };
    const res = await request(app)
      .post('/api/projects')
      .send(newProject);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe(newProject.name);
  });

  it('should fetch a single project by id', async () => {
    const res = await request(app).get('/api/projects/p1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toBe('p1');
  });

  it('should update a project', async () => {
    const updatedData = { name: 'Updated Project Name' };
    const res = await request(app)
      .put('/api/projects/p1')
      .send(updatedData);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe(updatedData.name);
  });

  it('should delete a project', async () => {
    // First, create a project to delete
    const projectToCreate = {
      name: 'To Be Deleted',
      code: 'DEL-2026',
      client: 'Delete Client',
      type: 'Other',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      status: 'Planning'
    };
    const createRes = await request(app).post('/api/projects').send(projectToCreate);
    const newProjectId = createRes.body.id;

    // Now delete it
    const deleteRes = await request(app).delete(`/api/projects/${newProjectId}`);
    expect(deleteRes.statusCode).toEqual(204);

    // Verify it's gone
    const getRes = await request(app).get(`/api/projects/${newProjectId}`);
    expect(getRes.statusCode).toEqual(404);
  });
});
