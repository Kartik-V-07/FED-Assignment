// ------------------------------
// EmployeePayrollData Class
// ------------------------------
class EmployeePayrollData {

    id;
    name;
    salary;
    gender;
    startDate;
    department;

    constructor(...params) {
        this.id = params[0];
        this.name = params[1];      // uses setter
        this.salary = params[2];
        this.gender = params[3];
        this.startDate = params[4];
        this.department = params[5];
    }

    get name() {
        return this._name;
    }

    set name(name) {
        let nameRegex = RegExp("^[A-Z]{1}[a-z]{2,}$");
        if (nameRegex.test(name)) {
            this._name = name;
        } else {
            alert("Name is Incorrect! Use capital first letter and at least 3 letters. Example: John");
            throw "Name is Incorrect!";
        }
    }
}


// ------------------------------
// UTIL: read / write employees array
// ------------------------------
function readEmployeesFromStorage() {
    let data = localStorage.getItem("employees");
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveEmployeesToStorage(list) {
    localStorage.setItem("employees", JSON.stringify(list));
}


// =======================================================
// SHOW EMPLOYEES ON index.html
// =======================================================
function loadEmployeeTable() {
    let tableBody = document.querySelector("#employeeTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = ""; // clear

    let employees = readEmployeesFromStorage();

    for (let i = 0; i < employees.length; i++) {
        let emp = employees[i];

        let row = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.textContent = emp.name || "";

        let genderCell = document.createElement("td");
        genderCell.textContent = emp.gender || "";

        let deptCell = document.createElement("td");
        deptCell.textContent = emp.department || "";

        let salaryCell = document.createElement("td");
        salaryCell.textContent = emp.salary ? ("₹ " + emp.salary) : "";

        let dateCell = document.createElement("td");
        dateCell.textContent = emp.startDate || "";

        let actionsCell = document.createElement("td");

        // Edit button
        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.marginRight = "6px";
        editBtn.onclick = (function(id) {
            return function() { editEmployee(id); };
        })(emp.id);

        // Delete button
        let delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = (function(id) {
            return function() { deleteEmployee(id); };
        })(emp.id);

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(delBtn);

        row.appendChild(nameCell);
        row.appendChild(genderCell);
        row.appendChild(deptCell);
        row.appendChild(salaryCell);
        row.appendChild(dateCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    }
}

// run when index.html loads
loadEmployeeTable();


// =======================================================
// DELETE employee
// =======================================================
function deleteEmployee(id) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    let employees = readEmployeesFromStorage();
    let newList = [];

    for (let i = 0; i < employees.length; i++) {
        if (employees[i].id != id) {
            newList.push(employees[i]);
        }
    }

    saveEmployeesToStorage(newList);
    // reload table
    loadEmployeeTable();
}


// =======================================================
// EDIT employee (prepare form)
// =======================================================
function editEmployee(id) {
    // find employee and save to a temporary key 'editEmpId'
    let employees = readEmployeesFromStorage();
    let toEdit = null;
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].id == id) {
            toEdit = employees[i];
            break;
        }
    }
    if (!toEdit) return;

    // Save the object to localStorage under 'editEmp'
    localStorage.setItem("editEmp", JSON.stringify(toEdit));

    // go to form page
    window.location.href = "form.html";
}


// =======================================================
// FORM HANDLING (form.html)
// - prefill if editing
// - save new or update existing
// =======================================================
(function setupForm() {
    let form = document.getElementById("payrollForm");
    if (!form) return; // not on form.html

    let formTitle = document.getElementById("formTitle");
    let submitBtn = document.getElementById("submitBtn");
    let empIdInput = document.getElementById("empId");

    // check if editEmp exists
    let editDataRaw = localStorage.getItem("editEmp");
    let isEdit = false;
    let editObj = null;

    if (editDataRaw) {
        try {
            editObj = JSON.parse(editDataRaw);
            isEdit = true;
        } catch (e) {
            isEdit = false;
        }
    }

    if (isEdit && editObj) {
        // prefill fields
        empIdInput.value = editObj.id || "";
        document.getElementById("name").value = editObj.name || "";

        // gender
        if (editObj.gender) {
            let genderInputs = document.querySelectorAll("input[name='gender']");
            for (let i = 0; i < genderInputs.length; i++) {
                if (genderInputs[i].value === editObj.gender) {
                    genderInputs[i].checked = true;
                } else {
                    genderInputs[i].checked = false;
                }
            }
        }

        // departments (string -> array)
        let depts = [];
        if (editObj.department) {
            // stored as "HR,Sales" or maybe just "HR"
            depts = editObj.department.split(",").map(function(s){ return s.trim(); });
        }

        let checkboxInputs = document.querySelectorAll("input[type='checkbox']");
        for (let i = 0; i < checkboxInputs.length; i++) {
            checkboxInputs[i].checked = depts.indexOf(checkboxInputs[i].value) !== -1;
        }

        // salary
        document.getElementById("salary").value = editObj.salary || document.getElementById("salary").value;
        // start date
        document.getElementById("startDate").value = editObj.startDate || "";

        // update UI
        formTitle.textContent = "Edit Employee";
        submitBtn.textContent = "Update";
    }

    // Cancel function used by Cancel button
    window.cancelAndBack = function() {
        // clear editEmp so future visits aren't in edit mode
        localStorage.removeItem("editEmp");
        window.location.href = "index.html";
    };

    // handle submit
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let nameInput = document.getElementById("name").value.trim();
        let salary = document.getElementById("salary").value;
        let startDate = document.getElementById("startDate").value;

        let genderInput = document.querySelector("input[name='gender']:checked");
        let gender = genderInput ? genderInput.value : "";

        // collect departments
        let deptList = [];
        let checkboxes = document.querySelectorAll("input[type='checkbox']:checked");
        for (let i = 0; i < checkboxes.length; i++) {
            deptList.push(checkboxes[i].value);
        }
        let deptString = deptList.toString();

        // Validate name BEFORE creating class instance
        let nameRegex = RegExp("^[A-Z]{1}[a-z]{2,}$");
        if (!nameRegex.test(nameInput)) {
            alert("Name is Incorrect! Use capital first letter and at least 3 letters. Example: John");
            return;
        }

        // create ID: for edit use existing id, for new generate
        let idValue = empIdInput.value;
        let id = idValue ? idValue : new Date().getTime();

        // create employee object using class
        let employee;
        try {
            employee = new EmployeePayrollData(id, nameInput, salary, gender, startDate, deptString);
        } catch (error) {
            return;
        }

        // load list and either update or add
        let employees = readEmployeesFromStorage();
        if (isEdit && editObj) {
            // find index and replace
            for (let i = 0; i < employees.length; i++) {
                if (employees[i].id == id) {
                    employees[i] = {
                        id: employee.id,
                        name: nameInput,
                        salary: employee.salary,
                        gender: employee.gender,
                        startDate: employee.startDate,
                        department: employee.department
                    };
                    break;
                }
            }
            // remove the edit key
            localStorage.removeItem("editEmp");
        } else {
            // push new
            employees.push({
                id: employee.id,
                name: nameInput,
                salary: employee.salary,
                gender: employee.gender,
                startDate: employee.startDate,
                department: employee.department
            });
        }

        saveEmployeesToStorage(employees);

        // go back to index
        window.location.href = "index.html";
    });
})();
