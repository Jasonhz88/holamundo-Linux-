const cart = new Map();
const cartPanel = document.querySelector('#cart-panel');
const cartBackdrop = document.querySelector('#cart-backdrop');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTitleCount = document.querySelector('#cart-title-count');
const cartTotal = document.querySelector('#cart-total');
const shippingMessage = document.querySelector('#shipping-message');
const toast = document.querySelector('#toast');
let activeFilter = 'todos';
let toastTimer;

function formatPrice(amount) {
	return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

function renderCart() {
	const products = [...cart.values()];
	const count = products.reduce((sum, product) => sum + product.quantity, 0);
	const subtotal = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

	cartCount.textContent = count;
	cartTitleCount.textContent = `(${count})`;
	cartTotal.textContent = formatPrice(subtotal);
	shippingMessage.textContent = subtotal >= 75
		? '¡Tu pedido tiene envío gratis!'
		: `Te faltan ${formatPrice(75 - subtotal)} para conseguir envío gratis.`;
	cartItems.replaceChildren();

	if (products.length === 0) {
		const empty = document.createElement('p');
		empty.className = 'empty-cart';
		empty.textContent = 'Tu bolsa está esperando algo bonito.';
		cartItems.append(empty);
		return;
	}

	for (const product of products) {
		const row = document.createElement('div');
		row.className = 'cart-row';
		const image = document.createElement('img');
		image.src = product.image;
		image.alt = '';
		const details = document.createElement('div');
		const name = document.createElement('h3');
		name.textContent = product.name;
		const price = document.createElement('p');
		price.textContent = formatPrice(product.price);
		const size = document.createElement('span');
		size.className = 'cart-row-size';
		size.textContent = `Talla: ${product.size}`;
		const quantity = document.createElement('div');
		quantity.className = 'quantity-control';
		quantity.innerHTML = `<button type="button" data-action="decrease" data-key="${product.key}" aria-label="Quitar una unidad">−</button><span>${product.quantity}</span><button type="button" data-action="increase" data-key="${product.key}" aria-label="Añadir una unidad">+</button>`;
		details.append(name, price, size, quantity);
		const remove = document.createElement('button');
		remove.className = 'remove-item';
		remove.type = 'button';
		remove.dataset.action = 'remove';
		remove.dataset.key = product.key;
		remove.textContent = 'Quitar';
		row.append(image, details, remove);
		cartItems.append(row);
	}
}

function setCartOpen(isOpen) {
	cartPanel.classList.toggle('is-open', isOpen);
	cartBackdrop.classList.toggle('is-open', isOpen);
	document.body.classList.toggle('cart-open', isOpen);
	cartPanel.setAttribute('aria-hidden', String(!isOpen));
	cartPanel.inert = !isOpen;
	document.querySelector('#open-cart').setAttribute('aria-expanded', String(isOpen));
	if (isOpen) document.querySelector('#close-cart').focus();
	else document.querySelector('#open-cart').focus();
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2300);
}

function filterProducts() {
	const query = document.querySelector('#product-search').value.trim().toLocaleLowerCase('es');
	let visibleCount = 0;
	document.querySelectorAll('.product-card').forEach((card) => {
		const matchesCategory = activeFilter === 'todos' || card.dataset.category === activeFilter;
		const matchesSearch = card.dataset.name.includes(query);
		card.hidden = !(matchesCategory && matchesSearch);
		if (!card.hidden) visibleCount += 1;
	});
	document.querySelector('#no-results').hidden = visibleCount > 0;
}

document.querySelectorAll('.filter-button').forEach((button) => {
	button.addEventListener('click', () => {
		activeFilter = button.dataset.filter;
		document.querySelectorAll('.filter-button').forEach((filter) => {
			const isActive = filter === button;
			filter.classList.toggle('is-active', isActive);
			filter.setAttribute('aria-pressed', String(isActive));
		});
		filterProducts();
	});
});

document.querySelector('#product-search').addEventListener('input', filterProducts);

document.querySelectorAll('.add-button').forEach((button) => {
	button.addEventListener('click', () => {
		const card = button.closest('.product-card');
		const size = card.querySelector('select').value;
		const key = `${button.dataset.id}:${size}`;
		const product = cart.get(key);
		if (product) product.quantity += 1;
		else cart.set(key, {
			key,
			id: button.dataset.id,
			name: button.dataset.name,
			price: Number(button.dataset.price),
			image: button.dataset.image,
			size,
			quantity: 1
		});
		renderCart();
		showToast(`${button.dataset.name}, talla ${size}, añadido a tu bolsa.`);
	});
});

cartItems.addEventListener('click', (event) => {
	const button = event.target.closest('button[data-action]');
	if (!button) return;
	const product = cart.get(button.dataset.key);
	if (!product) return;
	if (button.dataset.action === 'increase') product.quantity += 1;
	if (button.dataset.action === 'decrease') product.quantity -= 1;
	if (button.dataset.action === 'remove' || product.quantity < 1) cart.delete(product.key);
	renderCart();
});

document.querySelector('#open-cart').addEventListener('click', () => setCartOpen(true));
document.querySelector('#close-cart').addEventListener('click', () => setCartOpen(false));
cartBackdrop.addEventListener('click', () => setCartOpen(false));
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && cartPanel.classList.contains('is-open')) setCartOpen(false);
});

document.querySelector('#checkout-button').addEventListener('click', () => {
	if (cart.size === 0) {
		showToast('Añade una prenda a tu bolsa para continuar.');
		return;
	}
	showToast('Los pagos en línea estarán disponibles próximamente.');
});

document.querySelector('#newsletter-form').addEventListener('submit', (event) => {
	event.preventDefault();
	document.querySelector('#newsletter-message').textContent = 'La suscripción por correo estará disponible próximamente.';
});

renderCart();
