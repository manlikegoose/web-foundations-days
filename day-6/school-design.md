
# School Database Design

## 1. Tables and Their Purpose

### Students

The `students` table stores information about each student. It contains a unique student ID, the student's name, and email address. The student ID is the primary key, while the email address is unique to prevent duplicate student records.

### Courses

The `courses` table stores information about courses offered by the school. It contains a course ID, course name, and description. The course ID is the primary key, and the course name is unique.

### Enrolments

The `enrolments` table records which students have enrolled in which courses. It contains an enrolment ID, the student ID, the course ID, and the student's grade. The student ID and course ID are foreign keys referencing the `students` and `courses` tables.

A unique constraint on the combination of student ID and course ID prevents a student from enrolling in the same course more than once.

## 2. Relationships Between Tables

### One-to-Many Relationships

- **Students to Enrolments:** One student can have many enrolment records, but each enrolment belongs to one student.
- **Courses to Enrolments:** One course can have many enrolment records, but each enrolment belongs to one course.

These relationships are implemented using foreign keys in the `enrolments` table.

### Many-to-Many Relationship

Students and courses have a many-to-many relationship. A student can enrol in several courses, and each course can have several students.

The `enrolments` table acts as a join table between students and courses. It converts the many-to-many relationship into two one-to-many relationships. It is also needed to store information specific to an enrolment, such as the student's grade.

## 3. Recommended Index

I would add an index on `enrolments(course_id)` to improve queries that retrieve students enrolled in a particular course and count enrolments per course. This index can help SQLite locate matching enrolment records more efficiently as the database grows.

Example:

```sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);
```

## 4. SQL or NoSQL?

I would choose a relational SQL database such as SQLite for this school system. Students, courses, and enrolments have clearly defined relationships, and foreign keys help maintain data integrity. SQL also supports joins, grouping, and counting, which are useful for retrieving course lists, calculating enrolment totals, and finding students who have not enrolled. A NoSQL database could work for some versions of this system, but a relational database is a natural fit for structured data with these relationships and constraints.
