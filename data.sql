\c biztime

DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS connections CASCADE;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('wf', 'Wells Fargo', 'Big bank'),
         ('bofa', 'Bank of America', 'Another big bank'),
         ('toy', 'Toyota', 'Big car company'),
         ('gm', 'General Motors', 'Another big car company');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL
);

INSERT INTO industries (code, industry)
  VALUES ('tech', 'technology'),
         ('fin', 'finance'),
         ('auto', 'automotive'),
         ('mm', 'making money');

CREATE TABLE connections (
  industry_code text NOT NULL REFERENCES industries,
  company_code text NOT NULL REFERENCES companies,
  PRIMARY KEY(industry_code, company_code)
);

INSERT INTO connections (industry_code, company_code)
  VALUES ('tech', 'apple'),
         ('tech', 'ibm'),
         ('fin', 'wf'),
         ('fin', 'bofa'),
         ('auto', 'toy'),
         ('auto', 'gm'),
         ('mm', 'apple'),
         ('mm', 'ibm'),
         ('mm', 'wf'),
         ('mm', 'bofa'),
         ('mm', 'toy'),
         ('mm', 'gm');

