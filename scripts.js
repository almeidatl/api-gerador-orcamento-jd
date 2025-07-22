let servicesData = [];

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function populateServices(services) {
    const select = document.getElementById('service');
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} (${formatCurrency(service.price)})`;
        select.appendChild(option);
    });
}

fetch('services.json')
    .then(response => response.json())
    .then(data => {
        servicesData = data;
        populateServices(servicesData);
    })
    .catch(err => {
        document.getElementById('budget-result').innerHTML = '<span style="color:red;">Serviço inválido ou não encontrado.</span>';
    });

let addedServices = [];

function updateAddedServicesList() {
    const container = document.getElementById('added-services');
    if (addedServices.length === 0) {
        container.innerHTML = '<em>Nenhum serviço adicionado.</em>';
        return;
    }
    let html = '<div class="table-responsive">';
    html += '<table style="border-collapse:collapse;">';
    html += '<thead><tr><th style="border-bottom:1px solid #ccc;">Serviço</th><th style="border-bottom:1px solid #ccc;">Valor unitário</th><th style="border-bottom:1px solid #ccc;">Quantidade</th><th style="border-bottom:1px solid #ccc;">Subtotal</th><th></th></tr></thead><tbody>';
    addedServices.forEach((item, idx) => {
        html += `<tr><td data-label='Serviço'>${item.name}</td><td data-label='Valor unitário'>${formatCurrency(item.price)}</td><td data-label='Quantidade'>${item.quantity}</td><td data-label='Subtotal'>${formatCurrency(item.price * item.quantity)}</td><td data-label=' '><button type='button' onclick='removeService(${idx})'>Remover</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

window.removeService = function (idx) {
    addedServices.splice(idx, 1);
    updateAddedServicesList();
};

document.getElementById('add-service').addEventListener('click', function () {
    const serviceId = parseInt(document.getElementById('service').value, 10);
    const quantity = parseInt(document.getElementById('quantity').value, 10);
    const service = servicesData.find(s => s.id === serviceId);
    if (!service) {
        document.getElementById('budget-result').innerHTML = '<span style="color:red;">Selecione um serviço válido.</span>';
        return;
    }
    if (quantity < 1) {
        document.getElementById('budget-result').innerHTML = '<span style="color:red;">Quantidade inválida.</span>';
        return;
    }
    // Verifica se já existe o serviço na lista
    const existing = addedServices.find(item => item.id === serviceId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        addedServices.push({ ...service, quantity });
    }
    updateAddedServicesList();
    document.getElementById('budget-result').innerHTML = '';
    document.getElementById('quantity').value = 1;
    document.getElementById('service').value = '';
});

// Substituir o submit do form para gerar o relatório final

document.getElementById('budget-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (addedServices.length === 0) {
        document.getElementById('budget-result').innerHTML = '<span style="color:red;">Adicione pelo menos um serviço.</span>';
        return;
    }
    let total = 0;
    let html = '<h2>Orçamento Final</h2>';
    html += '<div class="table-responsive">';
    html += '<table style="border-collapse:collapse;">';
    html += '<thead><tr><th style="border-bottom:1px solid #ccc;">Serviço</th><th style="border-bottom:1px solid #ccc;">Valor unitário</th><th style="border-bottom:1px solid #ccc;">Quantidade</th><th style="border-bottom:1px solid #ccc;">Subtotal</th></tr></thead><tbody>';
    addedServices.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `<tr><td data-label='Serviço'>${item.name}</td><td data-label='Valor unitário'>${formatCurrency(item.price)}</td><td data-label='Quantidade'>${item.quantity}</td><td data-label='Subtotal'>${formatCurrency(subtotal)}</td></tr>`;
    });
    html += `<tr><td colspan='3' style='text-align:right;font-weight:bold;' data-label='Total:'>Total:</td><td style='font-size:1.2em;color:#007bff;font-weight:bold;' data-label='Total:'>${formatCurrency(total)}</td></tr>`;
    html += '</tbody></table></div>';
    document.getElementById('budget-result').innerHTML = html;
});

// Adiciona eventos aos botões de quantidade
const quantityInput = document.getElementById('quantity');
document.getElementById('increase-quantity').addEventListener('click', function () {
    quantityInput.value = parseInt(quantityInput.value, 10) + 1;
});
document.getElementById('decrease-quantity').addEventListener('click', function () {
    if (parseInt(quantityInput.value, 10) > 1) {
        quantityInput.value = parseInt(quantityInput.value, 10) - 1;
    }
});

document.getElementById('reset-budget').addEventListener('click', function () {
    addedServices = [];
    updateAddedServicesList();
    document.getElementById('budget-result').innerHTML = '';
    document.getElementById('service').value = '';
    document.getElementById('quantity').value = 1;
});


updateAddedServicesList();

