DROP DATABASE IF EXISTS employee_trackerDB;
CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;


CREATE TABLE department (

id   int NOT NULL AUTO_INCREMENT,
name varchar(30) NOT NULL,

PRIMARY KEY (id)
);

CREATE TABLE role (

id            int NOT NULL AUTO_INCREMENT,
title         varchar(30) NOT NULL,
salary        decimal NOT NULL,
department_id int NOT NULL,

PRIMARY KEY (id),
FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (

 id         int NOT NULL AUTO_INCREMENT,
 first_name varchar(30) NOT NULL,
 last_name  varchar(30) NOT NULL,
 manager_id int NULL,
 role_id    int NOT NULL,

PRIMARY KEY (id),
/* FOREIGN KEY (manager_id) REFERENCES employee(id), */
FOREIGN KEY (role_id) REFERENCES role(id)
);

/* Table is referencing itself so values have to be inserted separately -- however mysql workbench throws error if inserting into individual columns */
