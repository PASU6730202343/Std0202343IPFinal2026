-- Documentation only. On the exam server the table already exists and is seeded.
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
  salary DECIMAL(12,2) NOT NULL
);

INSERT INTO employees (name, position, status, salary) VALUES
  ('John Doe', 'Software Engineer', 'Active', 45000.00),
  ('Jane Smith', 'Designer', 'Active', 38000.00),
  ('Mike Brown', 'Intern', 'On Leave', 15000.00),
  ('Sara Lee', 'Manager', 'Active', 85000.00),
  ('Tom Hill', 'QA Tester', 'Active', 22000.00);
