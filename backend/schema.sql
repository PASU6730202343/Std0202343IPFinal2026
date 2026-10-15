-- Documentation only. On the exam server the table already exists and is seeded.
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
  salary DECIMAL(12,2) NOT NULL
);

INSERT INTO employees (name, position, status, salary) VALUES
  ('Somchai Prasert', 'Junior Developer', 'Active', 18000.00),
  ('Malee Suksan', 'Office Assistant', 'Active', 19500.00),
  ('Anan Boonmee', 'Accountant', 'On Leave', 42000.00),
  ('Preeya Chaiyo', 'Project Manager', 'Active', 47000.00),
  ('Krit Wongsa', 'Senior Engineer', 'Active', 85000.00),
  ('Naree Thongdee', 'Director', 'Active', 120000.00);
