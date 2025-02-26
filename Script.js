// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDODWUQrK9_C94_8apkPfKph7dH0T-VWzQ",
  authDomain: "price-sell-new.firebaseapp.com",
  projectId: "price-sell-new",
  storageBucket: "price-sell-new.firebasestorage.app",
  messagingSenderId: "97719764820",
  appId: "1:97719764820:web:7c83afecac08968cc1aac1",
  measurementId: "G-D27Q6TTH8K"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Initialize auth object

// Fetch items from backend
async function fetchItems() {
  try {
    const response = await fetch('http://localhost:5000/api/items');
    const items = await response.json();
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = items
      .map(
        (item) => `
        <tr>
          <td><img src="${item.imageUrl}" alt="${item.name}" width="50"></td>
          <td>${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>
            <button onclick="editItem('${item._id}')">Edit</button>
            <button onclick="deleteItem('${item._id}')">Delete</button>
          </td>
        </tr>
      `
      )
      .join('');
  } catch (error) {
    console.error('Failed to fetch items:', error);
  }
}

// Add item
async function addItem() {
  const name = document.getElementById('itemName').value;
  const price = parseFloat(document.getElementById('itemPrice').value);
  const image = document.getElementById('itemImage').files[0];

  if (!name || !price || !image) {
    alert('Please fill out all fields.');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  formData.append('image', image);

  try {
    const response = await fetch('http://localhost:5000/api/items', {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      fetchItems(); // Refresh the list
      alert('Item added successfully!');
    } else {
      alert('Failed to add item.');
    }
  } catch (error) {
    console.error('Error adding item:', error);
  }
}

// Edit item
async function editItem(id) {
  const newPrice = prompt('Enter new price:');
  if (newPrice) {
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(newPrice) }),
      });
      if (response.ok) {
        fetchItems(); // Refresh the list
        alert('Item updated successfully!');
      } else {
        alert('Failed to update item.');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }
}

// Delete item
async function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchItems(); // Refresh the list
        alert('Item deleted successfully!');
      } else {
        alert('Failed to delete item.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }
}

// Export to PDF
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.autoTable({ html: '#price-list-table' });
  doc.save('price-list.pdf');
}

// Export to Excel
async function exportToExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Price List');
  const headers = [];
  document.querySelectorAll('#price-list-table th').forEach((header) => {
    headers.push(header.innerText);
  });
  worksheet.addRow(headers);
  document.querySelectorAll('#price-list-table tbody tr').forEach((row) => {
    const rowData = [];
    row.querySelectorAll('td').forEach((cell) => {
      rowData.push(cell.innerText);
    });
    worksheet.addRow(rowData);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'price-list.xlsx';
  link.click();
}

// Firebase login
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please enter email and password.');
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    alert('Login successful!');
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

// Firebase signup
async function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please enter email and password.');
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    alert('Signup successful!');
  } catch (error) {
    alert('Signup failed: ' + error.message);
  }
}

// Load items on page load
fetchItems();
