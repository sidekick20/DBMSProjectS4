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
        let status = document.getElementById("statusFilter").value;
        if (status === "All") status = "";
        const sort = document.getElementById("sort").value;

        const res = await fetch(
            `/applications?search=${search}&status=${status}&sort=${sort}`
        );

        if (!res.ok) throw new Error("Failed to fetch applications");

        const data = await res.json();

        const table = document.getElementById("tableBody");
        table.innerHTML = "";

        data.forEach(app => {
            table.innerHTML += `
        <tr>
          <td>${app.company_name}</td>
          <td>${app.role}</td>
          <td>
          <span class="status ${app.status.toLowerCase()}">
           ${app.status}
         </span>
         </td>
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

        // Calculate and update statistics
        const allRes = await fetch("/applications");
        const allData = await allRes.json();
        
        const total = allData.length;
        const applied = allData.filter(app => app.status === "Applied").length;
        const interview = allData.filter(app => app.status === "Interview").length;
        const offer = allData.filter(app => app.status === "Offer").length;

        document.getElementById("total").textContent = total;
        document.getElementById("applied").textContent = applied;
        document.getElementById("interview").textContent = interview;
        document.getElementById("offer").textContent = offer;

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const response = await res.json();

        if (!res.ok) {
            throw new Error(response.error || "Failed to add application");
        }

        document.getElementById("applicationForm").reset();
        showMessage("Application added successfully.", "success");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        loadData();
    } catch (err) {
        showMessage(err.message || "Error adding application.", "error");
    }
}

async function deleteApp(id) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    try {
        const res = await fetch(`/applications/${id}`, {
            method: "DELETE"
        });
        
        if (!res.ok) throw new Error("Failed to delete application");
        
        showMessage("Application deleted successfully.", "success");
        loadData();
    } catch (err) {
        showMessage(err.message || "Error deleting application.", "error");
    }
}

async function updateStatus(id) {
    const newStatus = prompt("Enter new status:", "Interview");
    if (!newStatus) return;

    try {
        const res = await fetch(`/applications/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: newStatus
            })
        });

        if (!res.ok) throw new Error("Failed to update status");

        showMessage("Status updated successfully.", "success");
        loadData();
    } catch (err) {
        showMessage(err.message || "Error updating status.", "error");
    }
}

document.getElementById("applicationForm").addEventListener("submit", submitForm);
window.addEventListener("load", loadData);