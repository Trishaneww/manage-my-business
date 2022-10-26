-- inserting values as placeholders
INSERT INTO department
  (name)
VALUES
  ('Data'),
  ('Medecine'),
  ('Banking'),
  ('Legal');


INSERT INTO role
  (title, salary, department_id)
VALUES
  ('Data Scientist', 102000, 1),
  ('Radiologist', 627000, 2),
  ('Banker', 73000, 3),
  ('Attorney', 213500, 4);

INSERT INTO employee
  (first_name, last_name, role_id, manager_id)
VALUES
  ('Laura', 'Harden', 1, 1),
  ('Karl', 'Towns', 3, 3),
  ('Jose', 'Alverado', 5, 4),
  ('Chris', 'Boucher', 6, 4);