const inventoryContainer  = document.getElementById('inventoryContainer');

/* ---------------------- Create Inventory Form ---------------------- */
const inventoryForm = document.createElement('div');
inventoryForm.style.marginTop = '20px';
inventoryForm.innerHTML = `
  <h3>Create Inventory Record</h3>
  <select id="newInventoryProduct" style="margin:5px;"></select>
  <input type="number" placeholder="Quantity In Stock" id="newInventoryQty" style="margin:5px;" min="0">
  <input type="text" placeholder="Supplier" id="newInventorySupplier" style="margin:5px;">
  <button id="createInventoryBtn">Create Inventory Record</button>
`;
inventoryContainer.appendChild(inventoryForm);

/* ---------------------- Load Products ---------------------- */
async function loadProductDropdown() {
  const res = await fetch('/products');
  const products = await res.json();
  currentProducts = products;
  const Select = document.getElementById('newInventoryProduct');
  Select.innerHTML = '<option disabled selected>Select Product</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p._id;
    opt.textContent = `${p.name} (Stock: ${p.stock})`;
    Select.appendChild(opt);
  });
}

/* ---------------------- Quantity Check ---------------------- */
const Input = document.getElementById('newInventoryQty');
const Select = document.getElementById('newInventoryProduct');

Input.addEventListener('input', () => {
  const productId = Select.value;
  if (!productId) return;

  const product = currentProducts.find(p => p._id === productId);
  const qty = parseInt(Input.value);

  if (qty > product.stock) {
    alert(`Quantity cannot exceed product stock (${product.stock})`);
    Input.value = product.stock;
  } else if (qty < 0) {
    Input.value = 0;
  }
});

/* ---------------------- Create Inventory ---------------------- */
document.getElementById('createInventoryBtn').addEventListener('click', async () => {
  const productId = Select.value;
  const quantity = parseInt(Input.value);
  const supplier = document.getElementById('newInventorySupplier').value.trim();

  if (!productId || isNaN(quantity)) {
    return alert('Please select product and enter quantity');
  }

  const totalInventoryRes = await fetch('/inventories');
  const existingInventory = await totalInventoryRes.json();
  if (existingInventory.some(i => i.product === productId)) {
    return alert('Inventory for this product already exists!');
  }

  fetch('/inventories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product: productId, quantityInStock: quantity, supplier })
  })
    .then(res => res.json())
    .then(() => {
      Input.value = '';
      document.getElementById('newInventorySupplier').value = '';
      loadInventory();
      loadProductDropdown();
    });
});

/* ---------------------- Load Inventory ---------------------- */
function loadInventory() {
  fetch('/inventories')
    .then(res => res.json())
    .then(inventories => {
      inventoryContainer.querySelectorAll('select.inventorySelect, div.inventoryDetails, button.deleteBtn').forEach(el => el.remove());

      // Dropdown
      const select = document.createElement('select');
      select.classList.add('inventorySelect');
      const defaultOption = document.createElement('option');
      defaultOption.textContent = 'Select Inventory';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      inventories.forEach(inv => {
        const opt = document.createElement('option');
        opt.value = inv._id;
        opt.textContent = inv.product?.name || inv.product;
        select.appendChild(opt);
      });

      inventoryContainer.insertBefore(select, inventoryForm);

      // Details
      const details = document.createElement('div');
      details.classList.add('inventoryDetails');
      details.style.marginTop = '10px';
      inventoryContainer.insertBefore(details, inventoryForm);

      select.addEventListener('change', () => {
        const inv = inventories.find(i => i._id === select.value);
        if (inv) {
          details.innerHTML = `
            <p><strong>ID:</strong> ${inv._id}</p>
            <p><strong>Product:</strong> ${inv.product?.name || inv.product}</p>
            <p><strong>Quantity In Stock:</strong> ${inv.quantityInStock}</p>
            <p><strong>Supplier:</strong> ${inv.supplier || "N/A"}</p>
            <p><strong>Last Restocked:</strong> ${new Date(inv.lastRestocked).toLocaleString()}</p>
          `;
        }
      });

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete Selected Inventory';
      deleteBtn.classList.add('deleteBtn');
      deleteBtn.style.marginLeft = '10px';
      deleteBtn.addEventListener('click', () => {
        if (select.value) deleteInventory(select.value);
      });
      inventoryContainer.insertBefore(deleteBtn, inventoryForm);
    });
}

/* ---------------------- Delete Inventory ---------------------- */
function deleteInventory(id) {
  fetch(`/inventory/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => {
      loadInventory();
      loadProductDropdown();
    });
}

/* ---------------------- Initial Load ---------------------- */
loadProductDropdown();
loadInventory();
