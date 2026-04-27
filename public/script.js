const messageEl = document.getElementById("message");

async function showMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.className = type;
  setTimeout(() => {
    messageEl.textContent = "";
    messageEl.className = "";
  }, 3000);
}

async function loadData() {
  try {
    const search = document.getElementById("search").value;
    const status = document.getElementById("statusFilter").value;
    const sort = document.getElementById("sort").value;

    const res = await fetch(
      `/applications?search=${search}&status=${status}&sort=${sort}`
    );

    const data = await res.json();

    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    data.forEach(app => {
      table.innerHTML += `
        <tr>
          <td>${app.company_name}</td>
          <td>${app.role}</td>
          <td>${app.status}</td>
          <td>${app.salary || "-"}</td>
          <td>${app.contact_name || "-"}<br>${app.contact_number || ""}</td>
          <td>${new Date(app.applied_date).toLocaleDateString()}</td>
          <td>
            <button onclick="deleteApp(${app.id})">Delete</button>
            <button onclick="updateStatus(${app.id})">Update</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    showMessage("Unable to load applications.", "error");
  }
}

async function submitForm(event) {
  event.preventDefault();

  const formData = {
    company_name: document.getElementById("company_name").value,
    role: document.getElementById("role").value,
    status: document.getElementById("status").value,
    salary: document.getElementById("salary").value,
    contact_name: document.getElementById("contact_name").value,
    contact_number: document.getElementById("contact_number").value
  };

  try {
    const res = await fetch("/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!res.ok) throw new Error("Failed to add application");

    document.getElementById("applicationForm").reset();
    showMessage("Application added successfully.", "success");
    loadData();
  } catch (err) {
    showMessage(err.message || "Error adding application.", "error");
  }
}

async function deleteApp(id) {
  await fetch(`/applications/${id}`, { method: "DELETE" });
  loadData();
}

async function updateStatus(id) {
  const newStatus = prompt("Enter new status:", "Interview");
  if (!newStatus) return;

  await fetch(`/applications/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  });
  loadData();
}

document.getElementById("applicationForm").addEventListener("submit", submitForm);
window.addEventListener("load", loadData);
