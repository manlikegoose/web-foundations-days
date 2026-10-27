
PRAGMA foreign_keys = ON;

-- Drop existing tables so the script can be run again.
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- 1. Students table
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Courses table
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 3. Enrolments table
CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,

    FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    FOREIGN KEY (course_id)
        REFERENCES courses(course_id),

    UNIQUE (student_id, course_id)
);

-- Sample students: 4 students, including one with no enrolments.
INSERT INTO students (student_id, name, email) VALUES
    (1, 'Susan Chepkorir', 'chepkorirsusy@gmail.com'),
    (2, 'Adrian omenta', 'addieomenta@gmail.com'),
    (3, 'Carol Wanjiku', 'carolwanjiku@gmail.com'),
    (4, 'David Kiptoo', 'davikiptoo@gmail.com');

-- Sample courses: 3 courses.
INSERT INTO courses (course_id, course_name, description) VALUES
    (1, 'Database Systems', 'Introduction to relational databases'),
    (2, 'Web Development', 'Building websites and web applications'),
    (3, 'Computer Networks', 'Networking fundamentals');

-- Sample enrolments: 5 enrolments.
INSERT INTO enrolments
    (enrolment_id, student_id, course_id, grade)
VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 1, 'B'),
    (4, 2, 3, 'A'),
    (5, 3, 2, 'A');

-- QUERY 1: All courses taken by one student (Alice Kamau).
SELECT
    s.name AS student_name,
    c.course_name,
    e.grade
FROM students AS s
JOIN enrolments AS e
    ON s.student_id = e.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE s.name = 'Susan Chepkorir';

-- QUERY 2: All students enrolled in Database Systems.
SELECT
    s.name AS student_name,
    s.email
FROM students AS s
JOIN enrolments AS e
    ON s.student_id = e.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE c.course_name = 'Database Systems';

-- QUERY 3: Number of students enrolled in each course,
-- including courses with zero enrolments.
SELECT
    c.course_name,
    COUNT(e.student_id) AS number_of_students
FROM courses AS c
LEFT JOIN enrolments AS e
    ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_id;

-- QUERY 4: Students who have no enrolments.
SELECT
    s.student_id,
    s.name,
    s.email
FROM students AS s
LEFT JOIN enrolments AS e
    ON s.student_id = e.student_id
WHERE e.enrolment_id IS NULL;

-- QUERY 5: Update one enrolment's grade.
UPDATE enrolments
SET grade = 'A'
WHERE enrolment_id = 2;
