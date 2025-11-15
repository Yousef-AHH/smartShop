/* ---------------------------
   USERS SECTION
---------------------------- */

const usersContainer = document.getElementById('usersContainer');

// --- Add User Form ---
const userForm = document.createElement('div');
userForm.style.marginTop = '20px';
userForm.innerHTML = `
  <h3>Create New User</h3>
  <input type="text" placeholder="Name" id="newName" style="margin:5px;">
  <input type="email" placeholder="Email" id="newEmail" style="margin:5px;">
  <input type="password" placeholder="Password" id="newPassword" style="margin:5px;">
  <select id="newRole" style="margin:5px;">
    <option value="customer" selected>Customer</option>
    <option value="admin">Admin</option>
  </select>
  <button id="createUserBtn">Create User</button>
`;
usersContainer.appendChild(userForm);

document.getElementById('createUserBtn').addEventListener('click', () => {
  const name = document.getElementById('newName').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const role = document.getElementById('newRole').value;

  if (name && email && password && role) {
    addUser({ name, email, password, role });
  } else {
    alert('Please fill all fields');
  }
});

function loadUsers() {
  fetch('/users')
    .then(res => res.json())
    .then(users => {
      usersContainer.querySelectorAll('.userSelect, .userDetails, .userDeleteBtn')
        .forEach(el => el.remove());

      // Dropdown
      const select = document.createElement('select');
      select.classList.add('userSelect');

      const defaultOption = document.createElement('option');
      defaultOption.textContent = 'Select a user';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user._id;
        option.textContent = user.name;
        select.appendChild(option);
      });

      usersContainer.insertBefore(select, userForm);

      // Details
      const userDetails = document.createElement('div');
      userDetails.classList.add('userDetails');
      userDetails.style.marginTop = '10px';
      usersContainer.insertBefore(userDetails, userForm);

      select.addEventListener('change', () => {
        const u = users.find(x => x._id === select.value);
        userDetails.innerHTML = `
          <p><strong>ID:</strong> ${u._id}</p>
          <p><strong>Name:</strong> ${u.name}</p>
          <p><strong>Email:</strong> ${u.email}</p>
          <p><strong>Role:</strong> ${u.role}</p>
        `;
      });

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete Selected User';
      deleteBtn.classList.add('userDeleteBtn');
      deleteBtn.style.marginLeft = '10px';
      deleteBtn.addEventListener('click', () => {
        if (select.value) deleteUser(select.value);
      });

      usersContainer.insertBefore(deleteBtn, userForm);
    })
    .catch(err => console.error(err));
}

function deleteUser(id) {
  fetch(`/users/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => loadUsers());
}

function addUser(data) {
  fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById('newName').value = '';
      document.getElementById('newEmail').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('newRole').value = 'customer';
      loadUsers();
    });
}



/* ---------------------------
   CATEGORIES SECTION
---------------------------- */

const categoriesContainer = document.getElementById('categoriesContainer');

// --- Add Category Form ---
const categoryForm = document.createElement('div');
categoryForm.style.marginTop = '20px';
categoryForm.innerHTML = `
  <h3>Create New Category</h3>
  <input type="text" placeholder="Name" id="newCatName" style="margin:5px;">
  <input type="text" placeholder="Description" id="newCatDesc" style="margin:5px;">
  <button id="createCategoryBtn">Create Category</button>
`;
categoriesContainer.appendChild(categoryForm);

document.getElementById('createCategoryBtn').addEventListener('click', () => {
  const name = document.getElementById('newCatName').value.trim();
  const description = document.getElementById('newCatDesc').value.trim();

  if (!name) return alert("Category name is required");

  addCategory({ name, description });
});


function loadCategories() {
  fetch('/categories')
    .then(res => res.json())
    .then(categories => {

      categoriesContainer.querySelectorAll('.catSelect, .catDetails, .catDeleteBtn')
        .forEach(el => el.remove());

      // Dropdown
      const select = document.createElement('select');
      select.classList.add('catSelect');

      const defaultOption = document.createElement('option');
      defaultOption.textContent = 'Select a category';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat._id;
        option.textContent = cat.name;
        select.appendChild(option);
      });

      categoriesContainer.insertBefore(select, categoryForm);

      // Details
      const details = document.createElement('div');
      details.classList.add('catDetails');
      details.style.marginTop = '10px';
      categoriesContainer.insertBefore(details, categoryForm);

      select.addEventListener('change', () => {
        const c = categories.find(x => x._id === select.value);
        details.innerHTML = `
          <p><strong>ID:</strong> ${c._id}</p>
          <p><strong>Name:</strong> ${c.name}</p>
          <p><strong>Description:</strong> ${c.description || 'No description'}</p>
        `;
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete Selected Category';
      deleteBtn.classList.add('catDeleteBtn');
      deleteBtn.style.marginLeft = '10px';
      deleteBtn.addEventListener('click', () => {
        if (select.value) deleteCategory(select.value);
      });

      categoriesContainer.insertBefore(deleteBtn, categoryForm);
    });
}

function deleteCategory(id) {
  fetch(`/categories/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => loadCategories());
}

function addCategory(data) {
  fetch('/categories')
    .then(res => res.json())
    .then(existing => {
      if (existing.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        return alert("Category already exists!");
      }

      fetch('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(() => {
          document.getElementById('newCatName').value = '';
          document.getElementById('newCatDesc').value = '';
          loadCategories();
        });
    });
}



/* ---------------------------
   INITIAL LOAD
---------------------------- */

loadUsers();
loadCategories();
