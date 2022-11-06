const inquirer = require('inquirer')
const db = require('./config/connection')
require('console.table')

// connecting db to server after it starts
db.connect(err => {
  if (err) throw err
  console.log('You are now connected to the database!')
  console.log('Welcome to all employee tracker!')
  all_employees()
})

//prompt employee inquirer function
let all_employees = function () {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'prompt',
        message: 'What would you like to do?',
        choices: [
          'View All Department',
          'View All Roles',
          'View All Employees',
          'Add A Department',
          'Add A Role',
          'Add An Employee',
          'Update An Employee Role',
          'Quit'
        ]
      }
    ])
    .then(answers => {
      // views the database of department
      if (answers.prompt === 'View All Department') {
        querySelectTable('department')
      } else if (answers.prompt === 'View All Roles') {
        querySelectTable('role')
      } else if (answers.prompt === 'View All Employees') {
        querySelectTable('employee')
      } else if (answers.prompt === 'Add A Department') {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'department',
              message: 'Department name?'
            }
          ])
          .then(answers => {
            db.query(
              `INSERT INTO department (name) VALUES ('${answers.department}')`,
              (err, result) => {
                if (err) throw err
                console.log(`Department ${answers.department} has been added.`)
                all_employees()
              }
            )
          })
      } else if (answers.prompt === 'Add A Role') {
        //grabs the department of choice and roles aswell as the salary input
        db.query(`SELECT * FROM department`, (err, result) => {
          if (err) throw err

          inquirer
            .prompt([
              {
                // Adding A Role
                type: 'input',
                name: 'role',
                message: 'Choose a role.'
              },
              {
                // Adding the Salary
                type: 'input',
                name: 'salary',
                message: 'What is the salary?'
              },
              {
                // Department
                type: 'list',
                name: 'department',
                message: 'Pick a department.',
                choices: () => result.map(department => department.name)
              }
            ])
            .then(answers => {
              let department = result.find(r => r.name === answers.department)

              db.query(
                `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
                [answers.role, answers.salary, department.id],
                (err, result) => {
                  if (err) throw err
                  console.log(`${answers.role} has been added.`)
                  all_employees()
                }
              )
            })
        })
      } else if (answers.prompt === 'Add An Employee') {
        // joins the selected sections together
        db.query(
          `SELECT employee.id as employeeId, employee.* , role.id as roleId, role.*
                  FROM employee
                  RIGHT JOIN role
                  ON employee.role_id = role.id;`,
          (err, result) => {
            if (err) throw err

            inquirer
              .prompt([
                {
                  type: 'input',
                  name: 'firstName',
                  message: 'First name of employee?',
                  validate: firstNameInput => {
                    if (firstNameInput) {
                      return true
                    } else {
                      console.log('Please enter a first name')
                      return false
                    }
                  }
                },
                {
                  type: 'input',
                  name: 'lastName',
                  message: 'Last name of employee?',
                  validate: lastNameInput => {
                    if (lastNameInput) {
                      return true
                    } else {
                      console.log('Please enter a last name')
                      return false
                    }
                  }
                },
                {
                  // add the role of the employee
                  type: 'list',
                  name: 'role',
                  message: 'Role of employee?',
                  choices: () => {
                    let allRoles = []
                    for (let i = 0; i < result.length; i++) {
                      // if array doesn't include the role
                      if (!allRoles.includes(result[i].title)) {
                        allRoles.push(result[i].title)
                      }
                    }
                    return allRoles
                  }
                },
                {
                  // can choose to add an employee manager if not returns null
                  type: 'list',
                  name: 'manager',
                  message: 'Choose your manager',
                  choices: () => {
                    let managers = []
                    for (let i = 0; i < result.length; i++) {
                      let managerName =
                        result[i].first_name + ' ' + result[i].last_name
                      if (
                        result[i].first_name !== null &&
                        !managers.includes(managerName)
                      ) {
                        managers.push(managerName)
                      }
                    }

                    managers.push('None')
                    return managers
                  }
                }
              ])
              .then(answers => {
                let role = result.find(r => r.title === answers.role)
                let manager = result.find(
                  r => r.first_name + ' ' + r.last_name === answers.manager
                )
                let managerId = manager ? manager.employeeId : undefined
                db.query(
                  `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
                  [answers.firstName, answers.lastName, role.roleId, managerId],
                  (err, result) => {
                    if (err) throw err
                    console.log(
                      `Added ${answers.firstName} ${answers.lastName} to the database.`
                    )
                    all_employees()
                  }
                )
              })
          }
        )
      } else if (answers.prompt === 'Update An Employee Role') {
        db.query(
          `SELECT employee.id as employeeId, employee.* , role.id as roleId, role.*
                  FROM employee
                  JOIN role
                  ON employee.role_id = role.id;`,
          (err, result) => {
            if (err) throw err

            inquirer
              .prompt([
                {
                  // this section updates an employee
                  type: 'list',
                  name: 'employee',
                  message: 'Which employees role do you want to update?',
                  choices: () => {
                    let employees = []
                    for (let i = 0; i < result.length; i++) {
                      if (!employees.includes(result[i].last_name)) {
                        employees.push(result[i].last_name)
                      }
                    }
                    return employees
                  }
                },
                {
                  // updates the new role
                  type: 'list',
                  name: 'role',
                  message: 'What is their new role?',
                  choices: () => {
                    let roles = []
                    for (let i = 0; i < result.length; i++) {
                      if (!roles.includes(result[i].title)) {
                        roles.push(result[i].title)
                      }
                    }
                    return roles
                  }
                }
              ])
              .then(answers => {
                let employeeToUpdate = result.find(
                  r => r.last_name === answers.employee
                )
                let newRole = result.find(
                  r => r.title === answers.role
                )

                db.query(
                  `UPDATE employee SET role_id = ${newRole.roleId} WHERE last_name = '${employeeToUpdate.last_name}'`,
                  (err, result) => {
                    if (err) throw err
                    console.log(
                      `Updated ${answers.employee} role to the database.`
                    )
                    all_employees()
                  }
                )
              })
          }
        )
        //ends the database
      } else if (answers.prompt === 'Quit') {
        db.end()
        console.log('See you next time!')
      }
    })
}

// this calls the function again
querySelectTable = tableName => {
  db.query(`SELECT * FROM ${tableName}`, (err, result) => {
    if (err) throw err
    console.table(result)
    all_employees()
  })
}
