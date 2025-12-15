 function validateName() {
            const nameInput = document.getElementById("name");
            const error = document.getElementById("name-error");

            if (nameInput.value.length < 3) {
                error.textContent = "Name is Incorrect";
            } else {
                error.textContent = "";
            }
        }

        function updateSalary() {
            const salary = document.getElementById("salary").value;
            document.getElementById("salary-value").textContent = salary;
        }