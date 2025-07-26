CREATE TYPE user_role AS ENUM ('TEACHER', 'STUDENT');

CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');

CREATE TYPE material_type AS ENUM ('pdf', 'docx', 'youtube');

CREATE TYPE quiz_type AS ENUM ('PRETEST', 'POSTTEST');

-- One trigger function to set updated_at on any table
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id                   TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  email                TEXT        NOT NULL UNIQUE,
  name                 TEXT        NOT NULL,
  password             TEXT        NOT NULL,
  gender               gender      NOT NULL,
  role                 user_role   NOT NULL,
  phone                TEXT,
  address              TEXT,
  is_profile_complete  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE classes (
  id                            TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                          TEXT        NOT NULL,
  class_code                    TEXT        NOT NULL UNIQUE,
  teacher_id                    TEXT        NOT NULL,
  posttest_uses_pretest_questions BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER classes_set_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE student_enrollments (
  id             TEXT    PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id       TEXT    NOT NULL,
  student_id     TEXT    NOT NULL,
  group_number   INTEGER,
  pretest_score  REAL,
  posttest_score REAL,
  FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id)  ON DELETE CASCADE,
  UNIQUE (class_id, student_id)
);

CREATE TABLE materials (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   TEXT        NOT NULL,
  type       material_type NOT NULL,
  title      TEXT        NOT NULL,
  url        TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TRIGGER materials_set_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE quizzes (
  id                   TEXT      PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT      NOT NULL,
  time_limit_minutes   INTEGER   NOT NULL,
  type                 quiz_type NOT NULL,
  class_id_pretest     TEXT      UNIQUE,
  class_id_posttest    TEXT      UNIQUE,
  FOREIGN KEY (class_id_pretest ) REFERENCES classes(id),
  FOREIGN KEY (class_id_posttest) REFERENCES classes(id)
);


CREATE TABLE questions (
  id                   TEXT    PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id              TEXT    NOT NULL,
  text                 TEXT    NOT NULL,
  options              TEXT[]  NOT NULL,
  correct_answer_index INTEGER NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_submissions (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      TEXT        NOT NULL,
  student_id   TEXT        NOT NULL,
  score        REAL        NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (quiz_id)    REFERENCES quizzes(id)   ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id)     ON DELETE CASCADE
);

CREATE TABLE group_notes (
  id        TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id  TEXT        NOT NULL,
  group_id  INTEGER     NOT NULL,
  content   TEXT        NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE (class_id, group_id)
);

CREATE TRIGGER group_notes_set_updated_at
  BEFORE UPDATE ON group_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  CREATE TABLE chat_messages (
  id        TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id  TEXT        NOT NULL,
  group_id  INTEGER,
  sender_id TEXT        NOT NULL,
  text      TEXT        NOT NULL,
  is_ai     BOOLEAN     NOT NULL DEFAULT FALSE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

