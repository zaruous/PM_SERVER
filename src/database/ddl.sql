/* ==========================================================================
   PMO Suite - PostgreSQL DDL
   ========================================================================== */

DROP TABLE IF EXISTS member_skills CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS position_levels CASCADE;


-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- 1. Position Levels Table
CREATE TABLE position_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT NOT NULL
);


-- 2. Projects Table
CREATE TABLE projects (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    client          VARCHAR(100),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('External', 'Internal', 'Other')),
    order_amount    DECIMAL(18, 2) DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    status          VARCHAR(20) DEFAULT 'Planning' CHECK (status IN ('Planning', 'Active', 'Completed', 'On Hold')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 3. Members Table
CREATE TABLE members (
    id              VARCHAR(50) PRIMARY KEY, -- Employee Number
    name            VARCHAR(100) NOT NULL,
    position        VARCHAR(50),
    join_date       DATE,
    note            TEXT,
    deleteYn        SMALLINT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Member Skills Table
CREATE TABLE member_skills (
    member_id       VARCHAR(50) NOT NULL,
    skill_name      VARCHAR(100) NOT NULL,
    PRIMARY KEY (member_id, skill_name),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 5. Assignments Table
CREATE TABLE assignments (
    id              VARCHAR(50) PRIMARY KEY,
    project_id      VARCHAR(50) NOT NULL,
    member_id       VARCHAR(50) NOT NULL,
    member_name     VARCHAR(100),
    role            VARCHAR(20),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    input_ratio     DECIMAL(3, 2) DEFAULT 1.0,
    monthly_weights JSON,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);


CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
